# 🎵 Vibe — Free Worldwide Music Player

A beautiful, free, open-source Android music streaming app.
No subscription. No ads. Full quality.

## Features
- 🌍 Worldwide streaming (JioSaavn + YouTube Music proxy + Last.fm)
- 🎤 Apple Music-style synced lyrics with auto-scrolling
- 🎛 5-band native Android equalizer with presets
- 💤 Sleep timer (duration or end-of-song)
- 📱 Lock screen controls + notification playback
- 🌈 Dynamic album-art color theming (glassy dark aesthetic)
- 📋 Playlists, favorites, play history
- 📊 Worldwide + country-specific charts
- 😌 Mood/genre discovery

## Screenshots
*(Add screenshots here after building)*

## Download
[Latest APK → Releases](../../releases/latest)

## Build Locally
```bash
git clone https://github.com/YOUR_USERNAME/Vibe.git
cd Vibe
npm install
cp .env.example .env  # add your Last.fm API key
cd android && ./gradlew assembleDebug
```

The debug APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

### Prerequisites
- Node.js 18+
- Java 17 (Temurin/OpenJDK)
- Android SDK (compileSdk 36, minSdk 26, targetSdk 36)
- Last.fm API key (free at https://www.last.fm/api/account/create)

### Environment Variables
Create `.env` from `.env.example`:
```env
LASTFM_API_KEY=your_free_key_from_lastfm
```

## Release APK (Signed)
To generate a signed release APK locally:
```bash
# Generate keystore once
keytool -genkey -v -keystore vibe-release.keystore -alias vibe-key -keyalg RSA -keysize 2048 -validity 10000

# Build signed APK
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=../vibe-release.keystore \
  -Pandroid.injected.signing.store.password="YOUR_STORE_PASS" \
  -Pandroid.injected.signing.key.alias="vibe-key" \
  -Pandroid.injected.signing.key.password="YOUR_KEY_PASS"
```

The signed APK will be at `android/app/build/outputs/apk/release/app-release.apk`

## GitHub CI/CD
This repo includes GitHub Actions workflows:
- **Debug APK** on every push/PR → downloadable from Actions artifacts
- **Signed Release APK** on tags `v*.*.*` → published to GitHub Releases

### Required GitHub Secrets
| Secret | Description |
|--------|-------------|
| `LASTFM_API_KEY` | Your free Last.fm API key |
| `KEYSTORE_BASE64` | Base64-encoded release keystore |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias (e.g., `vibe-key`) |
| `KEY_PASSWORD` | Key password |

### Generate Keystore for Releases
```bash
keytool -genkey -v \
  -keystore vibe-release.keystore \
  -alias vibe-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Convert to Base64 for GitHub secret
base64 -i vibe-release.keystore | tr -d '\n'
# Copy the output → Settings → Secrets → KEYSTORE_BASE64
```

## Architecture
- **React Native CLI** (TypeScript) — no Expo
- **Audio**: `react-native-track-player` with foreground service
- **UI**: `react-native-reanimated`, `react-native-gesture-handler`, `FlashList`
- **Navigation**: `@react-navigation/native` + native stack
- **State**: `zustand` + `react-native-mmkv`
- **Data**: Multi-source waterfall (Saavn → Piped → Last.fm)
- **Equalizer**: Native Android `AudioEffect` via JNI bridge
- **Lyrics**: LRCLib synced LRC parser + auto-scroll

## Free APIs Used
| API | Purpose |
|-----|---------|
| `saavn.dev` | JioSaavn streaming (320kbps, worldwide) |
| `pipedapi.kavin.rocks` | YouTube Music proxy fallback |
| `ws.audioscrobbler.com/2.0/` | Last.fm recommendations, charts, metadata |
| `lrclib.net/api` | Synced lyrics (LRC) |
| `itunes.apple.com/search` | High-res artwork fallback |

## License
MIT — Free forever. Contribute, fork, enjoy!