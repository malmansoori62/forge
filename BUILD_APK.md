# Build FORGE as an Android APK

The repo includes a GitHub Actions workflow (`.github/workflows/build-apk.yml`)
that wraps the deployed PWA into a signed Android TWA `.apk` you can sideload
onto your phone.

## One-time setup

### 1. Deploy the PWA somewhere public (free)

The APK is just a thin Android wrapper that loads your hosted PWA. You need
the PWA available at a public HTTPS URL first.

**Easiest: Vercel** (free, takes ~3 minutes)

1. Go to <https://vercel.com> and sign in with GitHub
2. Click **Add New → Project** → select the `forge` repo
3. Accept the Next.js defaults (no env vars needed)
4. Click **Deploy** — wait ~60 seconds
5. Copy the deployment URL — it'll look like `https://forge-xyz.vercel.app`

That URL is now your live FORGE PWA. You can already install it from Chrome's
"Add to home screen" if you want to skip the APK step entirely.

### 2. (Optional) Set up Digital Asset Links

Without this, the TWA APK will show a small URL bar at the top of the screen.
With it, the app is fully chromeless and feels native. Skip this if you don't
care about the URL bar.

After the first APK build runs, look at the workflow log under
**"Generate signing keystore"** — you'll see a line like:

```
SHA256: A1:B2:C3:...:FF
```

Copy that fingerprint. Then create a file in the repo at
`public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.malmansoori.forge",
    "sha256_cert_fingerprints": ["A1:B2:C3:...:FF"]
  }
}]
```

Replace the fingerprint with yours. Commit + push. Vercel redeploys
automatically. Now `https://forge-xyz.vercel.app/.well-known/assetlinks.json`
returns it, and the next APK build will produce a chromeless TWA.

## Building the APK

Every time you want a fresh APK:

1. Go to the repo on GitHub → **Actions** tab
2. Click **"Build Android APK"** in the left sidebar
3. Click **"Run workflow"** (top right)
4. Fill in:
   - **Deployed PWA URL**: `https://forge-xyz.vercel.app` (no trailing slash)
   - **Package ID**: leave as default or pick your own reverse-DNS
   - **App name**: leave as `FORGE` or change
5. Click the green **Run workflow** button
6. Wait ~5–10 minutes for the build to finish (you'll see a green check)
7. Click into the completed run → scroll to **Artifacts** at the bottom
8. Download `forge-android-apk.zip` → unzip → you have the `.apk` file

## Installing on your phone

1. Transfer the `.apk` to your phone (USB cable, Google Drive, email — anything)
2. On Android, go to **Settings → Apps → Special access → Install unknown apps**
3. Pick whichever app you'll open the APK with (Files, Drive, Chrome) and
   toggle **Allow from this source**
4. Tap the APK file → **Install** → **Open**
5. The FORGE icon appears in your app drawer and on your home screen

## Updating later

For app updates: just bump the version in the workflow inputs (or re-run with
the same URL after pushing changes to the repo + redeploying Vercel) → the new
APK overwrites the old one on install.

For PWA updates that don't change the wrapper: just push to the repo, Vercel
auto-deploys, and the next time you open the app on your phone it pulls the
new web content automatically. **You don't need to rebuild the APK for web
content changes** — only for things like the app name, icon, or package ID.

## Troubleshooting

- **Build fails on "bubblewrap build"**: usually means the PWA manifest at
  `<your-url>/manifest.webmanifest` isn't reachable. Open that URL in a
  browser — you should see JSON. If you get a 404, your Vercel deployment
  hasn't picked up the manifest yet (try a redeploy).
- **APK installs but shows a URL bar**: that's the asset-links thing —
  see step 2 above to remove it.
- **"App not installed" on the phone**: usually means an older FORGE APK
  with a different signing key is already installed. Uninstall the old one
  first, then install the new APK.
