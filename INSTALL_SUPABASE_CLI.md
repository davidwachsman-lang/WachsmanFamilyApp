# Installing Supabase CLI

## Option 1: Using Homebrew (Recommended for macOS)

If you have Homebrew installed:

```bash
brew install supabase/tap/supabase
```

**Don't have Homebrew?** Install it first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Supabase:
```bash
brew install supabase/tap/supabase
```

## Option 2: Using npm (If you have Node.js)

```bash
npm install -g supabase
```

## Option 3: Direct Download (macOS)

Download the binary directly:

1. Go to: https://github.com/supabase/cli/releases
2. Download the latest `supabase_darwin_amd64.tar.gz` (or `arm64` if you have an Apple Silicon Mac)
3. Extract the archive
4. Move to a directory in your PATH:

```bash
# For Intel Macs
tar -xzf supabase_darwin_amd64.tar.gz
sudo mv supabase /usr/local/bin/

# For Apple Silicon Macs (M1/M2/M3)
tar -xzf supabase_darwin_arm64.tar.gz
sudo mv supabase /usr/local/bin/
```

## Option 4: Using Scoop (Windows only)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Verify Installation

After installing, verify it works:

```bash
supabase --version
```

You should see something like: `supabase version 1.x.x`

## Next Steps After Installation

1. **Login to Supabase:**
   ```bash
   supabase login
   ```
   This will open a browser to authenticate.

2. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   Find your project ref in: Supabase Dashboard → Settings → General → Reference ID

3. **Continue with the setup** (see QUICK_START_BACKEND.md)

## Troubleshooting

### "Command not found" after installation
- Make sure the install directory is in your PATH
- Restart your terminal
- For Homebrew: run `brew doctor` to check for issues

### Permission denied
- Use `sudo` if needed (for `/usr/local/bin/`)
- Or install to a user directory like `~/bin` and add it to PATH

### Check if already installed
```bash
which supabase
supabase --version
```

## Which Option Should I Use?

- **macOS with Homebrew**: Option 1 (easiest)
- **Have Node.js**: Option 2 (quick)
- **No package manager**: Option 3 (manual but reliable)

