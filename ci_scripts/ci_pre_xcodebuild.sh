#!/bin/bash
set -e

echo "=== Cleaning DerivedData and build folders ==="
cd "$CI_PRIMARY_REPOSITORY_PATH"
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# (Keep your existing npm install and verification steps here)
export PATH="/usr/local/bin:$PATH"
npm install

echo "=== Cleaning DerivedData to avoid cache issues ==="
rm -rf "$CI_PRIMARY_REPOSITORY_PATH/ios/build"
rm -rf "$CI_PRIMARY_REPOSITORY_PATH/ios/DerivedData"

echo "=== Running ci_pre_xcodebuild.sh ==="

# Ensure Node is in PATH
export PATH="/usr/local/bin:$PATH"

# Go to the repository root
cd "$CI_PRIMARY_REPOSITORY_PATH"

echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"

# Install dependencies – this ensures react-native scripts are available
echo "Installing npm dependencies..."
npm install

# Verify the critical script exists
if [ -f "node_modules/react-native/scripts/xcode/with-environment.sh" ]; then
    echo "✅ with-environment.sh found"
else
    echo "❌ with-environment.sh missing – re-running npm install"
    npm install --force
fi

# Optional: verify ios/Pods structure (keep your old check)
echo "=== Verifying ios/Pods structure ==="
ls -la "$CI_PRIMARY_REPOSITORY_PATH/ios/Pods/Target Support Files/Pods-freshsweeper/" || true

echo "=== Workspace contents ==="
cat "$CI_PRIMARY_REPOSITORY_PATH/ios/freshsweeper.xcworkspace/contents.xcworkspacedata" || true

echo "=== ci_pre_xcodebuild.sh finished ==="