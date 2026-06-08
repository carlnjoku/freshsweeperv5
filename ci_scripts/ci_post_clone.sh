#!/bin/bash
set -e

echo "🚀 Running Xcode Cloud post-clone script for Expo"

# Navigate back to the repository root from the ci_scripts folder
cd ../..

echo "📦 Installing Node.js and CocoaPods..."
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node cocoapods

echo "📦 Installing NPM dependencies..."
npm install

echo "🏗️ Generating native iOS project with Expo Prebuild..."
npx expo prebuild --clean --platform ios --non-interactive

echo "✅ Xcode Cloud post-clone script finished."