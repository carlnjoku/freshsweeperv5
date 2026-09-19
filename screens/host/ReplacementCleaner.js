import React, {
    useCallback,
    useEffect,
    useState,
  } from 'react';
  
  import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
  } from 'react-native';
  
  import {
    Card,
    Button,
    Divider,
    Checkbox,
  } from 'react-native-paper';
  
  import {
    useNavigation,
    useRoute,
  } from '@react-navigation/native';
  
  import moment from 'moment';
  
  import userService from '../../services/connection/userService';
  import COLORS from '../../constants/colors';
  import ROUTES from '../../constants/routes';
  
  
  const ReplacementCleaner = () => {
  
    const navigation = useNavigation();
    const route = useRoute();
  
    /*
     * =========================================================
     * ROUTE PARAMS
     * =========================================================
     */
  
    const {
      scheduleId,
      requestId,
      cleanerId,
    } = route?.params || {};
  
  
    /*
     * =========================================================
     * STATE
     * =========================================================
     */
  
    const [loading, setLoading] = useState(true);
  
    const [refreshing, setRefreshing] = useState(false);
  
    const [sendingRequests, setSendingRequests] =
      useState(false);
  
    const [candidates, setCandidates] =
      useState([]);
  
    const [scheduleDetails, setScheduleDetails] =
      useState(null);
  
    const [unavailableCleaner, setUnavailableCleaner] =
      useState(null);
  
    /*
     * Multiple selected cleaners
     */
    const [selectedCleaners, setSelectedCleaners] =
      useState([]);
  
  
    /*
     * =========================================================
     * FORMAT GROUP
     * =========================================================
     */
  
    const formatGroup = (group) => {
  
      if (!group) {
        return '';
      }
  
      return group
        .split('_')
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(' ');
    };
  
  
    /*
     * =========================================================
     * FORMAT DATE
     * =========================================================
     */
  
    const formatDate = (date) => {
  
      if (!date) {
        return '';
      }
  
      /*
       * Avoid timezone shifting YYYY-MM-DD.
       */
      if (
        typeof date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
  
        const [
          year,
          month,
          day,
        ] = date.split('-').map(Number);
  
        return moment(
          new Date(
            year,
            month - 1,
            day
          )
        ).format('MMM D, YYYY');
      }
  
      return moment(date).format(
        'MMM D, YYYY'
      );
    };
  
  
    /*
     * =========================================================
     * FORMAT TIME
     * =========================================================
     */
  
    const formatTime = (time) => {
  
      if (!time) {
        return '';
      }
  
      const parsedTime = moment(
        time,
        ['HH:mm:ss', 'HH:mm'],
        true
      );
  
      if (!parsedTime.isValid()) {
        return time;
      }
  
      return parsedTime.format('h:mm A');
    };
  
  
    /*
     * =========================================================
     * GET INITIALS
     * =========================================================
     */
  
    const getInitials = (cleaner) => {
  
      const first =
        cleaner?.firstname?.charAt(0) || '';
  
      const last =
        cleaner?.lastname?.charAt(0) || '';
  
      return `${first}${last}`.toUpperCase();
    };
  
  
    /*
     * =========================================================
     * FETCH REPLACEMENT CANDIDATES
     * =========================================================
     */
  
    const fetchReplacementCleaners =
      useCallback(async () => {
  
        if (
          !scheduleId ||
          !requestId
        ) {
  
          Alert.alert(
            'Missing Information',
            'The replacement request information is missing.'
          );
  
          setLoading(false);
  
          return;
        }
  
        try {
  
          const response =
            await userService.getReplacementCleaners(
              scheduleId,
              requestId
            );
  
          const data =
            response?.data || {};
  
  
          /*
           * Candidates
           */
  
          setCandidates(
            Array.isArray(
              data?.candidates
            )
              ? data.candidates
              : []
          );
  
  
          /*
           * Unavailable cleaner
           */
  
          setUnavailableCleaner(
            data?.unavailableCleaner ||
            null
          );
  
  
          /*
           * Schedule information
           */
  
          setScheduleDetails({
  
            scheduleId:
              data?.scheduleId ||
              scheduleId,
  
            requestId:
              data?.requestId ||
              requestId,
  
            group:
              data?.group,
  
            oldCleaningDate:
              data?.oldCleaningDate,
  
            newCleaningDate:
              data?.newCleaningDate,
  
            cleaningTime:
              data?.cleaningTime,
  
            cleaningEndTime:
              data?.cleaningEndTime,
  
            propertyName:
              data?.propertyName,
          });
  
        } catch (error) {
  
          console.error(
            '❌ Failed to load replacement cleaners:',
            error?.response?.data ||
            error
          );
  
          Alert.alert(
            'Unable to Load Cleaners',
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            'Unable to load replacement cleaners.'
          );
  
        } finally {
  
          setLoading(false);
          setRefreshing(false);
        }
  
      }, [
        scheduleId,
        requestId,
      ]);
  
  
    /*
     * =========================================================
     * INITIAL LOAD
     * =========================================================
     */
  
    useEffect(() => {
  
      fetchReplacementCleaners();
  
    }, [
      fetchReplacementCleaners,
    ]);
  
  
    /*
     * =========================================================
     * REFRESH
     * =========================================================
     */
  
    const handleRefresh = async () => {
  
      setRefreshing(true);
  
      /*
       * Clear selections because the candidate
       * list may have changed.
       */
  
      setSelectedCleaners([]);
  
      await fetchReplacementCleaners();
    };
  
  
    /*
     * =========================================================
     * TOGGLE CLEANER
     * =========================================================
     */
  
    const handleToggleCleaner = (cleaner) => {
  
      const id =
        String(
          cleaner?.cleanerId ||
          cleaner?._id ||
          ''
        );
  
      if (!id) {
        return;
      }
  
      setSelectedCleaners(
        (previous) => {
  
          const alreadySelected =
            previous.includes(id);
  
          if (alreadySelected) {
  
            return previous.filter(
              (cleanerId) =>
                cleanerId !== id
            );
          }
  
          return [
            ...previous,
            id,
          ];
        }
      );
    };
  
  
    /*
     * =========================================================
     * CHECK SELECTED
     * =========================================================
     */
  
    const isCleanerSelected = (cleaner) => {
  
      const id =
        String(
          cleaner?.cleanerId ||
          cleaner?._id ||
          ''
        );
  
      return selectedCleaners.includes(id);
    };
  
  
    /*
     * =========================================================
     * SEND REPLACEMENT REQUESTS
     * =========================================================
     */
  
    const handleSendReplacementRequests = () => {
  
      if (
        !scheduleId ||
        !requestId
      ) {
  
        Alert.alert(
          'Missing Information',
          'The replacement request information is missing.'
        );
  
        return;
      }
  
  
      if (
        selectedCleaners.length === 0
      ) {
  
        Alert.alert(
          'Select Cleaners',
          'Please select at least one cleaner.'
        );
  
        return;
      }
  
  
      Alert.alert(
        'Send Replacement Requests',
        `Send requests to ${selectedCleaners.length} selected cleaner${
          selectedCleaners.length === 1
            ? ''
            : 's'
        }?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
  
          {
            text: 'Send Requests',
            onPress:
              submitReplacementRequests,
          },
        ]
      );
    };
  
  
    /*
     * =========================================================
     * SUBMIT REQUESTS
     * =========================================================
     */
  
    const submitReplacementRequests =
      async () => {
  
        try {
  
          setSendingRequests(true);
  
          console.log(
            '🚨 Sending replacement requests:',
            {
              scheduleId,
              requestId,
              cleanerIds:
                selectedCleaners,
            }
          );
  
  
          const response =
            await userService.sendReplacementRequests(
              {
                scheduleId,
                requestId,
                cleanerIds:
                  selectedCleaners,
              }
            );
  
  
          console.log(
            '✅ Replacement request response:',
            response?.data
          );
  
  
          const data =
            response?.data || {};
  
  
          const createdRequests =
            Array.isArray(
              data?.createdRequests
            )
              ? data.createdRequests
              : [];
  
  
          const existingRequests =
            Array.isArray(
              data?.existingRequests
            )
              ? data.existingRequests
              : [];
  
  
          const skippedRequests =
            Array.isArray(
              data?.skippedRequests
            )
              ? data.skippedRequests
              : [];
  
  
          const totalRequests =
            createdRequests.length +
            existingRequests.length;
  
  
          /*
           * Clear selection
           */
  
          setSelectedCleaners([]);
  
  
          /*
           * Navigate to status screen.
           *
           * IMPORTANT:
           * We do NOT go to payment here.
           */
  
          navigation.navigate(
            ROUTES.host_replacement_request_status,
            {
              scheduleId,
              requestId,
  
              cleanerId,
  
              group:
                data?.group ||
                scheduleDetails?.group,
  
              oldCleaningDate:
                data?.oldCleaningDate ||
                scheduleDetails?.oldCleaningDate,
  
              newCleaningDate:
                data?.newCleaningDate ||
                scheduleDetails?.newCleaningDate,
  
              cleaningTime:
                data?.cleaningTime ||
                scheduleDetails?.cleaningTime,
  
              propertyName:
                data?.propertyName ||
                scheduleDetails?.propertyName,
  
              createdRequests,
  
              existingRequests,
  
              skippedRequests,
  
              totalRequests,
            }
          );
  
        } catch (error) {
  
          console.error(
            '❌ Failed to send replacement requests:',
            error?.response?.data ||
            error
          );
  
  
          Alert.alert(
            'Unable to Send Requests',
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            'Unable to send replacement requests. Please try again.'
          );
  
        } finally {
  
          setSendingRequests(false);
        }
      };
  
  
    /*
     * =========================================================
     * RENDER CLEANER
     * =========================================================
     */
  
    const renderCleaner = ({
      item,
    }) => {
  
      const isSelected =
        isCleanerSelected(item);
  
  
      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            handleToggleCleaner(item)
          }
          disabled={sendingRequests}
        >
  
          <View
            style={[
              styles.cleanerCard,
              isSelected &&
                styles.cleanerCardSelected,
            ]}
          >
  
            {/* -----------------------------------------------
             * Checkbox
             * -----------------------------------------------
             */}
  
            <View style={styles.checkboxContainer}>
  
              <Checkbox
                status={
                  isSelected
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() =>
                  handleToggleCleaner(item)
                }
                color={
                  COLORS.primary
                }
                disabled={
                  sendingRequests
                }
              />
  
            </View>
  
  
            {/* -----------------------------------------------
             * Avatar
             * -----------------------------------------------
             */}
  
            <View style={styles.avatar}>
  
              <Text style={styles.avatarText}>
                {getInitials(item)}
              </Text>
  
            </View>
  
  
            {/* -----------------------------------------------
             * Cleaner info
             * -----------------------------------------------
             */}
  
            <View style={styles.cleanerInfo}>
  
              <Text
                style={styles.cleanerName}
                numberOfLines={1}
              >
                {item?.name ||
                  `${item?.firstname || ''} ${
                    item?.lastname || ''
                  }`.trim()}
              </Text>
  
  
              <View
                style={styles.cleanerMeta}
              >
  
                <Text
                  style={styles.distance}
                >
                  {item?.distance != null
                    ? `${item.distance} mi away`
                    : 'Available cleaner'}
                </Text>
  
              </View>
  
  
              {item?.rating != null && (
  
                <Text style={styles.rating}>
                  ★ {item.rating}
                </Text>
  
              )}
  
            </View>
  
  
            {/* -----------------------------------------------
             * Selected indicator
             * -----------------------------------------------
             */}
  
            {isSelected && (
  
              <View
                style={
                  styles.selectedBadge
                }
              >
  
                <Text
                  style={
                    styles.selectedBadgeText
                  }
                >
                  Selected
                </Text>
  
              </View>
  
            )}
  
          </View>
  
        </TouchableOpacity>
      );
    };
  
  
    /*
     * =========================================================
     * LOADING
     * =========================================================
     */
  
    if (loading) {
  
      return (
        <SafeAreaView
          style={styles.container}
        >
  
          <StatusBar
            barStyle="dark-content"
          />
  
          <View
            style={styles.loadingContainer}
          >
  
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
  
            <Text
              style={styles.loadingTitle}
            >
              Finding replacement cleaners
            </Text>
  
            <Text
              style={styles.loadingSubtitle}
            >
              Checking cleaners available for
              the updated cleaning date...
            </Text>
  
          </View>
  
        </SafeAreaView>
      );
    }
  
  
    /*
     * =========================================================
     * MAIN UI
     * =========================================================
     */
  
    return (
  
      <SafeAreaView
        style={styles.container}
      >
  
        <StatusBar
          barStyle="dark-content"
        />
  
  
        <FlatList
  
          data={candidates}
  
          keyExtractor={(item) =>
            String(
              item?.cleanerId ||
              item?._id
            )
          }
  
          renderItem={
            renderCleaner
          }
  
          showsVerticalScrollIndicator={
            false
          }
  
          refreshing={
            refreshing
          }
  
          onRefresh={
            handleRefresh
          }
  
          contentContainerStyle={
            styles.listContent
          }
  
  
          /*
           * =====================================================
           * HEADER
           * =====================================================
           */
  
          ListHeaderComponent={
  
            <View>
  
  
              {/* -------------------------------------------------
               * Page Header
               * -------------------------------------------------
               */}
  
              <View
                style={styles.header}
              >
  
                <Text
                  style={styles.title}
                >
                  Find a Replacement
                </Text>
  
                <Text
                  style={styles.subtitle}
                >
                  Select cleaners you'd like to invite
                  to this replacement assignment.
                </Text>
  
              </View>
  
  
              {/* -------------------------------------------------
               * Schedule Hero
               * -------------------------------------------------
               */}
  
              <View
                style={styles.scheduleHero}
              >
  
                <View
                  style={styles.scheduleIcon}
                >
  
                  <Text
                    style={
                      styles.scheduleIconText
                    }
                  >
                    ↻
                  </Text>
  
                </View>
  
  
                <View
                  style={styles.scheduleHeroContent}
                >
  
                  <Text
                    style={
                      styles.propertyName
                    }
                    numberOfLines={1}
                  >
                    {
                      scheduleDetails?.propertyName ||
                      'Property'
                    }
                  </Text>
  
  
                  <Text
                    style={
                      styles.scheduleGroup
                    }
                  >
                    {formatGroup(
                      scheduleDetails?.group
                    )}
                  </Text>
  
  
                  <View
                    style={
                      styles.scheduleMeta
                    }
                  >
  
                    <View
                      style={
                        styles.metaItem
                      }
                    >
  
                      <Text
                        style={
                          styles.metaLabel
                        }
                      >
                        NEW DATE
                      </Text>
  
                      <Text
                        style={
                          styles.metaValue
                        }
                      >
                        {formatDate(
                          scheduleDetails?.newCleaningDate
                        )}
                      </Text>
  
                    </View>
  
  
                    <View
                      style={
                        styles.metaDivider
                      }
                    />
  
  
                    <View
                      style={
                        styles.metaItem
                      }
                    >
  
                      <Text
                        style={
                          styles.metaLabel
                        }
                      >
                        TIME
                      </Text>
  
                      <Text
                        style={
                          styles.metaValue
                        }
                      >
                        {formatTime(
                          scheduleDetails?.cleaningTime
                        )}
                      </Text>
  
                    </View>
  
                  </View>
  
                </View>
  
              </View>
  
  
              {/* -------------------------------------------------
               * Date Change
               * -------------------------------------------------
               */}
  
              <View
                style={styles.dateChange}
              >
  
                <View
                  style={styles.dateColumn}
                >
  
                  <Text
                    style={styles.dateLabel}
                  >
                    ORIGINAL
                  </Text>
  
                  <Text
                    style={styles.oldDate}
                  >
                    {formatDate(
                      scheduleDetails?.oldCleaningDate
                    )}
                  </Text>
  
                </View>
  
  
                <Text
                  style={styles.dateArrow}
                >
                  →
                </Text>
  
  
                <View
                  style={styles.dateColumn}
                >
  
                  <Text
                    style={styles.dateLabel}
                  >
                    UPDATED
                  </Text>
  
                  <Text
                    style={styles.updatedDate}
                  >
                    {formatDate(
                      scheduleDetails?.newCleaningDate
                    )}
                  </Text>
  
                </View>
  
              </View>
  
  
              {/* -------------------------------------------------
               * Unavailable Cleaner
               * -------------------------------------------------
               */}
  
              {unavailableCleaner && (
  
                <View
                  style={
                    styles.unavailableBanner
                  }
                >
  
                  <View
                    style={
                      styles.warningIcon
                    }
                  >
  
                    <Text
                      style={
                        styles.warningIconText
                      }
                    >
                      !
                    </Text>
  
                  </View>
  
  
                  <View
                    style={
                      styles.warningContent
                    }
                  >
  
                    <Text
                      style={
                        styles.warningTitle
                      }
                    >
                      Cleaner unavailable
                    </Text>
  
                    <Text
                      style={
                        styles.warningText
                      }
                    >
                      {
                        unavailableCleaner?.name ||
                        `${unavailableCleaner?.firstname || ''} ${
                          unavailableCleaner?.lastname || ''
                        }`.trim()
                      }{' '}
                      declined the updated
                      cleaning date.
                    </Text>
  
                  </View>
  
                </View>
  
              )}
  
  
              {/* -------------------------------------------------
               * Selection Header
               * -------------------------------------------------
               */}
  
              <View
                style={styles.selectionHeader}
              >
  
                <View
                  style={
                    styles.selectionHeaderText
                  }
                >
  
                  <Text
                    style={
                      styles.selectionTitle
                    }
                  >
                    Available Cleaners
                  </Text>
  
                  <Text
                    style={
                      styles.selectionSubtitle
                    }
                  >
                    Select multiple cleaners
                  </Text>
  
                </View>
  
  
                <View
                  style={
                    styles.selectionCount
                  }
                >
  
                  <Text
                    style={
                      styles.selectionCountNumber
                    }
                  >
                    {selectedCleaners.length}
                  </Text>
  
                  <Text
                    style={
                      styles.selectionCountLabel
                    }
                  >
                    SELECTED
                  </Text>
  
                </View>
  
              </View>
  
  
              {/* -------------------------------------------------
               * Instruction
               * -------------------------------------------------
               */}
  
              <View
                style={styles.instruction}
              >
  
                <Text
                  style={
                    styles.instructionIcon
                  }
                >
                  ✓
                </Text>
  
                <Text
                  style={
                    styles.instructionText
                  }
                >
                  Select multiple cleaners. Each selected
                  cleaner will receive a replacement request.
                </Text>
  
              </View>
  
            </View>
          }
  
  
          /*
           * =====================================================
           * FOOTER
           * =====================================================
           */
  
          ListFooterComponent={
  
            candidates.length > 0 ? (
  
              <View
                style={styles.footer}
              >
  
                <Button
                  mode="contained"
                  onPress={
                    handleSendReplacementRequests
                  }
                  disabled={
                    selectedCleaners.length === 0 ||
                    sendingRequests
                  }
                  buttonColor={
                    COLORS.primary
                  }
                  contentStyle={
                    styles.sendButtonContent
                  }
                  style={
                    styles.sendButton
                  }
                  icon={
                    sendingRequests
                      ? undefined
                      : 'send'
                  }
                >
  
                  {sendingRequests
                    ? 'Sending Requests...'
                    : selectedCleaners.length > 0
                      ? `Send ${selectedCleaners.length} Request${
                          selectedCleaners.length === 1
                            ? ''
                            : 's'
                        }`
                      : 'Select Cleaners'
                  }
  
                </Button>
  
  
                <Text
                  style={styles.footerText}
                >
                  Cleaners can accept or decline the
                  request. You will choose the replacement
                  after they respond.
                </Text>
  
              </View>
  
            ) : null
          }
  
        />
  
      </SafeAreaView>
    );
  };
  
  
  const styles = StyleSheet.create({
  
    container: {
      flex: 1,
      backgroundColor: '#F7F9FC',
    },
  
    listContent: {
      paddingBottom: 30,
    },
  
  
    // =========================================================
    // Loading
    // =========================================================
  
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
  
    loadingTitle: {
      marginTop: 18,
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
    },
  
    loadingSubtitle: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      color: '#64748B',
    },
  
  
    // =========================================================
    // Header
    // =========================================================
  
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
    },
  
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.6,
    },
  
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      color: '#64748B',
    },
  
  
    // =========================================================
    // Schedule hero
    // =========================================================
  
    scheduleHero: {
      marginHorizontal: 16,
      padding: 18,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
  
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.05,
      shadowRadius: 10,
  
      elevation: 2,
    },
  
    scheduleIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: '#EEF4FF',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    scheduleIconText: {
      fontSize: 25,
      fontWeight: '700',
      color: '#4F6EF7',
    },
  
    scheduleHeroContent: {
      flex: 1,
      marginLeft: 13,
    },
  
    propertyName: {
      fontSize: 18,
      fontWeight: '750',
      color: '#111827',
    },
  
    scheduleGroup: {
      marginTop: 3,
      fontSize: 13,
      color: '#64748B',
    },
  
    scheduleMeta: {
      flexDirection: 'row',
      marginTop: 15,
      alignItems: 'center',
    },
  
    metaItem: {
      flex: 1,
    },
  
    metaLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
      color: '#94A3B8',
    },
  
    metaValue: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '700',
      color: '#111827',
    },
  
    metaDivider: {
      width: 1,
      height: 30,
      backgroundColor: '#E2E8F0',
      marginHorizontal: 12,
    },
  
  
    // =========================================================
    // Date change
    // =========================================================
  
    dateChange: {
      marginHorizontal: 16,
      marginTop: 10,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: '#F1F5F9',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    dateColumn: {
      alignItems: 'center',
    },
  
    dateLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
      color: '#94A3B8',
    },
  
    oldDate: {
      marginTop: 3,
      fontSize: 13,
      fontWeight: '600',
      color: '#64748B',
    },
  
    updatedDate: {
      marginTop: 3,
      fontSize: 13,
      fontWeight: '700',
      color: '#16A34A',
    },
  
    dateArrow: {
      marginHorizontal: 20,
      fontSize: 19,
      color: '#94A3B8',
    },
  
  
    // =========================================================
    // Warning
    // =========================================================
  
    unavailableBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: '#FFF7E8',
      flexDirection: 'row',
    },
  
    warningIcon: {
      width: 32,
      height: 32,
      borderRadius: 11,
      backgroundColor: '#FFE5A3',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    warningIconText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#92400E',
    },
  
    warningContent: {
      flex: 1,
      marginLeft: 10,
    },
  
    warningTitle: {
      fontSize: 14,
      fontWeight: '750',
      color: '#78350F',
    },
  
    warningText: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: '#92400E',
    },
  
  
    // =========================================================
    // Selection
    // =========================================================
  
    selectionHeader: {
      marginHorizontal: 16,
      marginTop: 25,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  
    selectionHeaderText: {
      flex: 1,
    },
  
    selectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#111827',
    },
  
    selectionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: '#64748B',
    },
  
    selectionCount: {
      minWidth: 58,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: '#EEF4FF',
      alignItems: 'center',
    },
  
    selectionCountNumber: {
      fontSize: 17,
      fontWeight: '800',
      color: '#4F6EF7',
    },
  
    selectionCountLabel: {
      marginTop: 1,
      fontSize: 7,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: '#64748B',
    },
  
  
    // =========================================================
    // Instruction
    // =========================================================
  
    instruction: {
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#F0FDF4',
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    instructionIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      textAlign: 'center',
      lineHeight: 24,
      backgroundColor: '#DCFCE7',
      fontWeight: '800',
      color: '#15803D',
    },
  
    instructionText: {
      flex: 1,
      marginLeft: 9,
      fontSize: 12,
      lineHeight: 17,
      color: '#166534',
    },
  
  
    // =========================================================
    // Cleaner
    // =========================================================
  
    cleanerCard: {
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
  
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.035,
      shadowRadius: 8,
  
      elevation: 1,
    },
  
    cleanerCardSelected: {
      borderWidth: 2,
      borderColor: '#4F6EF7',
      padding: 11,
    },
  
    checkboxContainer: {
      marginLeft: -4,
      marginRight: 2,
    },
  
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: '#EEF2F7',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    avatarText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#475569',
    },
  
    cleanerInfo: {
      flex: 1,
      marginLeft: 11,
    },
  
    cleanerName: {
      fontSize: 15,
      fontWeight: '750',
      color: '#111827',
    },
  
    cleanerMeta: {
      marginTop: 4,
    },
  
    distance: {
      fontSize: 12,
      color: '#64748B',
    },
  
    rating: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
    },
  
    selectedBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: '#EEF4FF',
    },
  
    selectedBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#4F6EF7',
    },
  
  
    // =========================================================
    // Footer
    // =========================================================
  
    footer: {
      paddingHorizontal: 16,
      marginTop: 10,
    },
  
    sendButton: {
      borderRadius: 14,
    },
  
    sendButtonContent: {
      height: 54,
    },
  
    footerText: {
      marginTop: 10,
      paddingHorizontal: 15,
      textAlign: 'center',
      fontSize: 11,
      lineHeight: 17,
      color: '#94A3B8',
    },
  
  });
  
  
  export default ReplacementCleaner;




