// screens/auth/ResetPassword.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Keyboard,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { TextInput, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

// import authService from '../../services/connection/authService';
import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    isError: false,
  });

  // Extract token from deep link on component mount
  useEffect(() => {
    let subscription;

    const getTokenFromUrl = async () => {
      try {
        // Check if token was passed as route param
        if (route.params?.token) {
          setToken(route.params.token);
          return;
        }

        // Otherwise, try to get initial URL
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl) {
          const parsedToken = extractTokenFromUrl(initialUrl);

          if (parsedToken) {
            setToken(parsedToken);
          }
        }

        // Listen for subsequent deep links while app is open
        subscription = Linking.addEventListener('url', ({ url }) => {
          const parsedToken = extractTokenFromUrl(url);

          if (parsedToken) {
            setToken(parsedToken);
          }
        });
      } catch (error) {
        console.error('Failed to parse deep link:', error);

        showMessage(
          tSafe(
            'invalid_link',
            'Invalid reset link. Please request a new one.'
          ),
          true
        );
      }
    };

    getTokenFromUrl();

    return () => {
      subscription?.remove();
    };
  }, [route.params?.token]);

  const extractTokenFromUrl = (url) => {
    // Expected formats:
    // com.flavoursoft.freshsweeperv5://reset-password?token=eyJ...
    // https://freshsweeper.com/reset-password?token=...

    const match = url.match(/[?&]token=([^&]+)/);

    return match ? decodeURIComponent(match[1]) : null;
  };

  const showMessage = (message, isError = false) => {
    setSnackbar({
      visible: true,
      message,
      isError,
    });
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError(
        tSafe('password_required', 'Password is required')
      );
      return false;
    }

    if (password.length < 6) {
      setPasswordError(
        tSafe(
          'password_min_length',
          'Password must be at least 6 characters'
        )
      );
      return false;
    }

    setPasswordError('');
    return true;
  };

  const validateConfirm = () => {
    if (!confirmPassword) {
      setConfirmError(
        tSafe(
          'confirm_required',
          'Please confirm your password'
        )
      );
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmError(
        tSafe(
          'password_mismatch',
          'Passwords do not match'
        )
      );
      return false;
    }

    setConfirmError('');
    return true;
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirm();

    if (!isPasswordValid || !isConfirmValid) {
      return;
    }

    if (!token) {
      showMessage(
        tSafe(
          'missing_token',
          'Invalid or missing reset token. Please request a new link.'
        ),
        true
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        token,
        newPassword: password,
      });

      showMessage(
        response.data?.message ||
          tSafe(
            'reset_success',
            'Password reset successful! Please log in.'
          ),
        false
      );

      setTimeout(() => {
        navigation.navigate(ROUTES.signin);
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);

      let errorMessage = tSafe(
        'network_error',
        'Network error. Please try again.'
      );

      if (error.response) {
        const status = error.response.status;

        const detail =
          error.response.data?.detail ||
          error.response.data?.message;

        if (
          status === 400 &&
          detail?.toLowerCase().includes('expired')
        ) {
          errorMessage = tSafe(
            'token_expired',
            'Reset link has expired. Please request a new one.'
          );
        } else if (status === 400) {
          errorMessage =
            detail ||
            tSafe(
              'invalid_token',
              'Invalid reset link.'
            );
        } else if (status === 404) {
          errorMessage = tSafe(
            'token_not_found',
            'Reset link not found.'
          );
        } else {
          errorMessage =
            detail ||
            tSafe(
              'reset_failed',
              'Unable to reset password. Please try again.'
            );
        }
      } else if (error.request) {
        errorMessage = tSafe(
          'no_server_response',
          'Cannot connect to server. Check your internet.'
        );
      }

      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !snackbar.visible) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            variant="body"
            style={styles.loadingText}
          >
            {tSafe('loading', 'Loading...')}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <AppText
              variant="title"
              style={styles.title}
            >
              {tSafe('reset_password', 'Reset Password')}
            </AppText>

            <AppText
              variant="body"
              style={styles.subtitle}
            >
              {tSafe(
                'reset_instruction',
                'Enter your new password below.'
              )}
            </AppText>
          </View>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              label={tSafe('new_password', 'New Password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);

                if (passwordError) {
                  validatePassword();
                }

                if (
                  confirmError &&
                  text === confirmPassword
                ) {
                  validateConfirm();
                }
              }}
              secureTextEntry
              returnKeyType="next"
              error={!!passwordError}
              outlineColor={theme.input.border}
              activeOutlineColor={theme.input.focus}
              textColor={theme.input.text}
              placeholderTextColor={theme.input.placeholder}
              style={styles.input}
              contentStyle={styles.inputContent}
              left={
                <TextInput.Icon
                  icon="lock-outline"
                  color={
                    passwordError
                      ? theme.status.error
                      : theme.icon.default
                  }
                />
              }
              theme={{
                roundness: 16,
                colors: {
                  background: theme.input.background,
                  onSurfaceVariant: theme.text.secondary,
                  primary: theme.input.focus,
                  error: theme.status.error,
                  outline: theme.input.border,
                },
              }}
            />

            {passwordError ? (
              <AppText
                variant="caption"
                style={styles.errorText}
              >
                {passwordError}
              </AppText>
            ) : null}

            <TextInput
              mode="outlined"
              label={tSafe(
                'confirm_password',
                'Confirm Password'
              )}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);

                if (confirmError) {
                  validateConfirm();
                }
              }}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
              error={!!confirmError}
              outlineColor={theme.input.border}
              activeOutlineColor={theme.input.focus}
              textColor={theme.input.text}
              placeholderTextColor={theme.input.placeholder}
              style={styles.input}
              contentStyle={styles.inputContent}
              left={
                <TextInput.Icon
                  icon="lock-check-outline"
                  color={
                    confirmError
                      ? theme.status.error
                      : theme.icon.default
                  }
                />
              }
              theme={{
                roundness: 16,
                colors: {
                  background: theme.input.background,
                  onSurfaceVariant: theme.text.secondary,
                  primary: theme.input.focus,
                  error: theme.status.error,
                  outline: theme.input.border,
                },
              }}
            />

            {confirmError ? (
              <AppText
                variant="caption"
                style={styles.errorText}
              >
                {confirmError}
              </AppText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator
                  color={theme.button.primaryText}
                />
              ) : (
                <AppText
                  variant="button"
                  style={styles.buttonText}
                >
                  {tSafe(
                    'reset_password_button',
                    'Reset Password'
                  )}
                </AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(ROUTES.signin)
              }
              style={styles.linkContainer}
            >
              <AppText
                variant="body"
                style={styles.linkText}
              >
                {tSafe(
                  'back_to_login',
                  '← Back to Login'
                )}
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={4000}
          style={
            snackbar.isError
              ? styles.errorSnackbar
              : styles.successSnackbar
          }
          wrapperStyle={styles.snackbarWrapper}
        >
          <AppText style={styles.snackbarText}>
            {snackbar.message}
          </AppText>
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.default,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  form: {
    backgroundColor: theme.card.background,
    borderColor: theme.card.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,

    shadowColor: theme.shadow?.color || '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme.shadow?.opacity ?? 0.05,
    shadowRadius: 10,

    elevation: 3,
  },

  input: {
    marginBottom: 8,
    backgroundColor: theme.input.background,
  },

  inputContent: {
    color: theme.input.text,
  },

  errorText: {
    color: theme.status.error,
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
  },

  button: {
    backgroundColor: theme.button.primaryBackground,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
    minHeight: 52,
  },

  buttonDisabled: {
    backgroundColor:
      theme.button.disabledBackground ||
      theme.status.pending,
    opacity: 0.7,
  },

  buttonText: {
    color: theme.button.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },

  linkContainer: {
    alignItems: 'center',
  },

  linkText: {
    color: theme.brand.primary,
    fontSize: 14,
    fontWeight: '500',
  },

  errorSnackbar: {
    backgroundColor: theme.status.error,
  },

  successSnackbar: {
    backgroundColor: theme.status.success,
  },

  snackbarText: {
    color: theme.text.inverse,
  },

  snackbarWrapper: {
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.text.secondary,
  },
});

export default ResetPassword;