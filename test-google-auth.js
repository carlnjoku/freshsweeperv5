// test-google-auth.js
const fs = require('fs');

try {
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  
  console.log('=== Current App Configuration ===');
  console.log(`App Name: ${appJson.expo.name}`);
  console.log(`App Slug: ${appJson.expo.slug}`);
  console.log(`iOS Bundle ID: ${appJson.expo.ios?.bundleIdentifier || 'Not set'}`);
  console.log(`Android Package: ${appJson.expo.android?.package || 'Not set'}`);
  
  console.log('\n=== Required Google Cloud Console Setup ===');
  console.log('1. Create Web Application OAuth Client ID');
  console.log('2. Name: "FreshSweeper (Expo)"');
  console.log('3. Authorized JavaScript origins:');
  console.log('   - https://auth.expo.io');
  console.log('4. Authorized redirect URIs:');
  console.log(`   - https://auth.expo.io/@YOUR_USERNAME/${appJson.expo.slug}`);
  console.log('\n=== Testing Instructions ===');
  console.log('1. First test with JUST expoClientId');
  console.log('2. Only add platform IDs after Expo Go works');
  console.log('3. Make sure redirect URI matches EXACTLY');
  
} catch (error) {
  console.error('Error:', error.message);
}