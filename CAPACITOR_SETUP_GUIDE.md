# Capacitor Mobile App Guide (Assure Technician)

Complete handbook for running **Assure Technician** as a native Android application using Capacitor.

---

## 1. Quick Commands Reference

| Command | Action |
| :--- | :--- |
| `npm run cap:build` | Builds Vite web assets and syncs them directly into Android native container. Run after every code edit. |
| `npm run cap:apk` | Builds web assets, syncs to Android, and compiles debug APK via Gradle. |
| `npm run cap:open` | Opens the `android/` project in Android Studio. |
| `npx cap sync android` | Syncs web assets and native Gradle plugins. |
| `npx cap run android` | Directly runs the app on a connected physical USB device or emulator. |

---

## 2. Configuration Details

* **App Name**: `Assure Technician`
* **Package ID / App ID**: `com.assuretechnologies.technician`
* **Web Directory**: `dist`
* **Cleartext HTTP**: Enabled in `AndroidManifest.xml` for local network/Wi-Fi testing (`http://192.168.0.6:5000`).

---

## 3. Switching Backend URLs

* **Local Machine Web Dev**: `.env` $\rightarrow$ `VITE_API_BASE_URL=http://localhost:5000`
* **Physical Mobile Phone (Wi-Fi)**: `.env.production` $\rightarrow$ `VITE_API_BASE_URL=http://192.168.0.6:5000`
* **Live Production Server**: `.env.production` $\rightarrow$ `VITE_API_BASE_URL=https://assuretech.chenchala.com`

---

## 4. How to Build & Run on a Fresh Clone

```bash
# 1. Install dependencies
npm install

# 2. Build and sync to Android
npm run cap:build

# 3. Open in Android Studio to run on device
npm run cap:open
```

---

## 5. Installed Native Plugins

* **`@capacitor/app`**: Handles the Android hardware back button (navigates back or closes app gracefully instead of abrupt crash/exit).
* **`@capacitor/splash-screen`**: Smoothly hides splash screen upon React mount without white screen flicker.
* **`@capacitor/camera`**: Native camera capture and photo gallery picker.
* **`@capacitor/assets`**: Automatic generation of all Android icon and splash screen densities.

---

## 6. App Icon & Splash Screen Generation

1. Place your base high-res logo and splash images inside an `assets/` folder:
   * `assets/icon.png` (minimum 1024x1024 px)
   * `assets/splash.png` (minimum 2732x2732 px)
2. Run the generator:
   ```bash
   npx @capacitor/assets generate --android
   ```
   This automatically generates and places all required icons (`mipmap-mdpi`, `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`) directly into `android/app/src/main/res/`.
