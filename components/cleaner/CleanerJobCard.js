import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { Card, Divider } from 'react-native-paper';
import PhotoPreview from '../shared/PhotoPreview';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CleanerJobCard = ({
  schedule,
  onImagePress,
  currentCleanerId,
}) => {
  const [expanded, setExpanded] = useState(false);

  const rotateAnim = useRef(
    new Animated.Value(0)
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(1)
  ).current;

  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  // --------------------------------------------------
  // Current cleaner assignment
  // --------------------------------------------------

  const currentCleaner = useMemo(() => {
    return schedule?.assignedTo?.find(
      (cleaner) =>
        cleaner?.cleanerId === currentCleanerId
    );
  }, [
    schedule?.assignedTo,
    currentCleanerId,
  ]);

  // If cleaner is not assigned to this schedule,
  // there is nothing for this card to display.
  if (!currentCleaner) {
    return null;
  }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const normalizeStatus = (value) =>
    String(value || '')
      .trim()
      .toLowerCase();

  const getStatusConfig = () => {
    const cleanerStatus = normalizeStatus(
      currentCleaner?.status
    );

    /*
     * Payment states intentionally take priority over
     * normal cleaning states.
     */

    if (
      currentCleaner?.payment_released === true
    ) {
      return {
        type: 'payment_released',
        text: tSafe(
          'payment_released',
          'Payment Released'
        ),
        color: theme.status.success,
        background:
          theme.status.success + '18',
        icon: 'checkmark-done-circle-outline',
      };
    }

    if (
      currentCleaner?.payment_approved === true ||
      currentCleaner?.payment_appoved === true ||
      cleanerStatus === 'payment_approved'
    ) {
      return {
        type: 'payment_approved',
        text: tSafe(
          'payment_approved',
          'Payment Approved'
        ),
        color: theme.status.success,
        background:
          theme.status.success + '18',
        icon: 'checkmark-circle-outline',
      };
    }

    if (
      cleanerStatus === 'payment_confirmed'
    ) {
      return {
        type: 'payment_confirmed',
        text: tSafe(
          'payment_confirmed',
          'Payment Confirmed'
        ),
        color: theme.status.info,
        background:
          theme.status.info + '18',
        icon: 'checkmark-circle',
      };
    }

    switch (cleanerStatus) {
      case 'completed':
        return {
          type: 'completed',
          text: tSafe(
            'completed',
            'Completed'
          ),
          color: theme.status.success,
          background:
            theme.status.success + '18',
          icon: 'checkmark-circle-outline',
        };

      case 'uncompleted':
        return {
          type: 'uncompleted',
          text: tSafe(
            'uncompleted',
            'Uncompleted'
          ),
          color: theme.status.error,
          background:
            theme.status.error + '18',
          icon: 'close-circle-outline',
        };

      case 'pending_review':
        return {
          type: 'pending_review',
          text: tSafe(
            'pending_review',
            'Pending Review'
          ),
          color: theme.status.warning,
          background:
            theme.status.warning + '18',
          icon: 'time-outline',
        };

      case 'in_progress':
        return {
          type: 'in_progress',
          text: tSafe(
            'in_progress',
            'In Progress'
          ),
          color: theme.status.info,
          background:
            theme.status.info + '18',
          icon: 'timer-outline',
        };

      case 'approved':
        return {
          type: 'approved',
          text: tSafe(
            'approved',
            'Approved'
          ),
          color: theme.status.success,
          background:
            theme.status.success + '18',
          icon: 'checkmark-circle-outline',
        };

      case 'cancelled':
        return {
          type: 'cancelled',
          text: tSafe(
            'cancelled',
            'Cancelled'
          ),
          color: theme.text.muted,
          background:
            theme.background.sunken,
          icon: 'ban-outline',
        };

      case 'rejected':
        return {
          type: 'rejected',
          text: tSafe(
            'rejected',
            'Rejected'
          ),
          color: theme.status.error,
          background:
            theme.status.error + '18',
          icon: 'close-circle-outline',
        };

      default:
        return {
          type: 'unknown',
          text:
            cleanerStatus ||
            tSafe(
              'unknown_status',
              'Unknown'
            ),
          color: theme.text.muted,
          background:
            theme.background.sunken,
          icon: 'help-circle-outline',
        };
    }
  };

  const completionStatus =
    getStatusConfig();

  // --------------------------------------------------
  // Progress
  // --------------------------------------------------

  const getCleanerProgress = () => {
    const completed = Math.max(
      0,
      Number(
        currentCleaner?.progress
          ?.completedTasks
      ) || 0
    );

    const total = Math.max(
      0,
      Number(
        currentCleaner?.progress
          ?.totalTasks
      ) || 0
    );

    let percentage = Number(
      currentCleaner?.progress
        ?.percentage
    );

    if (!Number.isFinite(percentage)) {
      percentage =
        total > 0
          ? (completed / total) * 100
          : 0;
    }

    percentage = Math.min(
      100,
      Math.max(0, percentage)
    );

    return {
      completed,
      total,
      percentage: Math.round(
        percentage
      ),
    };
  };

  const progress = getCleanerProgress();

  // --------------------------------------------------
  // Fee
  // --------------------------------------------------

  const getCleanerFee = () => {
    const rawFee =
      currentCleaner?.checklist
        ?.price ??
      currentCleaner?.fee ??
      0;

    const parsedFee = Number(rawFee);

    return Number.isFinite(parsedFee)
      ? parsedFee
      : 0;
  };

  const fee = getCleanerFee();

  // --------------------------------------------------
  // Date
  // --------------------------------------------------

  const getDisplayDate = () => {
    const completionDate =
      schedule?.completed_on?.$date ||
      schedule?.completed_on;

    const scheduledDate =
      schedule?.schedule?.cleaning_date;

    if (
      completionStatus.type ===
        'payment_released' &&
      currentCleaner?.payout_date
    ) {
      return tSafe(
        'paid_on_date',
        'Paid {date}',
        {
          date: moment(
            currentCleaner.payout_date
          ).format('MMM DD, YYYY'),
        }
      );
    }

    if (
      completionStatus.type ===
      'payment_approved'
    ) {
      return tSafe(
        'approved_on_date',
        'Approved {date}',
        {
          date: completionDate
            ? moment(
                completionDate
              ).format(
                'MMM DD, YYYY'
              )
            : '—',
        }
      );
    }

    if (
      completionStatus.type ===
      'payment_confirmed'
    ) {
      return tSafe(
        'payment_confirmed_on_date',
        'Payment Confirmed {date}',
        {
          date: completionDate
            ? moment(
                completionDate
              ).format(
                'MMM DD, YYYY'
              )
            : '—',
        }
      );
    }

    if (
      completionStatus.type ===
      'completed'
    ) {
      return tSafe(
        'completed_on_date_time',
        'Completed {dateTime}',
        {
          dateTime: completionDate
            ? moment(
                completionDate
              ).format(
                'MMM DD, YYYY [at] h:mm A'
              )
            : '—',
        }
      );
    }

    return tSafe(
      'scheduled_on_date_time',
      'Scheduled {dateTime}',
      {
        dateTime: scheduledDate
          ? moment(
              scheduledDate
            ).format(
              'MMM DD, YYYY [at] h:mm A'
            )
          : '—',
      }
    );
  };

  // --------------------------------------------------
  // Group
  // --------------------------------------------------

  const formattedGroup =
    currentCleaner?.group
      ? String(
          currentCleaner.group
        )
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          )
      : tSafe(
          'unassigned',
          'Unassigned'
        );

  // --------------------------------------------------
  // Payment state
  // --------------------------------------------------

  const hasPaymentInformation =
    [
      'payment_released',
      'payment_approved',
      'payment_confirmed',
      'approved',
    ].includes(
      completionStatus.type
    );

  const paymentMessage =
    completionStatus.type ===
    'payment_released'
      ? tSafe(
          'payment_released_on_date',
          'Payment released {date}',
          {
            date:
              currentCleaner?.payout_date
                ? moment(
                    currentCleaner.payout_date
                  ).format(
                    'MMM DD, YYYY'
                  )
                : '',
          }
        )
      : completionStatus.type ===
        'payment_approved'
      ? tSafe(
          'payment_approved_awaiting_release',
          'Payment approved — awaiting release'
        )
      : completionStatus.type ===
        'payment_confirmed'
      ? tSafe(
          'payment_confirmed_under_review',
          'Payment confirmed — under review'
        )
      : tSafe(
          'payment_approved_awaiting_release',
          'Payment approved — awaiting release'
        );

  // --------------------------------------------------
  // Expand / collapse
  // --------------------------------------------------

  const toggleExpand = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    Animated.parallel([
      Animated.timing(
        rotateAnim,
        {
          toValue: expanded ? 0 : 1,
          duration: 250,
          useNativeDriver: true,
        }
      ),

      Animated.sequence([
        Animated.timing(
          scaleAnim,
          {
            toValue: 0.985,
            duration: 80,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          scaleAnim,
          {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }
        ),
      ]),
    ]).start();

    setExpanded((previous) => !previous);
  };

  const rotate =
    rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        '0deg',
        '180deg',
      ],
    });

  // --------------------------------------------------
  // Navigate to photos/work
  // --------------------------------------------------

  const openWorkDetails = () => {
    navigation.navigate(
      ROUTES.cleaner_attach_task_photos,
      {
        scheduleId: schedule?._id,
        schedule,
        cleanerId: currentCleanerId,
        mode:
          completionStatus.type ===
          'completed'
            ? 'completed'
            : 'in_progress',
      }
    );
  };

  // --------------------------------------------------
  // Render cleaner assignment
  // --------------------------------------------------

  const renderCleanerDetails = () => {
    const avatarSource =
      currentCleaner?.avatar
        ? {
            uri: currentCleaner.avatar,
          }
        : require('../../assets/images/default_avatar.png');

    const showProgress =
      completionStatus.type ===
        'in_progress' ||
      completionStatus.type ===
        'completed';

    return (
      <View style={styles.assignmentCard}>
        {/* Assignment header */}
        <View style={styles.assignmentHeader}>
          <View style={styles.assignmentIdentity}>
            <Image
              source={avatarSource}
              style={styles.cleanerAvatar}
            />

            <View
              style={styles.cleanerDetails}
            >
              <Text
                style={styles.cleanerName}
                numberOfLines={1}
              >
                {currentCleaner?.firstname ||
                  tSafe(
                    'unknown',
                    'Unknown'
                  )}{' '}
                {currentCleaner?.lastname ||
                  ''}
              </Text>

              <View
                style={
                  styles.assignmentMeta
                }
              >
                <View
                  style={styles.metaPill}
                >
                  <Ionicons
                    name="people-outline"
                    size={12}
                    color={
                      theme.text.secondary
                    }
                  />

                  <Text
                    style={
                      styles.metaPillText
                    }
                  >
                    {formattedGroup}
                  </Text>
                </View>

                <View
                  style={styles.metaPill}
                >
                  <Ionicons
                    name="cash-outline"
                    size={12}
                    color={
                      theme.text.secondary
                    }
                  />

                  <Text
                    style={
                      styles.metaPillText
                    }
                  >
                    ${fee.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.assignmentStatus,
              {
                backgroundColor:
                  completionStatus.background,
              },
            ]}
          >
            <Ionicons
              name={
                completionStatus.icon
              }
              size={14}
              color={
                completionStatus.color
              }
            />

            <Text
              style={[
                styles.assignmentStatusText,
                {
                  color:
                    completionStatus.color,
                },
              ]}
            >
              {completionStatus.text}
            </Text>
          </View>
        </View>

        {/* Progress */}
        {showProgress && (
          <View
            style={
              styles.progressContainer
            }
          >
            <View
              style={
                styles.progressHeader
              }
            >
              <Text
                style={
                  styles.progressLabel
                }
              >
                {tSafe(
                  'cleaning_progress',
                  'Cleaning Progress'
                )}
              </Text>

              <Text
                style={
                  styles.progressPercentage
                }
              >
                {progress.percentage}%
              </Text>
            </View>

            <View
              style={
                styles.progressBackground
              }
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress.percentage}%`,
                    backgroundColor:
                      completionStatus.color,
                  },
                ]}
              />
            </View>

            <Text
              style={styles.progressText}
            >
              {progress.completed}/
              {progress.total}{' '}
              {tSafe(
                'tasks',
                'tasks'
              )}
            </Text>
          </View>
        )}

        {/* Payment */}
        {hasPaymentInformation && (
          <View
            style={[
              styles.paymentInfo,
              {
                backgroundColor:
                  completionStatus.background,
                borderColor:
                  completionStatus.color +
                  '35',
              },
            ]}
          >
            <View
              style={styles.paymentRow}
            >
              <View
                style={[
                  styles.paymentIcon,
                  {
                    backgroundColor:
                      completionStatus.color +
                      '20',
                  },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={17}
                  color={
                    completionStatus.color
                  }
                />
              </View>

              <View
                style={
                  styles.paymentContent
                }
              >
                <Text
                  style={[
                    styles.paymentTitle,
                    {
                      color:
                        completionStatus.color,
                    },
                  ]}
                >
                  {completionStatus.text}
                </Text>

                <Text
                  style={
                    styles.paymentText
                  }
                >
                  {paymentMessage}
                </Text>

                {currentCleaner?.transfer_id && (
                  <Text
                    style={
                      styles.transferId
                    }
                    numberOfLines={1}
                  >
                    {tSafe(
                      'transfer_id',
                      'Transfer ID'
                    )}
                    :{' '}
                    {
                      currentCleaner.transfer_id
                    }
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Rooms */}
        {Array.isArray(
          currentCleaner?.checklist
            ?.rooms
        ) &&
          currentCleaner.checklist.rooms
            .length > 0 && (
            <View
              style={styles.detailGroup}
            >
              <Text
                style={
                  styles.detailGroupLabel
                }
              >
                {tSafe(
                  'rooms_label',
                  'Rooms'
                )}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.horizontalList
                }
              >
                {currentCleaner.checklist.rooms.map(
                  (
                    room,
                    roomIndex
                  ) => (
                    <View
                      key={`${room}-${roomIndex}`}
                      style={
                        styles.roomChip
                      }
                    >
                      <Ionicons
                        name="home-outline"
                        size={12}
                        color={
                          theme.text.secondary
                        }
                      />

                      <Text
                        style={
                          styles.roomText
                        }
                      >
                        {String(
                          room
                        ).replace(
                          /_/g,
                          ' '
                        )}
                      </Text>
                    </View>
                  )
                )}
              </ScrollView>
            </View>
          )}

        {/* Extras */}
        {Array.isArray(
          currentCleaner?.checklist
            ?.extras
        ) &&
          currentCleaner.checklist
            .extras.length > 0 && (
            <View
              style={styles.detailGroup}
            >
              <Text
                style={
                  styles.detailGroupLabel
                }
              >
                {tSafe(
                  'extras_label',
                  'Extras'
                )}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.horizontalList
                }
              >
                {currentCleaner.checklist.extras.map(
                  (
                    extra,
                    extraIndex
                  ) => (
                    <View
                      key={`${extra}-${extraIndex}`}
                      style={
                        styles.extraChip
                      }
                    >
                      <Ionicons
                        name="sparkles-outline"
                        size={12}
                        color={
                          theme.brand.primary
                        }
                      />

                      <Text
                        style={
                          styles.extraText
                        }
                      >
                        {extra}
                      </Text>
                    </View>
                  )
                )}
              </ScrollView>
            </View>
          )}
      </View>
    );
  };

  const address =
    schedule?.schedule?.address
      ?.split(',')[0] ||
    tSafe(
      'unknown_address',
      'Unknown address'
    );

  const cleaningTime =
    schedule?.schedule
      ?.total_cleaning_time || 0;

  return (
    <Animated.View
      style={[
        styles.animatedWrapper,
        {
          transform: [
            {
              scale: scaleAnim,
            },
          ],
        },
      ]}
    >
      <Card style={styles.card}>
        {/* ====================================== */}
        {/* JOB HEADER */}
        {/* ====================================== */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.propertyIdentity}>
              <View
                style={styles.propertyIcon}
              >
                <AntDesign
                  name="home"
                  size={18}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <View
                style={
                  styles.propertyTextContainer
                }
              >
                <Text
                  style={styles.eyebrow}
                >
                  {tSafe(
                    'cleaning_job',
                    'Cleaning Job'
                  )}
                </Text>

                <Text
                  style={styles.title}
                  numberOfLines={1}
                >
                  {schedule?.schedule
                    ?.apartment_name ||
                    tSafe(
                      'unknown_property',
                      'Unknown Property'
                    )}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    completionStatus.background,
                },
              ]}
            >
              <Ionicons
                name={
                  completionStatus.icon
                }
                size={14}
                color={
                  completionStatus.color
                }
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      completionStatus.color,
                  },
                ]}
              >
                {completionStatus.text}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={theme.icon.muted}
            />

            <Text style={styles.date}>
              {getDisplayDate()}
            </Text>
          </View>

          {/* Location / time */}
          <View style={styles.quickInfoRow}>
            <View
              style={styles.quickInfoItem}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.icon.muted}
              />

              <Text
                style={styles.quickInfoText}
                numberOfLines={1}
              >
                {address}
              </Text>
            </View>

            <View
              style={styles.quickInfoItem}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.icon.muted}
              />

              <Text
                style={styles.quickInfoText}
              >
                {cleaningTime}{' '}
                {tSafe(
                  'minutes_abbr',
                  'min'
                )}
              </Text>
            </View>
          </View>

          {/* Assignment preview */}
          <View
            style={styles.assignmentPreview}
          >
            <Image
              source={
                currentCleaner?.avatar
                  ? {
                      uri: currentCleaner.avatar,
                    }
                  : require('../../assets/images/default_avatar.png')
              }
              style={
                styles.previewAvatar
              }
            />

            <View
              style={
                styles.assignmentPreviewText
              }
            >
              <Text
                style={
                  styles.assignmentPreviewLabel
                }
              >
                {tSafe(
                  'your_assignment',
                  'Your Assignment'
                )}
              </Text>

              <Text
                style={
                  styles.assignmentPreviewStatus
                }
              >
                {completionStatus.text}
                {' • '}
                ${fee.toFixed(2)}
              </Text>
            </View>

            {currentCleaner?.payment_released && (
              <View
                style={
                  styles.paidBadge
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={
                    theme.status.success
                  }
                />

                <Text
                  style={
                    styles.paidText
                  }
                >
                  {tSafe(
                    'paid',
                    'Paid'
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ====================================== */}
        {/* EXPAND BUTTON */}
        {/* ====================================== */}

        <TouchableOpacity
          onPress={toggleExpand}
          style={styles.expandButton}
          activeOpacity={0.75}
        >
          <View
            style={styles.expandButtonLeft}
          >
            <View
              style={styles.detailsIcon}
            >
              <Ionicons
                name={
                  expanded
                    ? 'chevron-up'
                    : 'list-outline'
                }
                size={16}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <Text
              style={styles.viewDetailsText}
            >
              {expanded
                ? tSafe(
                    'hide_details',
                    'Hide Details'
                  )
                : tSafe(
                    'view_details',
                    'View Details'
                  )}
            </Text>
          </View>

          <Animated.View
            style={{
              transform: [
                {
                  rotate,
                },
              ],
            }}
          >
            <Ionicons
              name="chevron-down"
              size={19}
              color={
                theme.text.muted
              }
            />
          </Animated.View>
        </TouchableOpacity>

        {/* ====================================== */}
        {/* EXPANDED CONTENT */}
        {/* ====================================== */}

        {expanded && (
          <View
            style={
              styles.expandedContent
            }
          >
            <Divider
              style={styles.divider}
            />

            {/* Assignment */}
            <View
              style={styles.section}
            >
              <Text
                style={styles.sectionTitle}
              >
                {tSafe(
                  'your_assignment_section',
                  'Your Assignment'
                )}
              </Text>

              {renderCleanerDetails()}
            </View>

            {/* Property Details */}
            <View
              style={styles.section}
            >
              <Text
                style={styles.sectionTitle}
              >
                {tSafe(
                  'property_details',
                  'Property Details'
                )}
              </Text>

              <View
                style={styles.propertyStats}
              >
                <PropertyStat
                  icon="time-outline"
                  value={`${cleaningTime} ${tSafe(
                    'minutes_abbr',
                    'min'
                  )}`}
                  styles={styles}
                  theme={theme}
                />

                <PropertyStat
                  icon="cash-outline"
                  value={`$${fee.toFixed(
                    2
                  )}`}
                  label={tSafe(
                    'your_fee',
                    'Your fee'
                  )}
                  styles={styles}
                  theme={theme}
                />

                <PropertyStat
                  icon="location-outline"
                  value={address}
                  styles={styles}
                  theme={theme}
                />
              </View>
            </View>

            {/* Photos */}
            <View
              style={[
                styles.section,
                styles.photoSection,
              ]}
            >
              <View
                style={
                  styles.photoHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitleNoPadding
                    }
                  >
                    {tSafe(
                      'your_cleaning_photos',
                      'Your Cleaning Photos'
                    )}
                  </Text>

                  <Text
                    style={
                      styles.photoSubtitle
                    }
                  >
                    {tSafe(
                      'your_cleaning_photos_subtitle',
                      'Photos from your cleaning job'
                    )}
                  </Text>
                </View>

                <Ionicons
                  name="images-outline"
                  size={20}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <PhotoPreview
                checklist={
                  currentCleaner?.checklist ||
                  schedule?.checklist
                }
                onImagePress={
                  onImagePress
                }
              />
            </View>

            {/* Work button */}
            <TouchableOpacity
              style={
                styles.workButton
              }
              onPress={
                openWorkDetails
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color={
                  theme.button.primaryText
                }
              />

              <Text
                style={
                  styles.workButtonText
                }
              >
                {completionStatus.type ===
                'completed'
                  ? tSafe(
                      'view_completed_work',
                      'View Completed Work'
                    )
                  : tSafe(
                      'continue_work',
                      'Continue Work'
                    )}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={
                  theme.button.primaryText
                }
              />
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

// --------------------------------------------------
// Property statistic
// --------------------------------------------------

const PropertyStat = ({
  icon,
  value,
  label,
  styles,
  theme,
}) => (
  <View
    style={styles.statItem}
  >
    <View
      style={styles.statIcon}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          theme.icon.muted
        }
      />
    </View>

    <Text
      style={styles.statValue}
      numberOfLines={2}
    >
      {value}
    </Text>

    {label && (
      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    )}
  </View>
);

// --------------------------------------------------
// Styles
// --------------------------------------------------

const createStyles = (theme) =>
  StyleSheet.create({
    animatedWrapper: {
      width: '100%',
    },

    card: {
      margin: 0,
      padding: 0,
      borderRadius: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      overflow: 'hidden',

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        theme.shadow?.opacity ||
        0.08,

      shadowRadius: 10,
      elevation: 3,
    },

    // ------------------------------------------
    // Header
    // ------------------------------------------

    header: {
      padding: 18,
      paddingBottom: 16,
      backgroundColor:
        theme.surface.elevated,
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    propertyIdentity: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },

    propertyIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },

    propertyTextContainer: {
      flex: 1,
    },

    eyebrow: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      color:
        theme.text.muted,
      marginBottom: 2,
    },

    title: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      maxWidth: 145,
    },

    statusText: {
      marginLeft: 5,
      fontSize: 10,
      fontWeight: '700',
    },

    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 9,
    },

    date: {
      flex: 1,
      marginLeft: 6,
      fontSize: 12,
      lineHeight: 17,
      color:
        theme.text.secondary,
      fontWeight: '500',
    },

    quickInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      gap: 12,
    },

    quickInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    quickInfoText: {
      marginLeft: 5,
      fontSize: 11,
      color:
        theme.text.secondary,
      flexShrink: 1,
    },

    // ------------------------------------------
    // Assignment preview
    // ------------------------------------------

    assignmentPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 12,
      padding: 9,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    previewAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor:
        theme.surface.elevated,
    },

    assignmentPreviewText: {
      flex: 1,
      marginLeft: 9,
    },

    assignmentPreviewLabel: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color:
        theme.text.muted,
    },

    assignmentPreviewStatus: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '600',
      color:
        theme.text.primary,
    },

    paidBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.status.success +
        '18',
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 10,
    },

    paidText: {
      marginLeft: 3,
      fontSize: 10,
      fontWeight: '700',
      color:
        theme.status.success,
    },

    // ------------------------------------------
    // Expand button
    // ------------------------------------------

    expandButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 18,
      paddingVertical: 13,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      backgroundColor:
        theme.card.background,
    },

    expandButtonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    detailsIcon: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor:
        theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },

    viewDetailsText: {
      fontSize: 13,
      fontWeight: '700',
      color:
        theme.brand.primary,
    },

    // ------------------------------------------
    // Expanded content
    // ------------------------------------------

    expandedContent: {
      paddingTop: 4,
      backgroundColor:
        theme.background.default,
    },

    divider: {
      marginHorizontal: 18,
      backgroundColor:
        theme.divider,
    },

    section: {
      marginTop: 18,
      marginBottom: 2,
    },

    sectionTitle: {
      paddingHorizontal: 18,
      marginBottom: 10,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    sectionTitleNoPadding: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    // ------------------------------------------
    // Cleaner assignment
    // ------------------------------------------

    assignmentCard: {
      marginHorizontal: 18,
      padding: 13,
      borderRadius: 14,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    assignmentHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
    },

    assignmentIdentity: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },

    cleanerAvatar: {
      width: 43,
      height: 43,
      borderRadius: 22,
      backgroundColor:
        theme.background.sunken,
    },

    cleanerDetails: {
      flex: 1,
      marginLeft: 10,
    },

    cleanerName: {
      fontSize: 14,
      fontWeight: '700',
      color:
        theme.text.primary,
      marginBottom: 5,
    },

    assignmentMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },

    metaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 7,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },

    metaPillText: {
      marginLeft: 3,
      fontSize: 10,
      color:
        theme.text.secondary,
      fontWeight: '600',
    },

    assignmentStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 12,
      maxWidth: 115,
    },

    assignmentStatusText: {
      marginLeft: 4,
      fontSize: 9,
      fontWeight: '700',
    },

    // ------------------------------------------
    // Progress
    // ------------------------------------------

    progressContainer: {
      marginTop: 14,
    },

    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 6,
    },

    progressLabel: {
      fontSize: 10,
      fontWeight: '700',
      color:
        theme.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    progressPercentage: {
      fontSize: 11,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    progressBackground: {
      height: 7,
      borderRadius: 4,
      backgroundColor:
        theme.background.sunken,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      borderRadius: 4,
    },

    progressText: {
      marginTop: 5,
      fontSize: 10,
      color:
        theme.text.muted,
      textAlign: 'right',
    },

    // ------------------------------------------
    // Payment
    // ------------------------------------------

    paymentInfo: {
      marginTop: 12,
      padding: 11,
      borderRadius: 11,
      borderWidth: 1,
    },

    paymentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    paymentIcon: {
      width: 31,
      height: 31,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    paymentContent: {
      flex: 1,
      marginLeft: 9,
    },

    paymentTitle: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 2,
    },

    paymentText: {
      fontSize: 11,
      lineHeight: 16,
      color:
        theme.text.secondary,
    },

    transferId: {
      marginTop: 5,
      fontSize: 9,
      color:
        theme.text.muted,
      fontFamily:
        Platform.OS === 'ios'
          ? 'Menlo'
          : 'monospace',
    },

    // ------------------------------------------
    // Rooms / extras
    // ------------------------------------------

    detailGroup: {
      marginTop: 13,
    },

    detailGroupLabel: {
      fontSize: 11,
      fontWeight: '700',
      color:
        theme.text.secondary,
      marginBottom: 7,
    },

    horizontalList: {
      paddingRight: 10,
    },

    roomChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      marginRight: 6,
    },

    roomText: {
      marginLeft: 4,
      fontSize: 10,
      color:
        theme.text.primary,
      fontWeight: '500',
      textTransform: 'capitalize',
    },

    extraChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      borderWidth: 1,
      borderColor:
        theme.brand.primary + '40',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      marginRight: 6,
    },

    extraText: {
      marginLeft: 4,
      fontSize: 10,
      color:
        theme.brand.primary,
      fontWeight: '600',
    },

    // ------------------------------------------
    // Property stats
    // ------------------------------------------

    propertyStats: {
      flexDirection: 'row',
      marginHorizontal: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      borderRadius: 14,
      paddingVertical: 12,
    },

    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 5,
      borderRightWidth: 1,
      borderRightColor:
        theme.divider,
    },

    statIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor:
        theme.background.sunken,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
    },

    statValue: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
      color:
        theme.text.primary,
      textAlign: 'center',
    },

    statLabel: {
      marginTop: 1,
      fontSize: 9,
      color:
        theme.text.muted,
      textAlign: 'center',
    },

    // ------------------------------------------
    // Photos
    // ------------------------------------------

    photoSection: {
      paddingBottom: 18,
    },

    photoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 18,
      marginBottom: 10,
    },

    photoSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color:
        theme.text.muted,
    },

    // ------------------------------------------
    // Work button
    // ------------------------------------------

    workButton: {
      marginHorizontal: 18,
      marginBottom: 18,
      minHeight: 46,
      borderRadius: 13,
      backgroundColor:
        theme.button.primaryBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 14,
    },

    workButtonText: {
      marginHorizontal: 9,
      fontSize: 13,
      fontWeight: '700',
      color:
        theme.button.primaryText,
    },
  });

export default CleanerJobCard;