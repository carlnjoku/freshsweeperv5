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
import { Card, Divider } from 'react-native-paper';
import {
  Ionicons,
  AntDesign,
} from '@expo/vector-icons';
import PhotoPreview from './PhotoPreview';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';
import MarkCleanerUncompletedButton from '../host/MarkCleanerUncompletedButton';
import { useTheme } from '../../theme';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(
    true
  );
}

const JobCard = ({
  schedules,
  onImagePress,
  onRefresh,
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
  // Participating cleaners
  // --------------------------------------------------

  const participatingCleaners = useMemo(() => {
    return (
      schedules?.assignedTo?.filter(
        (cleaner) =>
          cleaner?.participated === true
      ) || []
    );
  }, [schedules?.assignedTo]);

  // --------------------------------------------------
  // Status
  // --------------------------------------------------

  const getStatusInfo = (status) => {
    const normalizedStatus = String(
      status || ''
    )
      .trim()
      .toLowerCase();

    const statusMap = {
      completed: {
        label: tSafe(
          'status_completed',
          'Completed'
        ),
        color: theme.status.success,
        background:
          theme.status.success + '18',
        icon: 'checkmark-circle-outline',
      },

      pending_review: {
        label: tSafe(
          'status_pending_review',
          'Pending Review'
        ),
        color: theme.status.warning,
        background:
          theme.status.warning + '18',
        icon: 'time-outline',
      },

      approved: {
        label: tSafe(
          'status_approved',
          'Approved'
        ),
        color: theme.status.success,
        background:
          theme.status.success + '18',
        icon: 'checkmark-circle-outline',
      },

      uncompleted: {
        label: tSafe(
          'status_uncompleted',
          'Uncompleted'
        ),
        color: theme.status.error,
        background:
          theme.status.error + '18',
        icon: 'close-circle-outline',
      },

      cancelled: {
        label: tSafe(
          'status_cancelled',
          'Cancelled'
        ),
        color: theme.text.muted,
        background:
          theme.background.sunken,
        icon: 'ban-outline',
      },

      payment_released: {
        label: tSafe(
          'status_payment_released',
          'Payment Released'
        ),
        color: theme.status.success,
        background:
          theme.status.success + '18',
        icon: 'cash-outline',
      },

      in_progress: {
        label: tSafe(
          'status_in_progress',
          'In Progress'
        ),
        color: theme.status.info,
        background:
          theme.status.info + '18',
        icon: 'timer-outline',
      },

      upcoming: {
        label: tSafe(
          'status_upcoming',
          'Upcoming'
        ),
        color: theme.brand.primary,
        background:
          theme.brand.primary + '18',
        icon: 'calendar-outline',
      },

      pending_payment: {
        label: tSafe(
          'status_pending_payment',
          'Pending Payment'
        ),
        color: theme.status.pending,
        background:
          theme.status.pending + '18',
        icon: 'cash-outline',
      },
    };

    return (
      statusMap[normalizedStatus] || {
        label:
          status ||
          tSafe(
            'status_unknown',
            'Unknown'
          ),
        color: theme.text.muted,
        background:
          theme.background.sunken,
        icon: 'information-circle-outline',
      }
    );
  };

  const statusInfo = getStatusInfo(
    schedules?.status
  );

  // --------------------------------------------------
  // Cleaner helpers
  // --------------------------------------------------

  const getCleanerProgress = (
    cleaner
  ) => {
    const completed = Math.max(
      0,
      Number(
        cleaner?.progress
          ?.completedTasks
      ) || 0
    );

    const total = Math.max(
      0,
      Number(
        cleaner?.progress
          ?.totalTasks
      ) || 0
    );

    let percentage = Number(
      cleaner?.progress?.percentage
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

  const getCleanerFee = (
    cleaner
  ) => {
    const fee = Number(
      cleaner?.checklist?.price || 0
    );

    return Number.isFinite(fee)
      ? fee
      : 0;
  };

  const isCleanerTerminal = (
    cleaner
  ) => {
    const cleanerStatus =
      String(
        cleaner?.status || ''
      ).toLowerCase();

    return [
      'pending_review',
      'uncompleted',
      'completed',
      'cancelled',
      'rejected',
    ].includes(cleanerStatus);
  };

  const formatGroup = (group) => {
    if (!group) {
      return tSafe(
        'unassigned',
        'Unassigned'
      );
    }

    return String(group)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // --------------------------------------------------
  // Toggle
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

    setExpanded(
      (previous) => !previous
    );
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
  // Schedule details
  // --------------------------------------------------

  const completedDate =
    schedules?.completed_on?.$date ||
    schedules?.completed_on;

  const address =
    schedules?.schedule?.address
      ?.split(',')[0] ||
    tSafe(
      'unknown_address',
      'Unknown address'
    );

  const totalCleaningTime =
    schedules?.schedule
      ?.total_cleaning_time || 0;

  const totalCleaningFee = Number(
    schedules?.schedule
      ?.total_cleaning_fee || 0
  );

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const handleViewDetails = () => {
    if (!schedules?._id) {
      return;
    }

    navigation.navigate(
      ROUTES.cleaner_schedule_details,
      {
        scheduleId: schedules._id,
      }
    );
  };

  const handleViewProgress = () => {
    if (!schedules?._id) {
      return;
    }

    navigation.navigate(
      ROUTES.host_task_progress,
      {
        scheduleId: schedules._id,
        schedule: schedules,
        mode: 'completed',
      }
    );
  };

  // --------------------------------------------------
  // Cleaner card
  // --------------------------------------------------

  const renderCleanerCard = (
    cleaner,
    index
  ) => {
    const progress =
      getCleanerProgress(cleaner);

    const fee =
      getCleanerFee(cleaner);

    const terminal =
      isCleanerTerminal(cleaner);

    const cleanerStatus =
      getStatusInfo(
        cleaner?.status
      );

    const avatarSource =
      cleaner?.avatar
        ? {
            uri: cleaner.avatar,
          }
        : require('../../assets/images/default_avatar.png');

    return (
      <View
        key={
          cleaner?.cleanerId ||
          index
        }
        style={styles.cleanerCard}
      >
        {/* Cleaner identity */}
        <View
          style={styles.cleanerHeader}
        >
          <View
            style={
              styles.cleanerInfo
            }
          >
            <Image
              source={avatarSource}
              style={
                styles.cleanerAvatar
              }
            />

            <View
              style={
                styles.cleanerDetails
              }
            >
              <Text
                style={
                  styles.cleanerName
                }
                numberOfLines={1}
              >
                {cleaner?.firstname ||
                  tSafe(
                    'unknown',
                    'Unknown'
                  )}{' '}
                {cleaner?.lastname ||
                  ''}
              </Text>

              <View
                style={
                  styles.cleanerMetaRow
                }
              >
                <View
                  style={
                    styles.metaPill
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={11}
                    color={
                      theme.text.secondary
                    }
                  />

                  <Text
                    style={
                      styles.metaPillText
                    }
                  >
                    {formatGroup(
                      cleaner?.group
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.metaPill
                  }
                >
                  <Ionicons
                    name="cash-outline"
                    size={11}
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

          {/* Cleaner status */}
          <View
            style={[
              styles.cleanerStatus,
              {
                backgroundColor:
                  cleanerStatus.background,
              },
            ]}
          >
            <Ionicons
              name={
                cleanerStatus.icon
              }
              size={14}
              color={
                cleanerStatus.color
              }
            />

            <Text
              style={[
                styles.cleanerStatusText,
                {
                  color:
                    cleanerStatus.color,
                },
              ]}
            >
              {cleanerStatus.label}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View
          style={
            styles.cleanerProgressContainer
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
                    cleanerStatus.color,
                },
              ]}
            />
          </View>

          <Text
            style={styles.progressText}
          >
            {tSafe(
              'tasks_progress',
              '{completed}/{total} tasks',
              {
                completed:
                  progress.completed,
                total:
                  progress.total,
              }
            )}
          </Text>
        </View>

        {/* Rooms */}
        {Array.isArray(
          cleaner?.checklist?.rooms
        ) &&
          cleaner.checklist.rooms
            .length > 0 && (
            <View
              style={
                styles.detailGroup
              }
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
                {cleaner.checklist.rooms.map(
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
          cleaner?.checklist?.extras
        ) &&
          cleaner.checklist.extras
            .length > 0 && (
            <View
              style={
                styles.detailGroup
              }
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
                {cleaner.checklist.extras.map(
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

        {/* Mark uncompleted */}
        {!terminal && (
          <View
            style={
              styles.markButtonContainer
            }
          >
            <MarkCleanerUncompletedButton
              scheduleId={
                schedules?._id
              }
              cleanerId={
                cleaner?.cleanerId
              }
              cleanerName={`${cleaner?.firstname || ''} ${
                cleaner?.lastname || ''
              }`.trim()}
              onSuccess={onRefresh}
            />
          </View>
        )}
      </View>
    );
  };

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
        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <View style={styles.header}>
          <View
            style={styles.headerTop}
          >
            <View
              style={
                styles.propertyIdentity
              }
            >
              <View
                style={
                  styles.propertyIcon
                }
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
                  {schedules?.schedule
                    ?.apartment_name ||
                    tSafe(
                      'unknown_property',
                      'Unknown Property'
                    )}
                </Text>
              </View>
            </View>

            <View
              style={styles.headerActions}
            >
              {/* Status */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      statusInfo.background,
                  },
                ]}
              >
                <Ionicons
                  name={
                    statusInfo.icon
                  }
                  size={14}
                  color={
                    statusInfo.color
                  }
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        statusInfo.color,
                    },
                  ]}
                >
                  {statusInfo.label}
                </Text>
              </View>

              {/* Schedule details */}
              <TouchableOpacity
                onPress={
                  handleViewDetails
                }
                style={
                  styles.detailsButton
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={
                    theme.brand.primary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Completion date */}
          <View
            style={styles.dateRow}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={
                theme.icon.muted
              }
            />

            <Text
              style={styles.date}
            >
              {tSafe(
                'completed_prefix',
                'Completed'
              )}{' '}
              {completedDate
                ? moment(
                    completedDate
                  ).format(
                    'MMM DD, YYYY [at] h:mm A'
                  )
                : '—'}
            </Text>
          </View>

          {/* Quick information */}
          <View
            style={
              styles.quickInfoRow
            }
          >
            <View
              style={
                styles.quickInfoItem
              }
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.quickInfoText
                }
                numberOfLines={1}
              >
                {address}
              </Text>
            </View>

            <View
              style={
                styles.quickInfoItem
              }
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.quickInfoText
                }
              >
                {totalCleaningTime}{' '}
                {tSafe(
                  'minutes_abbr',
                  'min'
                )}
              </Text>
            </View>

            <View
              style={
                styles.quickInfoItem
              }
            >
              <Ionicons
                name="cash-outline"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.quickInfoText
                }
              >
                ${totalCleaningFee.toFixed(
                  2
                )}
              </Text>
            </View>
          </View>

          {/* Cleaner preview */}
          {participatingCleaners.length >
            0 && (
            <View
              style={
                styles.cleanersPreview
              }
            >
              <View
                style={
                  styles.cleanersPreviewLeft
                }
              >
                <View
                  style={
                    styles.cleanersAvatars
                  }
                >
                  {participatingCleaners
                    .slice(0, 3)
                    .map(
                      (
                        cleaner,
                        index
                      ) => (
                        <Image
                          key={
                            cleaner?.cleanerId ||
                            index
                          }
                          source={
                            cleaner?.avatar
                              ? {
                                  uri: cleaner.avatar,
                                }
                              : require('../../assets/images/default_avatar.png')
                          }
                          style={[
                            styles.previewAvatar,
                            {
                              marginLeft:
                                index >
                                0
                                  ? -9
                                  : 0,
                            },
                          ]}
                        />
                      )
                    )}

                  {participatingCleaners.length >
                    3 && (
                    <View
                      style={[
                        styles.previewAvatar,
                        styles.moreCleaners,
                      ]}
                    >
                      <Text
                        style={
                          styles.moreCleanersText
                        }
                      >
                        +
                        {participatingCleaners.length -
                          3}
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={
                    styles.cleanersPreviewCopy
                  }
                >
                  <Text
                    style={
                      styles.cleanersPreviewTitle
                    }
                  >
                    {tSafe(
                      'assigned_cleaners',
                      'Assigned Cleaners'
                    )}
                  </Text>

                  <Text
                    style={
                      styles.cleanersPreviewText
                    }
                  >
                    {participatingCleaners.length}{' '}
                    {participatingCleaners.length ===
                    1
                      ? tSafe(
                          'cleaner',
                          'cleaner'
                        )
                      : tSafe(
                          'cleaners',
                          'cleaners'
                        )}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.assignmentIndicator
                }
              >
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={
                    theme.brand.primary
                  }
                />
              </View>
            </View>
          )}

          {/* No participating cleaners */}
          {participatingCleaners.length ===
            0 && (
            <View
              style={
                styles.noCleanersBanner
              }
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={
                  theme.text.muted
                }
              />

              <Text
                style={
                  styles.noCleanersText
                }
              >
                {tSafe(
                  'no_participating_cleaners',
                  'No participating cleaners recorded'
                )}
              </Text>
            </View>
          )}
        </View>

        {/* ========================================= */}
        {/* EXPAND */}
        {/* ========================================= */}

        <TouchableOpacity
          onPress={
            toggleExpand
          }
          style={
            styles.expandButton
          }
          activeOpacity={0.75}
        >
          <View
            style={
              styles.expandButtonLeft
            }
          >
            <View
              style={
                styles.detailsIcon
              }
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
              style={
                styles.viewDetailsText
              }
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

        {/* ========================================= */}
        {/* EXPANDED CONTENT */}
        {/* ========================================= */}

        {expanded && (
          <View
            style={
              styles.expandedContent
            }
          >
            <Divider
              style={styles.divider}
            />

            {/* Cleaners */}
            <View
              style={
                styles.cleanersSection
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {tSafe(
                      'assigned_cleaners',
                      'Assigned Cleaners'
                    )}
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    {participatingCleaners.length}{' '}
                    {participatingCleaners.length ===
                    1
                      ? tSafe(
                          'cleaner_assigned',
                          'cleaner assigned'
                        )
                      : tSafe(
                          'cleaners_assigned',
                          'cleaners assigned'
                        )}
                  </Text>
                </View>

                <View
                  style={
                    styles.sectionIcon
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={17}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>
              </View>

              <View
                style={
                  styles.cleanersList
                }
              >
                {participatingCleaners.map(
                  renderCleanerCard
                )}
              </View>
            </View>

            {/* Property details */}
            <View
              style={
                styles.propertySection
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {tSafe(
                      'property_details',
                      'Property Details'
                    )}
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    {tSafe(
                      'job_summary',
                      'Job summary'
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.sectionIcon
                  }
                >
                  <Ionicons
                    name="home-outline"
                    size={17}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>
              </View>

              <View
                style={
                  styles.propertyStats
                }
              >
                <PropertyStat
                  icon="time-outline"
                  value={`${totalCleaningTime} ${tSafe(
                    'minutes_abbr',
                    'min'
                  )}`}
                  label={tSafe(
                    'cleaning_time',
                    'Cleaning time'
                  )}
                  styles={styles}
                  theme={theme}
                />

                <PropertyStat
                  icon="cash-outline"
                  value={`$${totalCleaningFee.toFixed(
                    2
                  )}`}
                  label={tSafe(
                    'total_fee',
                    'Total fee'
                  )}
                  styles={styles}
                  theme={theme}
                />

                <PropertyStat
                  icon="location-outline"
                  value={address}
                  label={tSafe(
                    'location',
                    'Location'
                  )}
                  styles={styles}
                  theme={theme}
                />
              </View>
            </View>

            {/* Photos */}
            <View
              style={
                styles.photoSection
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {tSafe(
                      'cleaning_photos',
                      'Cleaning Photos'
                    )}
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    {tSafe(
                      'cleaning_photos_subtitle',
                      'Review photos submitted for this job'
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.sectionIcon
                  }
                >
                  <Ionicons
                    name="images-outline"
                    size={17}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>
              </View>

              <PhotoPreview
                checklist={
                  schedules?.checklist
                }
                onImagePress={
                  onImagePress
                }
              />
            </View>

            {/* Full progress */}
            <TouchableOpacity
              style={
                styles.progressButton
              }
              onPress={
                handleViewProgress
              }
              activeOpacity={0.8}
            >
              <View
                style={
                  styles.progressButtonIcon
                }
              >
                <Ionicons
                  name="analytics-outline"
                  size={18}
                  color={
                    theme.button.primaryText
                  }
                />
              </View>

              <View
                style={
                  styles.progressButtonCopy
                }
              >
                <Text
                  style={
                    styles.progressButtonTitle
                  }
                >
                  {tSafe(
                    'view_task_progress',
                    'View Task Progress'
                  )}
                </Text>

                <Text
                  style={
                    styles.progressButtonSubtitle
                  }
                >
                  {tSafe(
                    'view_task_progress_subtitle',
                    'See the full cleaning progress'
                  )}
                </Text>
              </View>

              <Ionicons
                name="arrow-forward"
                size={18}
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

    <Text
      style={styles.statLabel}
    >
      {label}
    </Text>
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
      marginRight: 8,
    },

    propertyIcon: {
      width: 39,
      height: 39,
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

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      maxWidth: 130,
    },

    statusText: {
      marginLeft: 5,
      fontSize: 10,
      fontWeight: '700',
    },

    detailsButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor:
        theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 6,
    },

    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
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
      marginBottom: 13,
      gap: 10,
    },

    quickInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    quickInfoText: {
      marginLeft: 4,
      fontSize: 10,
      color:
        theme.text.secondary,
      flexShrink: 1,
    },

    // ------------------------------------------
    // Cleaner preview
    // ------------------------------------------

    cleanersPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 12,
      padding: 9,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    cleanersPreviewLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    cleanersAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 9,
    },

    previewAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor:
        theme.background.sunken,
      backgroundColor:
        theme.surface.elevated,
    },

    moreCleaners: {
      backgroundColor:
        theme.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    moreCleanersText: {
      color:
        theme.text.inverse,
      fontSize: 10,
      fontWeight: '700',
    },

    cleanersPreviewCopy: {
      flex: 1,
    },

    cleanersPreviewTitle: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color:
        theme.text.muted,
    },

    cleanersPreviewText: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '600',
      color:
        theme.text.primary,
    },

    assignmentIndicator: {
      width: 29,
      height: 29,
      borderRadius: 10,
      backgroundColor:
        theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    noCleanersBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.background.sunken,
      borderRadius: 11,
      padding: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    noCleanersText: {
      marginLeft: 7,
      fontSize: 11,
      color:
        theme.text.muted,
    },

    // ------------------------------------------
    // Expand
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
    // Expanded
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

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 18,
      marginBottom: 10,
    },

    sectionTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color:
        theme.text.muted,
    },

    sectionIcon: {
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor:
        theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ------------------------------------------
    // Cleaners
    // ------------------------------------------

    cleanersSection: {
      marginTop: 18,
      marginBottom: 4,
    },

    cleanersList: {
      paddingHorizontal: 18,
    },

    cleanerCard: {
      backgroundColor:
        theme.card.background,
      borderRadius: 14,
      padding: 13,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    cleanerHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
    },

    cleanerInfo: {
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

    cleanerMetaRow: {
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
      fontSize: 9,
      color:
        theme.text.secondary,
      fontWeight: '600',
      textTransform: 'capitalize',
    },

    cleanerStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 12,
      maxWidth: 115,
    },

    cleanerStatusText: {
      marginLeft: 4,
      fontSize: 9,
      fontWeight: '700',
    },

    // ------------------------------------------
    // Progress
    // ------------------------------------------

    cleanerProgressContainer: {
      marginTop: 13,
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
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color:
        theme.text.secondary,
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
    // Details
    // ------------------------------------------

    detailGroup: {
      marginTop: 12,
    },

    detailGroupLabel: {
      fontSize: 10,
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
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        theme.border.default,
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
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        theme.brand.primary + '40',
      marginRight: 6,
    },

    extraText: {
      marginLeft: 4,
      fontSize: 10,
      color:
        theme.brand.primary,
      fontWeight: '600',
    },

    markButtonContainer: {
      marginTop: 12,
      alignSelf: 'flex-start',
    },

    // ------------------------------------------
    // Property
    // ------------------------------------------

    propertySection: {
      marginTop: 18,
      marginBottom: 4,
    },

    propertyStats: {
      flexDirection: 'row',
      marginHorizontal: 18,
      backgroundColor:
        theme.card.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.card.border,
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

    statItemLast: {
      borderRightWidth: 0,
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
      marginTop: 2,
      fontSize: 9,
      color:
        theme.text.muted,
      textAlign: 'center',
    },

    // ------------------------------------------
    // Photos
    // ------------------------------------------

    photoSection: {
      marginTop: 18,
      paddingBottom: 18,
    },

    // ------------------------------------------
    // Progress button
    // ------------------------------------------

    progressButton: {
      marginHorizontal: 18,
      marginBottom: 18,
      minHeight: 54,
      borderRadius: 14,
      backgroundColor:
        theme.button.primaryBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },

    progressButtonIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.16)',
    },

    progressButtonCopy: {
      flex: 1,
      marginHorizontal: 9,
    },

    progressButtonTitle: {
      fontSize: 12,
      fontWeight: '700',
      color:
        theme.button.primaryText,
    },

    progressButtonSubtitle: {
      marginTop: 2,
      fontSize: 9,
      color:
        theme.hero?.mutedForeground ||
        theme.button.primaryText,
    },
  });

export default JobCard;