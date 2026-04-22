# Geofencing Tracker - Mobile App

## 🚀 Gradle 9 & Expo 55 Ready

This app is **fully configured for Gradle 9 and Expo 55** compatibility! 

✅ **Gradle 9.0** - Latest Gradle version  
✅ **AGP 9.x** - Android Gradle Plugin 9.x compatible  
✅ **Android 15** - compileSdk 35, targetSdk 35  
✅ **Kotlin 2.x** - Modern Kotlin support  
✅ **Optimized Builds** - 4GB heap, parallel execution, caching enabled  

📚 **See [GRADLE9_SETUP.md](./GRADLE9_SETUP.md) for complete setup guide**

### Quick Verification

```bash
# Verify your environment is Gradle 9 ready
node verify-gradle9.js
```

## Building for Play Store

### Prerequisites

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure your project**
   ```bash
   eas build:configure
   ```

### Build APK for Testing

To build a standalone APK for testing (not for Play Store submission):

```bash
eas build --platform android --profile production
```

This creates an **APK** that you can:
- Install directly on Android devices
- Share for internal testing
- Test before Play Store submission

### Build AAB for Play Store

For **Play Store submission**, you need an Android App Bundle (AAB):

```bash
eas build --platform android --profile production-aab
```

The AAB format is **required** by Google Play Store since August 2021.

### Build Profiles

- **development**: Debug build for development with Expo Go
- **preview**: Release APK for internal testing
- **production**: Release APK for distribution (Gradle 9 configured)
- **production-aab**: Android App Bundle for Play Store (Gradle 9 configured)

### Important Configuration

Before building, update these in your platform's app configuration:

1. **Package name**: `android.package` (must be unique, e.g., `com.yourcompany.geofencing`)
2. **Version**: `version` (e.g., "1.0.0")
3. **Version Code**: `android.versionCode` (integer, increment for each release)
4. **Google Maps API Key**: `android.config.googleMaps.apiKey`
5. **App name**: `name` (shown on device)
6. **EAS Project ID**: `extra.eas.projectId` (get from `eas project:init`)

### Google Play Console Checklist

- [ ] App signed with upload key
- [ ] Privacy policy URL added
- [ ] App screenshots (min 2)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Age rating questionnaire completed
- [ ] Location permissions explained in store listing

### Permissions Justification

This app requires these sensitive permissions:

- **ACCESS_BACKGROUND_LOCATION**: Track user location during adventures even when app is backgrounded
- **FOREGROUND_SERVICE_LOCATION**: Maintain continuous tracking session
- **POST_NOTIFICATIONS**: Alert users to geofence breaches

Make sure to explain these clearly in your Play Store listing!

### Troubleshooting

**Build fails with package.json mismatch?**
- Delete `package-lock.json` and run `npm install`
- Make sure all dependencies are compatible with Expo 55

**Gradle errors?**
- ✅ **Your app is Gradle 9 configured** - see GRADLE9_SETUP.md
- Run `node verify-gradle9.js` to check your setup
- Check `android.versionCode` is an integer
- Verify package name has no special characters
- Use `--clear-cache` flag: `eas build --clear-cache`

**Memory or build timeout errors?**
- ✅ **Already configured** with 4GB heap in eas.json
- GRADLE_OPTS environment variable is set for optimal performance

**AGP or Gradle version errors?**
- ✅ **Already configured** to use latest EAS build image
- EAS Build automatically handles Gradle 9 and AGP 9.x

**Google Maps not showing?**
- Add valid Google Maps API key in app configuration
- Enable Maps SDK for Android in Google Cloud Console

## Gradle 9 Resources

All Gradle 9 configurations are pre-configured in this project:

- **[GRADLE9_SETUP.md](./GRADLE9_SETUP.md)** - Complete setup documentation with local build instructions
- **[gradle9-config.json](./gradle9-config.json)** - Build configuration reference
- **[verify-gradle9.js](./verify-gradle9.js)** - Environment verification script
- **[eas.json](./eas.json)** - Pre-configured with Gradle 9 optimized settings

### Gradle 9 Features Enabled

- 🚀 Latest EAS build image (includes Gradle 9.0)
- ⚡ 4GB JVM heap for large builds
- 📦 Parallel build execution
- 💾 Build caching enabled
- 🎯 AGP 9.x compatibility
- 🔧 Android 15 SDK (compileSdk 35)
- 🔐 R8 full mode for code shrinking
- ⚙️ Non-transitive R classes for faster builds

---

**Built with Expo 55 | Gradle 9 | Android 15 | AGP 9.x**
