import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';

import { TextInput } from 'react-native-paper';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
import userService from '../../services/connection/userService';

import Toast from 'react-native-toast-message';

import {
  MaterialCommunityIcons,
  Feather,
  AntDesign,
} from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ROUTES from '../../constants/routes';

import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';
import AppCard from '../../ui/AppCard';
import AppButton from '../../ui/AppButton';

/*
 * ================================================================
 * HELPERS
 * ================================================================
 */

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const withAlpha = (color, alpha, fallback) => {
  if (
    typeof color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};

/*
 * ================================================================
 * COMPONENT
 * ================================================================
 */

export default function EditChecklist() {
  const {
    currentUserId,
    currency,
    userToken,
    logout,
  } = useContext(AuthContext);

  const navigation = useNavigation();
  const route = useRoute();

  const {
    checklistId,
    onChecklistUpdated,
  } = route.params || {};

  const { theme } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  /*
   * ------------------------------------------------------------
   * STATE
   * ------------------------------------------------------------
   */

  const [
    selectedApartment,
    setSelectedApartment,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    checklistName,
    setChecklistName,
  ] = useState('');

  const [
    totalFee,
    setTotalFee,
  ] = useState(0);

  const [
    totalTime,
    setTotalTime,
  ] = useState(0);

  const [
    checklistData,
    setChecklistData,
  ] = useState(null);

  const [
    showTooltip,
    setShowTooltip,
  ] = useState(false);

  const [
    hasLoadedData,
    setHasLoadedData,
  ] = useState(false);

  const [
    isInitialLoad,
    setIsInitialLoad,
  ] = useState(true);

  const [
    groupSummary,
    setGroupSummary,
  ] = useState(null);

  /*
   * ------------------------------------------------------------
   * REFS
   * ------------------------------------------------------------
   */

  const hasFetchedData = useRef(false);
  const isFetching = useRef(false);
  const isMountedRef = useRef(true);

  /*
   * ==============================================================
   * MOUNT / UNMOUNT
   * ==============================================================
   */

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      hasFetchedData.current = false;
      isFetching.current = false;
    };
  }, []);

  /*
   * ==============================================================
   * TOKEN
   * ==============================================================
   */

  const getToken = useCallback(async () => {
    /*
     * Prefer the authenticated token already supplied
     * by AuthContext.
     */
    if (userToken) {
      return userToken;
    }

    try {
      const stored =
        await AsyncStorage.getItem(
          '@storage_Key'
        );

      if (!stored) {
        return null;
      }

      const parsed =
        JSON.parse(stored);

      return (
        parsed?.resp?.token ||
        parsed?.token ||
        null
      );
    } catch (error) {
      console.error(
        'Error getting token:',
        error
      );

      return null;
    }
  }, [userToken]);

  /*
   * ==============================================================
   * TOAST
   * ==============================================================
   */

  const showToast = useCallback(
    (type, text1, text2) => {
      Toast.show({
        type,
        text1,
        text2,
        position: 'top',
        visibilityTime: 6000,
        autoHide: true,
        topOffset:
          Platform.OS === 'ios'
            ? 50
            : 30,
        bottomOffset: 40,
      });
    },
    []
  );

  /*
   * ==============================================================
   * UNAUTHORIZED
   * ==============================================================
   */

  const handleUnauthorized = useCallback(() => {
    logout();

    navigation.reset({
      index: 0,
      routes: [
        {
          name: ROUTES.signin,
        },
      ],
    });
  }, [
    logout,
    navigation,
  ]);

  /*
   * ==============================================================
   * FETCH CHECKLIST
   * ==============================================================
   */

  const fetchChecklistData = useCallback(
    async ({ force = false } = {}) => {
      if (!checklistId) {
        setIsLoading(false);
        setIsInitialLoad(false);
        return;
      }

      if (
        isFetching.current &&
        !force
      ) {
        return;
      }

      if (
        hasFetchedData.current &&
        !force
      ) {
        return;
      }

      isFetching.current = true;

      if (isMountedRef.current) {
        setIsLoading(true);
      }

      try {
        console.log(
          'Fetching checklist:',
          checklistId
        );

        const token =
          await getToken();

        if (!token) {
          handleUnauthorized();
          return;
        }

        const res =
          await userService.getChecklistById(
            checklistId,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
                'Content-Type':
                  'application/json',
              },
            }
          );

        if (
          !res ||
          !res.data
        ) {
          throw new Error(
            'No checklist data returned from server'
          );
        }

        const data = res.data;

        if (!isMountedRef.current) {
          return;
        }

        setChecklistData(data);

        setChecklistName(
          data.checklistName ||
            ''
        );

        setTotalFee(
          safeNumber(
            data.totalFee
          )
        );

        setTotalTime(
          safeNumber(
            data.totalTime
          )
        );

        setGroupSummary(
          data.checklist || null
        );

        /*
         * --------------------------------------------------------
         * APARTMENT
         * --------------------------------------------------------
         */

        if (data.propertyId) {
          try {
            const apartmentRes =
              await userService.getApartmentById(
                data.propertyId,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                    'Content-Type':
                      'application/json',
                  },
                }
              );

            if (
              apartmentRes?.data
            ) {
              setSelectedApartment(
                apartmentRes.data
              );
            } else {
              setSelectedApartment({
                _id:
                  data.propertyId,
                apt_name:
                  tSafe(
                    'unknown_property',
                    'Unknown Property'
                  ),
                rooms: [],
                roomDetails: [],
              });
            }
          } catch (
            apartmentError
          ) {
            console.error(
              'Error fetching apartment:',
              apartmentError
            );

            setSelectedApartment({
              _id:
                data.propertyId,
              apt_name:
                tSafe(
                  'property',
                  'Property'
                ),
              rooms: [],
              roomDetails: [],
            });
          }
        } else {
          setSelectedApartment({
            _id: 'temp_id',
            apt_name:
              tSafe(
                'no_property',
                'No Property'
              ),
            rooms: [],
            roomDetails: [],
          });
        }

        hasFetchedData.current =
          true;

        setHasLoadedData(true);
        setIsInitialLoad(false);
      } catch (err) {
        console.error(
          'Error fetching checklist:',
          err
        );

        if (
          err?.response?.status ===
          401
        ) {
          handleUnauthorized();
          return;
        }

        if (isMountedRef.current) {
          setHasLoadedData(true);
          setIsInitialLoad(false);
        }

        showToast(
          'error',
          tSafe(
            'failed_load_checklist',
            'Failed to load checklist'
          ),
          err?.response?.data
            ?.message ||
            err?.message ||
            tSafe(
              'please_try_again',
              'Please try again'
            )
        );
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }

        isFetching.current = false;
      }
    },
    [
      checklistId,
      getToken,
      handleUnauthorized,
      showToast,
    ]
  );

  /*
   * ==============================================================
   * INITIAL FETCH
   * ==============================================================
   */

  useEffect(() => {
    if (!checklistId) {
      setIsLoading(false);
      setIsInitialLoad(false);
      return;
    }

    fetchChecklistData();
  }, [
    checklistId,
    fetchChecklistData,
  ]);

  /*
   * ==============================================================
   * GROUP SUMMARY
   * ==============================================================
   */

  const handleGroupSummaryChange = useCallback(
    (summary) => {
      setGroupSummary(
        summary || null
      );
    },
    []
  );

  const handleTotalFeeChange = useCallback(
    (fee) => {
      setTotalFee(
        safeNumber(fee)
      );
    },
    []
  );

  const handleTotalTimeChange =
    useCallback(
      (time) => {
        setTotalTime(
          safeNumber(time)
        );
      },
      []
    );

  const groupCount =
    groupSummary
      ? Object.keys(
          groupSummary
        ).length
      : 0;

  /*
   * ==============================================================
   * UPDATE CHECKLIST
   * ==============================================================
   */

  const handleUpdateChecklist =
    async () => {
      const trimmedName =
        checklistName.trim();

      if (!trimmedName) {
        showToast(
          'error',
          tSafe(
            'checklist_name_required',
            'Checklist Name Required'
          ),
          tSafe(
            'enter_checklist_name',
            'Please enter a name for this checklist.'
          )
        );

        return;
      }

      if (
        !groupSummary ||
        Object.keys(groupSummary)
          .length === 0
      ) {
        showToast(
          'error',
          tSafe(
            'no_tasks_error',
            'No Tasks'
          ),
          tSafe(
            'assign_tasks',
            'Please assign at least one task'
          )
        );

        return;
      }

      if (isSaving) {
        return;
      }

      const token =
        await getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const payload = {
        checklistName:
          trimmedName,

        checklist:
          groupSummary,

        apt_name:
          selectedApartment?.apt_name ||
          checklistData?.propertyName ||
          tSafe(
            'property',
            'Property'
          ),

        totalFee:
          safeNumber(totalFee),

        totalTime:
          safeNumber(totalTime),

        propertyId:
          selectedApartment?._id ||
          checklistData?.propertyId,

        hostId:
          currentUserId,
      };

      setIsSaving(true);

      try {
        const res =
          await userService.editChecklist(
            checklistId,
            payload,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
                'Content-Type':
                  'application/json',
              },
            }
          );

        if (
          res?.status === 200
        ) {
          showToast(
            'success',
            tSafe(
              'checklist_updated',
              'Checklist updated'
            ),
            tSafe(
              'changes_saved',
              'Your changes have been saved'
            )
          );

          if (
            typeof onChecklistUpdated ===
            'function'
          ) {
            try {
              await onChecklistUpdated();
            } catch (callbackError) {
              console.warn(
                'Checklist refresh callback failed:',
                callbackError
              );
            }
          }

          navigation.navigate(
            ROUTES.host_checklist,
            {
              mode: 'edit',
              status: 'success',
              message:
                tSafe(
                  'checklist_updated_success',
                  'Checklist successfully updated'
                ),
            }
          );

          return;
        }

        throw new Error(
          `Server returned status: ${res?.status}`
        );
      } catch (err) {
        console.error(
          'Checklist update failed:',
          err
        );

        if (
          err?.response?.status ===
          401
        ) {
          handleUnauthorized();
          return;
        }

        showToast(
          'error',
          tSafe(
            'failed_update_checklist',
            'Failed to update checklist'
          ),
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.detail ||
            err?.message ||
            tSafe(
              'please_try_again_later',
              'Please try again later'
            )
        );
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    };

  /*
   * ==============================================================
   * DELETE CHECKLIST
   * ==============================================================
   */

  const handleDeleteChecklist =
    () => {
      if (
        isDeleting ||
        !checklistId
      ) {
        return;
      }

      Alert.alert(
        tSafe(
          'delete_checklist_title',
          'Delete Checklist'
        ),
        tSafe(
          'delete_checklist_confirm',
          'Are you sure you want to delete "{name}"? This action cannot be undone.',
          {
            name:
              checklistName ||
              tSafe(
                'unnamed_checklist',
                'Unnamed Checklist'
              ),
          }
        ),
        [
          {
            text: tSafe(
              'cancel',
              'Cancel'
            ),
            style: 'cancel',
          },
          {
            text: tSafe(
              'delete',
              'Delete'
            ),
            style: 'destructive',
            onPress:
              async () => {
                if (isDeleting) {
                  return;
                }

                setIsDeleting(true);

                try {
                  const token =
                    await getToken();

                  if (!token) {
                    handleUnauthorized();
                    return;
                  }

                  const res =
                    await userService.deleteChecklist(
                      checklistId,
                      token
                    );

                  if (
                    res?.status ===
                      200 ||
                    res?.data?.status ===
                      'success'
                  ) {
                    showToast(
                      'success',
                      tSafe(
                        'checklist_deleted',
                        'Checklist deleted'
                      ),
                      tSafe(
                        'checklist_removed',
                        'The checklist has been removed'
                      )
                    );

                    if (
                      typeof onChecklistUpdated ===
                      'function'
                    ) {
                      try {
                        await onChecklistUpdated();
                      } catch (
                        callbackError
                      ) {
                        console.warn(
                          'Checklist refresh callback failed:',
                          callbackError
                        );
                      }
                    }

                    navigation.navigate(
                      ROUTES.host_checklist,
                      {
                        mode:
                          'delete',
                        status:
                          'success',
                        message:
                          tSafe(
                            'checklist_removed_success',
                            'Checklist successfully removed'
                          ),
                      }
                    );

                    return;
                  }

                  throw new Error(
                    `Server returned status: ${res?.status}`
                  );
                } catch (err) {
                  console.error(
                    'Delete error:',
                    err
                  );

                  if (
                    err?.response?.status ===
                    401
                  ) {
                    handleUnauthorized();
                    return;
                  }

                  let errorMessage =
                    tSafe(
                      'please_try_again',
                      'Please try again'
                    );

                  if (
                    err?.response
                  ) {
                    const {
                      status,
                      data,
                    } =
                      err.response;

                    if (
                      status === 404
                    ) {
                      errorMessage =
                        tSafe(
                          'checklist_not_found',
                          'Checklist not found. It may have already been deleted.'
                        );
                    } else if (
                      status === 403
                    ) {
                      errorMessage =
                        tSafe(
                          'not_authorized_delete',
                          'You are not authorized to delete this checklist.'
                        );
                    } else if (
                      data?.detail
                    ) {
                      errorMessage =
                        data.detail;
                    } else if (
                      data?.message
                    ) {
                      errorMessage =
                        data.message;
                    }
                  } else if (
                    err?.request
                  ) {
                    errorMessage =
                      tSafe(
                        'network_error',
                        'Network error. Please check your connection.'
                      );
                  } else if (
                    err?.message
                  ) {
                    errorMessage =
                      err.message;
                  }

                  showToast(
                    'error',
                    tSafe(
                      'failed_delete_checklist',
                      'Failed to delete checklist'
                    ),
                    errorMessage
                  );
                } finally {
                  if (
                    isMountedRef.current
                  ) {
                    setIsDeleting(
                      false
                    );
                  }
                }
              },
          },
        ]
      );
    };

  /*
   * ==============================================================
   * LOADING
   * ==============================================================
   */

  if (
    isLoading &&
    isInitialLoad
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <View
          style={
            styles.loadingCard
          }
        >
          <View
            style={
              styles.loadingIconContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                theme.brand.primary
              }
            />
          </View>

          <AppText
            variant="h6"
            style={
              styles.loadingTitle
            }
          >
            {tSafe(
              'loading_checklist_details',
              'Loading checklist details...'
            )}
          </AppText>

          <AppText
            variant="body2"
            color="secondary"
            style={
              styles.loadingSubtitle
            }
          >
            {tSafe(
              'please_wait',
              'Please wait...'
            )}
          </AppText>
        </View>
      </View>
    );
  }

  /*
   * ==============================================================
   * ERROR / NOT FOUND
   * ==============================================================
   */

  if (
    !checklistData &&
    !isLoading
  ) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <View
          style={
            styles.errorIconContainer
          }
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={
              theme.status.error
            }
          />
        </View>

        <AppText
          variant="h6"
          style={
            styles.errorTitle
          }
        >
          {tSafe(
            'checklist_not_found',
            'Checklist not found'
          )}
        </AppText>

        <AppText
          variant="body2"
          color="secondary"
          style={
            styles.errorDescription
          }
        >
          {tSafe(
            'checklist_load_error',
            'We could not load this checklist. Please go back and try again.'
          )}
        </AppText>

        <AppButton
          title={tSafe(
            'go_back',
            'Go Back'
          )}
          variant="primary"
          icon="arrow-left"
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.errorButton
          }
        />
      </View>
    );
  }

  /*
   * ==============================================================
   * MAIN RENDER
   * ==============================================================
   */

  return (
    <View
      style={styles.container}
    >
      {/* ==========================================================
          HEADER
      =========================================================== */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={
            styles.headerIconButton
          }
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.75}
          disabled={isSaving}
        >
          <Feather
            name="arrow-left"
            size={22}
            color={
              theme.icon.default
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerTitleContainer
          }
        >
          <AppText
            variant="h6"
            style={
              styles.headerTitle
            }
            numberOfLines={1}
          >
            {tSafe(
              'edit_checklist_title',
              'Edit Checklist'
            )}
          </AppText>

          <AppText
            variant="caption"
            color="secondary"
            style={
              styles.headerSubtitle
            }
            numberOfLines={1}
          >
            {selectedApartment?.apt_name ||
              checklistData?.propertyName ||
              tSafe(
                'property',
                'Property'
              )}
          </AppText>
        </View>

        <TouchableOpacity
          style={
            styles.deleteHeaderButton
          }
          onPress={
            handleDeleteChecklist
          }
          activeOpacity={0.75}
          disabled={
            isDeleting ||
            isSaving
          }
        >
          {isDeleting ? (
            <ActivityIndicator
              size="small"
              color={
                theme.status.error
              }
            />
          ) : (
            <Feather
              name="trash-2"
              size={19}
              color={
                theme.status.error
              }
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ==========================================================
          CONTENT
      =========================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        style={
          styles.scrollContainer
        }
        contentContainerStyle={
          styles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={styles.content}
        >
          {/* ======================================================
              CHECKLIST NAME
          ======================================================= */}

          <AppCard
            variant="default"
            style={
              styles.sectionCard
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View
                style={
                  styles.sectionIcon
                }
              >
                <MaterialCommunityIcons
                  name="clipboard-edit-outline"
                  size={21}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={
                  styles.sectionHeaderText
                }
              >
                <AppText
                  variant="h6"
                  style={
                    styles.sectionTitle
                  }
                >
                  {tSafe(
                    'checklist_details',
                    'Checklist Details'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={{
                    color: theme.text.secondary
                  }}
                >
                  {tSafe(
                    'update_checklist_information',
                    'Update your checklist information'
                  )}
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.inputContainer
              }
            >
              <AppText
                variant="body2"
                style={
                  styles.inputLabel
                }
              >
                {tSafe(
                  'checklist_name_label',
                  'Checklist Name'
                )}
              </AppText>

              <TextInput
                mode="outlined"
                value={checklistName}
                onChangeText={
                  setChecklistName
                }
                placeholder={tSafe(
                  'enter_checklist_name_placeholder',
                  'Enter checklist name'
                )}
                placeholderTextColor={
                  theme.input.placeholder
                }
                textColor={
                  theme.input.text
                }
                cursorColor={
                  theme.input.focus
                }
                selectionColor={
                  theme.input.focus
                }
                style={
                  styles.nameInput
                }
                outlineColor={
                  theme.input.border
                }
                activeOutlineColor={
                  theme.input.focus
                }
                theme={{
                  colors: {
                    primary:
                      theme.input.focus,
                    outline:
                      theme.input.border,
                    background:
                      theme.input.background,
                    onSurface:
                      theme.input.text,
                    placeholder:
                      theme.input.placeholder,
                  },
                  roundness: 14,
                }}
                maxLength={120}
                autoCapitalize="sentences"
                autoCorrect
              />

              <AppText
                variant="caption"
                color="secondary"
                style={
                  styles.characterHint
                }
              >
                {checklistName.length}/120
              </AppText>
            </View>
          </AppCard>

          {/* ======================================================
              ROOM ASSIGNMENT
          ======================================================= */}

          {hasLoadedData &&
            selectedApartment && (
              <View
                style={
                  styles.assignmentSection
                }
              >
                <View
                  style={
                    styles.sectionHeaderOutside
                  }
                >
                  <View
                    style={
                      styles.sectionIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name="home-group"
                      size={21}
                      color={
                        theme.brand.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.sectionHeaderText
                    }
                  >
                    <AppText
                      variant="h6"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'room_assignments',
                        'Room Assignments'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={{
                        color: theme.text.secondary
                      }}
                    >
                      {selectedApartment?.apt_name ||
                        tSafe(
                          'property',
                          'Property'
                        )}
                    </AppText>
                  </View>
                </View>

                <RoomAssignmentPicker
                  selectedApartment={
                    selectedApartment
                  }
                  onGroupSummaryChange={
                    handleGroupSummaryChange
                  }
                  onTotalFeeChange={
                    handleTotalFeeChange
                  }
                  onTotalTimeChange={
                    handleTotalTimeChange
                  }
                  checklistName={
                    checklistName
                  }
                  setChecklistName={
                    setChecklistName
                  }
                  onInfoPress={() =>
                    setShowTooltip(true)
                  }
                  isEditing={true}
                  existingChecklistData={
                    checklistData?.checklist ||
                    null
                  }
                  savedTotalFee={
                    checklistData?.totalFee ||
                    0
                  }
                  key={`room-picker-${checklistId}-${hasLoadedData}`}
                />
              </View>
            )}

          {/* ======================================================
              PROPERTY WARNING
          ======================================================= */}

          {hasLoadedData &&
            !selectedApartment && (
              <View
                style={
                  styles.warningContainer
                }
              >
                <View
                  style={
                    styles.warningIconContainer
                  }
                >
                  <MaterialCommunityIcons
                    name="alert-outline"
                    size={28}
                    color={
                      theme.status.warning
                    }
                  />
                </View>

                <AppText
                  variant="h6"
                  style={
                    styles.warningTitle
                  }
                >
                  {tSafe(
                    'unable_load_property',
                    'Property information unavailable'
                  )}
                </AppText>

                <AppText
                  variant="body2"
                  color="secondary"
                  style={
                    styles.warningText
                  }
                >
                  {tSafe(
                    'unable_load_property_data',
                    'Unable to load property data. Some features may be limited.'
                  )}
                </AppText>

                <AppButton
                  title={tSafe(
                    'retry_loading',
                    'Retry Loading'
                  )}
                  variant="outline"
                  icon="refresh"
                  onPress={() =>
                    fetchChecklistData({
                      force: true,
                    })
                  }
                  style={
                    styles.retryButton
                  }
                />
              </View>
            )}

          {/* ======================================================
              SUMMARY
          ======================================================= */}

          <AppCard
            variant="default"
            style={
              styles.summaryCard
            }
          >
            <View
              style={
                styles.summaryHeader
              }
            >
              <View
                style={
                  styles.sectionIcon
                }
              >
                <MaterialCommunityIcons
                  name="chart-box-outline"
                  size={21}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={
                  styles.sectionHeaderText
                }
              >
                <AppText
                  variant="h6"
                  style={
                    styles.sectionTitle
                  }
                >
                  {tSafe(
                    'summary',
                    'Summary'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={{
                    color: theme.text.secondary
                  }}
                >
                  {tSafe(
                    'current_checklist_totals',
                    'Current checklist totals'
                  )}
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.summaryRow
              }
            >
              <View
                style={
                  styles.summaryItem
                }
              >
                <View
                  style={
                    styles.summaryIconCircle
                  }
                >
                  <Feather
                    name="dollar-sign"
                    size={17}
                    color={
                      theme.status.success
                    }
                  />
                </View>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.summaryLabel
                  }
                >
                  {tSafe(
                    'total_fee',
                    'Total Fee'
                  )}
                </AppText>

                <AppText
                  style={
                    styles.summaryValue
                  }
                >
                  {currency || '$'}
                  {safeNumber(
                    totalFee
                  ).toFixed(2)}
                </AppText>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View
                style={
                  styles.summaryItem
                }
              >
                <View
                  style={
                    styles.summaryIconCircle
                  }
                >
                  <Feather
                    name="clock"
                    size={17}
                    color={
                      theme.status.info
                    }
                  />
                </View>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.summaryLabel
                  }
                >
                  {tSafe(
                    'total_time',
                    'Total Time'
                  )}
                </AppText>

                <AppText
                  style={
                    styles.summaryValue
                  }
                >
                  {safeNumber(
                    totalTime
                  )}{' '}
                  {tSafe(
                    'minutes',
                    'mins'
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View
                style={
                  styles.summaryItem
                }
              >
                <View
                  style={
                    styles.summaryIconCircle
                  }
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={18}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.summaryLabel
                  }
                >
                  {tSafe(
                    'groups',
                    'Groups'
                  )}
                </AppText>

                <AppText
                  style={
                    styles.summaryValue
                  }
                >
                  {groupCount}
                </AppText>
              </View>
            </View>
          </AppCard>

          {/* ======================================================
              ACTIONS
          ======================================================= */}

          <View
            style={
              styles.buttonContainer
            }
          >
            <AppButton
              title={tSafe(
                'cancel',
                'Cancel'
              )}
              variant="outline"
              onPress={() =>
                navigation.goBack()
              }
              disabled={
                isSaving ||
                isDeleting
              }
              style={
                styles.actionButton
              }
            />

            <AppButton
              title={tSafe(
                'save_changes',
                'Save Changes'
              )}
              variant="primary"
              icon="content-save-outline"
              onPress={
                handleUpdateChecklist
              }
              loading={isSaving}
              disabled={
                !groupSummary ||
                groupCount === 0 ||
                isSaving ||
                isDeleting ||
                !checklistName.trim()
              }
              style={
                styles.actionButton
              }
            />
          </View>

          <AppText
            variant="caption"
            color="secondary"
            style={
              styles.bottomHint
            }
          >
            {tSafe(
              'save_checklist_hint',
              'Review your room assignments and totals before saving your changes.'
            )}
          </AppText>
        </View>
      </ScrollView>

      {/* ==========================================================
          INFORMATION MODAL
      =========================================================== */}

      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowTooltip(false)
        }
        statusBarTranslucent
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContainer
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalIconContainer
                }
              >
                <AntDesign
                  name="infocirlce"
                  size={22}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={
                  styles.modalHeaderText
                }
              >
                <AppText
                  variant="h6"
                  style={
                    styles.modalTitle
                  }
                >
                  {tSafe(
                    'checklist_information',
                    'Checklist Information'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={{
                    color: theme.text.secondary
                  }}
                >
                  {tSafe(
                    'checklist_setup_information',
                    'How checklist assignments work'
                  )}
                </AppText>
              </View>

              <TouchableOpacity
                style={
                  styles.modalCloseIcon
                }
                onPress={() =>
                  setShowTooltip(false)
                }
                activeOpacity={0.75}
              >
                <Feather
                  name="x"
                  size={20}
                  color={
                    theme.icon.default
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={
                styles.modalScroll
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <AppText
                variant="body2"
                style={
                  styles.modalText
                }
              >
                {tSafe(
                  'checklist_tooltip_text',
                  "This helps us understand how many cleaners will work on the apartment.\n\nIf it's just one cleaner, we'll assign all tasks to one team. If it's two or more, you'll be able to split tasks across teams for faster cleaning.\n\nEditing Mode: You can modify existing task assignments, add new tasks, or adjust pricing."
                )}
              </AppText>
            </ScrollView>

            <AppButton
              title={tSafe(
                'got_it',
                'Got it'
              )}
              variant="primary"
              onPress={() =>
                setShowTooltip(false)
              }
              style={
                styles.modalDoneButton
              }
            />
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

/*
 * ================================================================
 * STYLES
 * ================================================================
 */

const createStyles = (theme) =>
  StyleSheet.create({
    /*
     * ------------------------------------------------------------
     * ROOT
     * ------------------------------------------------------------
     */

    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    scrollContainer: {
      flex: 1,
    },

    contentContainer: {
      paddingBottom: 50,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
    },

    /*
     * ------------------------------------------------------------
     * HEADER
     * ------------------------------------------------------------
     */

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight:
        Platform.OS === 'ios'
          ? 92
          : 68,
      paddingTop:
        Platform.OS === 'ios'
          ? 22
          : 0,
      paddingHorizontal: 14,
      backgroundColor:
        theme.surface.elevated,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    headerIconButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 12,
      minWidth: 0,
    },

    headerTitle: {
      color: theme.text.primary,
      fontWeight: '800',
    },

    headerSubtitle: {
      marginTop: 2,
      maxWidth: 220,
      textAlign: 'center',
      color: theme.text.secondary,
    },

    deleteHeaderButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        withAlpha(
          theme.status.error,
          '12',
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.error,
          '25',
          theme.border.default
        ),
    },

    /*
     * ------------------------------------------------------------
     * SECTION CARDS
     * ------------------------------------------------------------
     */

    sectionCard: {
      borderRadius: 18,
      padding: 17,
      marginBottom: 18,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },

    sectionHeaderOutside: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      paddingHorizontal: 2,
    },

    sectionIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '14',
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.brand.primary,
          '30',
          theme.border.default
        ),
      marginRight: 11,
    },

    sectionHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    sectionTitle: {
      color: theme.text.primary,
      fontWeight: '800',
    },

    /*
     * ------------------------------------------------------------
     * INPUT
     * ------------------------------------------------------------
     */

    inputContainer: {
      marginTop: 2,
    },

    inputLabel: {
      color: theme.text.primary,
      fontWeight: '700',
      marginBottom: 8,
    },

    nameInput: {
      backgroundColor:
        theme.input.background,
      fontSize: 15,
    },

    characterHint: {
      textAlign: 'right',
      marginTop: 6,
      fontSize: 11,
      color: theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * ROOM ASSIGNMENT
     * ------------------------------------------------------------
     */

    assignmentSection: {
      marginBottom: 8,
    },

    /*
     * ------------------------------------------------------------
     * WARNING
     * ------------------------------------------------------------
     */

    warningContainer: {
      alignItems: 'center',
      padding: 18,
      marginBottom: 18,
      borderRadius: 18,
      backgroundColor:
        withAlpha(
          theme.status.warning,
          '10',
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.warning,
          '35',
          theme.border.default
        ),
    },

    warningIconContainer: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        withAlpha(
          theme.status.warning,
          '18',
          theme.surface.selected
        ),
      marginBottom: 10,
    },

    warningTitle: {
      color: theme.text.primary,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 5,
    },

    warningText: {
      textAlign: 'center',
      lineHeight: 21,
      maxWidth: 340,
      marginBottom: 13,
      color: theme.text.secondary,
    },

    retryButton: {
      minWidth: 160,
    },

    /*
     * ------------------------------------------------------------
     * SUMMARY
     * ------------------------------------------------------------
     */

    summaryCard: {
      borderRadius: 18,
      padding: 17,
      marginTop: 10,
      marginBottom: 20,
    },

    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: 15,
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      paddingVertical: 14,
    },

    summaryItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
      paddingHorizontal: 4,
    },

    summaryIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      marginBottom: 7,
    },

    summaryLabel: {
      textAlign: 'center',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.25,
      marginBottom: 3,
      color: theme.text.secondary,
    },

    summaryValue: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },

    summaryDivider: {
      width: 1,
      marginVertical: 5,
      backgroundColor:
        theme.divider,
    },

    /*
     * ------------------------------------------------------------
     * ACTIONS
     * ------------------------------------------------------------
     */

    buttonContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 2,
    },

    actionButton: {
      flex: 1,
      minHeight: 50,
    },

    bottomHint: {
      textAlign: 'center',
      lineHeight: 18,
      marginTop: 12,
      paddingHorizontal: 12,
      color: theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * LOADING
     * ------------------------------------------------------------
     */

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.default,
      paddingHorizontal: 28,
    },

    loadingCard: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      padding: 28,
      borderRadius: 22,
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    loadingIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '14',
          theme.surface.selected
        ),
      marginBottom: 18,
    },

    loadingTitle: {
      color: theme.text.primary,
      fontWeight: '800',
      textAlign: 'center',
    },

    loadingSubtitle: {
      textAlign: 'center',
      marginTop: 5,
      color: theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * ERROR
     * ------------------------------------------------------------
     */

    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.default,
      paddingHorizontal: 30,
    },

    errorIconContainer: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        withAlpha(
          theme.status.error,
          '12',
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.error,
          '30',
          theme.border.default
        ),
      marginBottom: 18,
    },

    errorTitle: {
      color: theme.text.primary,
      fontWeight: '800',
      textAlign: 'center',
    },

    errorDescription: {
      textAlign: 'center',
      lineHeight: 21,
      maxWidth: 350,
      marginTop: 7,
      marginBottom: 22,
      color: theme.text.secondary,
    },

    errorButton: {
      minWidth: 150,
    },

    /*
     * ------------------------------------------------------------
     * INFORMATION MODAL
     * ------------------------------------------------------------
     */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        theme.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },

    modalContainer: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '82%',
      borderRadius: 22,
      padding: 20,
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },

    modalIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '14',
          theme.surface.selected
        ),
      marginRight: 11,
    },

    modalHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      color: theme.text.primary,
      fontWeight: '800',
    },

    modalCloseIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      marginLeft: 8,
    },

    modalScroll: {
      maxHeight: 330,
    },

    modalText: {
      color: theme.text.secondary,
      lineHeight: 23,
    },

    modalDoneButton: {
      marginTop: 18,
      minHeight: 48,
    },
  });


// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Platform
// } from 'react-native';
// import { Text, Button, TextInput } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ROUTES from '../../constants/routes';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function EditChecklist() {
//   const { currentUserId, currency, userToken, logout } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { checklistId, onChecklistUpdated } = route.params || {};

//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [checklistName, setChecklistName] = useState('');
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistData, setChecklistData] = useState(null);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [hasLoadedData, setHasLoadedData] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

//   // State for group summary
//   const [groupSummary, setGroupSummary] = useState(null);

//   // Refs to prevent loops
//   const hasFetchedData = useRef(false);
//   const isFetching = useRef(false);

//   console.log('EditChecklist - Loading checklist:', checklistId);

//   useEffect(() => {
//     // Only fetch data if we haven't already fetched it
//     if (checklistId && !hasFetchedData.current && !isFetching.current) {
//       fetchChecklistData();
//     }

//     return () => {
//       // Reset refs when component unmounts
//       hasFetchedData.current = false;
//       isFetching.current = false;
//     };
//   }, [checklistId]);

//   const getToken = async () => {
//     try {
//       const stored = await AsyncStorage.getItem('@storage_Key');
//       if (!stored) return null;
    
//       const parsed = JSON.parse(stored);
//       return parsed?.resp?.token || parsed?.token || null;
//     } catch (error) {
//       console.error('Error getting token:', error);
//       return null;
//     }
//   };

//   const showToast = (type, text1, text2) => {
//     console.log(`Showing toast: ${type} - ${text1} - ${text2}`);
//     Toast.show({
//       type,
//       text1,
//       text2,
//       position: 'top',
//       visibilityTime: 6000,
//       autoHide: true,
//       topOffset: Platform.OS === 'ios' ? 50 : 30,
//       bottomOffset: 40,
//     });
//   };

//   const handleUnauthorized = () => {
//     navigation.navigate(ROUTES.host_checklist,{
//       mode:"delete",
//       status:"success",
//       message:tSafe('session_expired_message', 'Session Expired, Please log in again.')
//     });
//     logout();
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'Signin' }],
//     });
//   };

//   const fetchChecklistData = async () => {
//     if (isFetching.current) {
//       console.log('Already fetching, skipping...');
//       return;
//     }

//     console.log('Starting fetch...');
//     isFetching.current = true;
//     setIsLoading(true);
//     setHasLoadedData(false);

//     try {
//       console.log('Fetching checklist data for ID:', checklistId);
      
//       const token = await getToken();
//       if (!token) {
//         handleUnauthorized();
//         return;
//       }
      
//       const res = await userService.getChecklistById(checklistId, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!res || !res.data) {
//         throw new Error('No data returned from server');
//       }
      
//       const data = res.data;
//       console.log('Fetched checklist data successfully');
      
//       if (!data) {
//         throw new Error('No checklist data found');
//       }
      
//       setChecklistData(data);
//       setChecklistName(data.checklistName || '');
//       setTotalFee(data.totalFee || 0);
//       setTotalTime(data.totalTime || 0);
      
//       if (data.checklist) {
//         console.log('Setting group summary from fetched data');
//         setGroupSummary(data.checklist);
//       }
      
//       if (data.propertyId) {
//         console.log('Fetching apartment data for propertyId:', data.propertyId);
        
//         try {
//           const apartmentRes = await userService.getApartmentById(data.propertyId, {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           });
          
//           if (!apartmentRes || !apartmentRes.data) {
//             throw new Error('No apartment data returned');
//           }
          
//           const apartmentData = apartmentRes.data;
          
//           if (apartmentData) {
//             setSelectedApartment(apartmentData);
//           } else {
//             console.warn('No apartment data returned');
//             setSelectedApartment({
//               _id: data.propertyId,
//               apt_name: tSafe('unknown_property', 'Unknown Property'),
//               rooms: [],
//               roomDetails: []
//             });
//           }
//         } catch (apartmentError) {
//           console.error('Error fetching apartment:', apartmentError);
//           setSelectedApartment({
//             _id: data.propertyId,
//             apt_name: tSafe('property', 'Property'),
//             rooms: [],
//             roomDetails: []
//           });
//         }
//       } else {
//         console.log('No propertyId in checklist data');
//         setSelectedApartment({
//           _id: 'temp_id',
//           apt_name: tSafe('no_property', 'No Property'),
//           rooms: [],
//           roomDetails: []
//         });
//       }
      
//       hasFetchedData.current = true;
//       setHasLoadedData(true);
//       setIsInitialLoad(false);
      
//     } catch (err) {
//       console.error('Error fetching checklist:', err);
      
//       if (err.response?.status === 401) {
//         handleUnauthorized();
//       } else {
//         showToast('error', tSafe('failed_load_checklist', 'Failed to load checklist'), err.message || tSafe('please_try_again', 'Please try again'));
//       }
      
//       setHasLoadedData(true);
//       setIsInitialLoad(false);
//     } finally {
//       setIsLoading(false);
//       isFetching.current = false;
//     }
//   };

//   const handleUpdateChecklist = async () => {
//     if (!checklistName.trim()) {
//       showToast('error', tSafe('checklist_name_required', 'Checklist Name Required'), tSafe('enter_checklist_name', 'Please enter a name for this checklist.'));
//       return;
//     }

//     if (!groupSummary) {
//       showToast('error', tSafe('no_tasks_error', 'No Tasks'), tSafe('assign_tasks', 'Please assign at least one task'));
//       return;
//     }

//     const payload = {
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       apt_name: selectedApartment?.apt_name || checklistData?.propertyName || tSafe('property', 'Property'),
//       totalFee,
//       totalTime,
//       propertyId: selectedApartment?._id || checklistData?.propertyId,
//       hostId: currentUserId,
//     };

//     console.log('Update payload:', payload);

//     setIsSaving(true);
//     try {
//       const token = await getToken();
//       if (!token) {
//         handleUnauthorized();
//         setIsSaving(false);
//         return;
//       }

//       const res = await userService.editChecklist(checklistId, payload, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (res.status === 200) {
//         showToast('success', tSafe('checklist_updated', 'Checklist updated'), tSafe('changes_saved', 'Your changes have been saved'));
        
//         if (onChecklistUpdated) {
//           onChecklistUpdated();
//         }
        
//         navigation.navigate(ROUTES.host_checklist,{
//           mode:"edit",
//           status:"success",
//           message:tSafe('checklist_updated_success', 'Checklist successfully updated')
//         })
//       } else {
//         throw new Error(`Server returned status: ${res.status}`);
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
      
//       if (err.response?.status === 401) {
//         handleUnauthorized();
//       } else {
//         showToast('error', tSafe('failed_update_checklist', 'Failed to update checklist'), err.response?.data?.message || tSafe('please_try_again_later', 'Please try again later'));
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };
  
//   const handleDeleteChecklist = () => {
//     Alert.alert(
//       tSafe('delete_checklist_title', 'Delete Checklist'),
//       tSafe('delete_checklist_confirm', 'Are you sure you want to delete "{name}"? This action cannot be undone.', { name: checklistName }),
//       [
//         {
//           text: tSafe('cancel', 'Cancel'),
//           style: 'cancel',
//         },
//         {
//           text: tSafe('delete', 'Delete'),
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               console.log(`🗑️ Deleting checklist ${checklistId}...`);
              
//               const token = await getToken();
//               if (!token) {
//                 handleUnauthorized();
//                 return;
//               }
              
//               console.log('Using token for delete');
//               const res = await userService.deleteChecklist(checklistId, token);
              
//               console.log('Delete response:', res);
              
//               if (res.status === 200 || res.data?.status === 'success') {
//                 showToast('success', tSafe('checklist_deleted', 'Checklist deleted'), tSafe('checklist_removed', 'The checklist has been removed'));
                
//                 if (onChecklistUpdated) {
//                   onChecklistUpdated();
//                 }
//                 navigation.navigate(ROUTES.host_checklist,{
//                   mode:"delete",
//                   status:"success",
//                   message:tSafe('checklist_removed_success', 'Checklist successfully removed')
//                 })
             
//               } else {
//                 throw new Error(`Server returned status: ${res.status}`);
//               }
//             } catch (err) {
//               console.error('❌ Delete error:', err);
              
//               if (err.response?.status === 401) {
//                 handleUnauthorized();
//               } else {
//                 let errorMessage = tSafe('please_try_again', 'Please try again');
                
//                 if (err.response) {
//                   const { status, data } = err.response;
                  
//                   if (status === 404) {
//                     errorMessage = tSafe('checklist_not_found', 'Checklist not found. It may have already been deleted.');
//                   } else if (status === 403) {
//                     errorMessage = tSafe('not_authorized_delete', 'You are not authorized to delete this checklist.');
//                   } else if (data?.detail) {
//                     errorMessage = data.detail;
//                   } else if (data?.message) {
//                     errorMessage = data.message;
//                   }
//                 } else if (err.request) {
//                   errorMessage = tSafe('network_error', 'Network error. Please check your connection.');
//                 } else {
//                   errorMessage = err.message || tSafe('unknown_error', 'Unknown error occurred.');
//                 }
                
//                 showToast('error', tSafe('failed_delete_checklist', 'Failed to delete checklist'), errorMessage);
//               }
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleGroupSummaryChange = (summary) => {
//     console.log('Group summary updated in parent:', {
//       keys: Object.keys(summary || {}),
//       summary
//     });
//     setGroupSummary(summary);
//   };

//   const handleTotalFeeChange = (fee) => {
//     setTotalFee(fee);
//   };

//   const handleTotalTimeChange = (time) => {
//     setTotalTime(time);
//   };

//   const groupCount = groupSummary ? Object.keys(groupSummary).length : 0;

//   if (isLoading && isInitialLoad) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_checklist_details', 'Loading checklist details...')}</Text>
//       </View>
//     );
//   }

//   if (!checklistData && !isLoading) {
//     return (
//       <View style={styles.errorContainer}>
//         <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
//         <Text style={styles.errorText}>{tSafe('checklist_not_found', 'Checklist not found')}</Text>
//         <Button 
//           mode="contained" 
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           {tSafe('go_back', 'Go Back')}
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Feather name="arrow-left" size={24} color={COLORS.dark} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>{tSafe('edit_checklist_title', 'Edit Checklist')}</Text>
//           <Text style={styles.headerSubtitle}>
//             {selectedApartment?.apt_name || checklistData?.propertyName || tSafe('property', 'Property')}
//           </Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.deleteButton}
//           onPress={handleDeleteChecklist}
//         >
//           <Feather name="trash-2" size={20} color="#FF6B6B" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false} 
//         style={styles.scrollContainer}
//       >
//         <View style={styles.content}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>{tSafe('checklist_name_label', 'Checklist Name')}</Text>
//             <TextInput
//               mode="outlined"
//               value={checklistName}
//               onChangeText={setChecklistName}
//               placeholder={tSafe('enter_checklist_name_placeholder', 'Enter checklist name')}
//               style={styles.nameInput}
//               outlineColor="#e0e0e0"
//               activeOutlineColor={COLORS.primary}
//             />
//           </View>

//           {hasLoadedData && selectedApartment && (
//             <RoomAssignmentPicker
//               selectedApartment={selectedApartment}
//               onGroupSummaryChange={handleGroupSummaryChange}
//               onTotalFeeChange={handleTotalFeeChange}
//               onTotalTimeChange={handleTotalTimeChange}
//               checklistName={checklistName}
//               setChecklistName={setChecklistName}
//               onInfoPress={() => setShowTooltip(true)}
//               isEditing={true}
//               existingChecklistData={checklistData?.checklist || null}
//               savedTotalFee={checklistData?.totalFee || 0}
//               key={`room-picker-${checklistId}-${hasLoadedData}`}
//             />
//           )}

          

//           {hasLoadedData && !selectedApartment && (
//             <View style={styles.warningContainer}>
//               <MaterialCommunityIcons name="alert-outline" size={32} color="#FFA500" />
//               <Text style={styles.warningText}>
//                 {tSafe('unable_load_property_data', 'Unable to load property data. Some features may be limited.')}
//               </Text>
//               <Button
//                 mode="outlined"
//                 onPress={fetchChecklistData}
//                 style={styles.retryButton}
//                 icon="refresh"
//               >
//                 {tSafe('retry_loading', 'Retry Loading')}
//               </Button>
//             </View>
//           )}

//           <View style={styles.summarySection}>
//             <Text style={styles.summaryTitle}>{tSafe('summary', 'Summary')}</Text>
//             <View style={styles.summaryRow}>
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>{tSafe('total_fee', 'Total Fee')}</Text>
//                 <Text style={styles.summaryValue}>{currency}{totalFee.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>{tSafe('total_time', 'Total Time')}</Text>
//                 <Text style={styles.summaryValue}>{totalTime} {tSafe('minutes', 'mins')}</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>{tSafe('groups', 'Groups')}</Text>
//                 <Text style={styles.summaryValue}>{groupCount}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.buttonContainer}>
//             <Button
//               mode="outlined"
//               onPress={() => navigation.goBack()}
//               style={[styles.button, styles.cancelButton]}
//               contentStyle={styles.buttonContent}
//             >
//               {tSafe('cancel', 'Cancel')}
//             </Button>
            
//             <Button
//               mode="contained"
//               onPress={handleUpdateChecklist}
//               disabled={!groupSummary || isSaving || !checklistName.trim()}
//               loading={isSaving}
//               style={[styles.button, styles.saveButton]}
//               contentStyle={styles.buttonContent}
//             >
//               {tSafe('save_changes', 'Save Changes')}
//             </Button>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Tooltip Modal */}
//       <Modal
//         visible={showTooltip}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowTooltip(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <AntDesign name="infocirlce" size={24} color={COLORS.primary} />
//               <Text style={styles.modalTitle}>{tSafe('checklist_information', 'Checklist Information')}</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               {tSafe('checklist_tooltip_text', 'This helps us understand how many cleaners will work on the apartment.\n\nIf it\'s just one cleaner, we\'ll assign all tasks to one team. If it\'s two or more, you\'ll be able to split tasks across teams for faster cleaning.\n\nEditing Mode: You can modify existing task assignments, add new tasks, or adjust pricing.')}
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>{tSafe('got_it', 'Got it')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
      
//       {/* Toast Component must be rendered at root level */}
//       <Toast />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   deleteButton: {
//     padding: 8,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//   },
//   inputContainer: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   nameInput: {
//     backgroundColor: '#fff',
//   },
//   summarySection: {
//     marginTop: 24,
//     padding: 16,
//     backgroundColor: '#f8f9fe',
//     borderRadius: 12,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   summaryDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#e0e7ff',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 32,
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     borderRadius: 8,
//   },
//   cancelButton: {
//     borderColor: COLORS.gray,
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//   },
//   buttonContent: {
//     paddingVertical: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 24,
//   },
//   warningContainer: {
//     padding: 16,
//     backgroundColor: '#FFF9E6',
//     borderRadius: 8,
//     alignItems: 'center',
//     marginVertical: 16,
//   },
//   warningText: {
//     fontSize: 14,
//     color: '#D48806',
//     textAlign: 'center',
//     marginVertical: 8,
//   },
//   retryButton: {
//     marginTop: 8,
//     borderColor: '#D48806',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 24,
//     width: '100%',
//     maxWidth: 400,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginLeft: 12,
//   },
//   modalText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   modalCloseButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignSelf: 'flex-end',
//   },
//   modalCloseText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });