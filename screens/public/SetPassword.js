// Signin.js - Updated handleLogin function
const handleLogin = async () => {
  setLoading(true);

  try {
    const result = await loginWithEmailPassword(
      inputs.email.trim(),
      inputs.password
    );

    if (result.success) {
      console.log('Login successful');

      // AuthContext handles the authenticated state/navigation.
      return;
    }

    switch (result.type) {
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
            {
              text: 'Resend Verification',
              onPress: () => resendVerification(result.email),
            },
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
        break;

      default:
        Alert.alert(
          'Login Failed',
          result.error || 'Unable to log in. Please check your credentials and try again.'
        );
        break;
    }
  } catch (error) {
    console.error('Login error:', error);

    Alert.alert(
      'Error',
      'Something went wrong. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

// ---------------------------------------------------------
// Google account helper
// ---------------------------------------------------------
const showGoogleAccountAlert = (email) => {
  Alert.alert(
    'Account Created with Google',
    'This account was created using Google. How would you like to proceed?',
    [
      {
        text: 'Use Google Login',
        onPress: () => {
          navigation.navigate(ROUTES.getting_started, {
            prefillEmail: email,
          });
        },
      },
      {
        text: 'Set Password',
        onPress: () => {
          navigation.navigate(ROUTES.set_password, {
            email,
          });
        },
      },
      {
        text: 'Reset Password',
        onPress: () => {
          navigation.navigate(ROUTES.forgot_password, {
            prefillEmail: email,
          });
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// ---------------------------------------------------------
// Password-required helper
// ---------------------------------------------------------
const showSetPasswordAlert = (email) => {
  Alert.alert(
    'Password Required',
    'You need to set a password for your account first.',
    [
      {
        text: 'Set Password',
        onPress: () => {
          navigation.navigate(ROUTES.set_password, {
            email,
          });
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// ---------------------------------------------------------
// Resend email verification
// ---------------------------------------------------------
const resendVerification = async (email) => {
  if (!email) {
    Alert.alert(
      'Error',
      'We could not determine your email address.'
    );
    return;
  }

  try {
    await axios.post(
      `${API_CONFIG.baseUrl}/auth/resend_verification`,
      {
        email: email.trim(),
      }
    );

    Alert.alert(
      'Success',
      'Verification email sent!'
    );
  } catch (error) {
    console.error(
      'Resend verification error:',
      error
    );

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Failed to resend verification email. Please try again.';

    Alert.alert(
      'Error',
      message
    );
  }
};