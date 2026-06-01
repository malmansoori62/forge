# Build FORGE as an Android APK

The repo includes a GitHub Actions workflow that builds an Android APK with
the entire FORGE web app bundled inside it — **no hosting required**. The
APK runs fully offline.

## How to get an APK

1. Go to <https://github.com/malmansoori62/forge> → **Actions** tab
2. Click **"Build Android APK"** in the left sidebar
3. Click **"Run workflow"** (top right of that panel)
4. Leave the defaults (or change the app name / package id) → click the green **Run workflow** button
5. Wait ~5–10 minutes for the green check
6. Click into the finished run → scroll to **Artifacts** at the bottom
7. Download `forge-android-apk` → unzip → you have `app-debug.apk`

## Install on your Android phone

1. Transfer the `.apk` to your phone (USB cable, Google Drive, WhatsApp, email — anything)
2. On Android, tap the file
3. If prompted, allow **"Install unknown apps"** for whichever app you opened the APK with
4. Tap **Install** → **Open** → FORGE icon shows up in your app drawer and home screen

## Updates

When you push code changes to the repo:

1. Re-run the workflow
2. Download the new APK
3. Install over the old one (data is preserved — IndexedDB stays in app sandbox)

## What you get

- Full FORGE app inside the APK — all 16 plans, 100+ exercises, coach notes, rest timer with voice cues, history, calendar, training max, the whole thing
- Works fully offline. No Vercel, no GitHub Pages, no external hosting
- Your custom 100.png logo as the launcher icon
- IndexedDB stays inside the app sandbox — your workout data is safe across app updates

## Troubleshooting

- **Build fails on `npm ci`**: usually means `package-lock.json` is out of sync. Push again or delete it locally and rerun `npm install`.
- **Build fails on `cap add android`**: Capacitor needs `capacitor.config.ts` to exist (the workflow creates it) and `out/` to be present (the workflow builds it).
- **APK installs but app is blank**: open Chrome on the phone, visit `chrome://inspect`, connect to USB-debug the device — usually a JS error from a path mismatch.
- **"App not installed" error**: a previous FORGE APK signed with a different key is already installed. Uninstall it first, then install the new APK.

## Local build (if you want)

```bash
npm install
npm install --save @capacitor/core @capacitor/cli @capacitor/android
npm run build              # outputs to ./out
# Create capacitor.config.ts manually with webDir: 'out'
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
# APK is at: android/app/build/outputs/apk/debug/app-debug.apk
```

Requires Android SDK + JDK 17 installed locally.
