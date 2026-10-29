import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  BackHandler,
  AppState,
  DeviceEventEmitter,
} from 'react-native';

import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';

import {
  MaterialIcons,
  Ionicons,
} from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';

import ROUTES from '../../../constants/routes';
import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';
import VerificationListItem from '../../../components/cleaner/VerificationListItem';

import uploadFile from '../../../services/firebase/UploadFile';

import { tSafe } from '../../../utils/tSafe';
import { navigationRef } from '../../../utils/navigationRef';

import { useTheme } from '../../../theme';
import { AppText } from '../../../ui';

const AccountVerificationGate = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    currentUserId,
    currentUser,
    updateUser,
    logout,
  } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  const styles = createStyles(theme, isDark);

  const expoPushToken =
    route.params?.expo_push_token;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [verifyList, setVerifyList] =
    useState([]);

  const [avatarUri, setAvatarUri] =
    useState(null);

  const [accountId, setAccountId] =
    useState(null);

  const [onboardingUrl, setOnboardingUrl] =
    useState(null);

  const [onboardingStatus, setOnboardingStatus] =
    useState('Not Onboarded');

  const [processingDeepLink, setProcessingDeepLink] =
    useState(false);

  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const processedDeepLinkRef =
    useRef(null);

  const appState =
    useRef(AppState.currentState);

  // ===========================================================================
  // Deep-link parameters
  // ===========================================================================

  const deepLinkParams =
    route.params || {};

  const {
    cleanerId: deepLinkCleanerId,
    stripe_account_id:
      deepLinkStripeAccountId,
    timestamp: deepLinkTimestamp,
    type: deepLinkType,
    source: deepLinkSource,
    flow: deepLinkFlow,
    redirect_to:
      deepLinkRedirectTo,
  } = deepLinkParams;

  // ===========================================================================
  // Verification helpers
  // ===========================================================================

  const isFullyVerified = u =>
    !!u?.avatar?.trim() &&
    !!u?.onboarding_completed &&
    !!u?.identity_verified;

  // ===========================================================================
  // App state listener
  // ===========================================================================

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        nextAppState => {
          if (
            appState.current.match(
              /inactive|background/
            ) &&
            nextAppState === 'active'
          ) {
            console.log(
              'App came to foreground, checking for updates...'
            );

            refreshVerificationStatus();
          }

          appState.current =
            nextAppState;
        }
      );

    return () => {
      subscription.remove();
    };
  }, []);

  // ===========================================================================
  // Verification deep-link listener
  // ===========================================================================

  useEffect(() => {
    console.log(
      '🔍 Checking for verification-complete deep link:',
      deepLinkParams
    );

    if (
      deepLinkCleanerId &&
      deepLinkCleanerId === currentUserId
    ) {
      console.log(
        '✅ Received verification-complete deep link with cleanerId:',
        deepLinkCleanerId
      );

      Alert.alert(
        tSafe(
          'payment_setup_complete_title',
          'Payment Setup Complete!'
        ),
        tSafe(
          'payment_setup_complete_message',
          'Your Stripe account has been successfully connected. You can now receive payments.'
        ),
        [
          {
            text: tSafe(
              'continue',
              'Continue'
            ),
            onPress: () => {
              refreshVerificationStatus(
                true
              );
            },
          },
        ]
      );
    }

    const verificationSubscription =
      DeviceEventEmitter.addListener(
        'verificationComplete',
        data => {
          console.log(
            '📬 Verification complete event received:',
            data
          );

          if (
            data.cleanerId ===
            currentUserId
          ) {
            handleIDVerificationComplete(
              data.cleanerId
            );
          }
        }
      );

    return () =>
      verificationSubscription.remove();
  }, [
    deepLinkCleanerId,
    currentUserId,
  ]);

  // ===========================================================================
  // Stripe onboarding deep-link handler
  // ===========================================================================

  useEffect(() => {
    if (
      deepLinkStripeAccountId &&
      deepLinkCleanerId ===
        currentUserId &&
      !processingDeepLink
    ) {
      const deepLinkKey =
        `${deepLinkStripeAccountId}_${deepLinkTimestamp}`;

      if (
        processedDeepLinkRef.current !==
        deepLinkKey
      ) {
        processedDeepLinkRef.current =
          deepLinkKey;

        handleStripeOnboardingComplete();
      }
    }
  }, [
    deepLinkStripeAccountId,
    deepLinkCleanerId,
    currentUserId,
  ]);

  // ===========================================================================
  // ID verification complete
  // ===========================================================================

  const handleIDVerificationComplete =
    async cleanerId => {
      try {
        console.log(
          '✅ Handling ID verification completion for cleaner:',
          cleanerId
        );

        Alert.alert(
          tSafe(
            'id_verification_complete_title',
            'ID Verification Complete!'
          ),
          tSafe(
            'id_verification_complete_message',
            'Your identity has been successfully verified.'
          ),
          [
            {
              text: tSafe(
                'continue',
                'Continue'
              ),
              onPress: async () => {
                await refreshVerificationStatus(
                  true
                );
              },
            },
          ]
        );
      } catch (error) {
        console.error(
          'Error handling ID verification complete:',
          error
        );

        Alert.alert(
          tSafe(
            'error',
            'Error'
          ),
          tSafe(
            'failed_update_verification_status',
            'Failed to update verification status.'
          )
        );
      }
    };

  // ===========================================================================
  // Stripe onboarding complete
  // ===========================================================================

  const handleStripeOnboardingComplete =
    async () => {
      if (processingDeepLink) {
        return;
      }

      setProcessingDeepLink(true);

      try {
        console.log(
          'Processing Stripe onboarding completion deep link:',
          deepLinkParams
        );

        setOnboardingStatus(
          tSafe(
            'verifying',
            'Verifying...'
          )
        );

        const verificationResult =
          await verifyStripeOnboardingStatus(
            deepLinkCleanerId,
            deepLinkStripeAccountId
          );

        if (
          verificationResult.charges_enabled
        ) {
          await updateUserOnboardingStatus(
            deepLinkCleanerId,
            true
          );

          setOnboardingStatus(
            tSafe(
              'onboarded',
              'Onboarded'
            )
          );

          await refreshVerificationStatus(
            true
          );

          Alert.alert(
            tSafe(
              'payment_setup_complete_title',
              'Payment Setup Complete!'
            ),
            tSafe(
              'payment_setup_complete_message',
              'Your Stripe account has been successfully connected. You can now receive payments.'
            ),
            [
              {
                text: tSafe(
                  'ok',
                  'OK'
                ),
              },
            ]
          );
        } else {
          setOnboardingStatus(
            tSafe(
              'not_onboarded',
              'Not Onboarded'
            )
          );

          Alert.alert(
            tSafe(
              'verification_in_progress_title',
              'Verification in Progress'
            ),
            tSafe(
              'verification_in_progress_message',
              'Your Stripe account is being verified. This may take a few minutes.'
            ),
            [
              {
                text: tSafe(
                  'ok',
                  'OK'
                ),
              },
            ]
          );
        }
      } catch (error) {
        console.error(
          'Error processing Stripe onboarding:',
          error
        );

        setOnboardingStatus(
          tSafe(
            'not_onboarded',
            'Not Onboarded'
          )
        );

        Alert.alert(
          tSafe(
            'verification_error_title',
            'Verification Error'
          ),
          tSafe(
            'verification_error_message',
            'There was an issue verifying your Stripe account. Please try again.'
          ),
          [
            {
              text: tSafe(
                'ok',
                'OK'
              ),
            },
          ]
        );
      } finally {
        setProcessingDeepLink(false);
      }
    };

  // ===========================================================================
  // Stripe verification
  // ===========================================================================

  const verifyStripeOnboardingStatus =
    async (
      cleanerId,
      stripeAccountId
    ) => {
      try {
        const response =
          await userService.verifyStripeOnboarding(
            {
              cleanerId,
              stripe_account_id:
                stripeAccountId,
            }
          );

        return response.data;
      } catch (error) {
        console.error(
          'Error verifying Stripe onboarding:',
          error
        );

        throw error;
      }
    };

  // ===========================================================================
  // Update onboarding status
  // ===========================================================================

  const updateUserOnboardingStatus =
    async (
      cleanerId,
      status
    ) => {
      try {
        await userService.updateOnboardingStatus(
          {
            userId: cleanerId,
            onboarding_completed:
              status,
          }
        );
      } catch (error) {
        console.error(
          'Error updating onboarding status:',
          error
        );

        throw error;
      }
    };

  // ===========================================================================
  // Refresh verification status
  // ===========================================================================

  const refreshVerificationStatus =
    async (force = false) => {
      if (!currentUserId) {
        return;
      }

      try {
        setLoading(true);

        const res =
          await userService.getUser(
            currentUserId
          );

        const updatedUser =
          res.data;

        console.log(
          'Refreshed user data:',
          updatedUser
        );

        setUser(updatedUser);

        setAvatarUri(
          updatedUser.avatar ||
            null
        );

        if (
          isFullyVerified(
            updatedUser
          )
        ) {
          await updateUser(
            updatedUser
          );

          if (
            navigationRef.isReady()
          ) {
            navigationRef.reset({
              index: 0,
              routes: [
                {
                  name: 'Cleaner',
                },
              ],
            });
          } else {
            console.error(
              '❌ Navigation ref not available'
            );
          }
        } else {
          const newOnboardingStatus =
            updatedUser.onboarding_completed
              ? tSafe(
                  'onboarded',
                  'Onboarded'
                )
              : tSafe(
                  'not_onboarded',
                  'Not Onboarded'
                );

          setOnboardingStatus(
            newOnboardingStatus
          );

          setVerifyList(
            generateVerificationItems(
              updatedUser
            )
          );

          if (
            force &&
            updatedUser.onboarding_completed
          ) {
            setVerifyList(
              generateVerificationItems(
                updatedUser
              )
            );
          }
        }
      } catch (error) {
        console.error(
          'refreshVerificationStatus error:',
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  // ===========================================================================
  // Focus refresh
  // ===========================================================================

  useFocusEffect(
    useCallback(() => {
      refreshVerificationStatus();

      if (
        deepLinkStripeAccountId ||
        deepLinkCleanerId
      ) {
        const timer =
          setTimeout(() => {
            refreshVerificationStatus();
          }, 1000);

        return () =>
          clearTimeout(timer);
      }
    }, [
      currentUserId,
      deepLinkStripeAccountId,
      deepLinkCleanerId,
    ])
  );

  // ===========================================================================
  // Initial refresh
  // ===========================================================================

  useEffect(() => {
    refreshVerificationStatus();
  }, []);

  // ===========================================================================
  // Stripe onboarding
  // ===========================================================================

  const onboardCleaner =
    async () => {
      try {
        setLoading(true);

        if (
          onboardingStatus ===
          'Not Onboarded'
        ) {
          const response =
            await userService.createStripeConnectAccount(
              {
                firstname:
                  user.firstname,
                lastname:
                  user.lastname,
                email:
                  user.email,
              }
            );

          setAccountId(
            response.data.account_id
          );

          const linkRes =
            await userService.createLinkUrl(
              response.data.account_id,
              user._id
            );

          setOnboardingUrl(
            linkRes.data.update_link
          );

          setOnboardingStatus(
            tSafe(
              'onboarding_in_progress',
              'Onboarding in Progress'
            )
          );

          processedDeepLinkRef.current =
            null;

          Linking.openURL(
            linkRes.data.update_link
          );

          if (
            Platform.OS ===
            'android'
          ) {
            setTimeout(() => {
              BackHandler.exitApp();
            }, 300);
          }
        }
      } catch (error) {
        console.error(
          'Onboarding error:',
          error.message
        );

        Alert.alert(
          tSafe(
            'error',
            'Error'
          ),
          error.response?.data ||
            tSafe(
              'failed_start_onboarding',
              'Failed to start onboarding.'
            )
        );
      } finally {
        setLoading(false);
      }
    };

  // ===========================================================================
  // Identity verification polling
  // ===========================================================================

  const startVerificationStatusPolling =
    (
      cleanerId,
      sessionId
    ) => {
      let attempts = 0;

      const maxAttempts = 30;

      const poll = async () => {
        attempts++;

        if (
          attempts >
          maxAttempts
        ) {
          console.log(
            'Polling timeout reached'
          );

          return;
        }

        try {
          const response =
            await userService.checkVerificationStatus(
              cleanerId
            );

          const status =
            response.data;

          if (
            status.identity_verified ===
            'verified'
          ) {
            Alert.alert(
              tSafe(
                'verification_complete_title',
                'Verification Complete!'
              ),
              tSafe(
                'verification_complete_message',
                'Your identity has been successfully verified.'
              ),
              [
                {
                  text: tSafe(
                    'continue',
                    'Continue'
                  ),
                  onPress: () =>
                    refreshVerificationStatus(
                      true
                    ),
                },
              ]
            );

            return;
          }

          if (
            status.identity_verified ===
              'failed' ||
            status.identity_verified ===
              'canceled'
          ) {
            Alert.alert(
              tSafe(
                'verification_failed_title',
                'Verification Failed'
              ),
              tSafe(
                'verification_failed_message',
                'Please try the verification process again.'
              ),
              [
                {
                  text: tSafe(
                    'ok',
                    'OK'
                  ),
                },
              ]
            );

            return;
          }

          setTimeout(
            poll,
            10000
          );
        } catch (error) {
          console.error(
            'Polling error:',
            error
          );

          setTimeout(
            poll,
            10000
          );
        }
      };

      setTimeout(
        poll,
        5000
      );
    };

  // ===========================================================================
  // Verification item press
  // ===========================================================================

  const handlePress =
    async type => {
      if (type === 'avatar') {
        addImage();

        return;
      }

      if (
        type === 'onboarding'
      ) {
        onboardCleaner();

        return;
      }

      if (
        type ===
        'verify_identity'
      ) {
        try {
          const returnUrl =
            'https://www.freshsweeper.com/id-verification-complete';

          const response =
            await userService.createVerificationSession(
              {
                cleanerId:
                  currentUserId,

                return_url:
                  `${returnUrl}?cleanerId=${currentUserId}`,

                ...user,
              }
            );

          Linking.openURL(
            response.data.url
          );

          startVerificationStatusPolling(
            currentUserId,
            response.data.sessionId
          );
        } catch (err) {
          console.error(
            'ID verification error:',
            err.message
          );

          Alert.alert(
            tSafe(
              'error',
              'Error'
            ),
            tSafe(
              'failed_start_id_verification',
              'Failed to start ID verification. Please try again.'
            )
          );
        }
      }
    };

  // ===========================================================================
  // Avatar update
  // ===========================================================================

  const getUploadedPhoto =
    async uploadedUrl => {
      try {
        if (!uploadedUrl) {
          throw new Error(
            'No uploaded image URL was returned.'
          );
        }

        const data = {
          userId:
            currentUserId,
          avatar:
            uploadedUrl,
        };

        // Save the Firebase Storage URL in the backend.
        await userService.updateProfileAvatar(
          data
        );

        // Refresh backend user data.
        await refreshVerificationStatus();

      } catch (err) {
        console.error(
          'Error after photo upload:',
          err
        );

        // Restore the previous avatar
        // if backend persistence fails.
        setAvatarUri(
          user?.avatar || null
        );

        Alert.alert(
          tSafe(
            'error',
            'Error'
          ),
          tSafe(
            'failed_update_profile_photo',
            'Failed to update your profile photo.'
          )
        );
      }
    };

  // ===========================================================================
  // Pick and upload profile image
  // ===========================================================================

  const addImage =
    async () => {
      if (uploadingAvatar) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            tSafe(
              'permission_required',
              'Permission required'
            ),
            tSafe(
              'photo_permission_message',
              'We need access to your photos to upload a profile picture.'
            )
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              allowsEditing:
                true,

              aspect: [4, 4],

              quality: 0.8,
            }
          );

        if (result.canceled) {
          return;
        }

        if (
          !result.assets ||
          !Array.isArray(
            result.assets
          ) ||
          !result.assets.length
        ) {
          console.warn(
            'ImagePicker returned no assets:',
            result
          );

          return;
        }

        const uri =
          result.assets[0].uri;

        if (!uri) {
          throw new Error(
            'No image URI was returned.'
          );
        }

        // Show selected image immediately.
        setAvatarUri(uri);

        setUploadingAvatar(true);

        // ---------------------------------------------------------------
        // THIS IS THE WORKING FIREBASE STORAGE PATTERN
        // ---------------------------------------------------------------

        const imageExtension =
          uri
            .split('.')
            .pop()
            ?.split('?')[0] ||
          'jpg';

        const imageName =
          `avatar_${currentUserId}.${imageExtension}`;

        const storagePath =
          `profile/${imageName}`;

        console.log(
          'Uploading avatar:',
          storagePath
        );

        const uploadedUrl =
          await uploadFile(
            uri,
            storagePath
          );

        if (!uploadedUrl) {
          throw new Error(
            'Firebase Storage upload did not return a URL.'
          );
        }

        console.log(
          'Firebase Storage upload successful.'
        );

        // Save URL through backend.
        await getUploadedPhoto(
          uploadedUrl
        );

      } catch (error) {
        console.error(
          'Profile photo upload error:',
          error
        );

        // Restore previous backend avatar
        // if anything failed.
        setAvatarUri(
          user?.avatar || null
        );

        Alert.alert(
          tSafe(
            'error',
            'Error'
          ),
          error?.message ||
            tSafe(
              'failed_upload_photo',
              'Failed to upload your profile photo.'
            )
        );
      } finally {
        setUploadingAvatar(false);
      }
    };

  // ===========================================================================
  // Verification items
  // ===========================================================================

  const generateVerificationItems =
    userData => {
      const hasAvatar =
        !!userData.avatar?.trim();

      const hasOnboarded =
        !!userData.onboarding_completed;

      const hasVerifiedID =
        userData.identity_verified;

      const statusTranslations = {
        verified: tSafe(
          'identity_verified',
          'Identity Verified'
        ),

        pending: tSafe(
          'verification_in_progress',
          'Verification in Progress'
        ),

        requires_input: tSafe(
          'more_info_needed',
          'More Info Needed'
        ),

        failed: tSafe(
          'verification_failed',
          'Verification Failed'
        ),

        default: tSafe(
          'verify_identity',
          'Verify Identity'
        ),
      };

      const labelForVerification =
        hasVerifiedID ===
        'verified'
          ? statusTranslations.verified
          : hasVerifiedID ===
            'pending'
          ? statusTranslations.pending
          : hasVerifiedID ===
            'requires_input'
          ? statusTranslations.requires_input
          : hasVerifiedID ===
            'failed'
          ? statusTranslations.failed
          : statusTranslations.default;

      const descriptionForVerification =
        hasVerifiedID ===
        'verified'
          ? tSafe(
              'identity_verified_description',
              'Your identity has been successfully verified.'
            )
          : hasVerifiedID ===
            'pending'
          ? tSafe(
              'identity_pending_description',
              'Your ID verification is being processed.'
            )
          : hasVerifiedID ===
            'requires_input'
          ? tSafe(
              'identity_requires_input_description',
              'Additional information is needed to verify your identity.'
            )
          : hasVerifiedID ===
            'failed'
          ? tSafe(
              'identity_failed_description',
              'ID verification failed. Please try again.'
            )
          : tSafe(
              'identity_required_description',
              'Confirm your ID to get started.'
            );

      return [
        {
          id: 1,
          icon: 'account',
          label: tSafe(
            'upload_profile_photo',
            'Upload Profile Photo'
          ),
          description: tSafe(
            'upload_profile_photo_description',
            'Helps build trust with hosts.'
          ),
          type: 'avatar',
          isCompleted:
            hasAvatar,
          isEnabled: true,
        },

        {
          id: 2,
          icon: 'credit-card',

          label: hasOnboarded
            ? tSafe(
                'payment_setup_complete',
                'Payment Setup Complete'
              )
            : tSafe(
                'set_up_payment',
                'Set Up Payment'
              ),

          description: hasOnboarded
            ? tSafe(
                'payment_setup_complete_description',
                'Your Stripe account is connected and ready for payouts.'
              )
            : tSafe(
                'set_up_payment_description',
                'Receive your payouts securely through Stripe.'
              ),

          type: 'onboarding',

          isCompleted:
            hasOnboarded,

          isEnabled:
            hasAvatar,

          status:
            hasOnboarded
              ? 'complete'
              : 'pending',
        },

        {
          id: 3,
          icon: 'shield-check',

          label:
            labelForVerification,

          description:
            descriptionForVerification,

          type: 'verify_identity',

          isCompleted:
            hasVerifiedID ===
            'verified',

          isEnabled:
            hasAvatar &&
            hasOnboarded,
        },
      ];
    };

  // ===========================================================================
  // Render verification item
  // ===========================================================================

  const renderItem =
    ({ item }) => (
      <VerificationListItem
        icon={item.icon}
        label={item.label}
        description={
          item.description
        }
        isEnabled={
          item.isEnabled
        }
        isCompleted={
          item.isCompleted
        }
        onPress={() =>
          handlePress(
            item.type
          )
        }
        status={
          item.status
        }
      />
    );

  // ===========================================================================
  // Stripe processing state
  // ===========================================================================

  if (processingDeepLink) {
    return (
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color={
            theme.brand.primary
          }
        />

        <AppText
          variant="body"
          style={
            styles.processingText
          }
        >
          {tSafe(
            'verifying_stripe_account',
            'Verifying your Stripe account...'
          )}
        </AppText>

        <AppText
          variant="caption"
          style={
            styles.processingSubtext
          }
        >
          {tSafe(
            'this_may_take_few_seconds',
            'This may take a few seconds'
          )}
        </AppText>
      </View>
    );
  }

  // ===========================================================================
  // Loading state
  // ===========================================================================

  if (
    loading &&
    !processingDeepLink
  ) {
    return (
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color={
            theme.brand.primary
          }
        />

        <AppText
          variant="body"
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'checking_account_status',
            'Checking your account status...'
          )}
        </AppText>
      </View>
    );
  }

  // ===========================================================================
  // Main UI
  // ===========================================================================

  return (
    <View
      style={styles.container}
    >
      {/* ================================================================= */}
      {/* Header */}
      {/* ================================================================= */}

      <View
        style={styles.topBanner}
      >
        <AppText
          variant="title"
          style={
            styles.welcomeTitle
          }
        >
          {tSafe(
            'almost_done_title',
            "You're Almost Done"
          )}
        </AppText>

        <AppText
          variant="body"
          style={
            styles.welcomeSubtitle
          }
        >
          {tSafe(
            'almost_done_subtitle',
            "Just complete the final steps below so you can start accepting jobs with confidence. We've made it quick and easy."
          )}
        </AppText>
      </View>

      {/* ================================================================= */}
      {/* Avatar */}
      {/* ================================================================= */}

      <View
        style={styles.avatarSection}
      >
        <TouchableOpacity
          onPress={addImage}
          disabled={uploadingAvatar}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <View
              style={
                styles.avatarWrapper
              }
            >
              <Image
                source={{
                  uri: avatarUri,
                }}
                style={
                  styles.avatar
                }
              />

              {uploadingAvatar && (
                <View
                  style={
                    styles.avatarLoadingOverlay
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color={
                      theme.icon.inverse
                    }
                  />
                </View>
              )}
            </View>
          ) : (
            <View
              style={
                styles.avatarPlaceholder
              }
            >
              {uploadingAvatar ? (
                <ActivityIndicator
                  size="small"
                  color={
                    theme.brand.primary
                  }
                />
              ) : (
                <MaterialIcons
                  name="add-a-photo"
                  size={32}
                  color={
                    theme.icon.muted
                  }
                />
              )}
            </View>
          )}
        </TouchableOpacity>

        <AppText
          variant="body"
          style={
            styles.userName
          }
        >
          {user?.firstname}{' '}
          {user?.lastname}
        </AppText>

        {uploadingAvatar && (
          <AppText
            variant="caption"
            style={
              styles.uploadingText
            }
          >
            {tSafe(
              'uploading_photo',
              'Uploading profile photo...'
            )}
          </AppText>
        )}

        <TouchableOpacity
          style={
            styles.refreshButton
          }
          onPress={() =>
            refreshVerificationStatus(
              true
            )
          }
          activeOpacity={0.8}
          disabled={uploadingAvatar}
        >
          <MaterialIcons
            name="refresh"
            size={16}
            color={
              theme.brand.primary
            }
          />

          <AppText
            variant="caption"
            style={
              styles.refreshText
            }
          >
            {tSafe(
              'refresh_status',
              'Refresh Status'
            )}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* ================================================================= */}
      {/* Verification List */}
      {/* ================================================================= */}

      <FlatList
        data={verifyList}
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={
          renderItem
        }
        contentContainerStyle={
          styles.listContainer
        }
        extraData={[
          onboardingStatus,
          user?.identity_verified,
          uploadingAvatar,
        ]}
        scrollEnabled={false}
      />

      {/* ================================================================= */}
      {/* Logout */}
      {/* ================================================================= */}

      <TouchableOpacity
        style={
          styles.logoutButton
        }
        onPress={logout}
        activeOpacity={0.8}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color={
            theme.icon.muted
          }
        />

        <AppText
          variant="body"
          style={
            styles.logoutText
          }
        >
          {tSafe(
            'logout',
            'Logout'
          )}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default AccountVerificationGate;

// =============================================================================
// Theme-aware styles
// =============================================================================

const createStyles = (
  theme,
  isDark
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20,
      backgroundColor:
        theme.background.default,
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 10,
      color: theme.text.primary,
      textAlign: 'center',
    },

    processingText: {
      marginTop: 14,
      color: theme.text.primary,
      textAlign: 'center',
      fontWeight: '600',
    },

    processingSubtext: {
      marginTop: 4,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    // -----------------------------------------------------------------------
    // Header
    // -----------------------------------------------------------------------

    topBanner: {
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
      backgroundColor:
        theme.background.default,
    },

    welcomeTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
      color: theme.text.primary,
    },

    welcomeSubtitle: {
      fontSize: 15,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },

    // -----------------------------------------------------------------------
    // Avatar
    // -----------------------------------------------------------------------

    avatarSection: {
      alignItems: 'center',
      marginVertical: 10,
    },

    avatarWrapper: {
      width: 110,
      height: 110,
      borderRadius: 55,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor:
        theme.brand.primary,
      position: 'relative',
    },

    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 55,
    },

    avatarLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(0,0,0,0.45)',
    },

    avatarPlaceholder: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor:
        theme.surface.selected,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    userName: {
      marginTop: 8,
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '500',
    },

    uploadingText: {
      marginTop: 5,
      color: theme.brand.primary,
      fontSize: 12,
      fontWeight: '600',
    },

    // -----------------------------------------------------------------------
    // Refresh
    // -----------------------------------------------------------------------

    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.elevated,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
      marginTop: 12,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    refreshText: {
      marginLeft: 6,
      color: theme.brand.primary,
      fontSize: 12,
      fontWeight: '600',
    },

    // -----------------------------------------------------------------------
    // Verification list
    // -----------------------------------------------------------------------

    listContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      paddingBottom: 10,
    },

    // -----------------------------------------------------------------------
    // Logout
    // -----------------------------------------------------------------------

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 4,
      marginBottom: 24,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    logoutText: {
      marginLeft: 7,
      color: theme.text.secondary,
      fontSize: 14,
      fontWeight: '600',
    },
  });