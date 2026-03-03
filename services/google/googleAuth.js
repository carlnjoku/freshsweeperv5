// // services/googleAuth.js
// import * as AuthSession from 'expo-auth-session';
// import * as Crypto from 'expo-crypto';
// import { GOOGLE_CONFIG, GOOGLE_DISCOVERY } from './auth';

// export class GoogleAuthService {
//     static async initiateAuth() {
//         try {
//             // Generate code verifier and challenge for PKCE
//             const codeVerifier = await Crypto.randomUUID();
//             const codeChallenge = await Crypto.digestStringAsync(
//                 Crypto.CryptoDigestAlgorithm.SHA256,
//                 codeVerifier
//             );

//             // Create auth request
//             const request = new AuthSession.AuthRequest({
//                 clientId: GOOGLE_CONFIG.clientId,
//                 redirectUri: GOOGLE_CONFIG.redirectUri,
//                 scopes: GOOGLE_CONFIG.scopes,
//                 usePKCE: true,
//                 codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
//                 codeChallenge,
//                 extraParams: GOOGLE_CONFIG.extraParams,
//             });
            
//             // Prompt user to authenticate
//             const result = await request.promptAsync(GOOGLE_DISCOVERY);
            

//             if (result.type === 'success') {
//                 return {
//                     success: true,
//                     code: result.params.code,
//                     codeVerifier: codeVerifier,
//                     redirectUri: GOOGLE_CONFIG.redirectUri,
//                 };
//             } else if (result.type === 'cancel') {
//                 return {
//                     success: false,
//                     error: 'User cancelled authentication',
//                 };
//             } else {
//                 return {
//                     success: false,
//                     error: 'Authentication failed',
//                 };
//             }

            
            
//         } catch (error) {
//             console.error('Google auth error:', error);
//             return {
//                 success: false,
//                 error: error.message || 'Authentication failed',
//             };
//         }
//     }

//     static extractUserInfoFromToken(token) {
//         // Parse JWT token to get user info
//         try {
//             const base64Url = token.split('.')[1];
//             const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//             const jsonPayload = decodeURIComponent(
//                 atob(base64)
//                     .split('')
//                     .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//                     .join('')
//             );

//             const payload = JSON.parse(jsonPayload);
//             return {
//                 email: payload.email,
//                 emailVerified: payload.email_verified || false,
//                 name: payload.name,
//                 givenName: payload.given_name,
//                 familyName: payload.family_name,
//                 picture: payload.picture,
//                 googleId: payload.sub,
//             };
//         } catch (error) {
//             console.error('Error parsing token:', error);
//             return null;
//         }

        
//     }
// }




// services/googleAuth.js
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CONFIG, GOOGLE_DISCOVERY } from './auth';

// Open WebBrowser on component mount for better OAuth experience
WebBrowser.maybeCompleteAuthSession();

export class GoogleAuthService {
  static async initiateAuth(emailHint = null) {
    try {
      console.log("🚀 Starting Google OAuth flow...");
      console.log("📧 Email hint provided:", emailHint || 'No email hint');
      
      // Generate code verifier and challenge for PKCE
      const codeVerifier = await Crypto.randomUUID();
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier
      );

      // Prepare extra params - include login_hint if email is provided
      const extraParams = {
        ...GOOGLE_CONFIG.extraParams,
        ...(emailHint ? { login_hint: emailHint } : {})
      };

      console.log("🔗 Extra params:", extraParams);

      // Create auth request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.clientId,
        redirectUri: GOOGLE_CONFIG.redirectUri,
        scopes: GOOGLE_CONFIG.scopes,
        usePKCE: true,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        codeChallenge,
        extraParams,
      });
      
      // Configure the request
      request.shouldAutoExchangeCode = false; // We'll handle code exchange manually
      
      // Build authorization URL manually for better control
      const authUrl = `${GOOGLE_DISCOVERY.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(GOOGLE_CONFIG.clientId)}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(GOOGLE_CONFIG.scopes.join(' '))}&` +
        `code_challenge=${encodeURIComponent(codeChallenge)}&` +
        `code_challenge_method=S256&` +
        Object.entries(extraParams)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');

      console.log("🔗 Full auth URL (first 200 chars):", authUrl.substring(0, 200) + "...");

      // Prompt user to authenticate using WebBrowser for better reliability
      let result;
      try {
        console.log("🔐 Opening Google OAuth in browser...");
        result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          GOOGLE_CONFIG.redirectUri,
          {
            showTitle: false,
            enableBarCollapsing: true,
            preferEphemeralSession: false, // Allow persistence for easier future logins
          }
        );
      } catch (browserError) {
        console.error("❌ WebBrowser error:", browserError);
        return {
          success: false,
          error: 'Failed to open authentication. Please check your internet connection.',
        };
      }

      console.log("📱 Auth session result type:", result.type);
      console.log("📱 Auth session result:", result);

      if (result.type === 'success') {
        // Parse the URL to get the code
        const url = new URL(result.url);
        const params = new URLSearchParams(url.search);
        const code = params.get('code');
        
        if (!code) {
          console.error("❌ No code found in response");
          console.log("URL parameters:", Array.from(params.entries()));
          return {
            success: false,
            error: 'No authorization code received from Google.',
          };
        }

        console.log("✅ Google auth successful");
        console.log("🔑 Code received:", code.substring(0, 20) + "...");

        return {
          success: true,
          code: code,
          codeVerifier: codeVerifier,
          redirectUri: GOOGLE_CONFIG.redirectUri,
          emailHint: emailHint,
        };
      } else if (result.type === 'cancel') {
        console.log("⚠️ User cancelled Google authentication");
        return {
          success: false,
          error: 'User cancelled authentication',
        };
      } else {
        console.error("❌ Authentication failed with type:", result.type);
        return {
          success: false,
          error: result.type === 'dismiss' ? 'Authentication dismissed' : 'Authentication failed',
        };
      }
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      console.error('❌ Error stack:', error.stack);
      return {
        success: false,
        error: error.message || 'Authentication failed. Please try again.',
      };
    }
  }

  static async initiateAuthLegacy(emailHint = null) {
    // Legacy version using AuthSession for backward compatibility
    try {
      console.log("🔄 Using legacy AuthSession for Google OAuth...");
      
      // Generate code verifier and challenge for PKCE
      const codeVerifier = await Crypto.randomUUID();
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier
      );

      // Prepare extra params - include login_hint if email is provided
      const extraParams = {
        ...GOOGLE_CONFIG.extraParams,
        ...(emailHint ? { login_hint: emailHint } : {})
      };

      // Create auth request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.clientId,
        redirectUri: GOOGLE_CONFIG.redirectUri,
        scopes: GOOGLE_CONFIG.scopes,
        usePKCE: true,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        codeChallenge,
        extraParams,
      });

      // Prompt user to authenticate
      const result = await request.promptAsync(GOOGLE_DISCOVERY);
      
      console.log("📱 AuthSession result type:", result.type);

      if (result.type === 'success') {
        console.log("✅ Google auth successful (legacy)");
        return {
          success: true,
          code: result.params.code,
          codeVerifier: codeVerifier,
          redirectUri: GOOGLE_CONFIG.redirectUri,
          emailHint: emailHint,
        };
      } else if (result.type === 'cancel') {
        console.log("⚠️ User cancelled Google authentication (legacy)");
        return {
          success: false,
          error: 'User cancelled authentication',
        };
      } else {
        console.error("❌ Authentication failed (legacy) with type:", result.type);
        return {
          success: false,
          error: 'Authentication failed',
        };
      }
      
    } catch (error) {
      console.error('❌ Google auth error (legacy):', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  static extractUserInfoFromToken(token) {
    // Parse JWT token to get user info
    try {
      // Handle JWT token parsing (same as before)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Handle both browser and React Native environments
      let jsonPayload;
      if (typeof atob === 'function') {
        jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } else {
        // For React Native, use Buffer if available
        if (typeof Buffer !== 'undefined') {
          jsonPayload = JSON.parse(Buffer.from(base64, 'base64').toString());
        } else {
          // Fallback to polyfill
          const decoded = this.base64Decode(base64);
          jsonPayload = JSON.parse(decoded);
        }
      }

      const payload = typeof jsonPayload === 'string' ? JSON.parse(jsonPayload) : jsonPayload;
      return {
        email: payload.email,
        emailVerified: payload.email_verified || false,
        name: payload.name,
        givenName: payload.given_name,
        familyName: payload.family_name,
        picture: payload.picture,
        googleId: payload.sub,
        locale: payload.locale,
      };
    } catch (error) {
      console.error('❌ Error parsing token:', error);
      return null;
    }
  }

  // Helper method for base64 decoding in React Native
  static base64Decode(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    
    let i = 0;
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    
    while (i < base64.length) {
      const enc1 = chars.indexOf(base64.charAt(i++));
      const enc2 = chars.indexOf(base64.charAt(i++));
      const enc3 = chars.indexOf(base64.charAt(i++));
      const enc4 = chars.indexOf(base64.charAt(i++));
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }
    
    return decodeURIComponent(escape(output));
  }
}