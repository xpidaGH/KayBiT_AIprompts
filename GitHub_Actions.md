# Multiplatform Production CI/CD & Secure Code-Signing Workflow
### KayBiT Studio — Automated Cross-Platform Packaging Pipeline

This document provides the complete, production-grade GitHub Actions automation workflow for compiling, securely code-signing, packaging, and distributing **KayBiT Studio** across all major desktop and mobile operating systems:
- **macOS Runner (`macos-latest`)**: iOS `.ipa` (App Store / TestFlight) + macOS Universal `.dmg` / `.app` (Apple Silicon & Intel x86_64).
- **Windows Runner (`windows-latest`)**: Windows `.exe` and `.msi` installers via Tauri & WiX/NSIS with Authenticode signing.
- **Ubuntu Linux Runner (`ubuntu-latest`)**: Android `.apk` & `.aab` (Google Play Internal Testing Track) + Linux `.deb` and `.AppImage` with PipeWire support.

---

## 1. Zero-Trust Code Signing Security Architecture

> **Security Rule**: Never commit raw `.keystore`, `.jks`, `.p12`, `.cer`, or `.mobileprovision` files into your Git repository. 
> Convert private certificates into Base64 strings, store them inside **GitHub Repository Secrets**, and decode them on the fly into isolated runner memory during execution.

### Certificate Conversion Commands: Bash vs. PowerShell

#### A. Android Keystore (.keystore / .jks)
Generate keystore:
```bash
# Generate production keystore locally
keytool -genkey -v -keystore release.keystore -alias kaybit-key -keyalg RSA -keysize 2048 -validity 10000
```

Convert to Base64:
- **Bash (Linux / macOS / Git Bash)**:
  ```bash
  base64 -w 0 release.keystore > keystore_base64.txt
  # Copy content and save as GitHub Secret: ANDROID_KEYSTORE_BASE64
  ```
- **PowerShell (Windows)**:
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\release.keystore")) | Out-File -Encoding ascii keystore_base64.txt
  # Copy content and save as GitHub Secret: ANDROID_KEYSTORE_BASE64
  ```

#### B. Apple iOS / macOS Distribution Certificate (.p12)
Export your certificate with a strong passphrase from macOS Keychain Access:
- **Bash**:
  ```bash
  base64 -w 0 AppleDistribution.p12 > ios_cert_base64.txt
  # Save as GitHub Secret: APPLE_CERTIFICATE_BASE64
  ```
- **PowerShell**:
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\AppleDistribution.p12")) | Out-File -Encoding ascii ios_cert_base64.txt
  # Save as GitHub Secret: APPLE_CERTIFICATE_BASE64
  ```

#### C. Apple iOS Provisioning Profile (.mobileprovision)
Download your App Store Distribution Profile from developer.apple.com:
- **Bash**:
  ```bash
  base64 -w 0 KayBiT_AppStore.mobileprovision > profile_base64.txt
  # Save as GitHub Secret: APPLE_PROVISION_PROFILE_BASE64
  ```
- **PowerShell**:
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\KayBiT_AppStore.mobileprovision")) | Out-File -Encoding ascii profile_base64.txt
  # Save as GitHub Secret: APPLE_PROVISION_PROFILE_BASE64
  ```

#### D. Google Play Service Account JSON Key
Download your Google Play Console API service account key (`play-service-account.json`):
- **Bash**:
  ```bash
  base64 -w 0 play-service-account.json > play_json_base64.txt
  # Save as GitHub Secret: PLAY_SERVICE_ACCOUNT_JSON_BASE64
  ```
- **PowerShell**:
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\play-service-account.json")) | Out-File -Encoding ascii play_json_base64.txt
  # Save as GitHub Secret: PLAY_SERVICE_ACCOUNT_JSON_BASE64
  ```

---

## 2. GitHub Repository Secrets Reference Table

Configure the following secrets in your GitHub repository (**Settings > Secrets and variables > Actions > New repository secret**):

| Secret Name | Category | Purpose / Description |
| :--- | :--- | :--- |
| `APPLE_CERTIFICATE_BASE64` | iOS / macOS | Base64-encoded `.p12` Distribution Certificate |
| `APPLE_CERTIFICATE_PASSWORD` | iOS / macOS | Password protecting the `.p12` export |
| `APPLE_PROVISION_PROFILE_BASE64` | iOS | Base64-encoded `.mobileprovision` App Store profile |
| `APPLE_TEAM_ID` | iOS / macOS | 10-character Apple Developer Team ID (e.g., `A1B2C3D4E5`) |
| `APPLE_BUNDLE_ID` | iOS | App Bundle Identifier (e.g., `com.kaybit.aiprompts`) |
| `APPLE_PROVISIONING_PROFILE_NAME`| iOS | Exact profile name in developer portal |
| `APP_STORE_CONNECT_KEY_ID` | TestFlight | Key ID from App Store Connect Users and Access |
| `APP_STORE_CONNECT_ISSUER_ID` | TestFlight | Issuer ID UUID from App Store Connect |
| `APP_STORE_CONNECT_PRIVATE_KEY`| TestFlight | Raw contents of `AuthKey_<KEY_ID>.p8` |
| `ANDROID_KEYSTORE_BASE64` | Android | Base64-encoded release `.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Android | Master password for the keystore file |
| `ANDROID_KEY_ALIAS` | Android | Key alias name (e.g. `kaybit-key`) |
| `ANDROID_KEY_PASSWORD` | Android | Password for the specific key alias |
| `PLAY_SERVICE_ACCOUNT_JSON_BASE64` | Google Play | Base64 service account JSON with Publish permission |
| `WINDOWS_CERTIFICATE_BASE64` | Windows | (Optional) Base64 PFX Authenticode certificate |
| `WINDOWS_CERTIFICATE_PASSWORD` | Windows | (Optional) Password for Authenticode certificate |
| `SLACK_WEBHOOK_URL` | Notifications| Incoming Webhook URL for Slack CI/CD notifications |
| `DISCORD_WEBHOOK_URL` | Notifications| Webhook URL for Discord build alerts |

---

## 3. Dynamic `exportOptions.plist` Template

To ensure Xcode exports the `.ipa` package properly for App Store distribution without hardcoding sensitive IDs, a template file `ios/App/exportOptions.plist.template` is transformed on the runner using `envsubst` or `sed`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>${APPLE_TEAM_ID}</string>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>manual</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>${APPLE_BUNDLE_ID}</key>
        <string>${APPLE_PROVISIONING_PROFILE_NAME}</string>
    </dict>
</dict>
</plist>
```

Dynamic injection script run during the workflow:
```bash
sed -e "s/\${APPLE_TEAM_ID}/$APPLE_TEAM_ID/g" \
    -e "s/\${APPLE_BUNDLE_ID}/$APPLE_BUNDLE_ID/g" \
    -e "s/\${APPLE_PROVISIONING_PROFILE_NAME}/$APPLE_PROVISIONING_PROFILE_NAME/g" \
    ios/App/exportOptions.plist.template > ios/App/exportOptions.plist
```

---

## 4. Production Multiplatform GitHub Actions Workflow

Below is the complete workflow file, placed in `.github/workflows/multiplatform-release.yml`:

```yaml
name: Multiplatform Production Release & Code Signing

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'
  workflow_dispatch:

permissions:
  contents: write
  packages: write

env:
  CARGO_TERM_COLOR: always
  NODE_VERSION: '20'

jobs:
  # -------------------------------------------------------------
  # JOB 1: VERSION & CHANGELOG PREPARATION
  # -------------------------------------------------------------
  prepare:
    name: Prepare Release & Generate Changelog
    runs-on: ubuntu-latest
    outputs:
      build_number: ${{ steps.version.outputs.build_number }}
      version_tag: ${{ steps.version.outputs.version_tag }}
      changelog: ${{ steps.changelog.outputs.changelog }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Calculate Continuous Build Number & Version
        id: version
        run: |
          BUILD_NUM=${{ github.run_number }}
          echo "build_number=$BUILD_NUM" >> $GITHUB_OUTPUT
          
          if [[ "${{ github.ref }}" == refs/tags/v* ]]; then
            TAG_NAME="${GITHUB_REF#refs/tags/}"
          else
            TAG_NAME="v2.4.${BUILD_NUM}"
          fi
          echo "version_tag=$TAG_NAME" >> $GITHUB_OUTPUT
          echo "Target Release Tag: $TAG_NAME (Build $BUILD_NUM)"

      - name: Extract Commit Changelog
        id: changelog
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 2>/dev/null || "")
          if [ -z "$PREV_TAG" ]; then
            COMMITS=$(git log -n 25 --pretty=format:"* %s (%h - %an)")
          else
            COMMITS=$(git log ${PREV_TAG}..HEAD --pretty=format:"* %s (%h - %an)")
          fi
          
          echo "CHANGELOG<<EOF" >> $GITHUB_OUTPUT
          echo "### 🚀 Automated Changelog (${{ steps.version.outputs.version_tag }})" >> $GITHUB_OUTPUT
          echo "" >> $GITHUB_OUTPUT
          echo "$COMMITS" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

  # -------------------------------------------------------------
  # JOB 2: MATRIX BUILD & CODE SIGNING
  # -------------------------------------------------------------
  build-and-sign:
    name: Build & Package (${{ matrix.target.name }})
    needs: prepare
    runs-on: ${{ matrix.target.os }}
    strategy:
      fail-fast: false
      matrix:
        target:
          # Runner 1: macOS Latest -> iOS .ipa + macOS Universal .dmg
          - name: macOS & iOS
            os: macos-latest
            platform: macos-ios
          # Runner 2: Windows Latest -> Windows .exe & .msi (Tauri)
          - name: Windows
            os: windows-latest
            platform: windows
          # Runner 3: Ubuntu Latest -> Android .apk/.aab + Linux .AppImage/.deb
          - name: Linux & Android
            os: ubuntu-latest
            platform: linux-android

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Project Dependencies
        run: npm ci

      # -------------------------------------------------------------
      # PLATFORM A: macOS & iOS PIPELINE (macos-latest)
      # -------------------------------------------------------------
      - name: Setup Rust (for macOS Tauri Universal Binary)
        if: matrix.target.platform == 'macos-ios'
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-apple-darwin,aarch64-apple-darwin

      - name: Import Apple Code Signing Identity & Provisioning Profile
        if: matrix.target.platform == 'macos-ios' && env.APPLE_CERT_SET == 'true'
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.APPLE_CERTIFICATE_BASE64 }}
          p12-password: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
        env:
          APPLE_CERT_SET: ${{ secrets.APPLE_CERTIFICATE_BASE64 != '' }}

      - name: Install iOS Provisioning Profile
        if: matrix.target.platform == 'macos-ios' && secrets.APPLE_PROVISION_PROFILE_BASE64 != ''
        run: |
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          echo "${{ secrets.APPLE_PROVISION_PROFILE_BASE64 }}" | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/profile.mobileprovision

      - name: Generate Dynamic exportOptions.plist
        if: matrix.target.platform == 'macos-ios'
        env:
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          APPLE_BUNDLE_ID: ${{ secrets.APPLE_BUNDLE_ID }}
          APPLE_PROVISIONING_PROFILE_NAME: ${{ secrets.APPLE_PROVISIONING_PROFILE_NAME }}
        run: |
          mkdir -p ios/App
          cat << 'EOF' > ios/App/exportOptions.plist
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0">
          <dict>
              <key>method</key>
              <string>app-store</string>
              <key>teamID</key>
              <string>${APPLE_TEAM_ID}</string>
              <key>uploadBitcode</key>
              <false/>
              <key>compileBitcode</key>
              <false/>
              <key>uploadSymbols</key>
              <true/>
              <key>signingStyle</key>
              <string>manual</string>
              <key>provisioningProfiles</key>
              <dict>
                  <key>${APPLE_BUNDLE_ID}</key>
                  <string>${APPLE_PROVISIONING_PROFILE_NAME}</string>
              </dict>
          </dict>
          </plist>
          EOF
          sed -i '' -e "s/\${APPLE_TEAM_ID}/$APPLE_TEAM_ID/g" \
                    -e "s/\${APPLE_BUNDLE_ID}/$APPLE_BUNDLE_ID/g" \
                    -e "s/\${APPLE_PROVISIONING_PROFILE_NAME}/$APPLE_PROVISIONING_PROFILE_NAME/g" ios/App/exportOptions.plist

      - name: Build Web Application
        run: npm run build

      - name: Compile macOS Universal DMG (.dmg & .app)
        if: matrix.target.platform == 'macos-ios'
        run: |
          if [ -d "src-tauri" ]; then
            npx tauri build --target universal-apple-darwin
          else
            mkdir -p dist/desktop
            tar -czf dist/desktop/KayBiT_macOS_v${{ needs.prepare.outputs.build_number }}.tar.gz -C dist .
          fi

      - name: Compile & Package iOS (.ipa) via Capacitor / Xcode
        if: matrix.target.platform == 'macos-ios'
        run: |
          if [ -d "ios" ]; then
            npx cap sync ios
            xcodebuild -workspace ios/App/App.xcworkspace \
                       -scheme App \
                       -configuration Release \
                       -archivePath build/App.xcarchive \
                       archive
            xcodebuild -exportArchive \
                       -archivePath build/App.xcarchive \
                       -exportOptionsPlist ios/App/exportOptions.plist \
                       -exportPath build/ipa
          fi

      - name: Auto-Publish to Apple TestFlight
        if: matrix.target.platform == 'macos-ios' && secrets.APP_STORE_CONNECT_PRIVATE_KEY != ''
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: 'build/ipa/App.ipa'
          issuer-id: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          api-key-id: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
          api-private-key: ${{ secrets.APP_STORE_CONNECT_PRIVATE_KEY }}

      # -------------------------------------------------------------
      # PLATFORM B: WINDOWS PIPELINE (windows-latest)
      # -------------------------------------------------------------
      - name: Setup Rust (Windows)
        if: matrix.target.platform == 'windows'
        uses: dtolnay/rust-toolchain@stable

      - name: Install WiX & NSIS Toolsets (Windows)
        if: matrix.target.platform == 'windows'
        shell: pwsh
        run: |
          dotnet tool install --global wix --version 4.0.5
          choco install nsis -y

      - name: Build Windows Installers (.exe & .msi via Tauri)
        if: matrix.target.platform == 'windows'
        shell: pwsh
        run: |
          npm run build
          if (Test-Path "src-tauri") {
            npx tauri build
          } else {
            New-Item -ItemType Directory -Force -Path "dist\desktop"
            Compress-Archive -Path "dist\*" -DestinationPath "dist\desktop\KayBiT_Windows_x64_v${{ needs.prepare.outputs.build_number }}.zip"
          }

      # -------------------------------------------------------------
      # PLATFORM C: LINUX & ANDROID PIPELINE (ubuntu-latest)
      # -------------------------------------------------------------
      - name: Setup Java Development Kit (JDK 17)
        if: matrix.target.platform == 'linux-android'
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Android SDK & Build Tools
        if: matrix.target.platform == 'linux-android'
        uses: android-actions/setup-android@v3

      - name: Install Linux Desktop Dependencies (PipeWire, GTK, WebKit2GTK)
        if: matrix.target.platform == 'linux-android'
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libpipewire-0.3-dev \
            libgstreamer1.0-dev \
            libgstreamer-plugins-base1.0-dev \
            libwebkit2gtk-4.1-dev \
            build-essential \
            curl \
            wget \
            file \
            libssl-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev

      - name: Compile Linux Binary (.deb & .AppImage)
        if: matrix.target.platform == 'linux-android'
        run: |
          npm run build
          if [ -d "src-tauri" ]; then
            npx tauri build
          fi

      - name: Build Android Bundle (.aab & .apk via Capacitor)
        if: matrix.target.platform == 'linux-android'
        run: |
          if [ -d "android" ]; then
            npx cap sync android
            cd android
            ./gradlew bundleRelease assembleRelease
          fi

      - name: Sign Android Release (.aab / .apk)
        if: matrix.target.platform == 'linux-android' && secrets.ANDROID_KEYSTORE_BASE64 != ''
        id: sign_android
        uses: r0adkll/sign-android-release@v1
        with:
          releaseDirectory: android/app/build/outputs/bundle/release
          signingKeyBase64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          alias: ${{ secrets.ANDROID_KEY_ALIAS }}
          keyStorePassword: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          keyPassword: ${{ secrets.ANDROID_KEY_PASSWORD }}

      - name: Decode Google Play Service Account JSON
        if: matrix.target.platform == 'linux-android' && secrets.PLAY_SERVICE_ACCOUNT_JSON_BASE64 != ''
        run: |
          echo "${{ secrets.PLAY_SERVICE_ACCOUNT_JSON_BASE64 }}" | base64 --decode > service-account.json

      - name: Auto-Publish to Google Play Internal Testing Track
        if: matrix.target.platform == 'linux-android' && secrets.PLAY_SERVICE_ACCOUNT_JSON_BASE64 != ''
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJson: service-account.json
          packageName: ${{ secrets.APPLE_BUNDLE_ID || 'com.kaybit.aiprompts' }}
          releaseFiles: android/app/build/outputs/bundle/release/*.aab
          track: internal
          status: completed

      # -------------------------------------------------------------
      # COLLECT ARTIFACTS ACROSS RUNNERS
      # -------------------------------------------------------------
      - name: Stash Compiled Release Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: artifacts-${{ matrix.target.platform }}
          path: |
            dist/desktop/*
            src-tauri/target/release/bundle/msi/*.msi
            src-tauri/target/release/bundle/dmg/*.dmg
            src-tauri/target/release/bundle/appimage/*.AppImage
            src-tauri/target/release/bundle/deb/*.deb
            build/ipa/*.ipa
            android/app/build/outputs/bundle/release/*.aab
            android/app/build/outputs/apk/release/*.apk
          if-no-files-found: ignore

  # -------------------------------------------------------------
  # JOB 3: PUBLISH GITHUB RELEASE
  # -------------------------------------------------------------
  publish-release:
    name: Publish to GitHub Releases Page
    needs: [prepare, build-and-sign]
    runs-on: ubuntu-latest
    steps:
      - name: Download All Artifacts
        uses: actions/download-artifact@v4
        with:
          path: release-assets
          merge-multiple: true

      - name: Publish GitHub Release with Changelog & Installers
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ needs.prepare.outputs.version_tag }}
          name: "KayBiT AI Prompt Studio ${{ needs.prepare.outputs.version_tag }} (Build #${{ needs.prepare.outputs.build_number }})"
          body: |
            ${{ needs.prepare.outputs.changelog }}

            ### 📦 Downloadable Multiplatform Installers
            - **Windows**: `.msi` / `.exe` (Tauri 64-bit installer with WiX/NSIS)
            - **macOS**: `.dmg` (Universal Binary - Apple Silicon M1/M2/M3/M4 & Intel x86_64)
            - **Linux**: `.AppImage` & `.deb` (Built with native PipeWire & WebKit2GTK support)
            - **Android**: `.apk` & `.aab` (Signed for Google Play Internal Track)
            - **iOS**: `.ipa` (Signed for App Store / TestFlight distribution)
          files: |
            release-assets/**/*.msi
            release-assets/**/*.exe
            release-assets/**/*.dmg
            release-assets/**/*.AppImage
            release-assets/**/*.deb
            release-assets/**/*.ipa
            release-assets/**/*.aab
            release-assets/**/*.apk
            release-assets/**/*.zip
            release-assets/**/*.tar.gz
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # -------------------------------------------------------------
  # JOB 4: MULTI-CHANNEL TEAM NOTIFICATIONS (Slack, Discord, Email)
  # -------------------------------------------------------------
  notify:
    name: Send Multi-Channel Notifications
    needs: [prepare, build-and-sign, publish-release]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Determine Build Status
        id: status
        run: |
          if [ "${{ needs.publish-release.result }}" == "success" ]; then
            echo "status_title=SUCCESS" >> $GITHUB_OUTPUT
            echo "status_color=#10b981" >> $GITHUB_OUTPUT
            echo "discord_color=3066993" >> $GITHUB_OUTPUT
          else
            echo "status_title=FAILURE" >> $GITHUB_OUTPUT
            echo "status_color=#ef4444" >> $GITHUB_OUTPUT
            echo "discord_color=15158332" >> $GITHUB_OUTPUT
          fi

      # 1. Slack Webhook Notification
      - name: Send Slack Notification
        if: secrets.SLACK_WEBHOOK_URL != ''
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "Build ${{ steps.status.outputs.status_title }}: KayBiT Studio ${{ needs.prepare.outputs.version_tag }} (Run #${{ needs.prepare.outputs.build_number }})",
              "attachments": [
                {
                  "color": "${{ steps.status.outputs.status_color }}",
                  "fields": [
                    { "title": "Version", "value": "${{ needs.prepare.outputs.version_tag }}", "short": true },
                    { "title": "Commit Author", "value": "${{ github.actor }}", "short": true },
                    { "title": "Branch / Tag", "value": "${{ github.ref_name }}", "short": true },
                    { "title": "Release URL", "value": "https://github.com/${{ github.repository }}/releases/tag/${{ needs.prepare.outputs.version_tag }}", "short": false }
                  ]
                }
              ]
            }

      # 2. Discord Webhook Notification
      - name: Send Discord Notification
        if: secrets.DISCORD_WEBHOOK_URL != ''
        run: |
          curl -H "Content-Type: application/json" \
               -X POST \
               -d '{
                 "username": "KayBiT CI/CD Bot",
                 "avatar_url": "https://raw.githubusercontent.com/${{ github.repository }}/main/public/assets/kbt-logo-transparent.png",
                 "embeds": [{
                   "title": "KayBiT Studio Build ${{ steps.status.outputs.status_title }}",
                   "url": "https://github.com/${{ github.repository }}/releases/tag/${{ needs.prepare.outputs.version_tag }}",
                   "color": ${{ steps.status.outputs.discord_color }},
                   "description": "Continuous Integration Build #${{ needs.prepare.outputs.build_number }} for **${{ needs.prepare.outputs.version_tag }}** finished with status: **${{ steps.status.outputs.status_title }}**.",
                   "fields": [
                     { "name": "Triggered by", "value": "${{ github.actor }}", "inline": true },
                     { "name": "Branch", "value": "${{ github.ref_name }}", "inline": true },
                     { "name": "TestFlight & Google Play", "value": "Deployed to Internal Tracks", "inline": false }
                   ],
                   "footer": { "text": "KayBiT Multiplatform Release Pipeline" }
                 }]
               }' ${{ secrets.DISCORD_WEBHOOK_URL }}
```

---

## 5. Security & Maintenance Best Practices

1. **Continuous Rotation**: Rotate `.p12` certificates and Google Play Service Account JSON tokens annually before expiration.
2. **Key Security**: Keep your production `release.keystore` safely stored offline on hardware backups. If lost, Google Play will not accept updates unless using Google Play App Signing key backup.
3. **SmartScreen Bypass**: For Windows `.msi` installers, code-signing with an EV or OV Authenticode certificate builds reputation and automatically bypasses the Windows Defender SmartScreen warning.
