// Supabase Edge Function: OAuth Callback Handler
// Exchanges authorization code for tokens and stores refresh token

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure function to not require JWT (via config file or dashboard)
// This function is called by Google OAuth redirect which doesn't include auth headers
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Log request for debugging
  console.log('Callback received:', {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.get('authorization'),
    hasApikey: !!req.headers.get('apikey'),
  })

  try {
    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI,
      SUPABASE_SERVICE_ROLE_KEY,
    } = Deno.env.toObject()

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error('Missing Google OAuth credentials')
    }

    // Construct Supabase URL from request hostname
    const url = new URL(req.url)
    const host = url.hostname
    const projectRef = host.split('.')[0]
    const supabaseUrl = `https://${projectRef}.supabase.co`

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in environment')
    }

    // Get authorization code from query params
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response(
        `
        <html>
          <body>
            <h1>Authorization Error</h1>
            <p>No authorization code received. Please try the login process again.</p>
            <a href="/">Go back</a>
          </body>
        </html>
        `,
        {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          status: 400,
        },
      )
    }

    // Exchange code for tokens
    // Use the same redirect_uri that was used in the authorization request
    // This must match exactly what was sent to Google
    const redirectUri = GOOGLE_REDIRECT_URI
    
    console.log('Exchanging code for tokens:', {
      client_id: GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      redirect_uri: redirectUri,
      code_length: code?.length,
    })
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', {
        status: tokenResponse.status,
        error: tokenData.error,
        error_description: tokenData.error_description,
        redirect_uri_used: redirectUri,
      })
      throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error || 'Unknown error'}. Check that redirect_uri matches exactly.`)
    }

    // Store refresh token in Supabase
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)

    const { error: upsertError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        id: 1, // Single row for admin tokens
        refresh_token: tokenData.refresh_token,
        access_token: tokenData.access_token,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })

    if (upsertError) {
      throw new Error(`Failed to store tokens: ${upsertError.message}`)
    }

    // Display success page with refresh token
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #4caf50; }
            .token-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 14px;
              border: 2px solid #4caf50;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            button {
              background: #4caf50;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 10px;
            }
            button:hover {
              background: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Authorization Successful!</h1>
            <p>Your Google Calendar access has been configured. The tokens have been stored securely in the database.</p>
            
            <p style="margin-top: 30px;">
              <strong>You're all set!</strong> The calendar events API should now work. You can close this page and return to your app.
            </p>
            
            <p style="margin-top: 20px; color: #666;">
              <small>Tokens are automatically stored in the database - no manual configuration needed.</small>
            </p>
          </div>

          <script>
            function copyToken() {
              const token = document.getElementById('refreshToken').textContent;
              navigator.clipboard.writeText(token).then(() => {
                alert('Refresh token copied to clipboard!');
              });
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      `
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
            }
            .error {
              background: #ffebee;
              border: 1px solid #f44336;
              padding: 15px;
              border-radius: 4px;
              color: #c62828;
            }
          </style>
        </head>
        <body>
          <h1>Authorization Error</h1>
          <div class="error">
            <p><strong>Error:</strong> ${error.message}</p>
          </div>
          <a href="/">Go back</a>
        </body>
      </html>
      `,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 500,
      },
    )
  }
})
