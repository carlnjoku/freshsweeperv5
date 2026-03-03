#!/bin/bash
echo "Fixing ExpoModulesCorePlugin.gradle..."

# Backup the file
cp node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle \
   node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle.backup

# Apply the fixes
sed -i '' 's/android().buildTypes.all {/project.android.buildTypes.all {/g' \
    node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle

sed -i '' 's/components.release {/project.components.release {/g' \
    node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle

echo "✅ File fixed!"
