// Signin.js - Updated handleLogin function
const handleLogin = async() => {
    setLoading(true);
    
    try {
      const result = await loginWithEmailPassword(inputs.email, inputs.password);
      
      if (result.success) {
        console.log("Login successful");
        // Navigation is handled by AuthContext update
      } else {
        // Handle different error types
        switch(result.type) {
          case 'GOOGLE_ACCOUNT':
            showGoogleAccountAlert(result.email);
            break;
            
          case 'NO_PASSWORD':
            showSetPasswordAlert(result.email);
            break;
            
          case 'VERIFICATION_REQUIRED':
            Alert.alert(
              'Verification Required',
              'Please verify your email before logging in.',
              [
                { text: 'Resend Verification', onPress: () => resendVerification(result.email) },
                { text: 'OK', style: 'default' }
              ]
            );
            break;
            
          default:
            Alert.alert('Login Failed', result.error);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function for Google account alert
  const showGoogleAccountAlert = (email) => {
    Alert.alert(
      'Account Created with Google',
      'This account was created using Google. How would you like to proceed?',
      [
        {
          text: 'Use Google Login',
          onPress: () => {
            // Navigate to Google sign-in
            navigation.navigate(ROUTES.getting_started, { 
              prefillEmail: email 
            });
          }
        },
        {
          text: 'Set Password',
          onPress: () => {
            navigation.navigate(ROUTES.set_password, { email });
          }
        },
        {
          text: 'Reset Password',
          onPress: () => {
            navigation.navigate(ROUTES.forgot_password, { prefillEmail: email });
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  // Helper function for set password alert
  const showSetPasswordAlert = (email) => {
    Alert.alert(
      'Password Required',
      'You need to set a password for your account first.',
      [
        {
          text: 'Set Password',
          onPress: () => {
            navigation.navigate(ROUTES.set_password, { email });
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  // Add to navigation params
  const resendVerification = async (email) => {
    try {
      // Call your backend to resend verification
      await axios.post(`${API_CONFIG.baseUrl}/auth/resend_verification`, { email });
      Alert.alert('Success', 'Verification email sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email.');
    }
  };



  