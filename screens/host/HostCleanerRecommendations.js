import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import moment from 'moment';

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import ROUTES from '../../constants/routes';

import { Avatar } from 'react-native-paper';
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating-widget';

import AboutMeDisplay from '../cleaner/AboutMeDisplay';
import HostAvailabilityDisplay from '../../components/host/HostAvailabilityDisplay';
import HostCertificationDisplay from '../../components/host/HostCertificationDisplay';
import Reviews from '../../components/shared/Reviews';

import { useTheme } from '../../theme';
import { AppText } from '../../ui';

export default function HostCleanerRecommendations({
  navigation,
}) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  /*
   * ============================================================
   * TRUST / BADGE HELPERS
   * ============================================================
   */

  const getCleanerTrustTier = useCallback(
    (cleaner) => {
      if (!cleaner) {
        return null;
      }

      if (cleaner?.trustTier) {
        return String(
          cleaner.trustTier
        ).toLowerCase();
      }

      if (
        cleaner?.verification?.trustTier
      ) {
        return String(
          cleaner.verification.trustTier
        ).toLowerCase();
      }

      if (
        cleaner?.profile?.trustTier
      ) {
        return String(
          cleaner.profile.trustTier
        ).toLowerCase();
      }

      return null;
    },
    []
  );

  const isPremiumCleaner = useCallback(
    (cleaner) => {
      const tier =
        getCleanerTrustTier(cleaner);

      return (
        tier === 'premium' ||
        tier === 'premium_cleaner'
      );
    },
    [getCleanerTrustTier]
  );

  const isVerifiedCleaner = useCallback(
    (cleaner) => {
      if (
        typeof cleaner?.trust?.isVerified ===
        'boolean'
      ) {
        return cleaner.trust.isVerified;
      }

      const tier =
        getCleanerTrustTier(cleaner);

      if (
        tier === 'verified' ||
        tier === 'trusted' ||
        tier === 'premium' ||
        tier === 'premium_cleaner'
      ) {
        return true;
      }

      const verification =
        cleaner?.verification;

      return Boolean(
        verification?.identityVerified &&
          verification?.phoneVerified &&
          verification?.emailVerified
      );
    },
    [getCleanerTrustTier]
  );

  const route = useRoute();

  const {
    scheduleId,
    schedule: routeSchedule,
  } = route?.params || {};

  const [candidates, setCandidates] =
    useState([]);

  const [requiredCleaners, setRequiredCleaners] =
    useState(0);

  const [assignedTo, setAssignedTo] =
    useState([]);

  const [scheduleDetails, setScheduleDetails] =
    useState({});

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [acceptedCleanerIds, setAcceptedCleanerIds] =
    useState(new Set());

  const [profileCleaner, setProfileCleaner] =
    useState(null);

  const [profileVisible, setProfileVisible] =
    useState(false);

  const [profileTab, setProfileTab] =
    useState('about');

  const [profileAvailability, setProfileAvailability] =
    useState(null);

  const [profileReviews, setProfileReviews] =
    useState([]);

  const [profileLoading, setProfileLoading] =
    useState(false);

  /*
   * ============================================================
   * STICKY HEADERS STATE
   * ============================================================
   */

  const [stickyProperty, setStickyProperty] =
    useState(false);

  const [stickyGroupReqs, setStickyGroupReqs] =
    useState(false);

  const propertyYRef = useRef(null);
  const groupReqsYRef = useRef(null);

  const handlePropertyLayout = useCallback(
    (event) => {
      propertyYRef.current =
        event.nativeEvent.layout.y;
    },
    []
  );

  const handleGroupReqsLayout = useCallback(
    (event) => {
      groupReqsYRef.current =
        event.nativeEvent.layout.y;
    },
    []
  );

  const handlePageScroll = useCallback(
    (event) => {
      const y =
        event.nativeEvent.contentOffset.y;

      if (propertyYRef.current != null) {
        const shouldShowProperty =
          y >= propertyYRef.current;

        setStickyProperty((prev) =>
          prev === shouldShowProperty
            ? prev
            : shouldShowProperty
        );
      }

      if (groupReqsYRef.current != null) {
        const shouldShowGroupReqs =
          y >= groupReqsYRef.current;

        setStickyGroupReqs((prev) =>
          prev === shouldShowGroupReqs
            ? prev
            : shouldShowGroupReqs
        );
      }
    },
    []
  );

  /*
   * ============================================================
   * GROUP HELPERS
   * ============================================================
   */

  const getCleanerGroup = useCallback(
    (cleaner) => {
      if (!cleaner) {
        return null;
      }

      return (
        cleaner.group ||
        cleaner.requestGroup ||
        cleaner.assignedGroup ||
        cleaner.request?.group ||
        null
      );
    },
    []
  );

  const groupLabel = useCallback(
    (group) => {
      if (!group) {
        return tSafe(
          'unknown_group',
          'Unknown group'
        );
      }

      const normalizedGroup = group
        .replace(/^group[_-]?/i, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );

      return `${tSafe(
        'group',
        'Group'
      )} ${normalizedGroup}`;
    },
    []
  );

  /*
   * ============================================================
   * REQUIRED GROUP COUNTS
   * ============================================================
   */

  const requiredGroupCounts = useMemo(() => {
    return assignedTo.reduce(
      (counts, position) => {
        const group =
          position?.group;

        if (!group) {
          return counts;
        }

        counts[group] =
          (counts[group] || 0) + 1;

        return counts;
      },
      {}
    );
  }, [assignedTo]);

  const requiredGroups = useMemo(
    () =>
      Object.keys(
        requiredGroupCounts
      ),
    [requiredGroupCounts]
  );

  /*
   * ============================================================
   * SELECTED GROUP COUNTS
   * ============================================================
   */

  const selectedGroupCounts = useMemo(() => {
    return selectedIds.reduce(
      (counts, cleanerId) => {
        const cleaner =
          candidates.find(
            (candidate) =>
              candidate.cleanerId ===
              cleanerId
          );

        const group =
          getCleanerGroup(cleaner);

        if (!group) {
          return counts;
        }

        counts[group] =
          (counts[group] || 0) + 1;

        return counts;
      },
      {}
    );
  }, [
    selectedIds,
    candidates,
    getCleanerGroup,
  ]);

  /*
   * ============================================================
   * MISSING GROUPS
   * ============================================================
   */

  const missingGroups = useMemo(() => {
    return requiredGroups
      .map((group) => {
        const required =
          requiredGroupCounts[group] ||
          0;

        const selected =
          selectedGroupCounts[group] ||
          0;

        return {
          group,
          required,
          selected,
          remaining: Math.max(
            0,
            required - selected
          ),
        };
      })
      .filter(
        (item) =>
          item.remaining > 0
      );
  }, [
    requiredGroups,
    requiredGroupCounts,
    selectedGroupCounts,
  ]);

  /*
   * ============================================================
   * GROUP COMPOSITION
   * ============================================================
   */

  const groupCompositionComplete =
    useMemo(() => {
      if (!requiredGroups.length) {
        return false;
      }

      return requiredGroups.every(
        (group) =>
          (selectedGroupCounts[group] ||
            0) ===
          (requiredGroupCounts[group] ||
            0)
      );
    }, [
      requiredGroups,
      requiredGroupCounts,
      selectedGroupCounts,
    ]);

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  const fetchData = useCallback(
    async () => {
      if (!scheduleId) {
        setError(
          tSafe(
            'missing_schedule_id',
            'Missing schedule ID.'
          )
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        /*
         * STEP 1
         * Get existing request state.
         */

        const requestResponse =
          await userService.getHostCleaningRequestByScheduleId(
            scheduleId,
            moment().format(
              'YYYY-MM-DD HH:mm:ss'
            )
          );

        const requestData =
          requestResponse?.data || [];

        const requestAssignedTo =
          requestData?.[0]?.schedule
            ?.assignedTo || [];

        const routeAssignedTo =
          routeSchedule?.assignedTo || [];

        const initialAssignedTo =
          requestAssignedTo.length > 0
            ? requestAssignedTo
            : routeAssignedTo;

        /*
         * STEP 2
         * Create/send host-selection requests.
         */

        try {
          await userService.sendHostGroupCleanerRequests(
            scheduleId
          );
        } catch (requestErr) {
          console.warn(
            '⚠️ Host group cleaner request skipped:',
            requestErr?.response?.data
              ?.detail ||
              requestErr?.message
          );
        }

        /*
         * STEP 3
         * Refresh request state and candidates.
         */

        const [
          refreshedCandidateResponse,
          refreshedRequestResponse,
        ] = await Promise.all([
          userService.getHostCleanerCandidates(
            scheduleId
          ),
          userService.getHostCleaningRequestByScheduleId(
            scheduleId,
            moment().format(
              'YYYY-MM-DD HH:mm:ss'
            )
          ),
        ]);

        const candidateData =
          refreshedCandidateResponse?.data ||
          {};

        const refreshedRequestData =
          refreshedRequestResponse?.data ||
          [];

        const refreshedRequestAssignedTo =
          refreshedRequestData?.[0]
            ?.schedule?.assignedTo || [];

        const refreshedAssignedTo =
          refreshedRequestAssignedTo.length >
          0
            ? refreshedRequestAssignedTo
            : initialAssignedTo;

        const acceptedIds = new Set(
          refreshedRequestData
            .filter(
              (request) =>
                request?.status ===
                  'accepted' &&
                request?.cleaner?.['_id']
            )
            .map(
              (request) =>
                request.cleaner['_id']
            )
        );

        const recommendedCandidates =
          Array.isArray(
            candidateData?.candidates
          )
            ? candidateData.candidates
            : [];

        recommendedCandidates.forEach(
          (candidate) => {
            if (
              candidate?.requestStatus ===
              'accepted'
            ) {
              acceptedIds.add(
                candidate.cleanerId
              );
            }
          }
        );

        setAcceptedCleanerIds(
          acceptedIds
        );

        const refreshedSchedule =
          refreshedRequestData?.[0]
            ?.schedule ||
          routeSchedule ||
          {};

        setScheduleDetails(
          refreshedSchedule
        );

        setCandidates(
          recommendedCandidates
        );

        setAssignedTo(
          refreshedAssignedTo
        );

        setRequiredCleaners(
          refreshedAssignedTo.length
        );

        setSelectedIds((current) =>
          current.filter(
            (id) =>
              acceptedIds.has(id) &&
              recommendedCandidates.some(
                (candidate) =>
                  candidate.cleanerId ===
                  id
              )
          )
        );
      } catch (err) {
        console.error(
          '❌ Error loading host cleaner recommendations:',
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.message ||
            tSafe(
              'unable_to_load_cleaner_recommendations',
              'Unable to load cleaner recommendations.'
            )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      scheduleId,
      routeSchedule,
    ]
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  /*
   * ============================================================
   * CANDIDATE GROUPS
   * ============================================================
   */

  const acceptedCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) =>
          acceptedCleanerIds.has(
            candidate.cleanerId
          ) ||
          candidate.requestStatus ===
            'accepted'
      ),
    [
      candidates,
      acceptedCleanerIds,
    ]
  );

  const pendingCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) =>
          candidate.requestStatus ===
          'pending_acceptance'
      ),
    [candidates]
  );

  /*
   * ============================================================
   * TOGGLE CLEANER
   * ============================================================
   */

  const toggleCleaner = (
    cleanerId
  ) => {
    const candidate =
      candidates.find(
        (item) =>
          item.cleanerId === cleanerId
      );

    const accepted =
      acceptedCleanerIds.has(
        cleanerId
      ) ||
      candidate?.requestStatus ===
        'accepted';

    if (!accepted) {
      return;
    }

    const cleanerGroup =
      getCleanerGroup(candidate);

    if (!cleanerGroup) {
      console.warn(
        `Cleaner ${cleanerId} has no request group. Selection blocked until the group is known.`
      );

      return;
    }

    setSelectedIds((current) => {
      if (
        current.includes(cleanerId)
      ) {
        return current.filter(
          (id) => id !== cleanerId
        );
      }

      if (
        current.length >=
        requiredCleaners
      ) {
        return current;
      }

      const requiredForGroup =
        requiredGroupCounts[
          cleanerGroup
        ] || 0;

      const alreadySelectedForGroup =
        current.reduce(
          (count, selectedId) => {
            const selectedCleaner =
              candidates.find(
                (item) =>
                  item.cleanerId ===
                  selectedId
              );

            return (
              count +
              (getCleanerGroup(
                selectedCleaner
              ) === cleanerGroup
                ? 1
                : 0)
            );
          },
          0
        );

      if (
        alreadySelectedForGroup >=
        requiredForGroup
      ) {
        return current;
      }

      return [
        ...current,
        cleanerId,
      ];
    });
  };

  /*
   * ============================================================
   * CLEANER PROFILE
   * ============================================================
   */

  const openCleanerProfile =
    async (cleaner) => {
      setProfileCleaner(cleaner);
      setProfileTab('about');
      setProfileVisible(true);
      setProfileAvailability(null);
      setProfileReviews([]);
      setProfileLoading(true);

      try {
        const [
          availabilityResponse,
          reviewsResponse,
        ] = await Promise.all([
          userService.getCleanerAvailability(
            cleaner.cleanerId
          ),
          userService.getCleanerFeedbacks(
            cleaner.cleanerId
          ),
        ]);

        setProfileAvailability(
          availabilityResponse?.data
            ?.data ||
            availabilityResponse?.data ||
            null
        );

        setProfileReviews(
          reviewsResponse?.data?.data ||
            reviewsResponse?.data ||
            []
        );
      } catch (err) {
        console.warn(
          '⚠️ Unable to load cleaner profile details:',
          err?.response?.data?.detail ||
            err?.message
        );
      } finally {
        setProfileLoading(false);
      }
    };

  const closeCleanerProfile = () => {
    setProfileVisible(false);
    setProfileCleaner(null);
  };

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */

  const proceedToCheckout = () => {
    if (
      selectedIds.length !==
        requiredCleaners ||
      !assignedTo.length ||
      !groupCompositionComplete
    ) {
      return;
    }

    const openPositions =
      assignedTo.filter(
        (position) =>
          !position?.cleanerId
      );

    if (
      openPositions.length !==
      selectedIds.length
    ) {
      return;
    }

    const selectedCleaners =
      selectedIds
        .map((id) =>
          candidates.find(
            (candidate) =>
              candidate.cleanerId ===
              id
          )
        )
        .filter(Boolean);

    const availablePositionsByGroup =
      openPositions.reduce(
        (groups, position) => {
          const group =
            position?.group;

          if (!group) {
            return groups;
          }

          if (!groups[group]) {
            groups[group] = [];
          }

          groups[group].push(
            position
          );

          return groups;
        },
        {}
      );

    const cleanersWithFee = [];

    for (const cleaner of selectedCleaners) {
      const cleanerGroup =
        getCleanerGroup(cleaner);

      if (!cleanerGroup) {
        console.error(
          '❌ Cannot continue: selected cleaner has no group.',
          cleaner
        );

        return;
      }

      const matchingPositions =
        availablePositionsByGroup[
          cleanerGroup
        ] || [];

      const position =
        matchingPositions.shift();

      if (!position) {
        console.error(
          `❌ Cannot continue: no available ${cleanerGroup} position for cleaner ${cleaner.cleanerId}.`
        );

        return;
      }

      const calculatedPrice =
        Number(
          position?.checklist
            ?.calculatedPrice ??
            position?.checklist
              ?.price ??
            0
        );

      cleanersWithFee.push({
        cleanerId:
          cleaner.cleanerId,

        firstname:
          cleaner.firstname || '',

        lastname:
          cleaner.lastname || '',

        avatar:
          cleaner.avatar || '',

        group: cleanerGroup,

        fee: calculatedPrice,

        price: Number(
          position?.checklist
            ?.price ?? 0
        ),

        calculatedPrice,
      });
    }

    const checkoutGroupCounts =
      cleanersWithFee.reduce(
        (counts, cleaner) => {
          counts[cleaner.group] =
            (counts[cleaner.group] ||
              0) + 1;

          return counts;
        },
        {}
      );

    const checkoutCompositionValid =
      requiredGroups.every(
        (group) =>
          checkoutGroupCounts[
            group
          ] ===
          requiredGroupCounts[group]
      );

    if (
      !checkoutCompositionValid
    ) {
      console.error(
        '❌ Group composition validation failed before checkout.',
        {
          requiredGroupCounts,
          checkoutGroupCounts,
        }
      );

      return;
    }

    const totalFee =
      cleanersWithFee.reduce(
        (sum, cleaner) =>
          sum +
          Number(
            cleaner.fee || 0
          ),
        0
      );

    console.log(
      '💰 HOST CHECKOUT CLEANERS:',
      cleanersWithFee
    );

    console.log(
      '💰 HOST CHECKOUT TOTAL:',
      totalFee
    );

    navigation?.navigate(
      ROUTES.host_group_checkout,
      {
        requestId: null,
        cleaning_fee: totalFee,
        scheduleId,
        schedule: {
          ...scheduleDetails,
          assignedTo,
        },
        selected_cleaners:
          selectedCleaners.map(
            (cleaner) => ({
              _id:
                cleaner.cleanerId,

              cleanerId:
                cleaner.cleanerId,

              firstname:
                cleaner.firstname ||
                '',

              lastname:
                cleaner.lastname ||
                '',

              avatar:
                cleaner.avatar || '',

              group:
                getCleanerGroup(
                  cleaner
                ),
            })
          ),

        cleanerIds: selectedIds,

        cleanersWithFee,

        hostSelectionFlow: true,
      }
    );
  };

  /*
   * ============================================================
   * CLEANER CARD
   * ============================================================
   */

  const renderCandidate = ({
    item,
  }) => {
    const selected =
      selectedIds.includes(
        item.cleanerId
      );

    const performance =
      item.performance || {};

    const hasRating =
      typeof item.averageRating ===
      'number';

    const rating = hasRating
      ? item.averageRating.toFixed(
          1
        )
      : null;

    const cleanerGroup =
      getCleanerGroup(item);

    const requiredForGroup =
      cleanerGroup
        ? requiredGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const selectedForGroup =
      cleanerGroup
        ? selectedGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const groupFull =
      cleanerGroup &&
      selectedForGroup >=
        requiredForGroup;

    const cannotSelect =
      !selected &&
      (selectedIds.length >=
        requiredCleaners ||
        !cleanerGroup ||
        groupFull);

    const premium =
      isPremiumCleaner(item);

    const verified =
      isVerifiedCleaner(item);

    return (
      <View
        style={[
          styles.cleanerCard,
          selected &&
            styles.cleanerCardSelected,
        ]}
      >
        <TouchableOpacity
          style={styles.cleanerCardMain}
          onPress={() =>
            openCleanerProfile(item)
          }
          activeOpacity={0.88}
        >
          <View
            style={styles.avatarWrapper}
          >
            {item.avatar ? (
              <Avatar.Image
                size={58}
                source={{
                  uri: item.avatar,
                }}
              />
            ) : (
              <View
                style={
                  styles.avatarFallback
                }
              >
                <MaterialCommunityIcons
                  name="account"
                  size={27}
                  color={
                    theme.icon.inverse
                  }
                />
              </View>
            )}

            {premium ? (
              <View
                style={
                  styles.premiumBadge
                }
              >
                <MaterialCommunityIcons
                  name="shield-star"
                  size={14}
                  color={
                    theme.text.inverse
                  }
                />
              </View>
            ) : verified ? (
              <View
                style={
                  styles.verifiedBadge
                }
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color={
                    theme.text.inverse
                  }
                />
              </View>
            ) : null}

            {selected ? (
              <View
                style={
                  styles.avatarCheck
                }
              >
                <MaterialCommunityIcons
                  name="check"
                  size={13}
                  color={
                    theme.text.inverse
                  }
                />
              </View>
            ) : null}
          </View>

          <View
            style={styles.cleanerMainInfo}
          >
            <View
              style={
                styles.cleanerNameRow
              }
            >
              <AppText
                variant="bodyMedium"
                numberOfLines={1}
                style={styles.cleanerName}
              >
                {`${item.firstname || ''} ${
                  item.lastname || ''
                }`.trim()}
              </AppText>

              <View
                style={
                  styles.ratingPill
                }
              >
                <MaterialCommunityIcons
                  name="star"
                  size={13}
                  color={
                    theme.status.warning
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.ratingPillText
                  }
                >
                  {rating ||
                    tSafe(
                      'new',
                      'New'
                    )}
                </AppText>
              </View>
            </View>

            {premium ? (
              <View
                style={styles.trustBadgeRow}
              >
                <MaterialCommunityIcons
                  name="shield-star"
                  size={14}
                  color={
                    theme.status.warning
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.premiumLabel
                  }
                >
                  {tSafe(
                    'premium_cleaner',
                    'Premium Cleaner'
                  )}
                </AppText>
              </View>
            ) : verified ? (
              <View
                style={styles.trustBadgeRow}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color={
                    theme.status.info
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.verifiedLabel
                  }
                >
                  {tSafe(
                    'verified_cleaner',
                    'Verified Cleaner'
                  )}
                </AppText>
              </View>
            ) : null}

            <View
              style={
                styles.distanceRow
              }
            >
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.distanceText
                }
              >
                {item.distance ??
                  '—'}{' '}
                {tSafe(
                  'miles_away',
                  'miles away'
                )}
              </AppText>
            </View>

            <View
              style={
                styles.cardMetaRow
              }
            >
              {cleanerGroup ? (
                <View
                  style={
                    styles.groupPill
                  }
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={13}
                    color={
                      theme.brand.primary
                    }
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.groupPillText
                    }
                  >
                    {groupLabel(
                      cleanerGroup
                    )}
                  </AppText>
                </View>
              ) : (
                <View
                  style={[
                    styles.groupPill,
                    styles.groupPillWarning,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={13}
                    color={
                      theme.status.warning
                    }
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.groupPillText,
                      styles.groupPillWarningText,
                    ]}
                  >
                    {tSafe(
                      'group_pending',
                      'Group pending'
                    )}
                  </AppText>
                </View>
              )}

              <View
                style={styles.performancePill}
              >
                <AppText
                  variant="caption"
                  style={
                    styles.performancePillText
                  }
                >
                  {tSafe(
                    'performance',
                    'Performance'
                  )}{' '}
                  {performance.performance_score ??
                    0}
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.recommendationRow
              }
            >
              <View
                style={
                  styles.recommendationIcon
                }
              >
                <MaterialCommunityIcons
                  name="sparkles"
                  size={13}
                  color={
                    theme.brand.primary
                  }
                />
              </View>

              <AppText
                variant="caption"
                style={
                  styles.recommendationText
                }
              >
                {tSafe(
                  'recommendation_score',
                  'Recommendation score'
                )}{' '}
                {item.host_recommendation_score ??
                  0}
              </AppText>
            </View>

            <View
              style={
                styles.acceptedRow
              }
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={15}
                color={
                  theme.status.success
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.acceptedText
                }
              >
                {tSafe(
                  'cleaner_accepted_available',
                  'Accepted — available for selection'
                )}
              </AppText>
            </View>

            {cleanerGroup &&
            groupFull &&
            !selected ? (
              <AppText
                variant="caption"
                style={
                  styles.groupNotice
                }
              >
                {`${groupLabel(
                  cleanerGroup
                )} ${tSafe(
                  'group_already_filled',
                  'is already filled'
                )}`}
              </AppText>
            ) : null}

            {!cleanerGroup ? (
              <AppText
                variant="caption"
                style={
                  styles.groupNotice
                }
              >
                {tSafe(
                  'waiting_for_request_group',
                  'Waiting for request group information'
                )}
              </AppText>
            ) : null}
          </View>

          <View
            style={styles.cardChevron}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={
                theme.icon.muted
              }
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectButton,
            selected &&
              styles.selectButtonSelected,
            cannotSelect &&
              styles.selectButtonDisabled,
          ]}
          onPress={() =>
            toggleCleaner(
              item.cleanerId
            )
          }
          disabled={cannotSelect}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={
              selected
                ? 'check'
                : 'plus'
            }
            size={20}
            color={
              selected
                ? theme.button.primaryText
                : cannotSelect
                ? theme.button.disabledText
                : theme.brand.primary
            }
          />

          <AppText
            variant="label"
            style={[
              styles.selectButtonText,
              selected &&
                styles.selectButtonTextSelected,
              cannotSelect &&
                styles.selectButtonTextDisabled,
            ]}
          >
            {selected
              ? tSafe(
                  'selected',
                  'Selected'
                )
              : tSafe(
                  'select',
                  'Select'
                )}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * ============================================================
   * PROPERTY CARD
   * ============================================================
   */

  const renderPropertyContext = (
    sticky = false
  ) => (
    <View
      style={[
        styles.propertyContext,
        sticky &&
          styles.propertyContextSticky,
      ]}
      onLayout={
        sticky
          ? undefined
          : handlePropertyLayout
      }
    >
      <View
        style={
          styles.propertyIconContainer
        }
      >
        <MaterialCommunityIcons
          name="home-map-marker"
          size={21}
          color={
            theme.brand.primary
          }
        />
      </View>

      <View style={styles.propertyInfo}>
        {!sticky ? (
          <AppText
            variant="caption"
            style={
              styles.propertyEyebrow
            }
          >
            {tSafe(
              'property',
              'Property'
            )}
          </AppText>
        ) : null}

        <AppText
          variant="bodyMedium"
          numberOfLines={1}
          style={styles.propertyName}
        >
          {scheduleDetails
            ?.apartment_name
            ?.trim() ||
            scheduleDetails
              ?.overall_checklist
              ?.apartment_name
              ?.trim() ||
            tSafe(
              'property',
              'Property'
            )}
        </AppText>

        {scheduleDetails?.address?.trim() ? (
          <View
            style={
              styles.propertyLocationRow
            }
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={
                theme.icon.muted
              }
            />

            <AppText
              variant="caption"
              numberOfLines={1}
              style={
                styles.propertyLocation
              }
            >
              {scheduleDetails.address.trim()}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );

  /*
   * ============================================================
   * TEAM REQUIREMENTS
   * ============================================================
   */

  const renderGroupRequirements = (
    sticky = false
  ) => {
    if (!requiredGroups.length) {
      return null;
    }

    return (
      <View
        style={[
          styles.groupRequirements,
          sticky &&
            styles.groupRequirementsSticky,
        ]}
        onLayout={
          sticky
            ? undefined
            : handleGroupReqsLayout
        }
      >
        <View
          style={
            styles.groupRequirementsHeader
          }
        >
          <View
            style={
              styles.groupRequirementsTitleBlock
            }
          >
            <AppText
              variant="bodyMedium"
              style={
                styles.groupRequirementsTitle
              }
            >
              {tSafe(
                'team_requirements',
                'Team requirements'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.groupRequirementsSubtitle
              }
            >
              {tSafe(
                'group_requirement_description',
                'Each required group needs a cleaner before payment.'
              )}
            </AppText>
          </View>

          <View
            style={[
              styles.completionBadge,
              groupCompositionComplete
                ? styles.completionBadgeComplete
                : styles.completionBadgeIncomplete,
            ]}
          >
            <MaterialCommunityIcons
              name={
                groupCompositionComplete
                  ? 'check-circle'
                  : 'alert-circle-outline'
              }
              size={15}
              color={
                groupCompositionComplete
                  ? theme.status.success
                  : theme.status.warning
              }
            />

            <AppText
              variant="caption"
              style={[
                styles.completionBadgeText,
                groupCompositionComplete
                  ? styles.completionBadgeTextComplete
                  : styles.completionBadgeTextIncomplete,
              ]}
            >
              {groupCompositionComplete
                ? tSafe(
                    'complete',
                    'Complete'
                  )
                : tSafe(
                    'incomplete',
                    'Incomplete'
                  )}
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.groupRequirementsList
          }
        >
          {requiredGroups.map(
            (group) => {
              const required =
                requiredGroupCounts[
                  group
                ] || 0;

              const selected =
                selectedGroupCounts[
                  group
                ] || 0;

              const complete =
                selected ===
                required;

              return (
                <View
                  key={group}
                  style={
                    styles.groupRequirementRow
                  }
                >
                  <View
                    style={
                      styles.groupRequirementLeft
                    }
                  >
                    <MaterialCommunityIcons
                      name={
                        complete
                          ? 'check-circle'
                          : 'circle-outline'
                      }
                      size={17}
                      color={
                        complete
                          ? theme.status.success
                          : theme.status.warning
                      }
                    />

                    <AppText
                      variant="body"
                      style={
                        styles.groupRequirementName
                      }
                    >
                      {groupLabel(
                        group
                      )}
                    </AppText>
                  </View>

                  <AppText
                    variant="caption"
                    style={[
                      styles.groupRequirementCount,
                      complete &&
                        styles.groupRequirementCountComplete,
                    ]}
                  >
                    {selected} /{' '}
                    {required}
                  </AppText>
                </View>
              );
            }
          )}
        </View>
      </View>
    );
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <View style={styles.center}>
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
          variant="title"
          style={styles.loadingTitle}
        >
          {tSafe(
            'loading_recommendations',
            'Finding recommended cleaners...'
          )}
        </AppText>

        <AppText
          variant="caption"
          style={
            styles.loadingSubtitle
          }
        >
          {tSafe(
            'loading_recommendations_subtitle',
            'Reviewing availability, performance, ratings, and distance.'
          )}
        </AppText>
      </View>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <View style={styles.center}>
        <View
          style={
            styles.errorIconContainer
          }
        >
          <MaterialCommunityIcons
            name="alert-outline"
            size={30}
            color={
              theme.status.error
            }
          />
        </View>

        <AppText
          variant="title"
          style={styles.errorTitle}
        >
          {tSafe(
            'unable_to_load',
            'Unable to load recommendations'
          )}
        </AppText>

        <AppText
          variant="body"
          style={styles.errorText}
        >
          {error}
        </AppText>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchData}
          activeOpacity={0.85}
        >
          <AppText
            variant="label"
            color={
              theme.button.primaryText
            }
            style={styles.retryText}
          >
            {tSafe(
              'retry',
              'Retry'
            )}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * ============================================================
   * PROFILE MODAL
   * ============================================================
   */

  const renderProfileModal = () => {
    if (!profileCleaner) {
      return null;
    }

    const accepted =
      acceptedCleanerIds.has(
        profileCleaner.cleanerId
      ) ||
      profileCleaner.requestStatus ===
        'accepted';

    const selected =
      selectedIds.includes(
        profileCleaner.cleanerId
      );

    const premium =
      isPremiumCleaner(
        profileCleaner
      );

    const verified =
      isVerifiedCleaner(
        profileCleaner
      );

    const rating =
      typeof profileCleaner.averageRating ===
      'number'
        ? profileCleaner.averageRating
        : 0;

    const certification =
      profileCleaner.certification ||
      {};

    const cleanerGroup =
      getCleanerGroup(
        profileCleaner
      );

    const requiredForGroup =
      cleanerGroup
        ? requiredGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const selectedForGroup =
      cleanerGroup
        ? selectedGroupCounts[
            cleanerGroup
          ] || 0
        : 0;

    const groupFull =
      cleanerGroup &&
      selectedForGroup >=
        requiredForGroup;

    return (
      <Modal
        isVisible={profileVisible}
        onBackdropPress={
          closeCleanerProfile
        }
        propagateSwipe
        style={styles.profileModal}
        backdropOpacity={
          isDark ? 0.65 : 0.48
        }
      >
        <View
          style={
            styles.profileContainer
          }
        >
          <View
            style={styles.modalHandle}
          />

          <View
            style={styles.profileHeader}
          >
            <View
              style={styles.profileIdentity}
            >
              <View
                style={
                  styles.profileAvatarWrapper
                }
              >
                {profileCleaner.avatar ? (
                  <Avatar.Image
                    size={70}
                    source={{
                      uri: profileCleaner.avatar,
                    }}
                  />
                ) : (
                  <Avatar.Icon
                    size={70}
                    icon="account"
                    color={
                      theme.icon.inverse
                    }
                    style={{
                      backgroundColor:
                        theme.brand.primary,
                    }}
                  />
                )}

                {premium ? (
                  <View
                    style={
                      styles.profilePremiumBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-star"
                      size={15}
                      color={
                        theme.text.inverse
                      }
                    />
                  </View>
                ) : verified ? (
                  <View
                    style={
                      styles.profileVerifiedBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={15}
                      color={
                        theme.text.inverse
                      }
                    />
                  </View>
                ) : null}
              </View>

              <View
                style={
                  styles.profileNameContainer
                }
              >
                <AppText
                  variant="title"
                  numberOfLines={1}
                  style={
                    styles.profileName
                  }
                >
                  {`${profileCleaner.firstname || ''} ${
                    profileCleaner.lastname || ''
                  }`.trim()}
                </AppText>

                {premium ? (
                  <View
                    style={
                      styles.profileTrustRow
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-star"
                      size={14}
                      color={
                        theme.status.warning
                      }
                    />

                    <AppText
                      variant="caption"
                      style={
                        styles.profilePremiumText
                      }
                    >
                      {tSafe(
                        'premium_cleaner',
                        'Premium Cleaner'
                      )}
                    </AppText>
                  </View>
                ) : verified ? (
                  <View
                    style={
                      styles.profileTrustRow
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={14}
                      color={
                        theme.status.info
                      }
                    />

                    <AppText
                      variant="caption"
                      style={
                        styles.profileVerifiedText
                      }
                    >
                      {tSafe(
                        'verified_cleaner',
                        'Verified Cleaner'
                      )}
                    </AppText>
                  </View>
                ) : null}

                {profileCleaner
                  .location?.city ? (
                  <AppText
                    variant="caption"
                    style={
                      styles.profileLocation
                    }
                  >
                    {
                      profileCleaner
                        .location
                        .city
                    }
                    {profileCleaner
                      .location
                      .region_code
                      ? `, ${profileCleaner.location.region_code}`
                      : ''}
                  </AppText>
                ) : null}

                <View
                  style={
                    styles.profileDistanceRow
                  }
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color={
                      theme.icon.muted
                    }
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.profileDistance
                    }
                  >
                    {profileCleaner.distance ??
                      '—'}{' '}
                    {tSafe(
                      'miles_away',
                      'miles away'
                    )}
                  </AppText>
                </View>

                {cleanerGroup ? (
                  <View
                    style={
                      styles.profileGroupBadge
                    }
                  >
                    <AppText
                      variant="caption"
                      color={
                        theme.brand.primary
                      }
                      style={
                        styles.profileGroupBadgeText
                      }
                    >
                      {groupLabel(
                        cleanerGroup
                      )}
                    </AppText>
                  </View>
                ) : null}

                <View
                  style={
                    styles.profileRatingRow
                  }
                >
                  <StarRating
                    rating={rating}
                    onChange={() => {}}
                    starSize={17}
                    enableHalfStar
                    disabled
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.ratingText
                    }
                  >
                    {rating > 0
                      ? rating.toFixed(
                          1
                        )
                      : tSafe(
                          'new',
                          'New'
                        )}

                    {profileCleaner.totalRatings
                      ? ` (${profileCleaner.totalRatings})`
                      : ''}
                  </AppText>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={
                closeCleanerProfile
              }
              style={
                styles.closeButton
              }
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name="close"
                size={23}
                color={
                  theme.icon.muted
                }
              />
            </TouchableOpacity>
          </View>

          <View
            style={styles.profileStatus}
          >
            <MaterialCommunityIcons
              name={
                accepted
                  ? 'check-circle'
                  : 'clock-outline'
              }
              size={17}
              color={
                accepted
                  ? theme.status.success
                  : theme.status.warning
              }
            />

            <AppText
              variant="caption"
              style={[
                styles.profileStatusText,
                accepted
                  ? styles.acceptedStatus
                  : styles.pendingStatus,
              ]}
            >
              {accepted
                ? tSafe(
                    'cleaner_accepted_request',
                    'Cleaner has accepted the request'
                  )
                : tSafe(
                    'waiting_cleaner_accept',
                    'Waiting for cleaner to accept'
                  )}
            </AppText>
          </View>

          <View
            style={styles.profileTabs}
          >
            {[
              [
                'about',
                tSafe(
                  'about',
                  'About'
                ),
              ],
              [
                'availability',
                tSafe(
                  'availability',
                  'Availability'
                ),
              ],
              [
                'reviews',
                tSafe(
                  'reviews',
                  'Reviews'
                ),
              ],
            ].map(
              ([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.profileTab,
                    profileTab ===
                      key &&
                      styles.profileTabActive,
                  ]}
                  onPress={() =>
                    setProfileTab(
                      key
                    )
                  }
                  activeOpacity={0.75}
                >
                  <AppText
                    variant="label"
                    style={[
                      styles.profileTabText,
                      profileTab ===
                        key &&
                        styles.profileTabTextActive,
                    ]}
                  >
                    {label}
                  </AppText>
                </TouchableOpacity>
              )
            )}
          </View>

          <ScrollView
            style={styles.profileScroll}
            contentContainerStyle={
              styles.profileScrollContent
            }
            showsVerticalScrollIndicator={
              false
            }
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {profileLoading ? (
              <View
                style={
                  styles.profileLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    theme.brand.primary
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.profileLoadingText
                  }
                >
                  {tSafe(
                    'loading_profile_details',
                    'Loading profile details...'
                  )}
                </AppText>
              </View>
            ) : (
              <>
                {profileTab ===
                  'about' && (
                  <View>
                    <AppText
                      variant="title"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'about',
                        'About'
                      )}
                    </AppText>

                    <AboutMeDisplay
                      mode="display"
                      aboutme={
                        profileCleaner.aboutme
                      }
                      isHost
                    />

                    <AppText
                      variant="title"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'certification',
                        'Certification'
                      )}
                    </AppText>

                    <HostCertificationDisplay
                      certification={
                        certification
                      }
                    />

                    <AppText
                      variant="title"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'performance',
                        'Performance'
                      )}
                    </AppText>

                    <View
                      style={
                        styles.performanceGrid
                      }
                    >
                      <View
                        style={
                          styles.performanceItem
                        }
                      >
                        <AppText
                          variant="title"
                          color={
                            theme.brand.primary
                          }
                          style={
                            styles.performanceValue
                          }
                        >
                          {profileCleaner
                            .performance
                            ?.performance_score ??
                            0}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.performanceLabel
                          }
                        >
                          {tSafe(
                            'performance',
                            'Performance'
                          )}
                        </AppText>
                      </View>

                      <View
                        style={
                          styles.performanceItem
                        }
                      >
                        <AppText
                          variant="title"
                          color={
                            theme.brand.primary
                          }
                          style={
                            styles.performanceValue
                          }
                        >
                          {profileCleaner
                            .ranking_score ??
                            0}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.performanceLabel
                          }
                        >
                          {tSafe(
                            'ranking',
                            'Ranking'
                          )}
                        </AppText>
                      </View>

                      <View
                        style={
                          styles.performanceItem
                        }
                      >
                        <AppText
                          variant="title"
                          color={
                            theme.brand.primary
                          }
                          style={
                            styles.performanceValue
                          }
                        >
                          {profileCleaner.distance ??
                            '—'}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.performanceLabel
                          }
                        >
                          {tSafe(
                            'miles_away',
                            'Miles away'
                          )}
                        </AppText>
                      </View>
                    </View>
                  </View>
                )}

                {profileTab ===
                  'availability' && (
                  <View>
                    <AppText
                      variant="title"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'availability',
                        'Availability'
                      )}
                    </AppText>

                    <HostAvailabilityDisplay
                      availability={
                        profileAvailability?.availability ||
                        []
                      }
                      bookedSchedules={
                        profileAvailability?.booked_schedules ||
                        []
                      }
                    />
                  </View>
                )}

                {profileTab ===
                  'reviews' && (
                  <View>
                    <AppText
                      variant="title"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        'reviews',
                        'Reviews'
                      )}
                    </AppText>

                    <Reviews
                      ratings={
                        profileReviews
                      }
                      cleanerId={
                        profileCleaner.cleanerId
                      }
                    />
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View
            style={styles.profileFooter}
          >
            <TouchableOpacity
              style={[
                styles.profileSelectButton,
                (!accepted ||
                  !cleanerGroup ||
                  (!selected &&
                    groupFull)) &&
                  styles.profileSelectButtonDisabled,
              ]}
              disabled={
                !accepted ||
                !cleanerGroup ||
                (!selected &&
                  groupFull)
              }
              onPress={() => {
                if (
                  !accepted ||
                  !cleanerGroup
                ) {
                  return;
                }

                toggleCleaner(
                  profileCleaner.cleanerId
                );

                closeCleanerProfile();
              }}
              activeOpacity={0.85}
            >
              <AppText
                variant="label"
                color={
                  theme.button.primaryText
                }
                style={
                  styles.profileSelectButtonText
                }
              >
                {selected
                  ? tSafe(
                      'remove_from_team',
                      'Remove from Team'
                    )
                  : !cleanerGroup
                  ? tSafe(
                      'waiting_for_group',
                      'Waiting for Group'
                    )
                  : groupFull
                  ? `${groupLabel(
                      cleanerGroup
                    )} ${tSafe(
                      'already_filled',
                      'Already Filled'
                    )}`
                  : tSafe(
                      'select_cleaner',
                      'Select Cleaner'
                    )}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  /*
   * ============================================================
   * MAIN SCREEN
   * ============================================================
   */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.pageContent
        }
        onScroll={handlePageScroll}
        scrollEventThrottle={16}
      >
        <View
          style={styles.header}
        >
          <View
            style={styles.headerText}
          >
            <AppText
              variant="caption"
              color={
                theme.brand.primary
              }
              style={styles.eyebrow}
            >
              {tSafe(
                'cleaning_team',
                'Cleaning team'
              )}
            </AppText>

            <AppText
              variant="heading"
              style={styles.title}
            >
              {tSafe(
                'build_your_cleaning_team',
                'Build your cleaning team'
              )}
            </AppText>

            <AppText
              variant="caption"
              style={styles.subtitle}
            >
              {tSafe(
                'choose_cleaners_for_your_team',
                'Choose the cleaners you want for this booking.'
              )}
            </AppText>
          </View>

          <View
            style={styles.selectionCounter}
          >
            <View
              style={
                styles.selectionCounterRow
              }
            >
              <AppText
                variant="title"
                color={
                  theme.brand.primary
                }
                style={
                  styles.selectionCounterValue
                }
              >
                {selectedIds.length}
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.selectionCounterSlash
                }
              >
                /
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.selectionCounterTotal
                }
              >
                {requiredCleaners}
              </AppText>
            </View>

            <AppText
              variant="caption"
              style={
                styles.selectionCounterLabel
              }
            >
              {tSafe(
                'selected',
                'selected'
              )}
            </AppText>
          </View>
        </View>

        {renderPropertyContext()}

        {renderGroupRequirements()}

        {acceptedCandidates.length ===
          0 &&
        pendingCandidates.length ===
          0 ? (
          <View
            style={
              styles.selectionEmptyContainer
            }
          >
            <View
              style={
                styles.selectionEmptyIcon
              }
            >
              <MaterialCommunityIcons
                name="account-search-outline"
                size={30}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <AppText
              variant="title"
              style={
                styles.selectionEmptyTitle
              }
            >
              {tSafe(
                'no_cleaners_available',
                'No cleaners are currently available'
              )}
            </AppText>

            <AppText
              variant="body"
              style={
                styles.selectionEmptyText
              }
            >
              {tSafe(
                'no_cleaners_available_description',
                'There are currently no cleaners available to select for this cleaning.'
              )}
            </AppText>
          </View>
        ) : acceptedCandidates.length ===
          0 &&
          pendingCandidates.length >
            0 ? (
          <View
            style={
              styles.selectionEmptyContainer
            }
          >
            <View
              style={
                styles.selectionEmptyIcon
              }
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={30}
                color={
                  theme.status.warning
                }
              />
            </View>

            <AppText
              variant="title"
              style={
                styles.selectionEmptyTitle
              }
            >
              {tSafe(
                'waiting_for_cleaners',
                'Waiting for cleaners to respond'
              )}
            </AppText>

            <AppText
              variant="body"
              style={
                styles.selectionEmptyText
              }
            >
              {tSafe(
                'cleaners_accepting_will_appear',
                'Cleaners who accept the request will appear here and become available for your team selection.'
              )}
            </AppText>

            <View
              style={
                styles.pendingSummary
              }
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={
                  theme.status.warning
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.pendingSummaryText
                }
              >
                {pendingCandidates.length}{' '}
                {pendingCandidates.length ===
                1
                  ? tSafe(
                      'cleaner_is',
                      'cleaner is'
                    )
                  : tSafe(
                      'cleaners_are',
                      'cleaners are'
                    )}{' '}
                {tSafe(
                  'waiting_for_response',
                  'waiting for a response'
                )}
              </AppText>
            </View>
          </View>
        ) : (
          <FlatList
            data={
              acceptedCandidates
            }
            keyExtractor={(item) =>
              item.cleanerId
            }
            renderItem={
              renderCandidate
            }
            scrollEnabled={false}
            contentContainerStyle={
              styles.list
            }
            showsVerticalScrollIndicator={
              false
            }
            ListHeaderComponent={
              <View
                style={
                  styles.availableHeader
                }
              >
                <View>
                  <AppText
                    variant="title"
                    style={
                      styles.availableTitle
                    }
                  >
                    {tSafe(
                      'available_cleaners',
                      'Available cleaners'
                    )}
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.availableSubtitle
                    }
                  >
                    {acceptedCandidates.length}{' '}
                    {acceptedCandidates.length ===
                    1
                      ? tSafe(
                          'cleaner_has_accepted',
                          'cleaner has accepted the request'
                        )
                      : tSafe(
                          'cleaners_have_accepted',
                          'cleaners have accepted the request'
                        )}
                  </AppText>
                </View>

                {pendingCandidates.length >
                0 ? (
                  <View
                    style={
                      styles.waitingBadge
                    }
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color={
                        theme.status.warning
                      }
                    />

                    <AppText
                      variant="caption"
                      style={
                        styles.waitingBadgeText
                      }
                    >
                      {pendingCandidates.length}{' '}
                      {tSafe(
                        'waiting',
                        'waiting'
                      )}
                    </AppText>
                  </View>
                ) : null}
              </View>
            }
          />
        )}
      </ScrollView>

      {stickyProperty ||
      stickyGroupReqs ? (
        <View
          pointerEvents="none"
          style={
            styles.stickyHeaderContainer
          }
        >
          {stickyProperty
            ? renderPropertyContext(true)
            : null}

          {stickyGroupReqs
            ? renderGroupRequirements(true)
            : null}
        </View>
      ) : null}

      <View
        style={styles.checkoutArea}
      >
        {!groupCompositionComplete &&
        selectedIds.length ===
          requiredCleaners &&
        missingGroups.length > 0 ? (
          <AppText
            variant="caption"
            style={
              styles.checkoutWarning
            }
          >
            {`${tSafe(
              'still_needed',
              'Still needed'
            )}: ${missingGroups
              .map(
                (item) =>
                  `${groupLabel(
                    item.group
                  )} (${item.remaining})`
              )
              .join(', ')}`}
          </AppText>
        ) : null}

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!groupCompositionComplete ||
              selectedIds.length !==
                requiredCleaners) &&
              styles.checkoutButtonDisabled,
          ]}
          onPress={
            proceedToCheckout
          }
          disabled={
            !groupCompositionComplete ||
            selectedIds.length !==
              requiredCleaners
          }
          activeOpacity={0.85}
        >
          <AppText
            variant="label"
            color={
              theme.button.primaryText
            }
            style={
              styles.checkoutButtonText
            }
          >
            {groupCompositionComplete &&
            selectedIds.length ===
              requiredCleaners
              ? tSafe(
                  'continue_to_payment',
                  'Continue to Payment'
                )
              : tSafe(
                  'complete_team_selection',
                  'Complete team selection to continue'
                )}
          </AppText>

          {groupCompositionComplete &&
          selectedIds.length ===
            requiredCleaners ? (
            <MaterialCommunityIcons
              name="arrow-right"
              size={19}
              color={
                theme.button.primaryText
              }
              style={
                styles.checkoutArrow
              }
            />
          ) : null}
        </TouchableOpacity>
      </View>

      {renderProfileModal()}
    </View>
  );
}

/*
 * ============================================================
 * THEME-AWARE STYLES
 * ============================================================
 */

const createStyles = (theme) =>
  StyleSheet.create({
    /*
     * SCREEN
     */

    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    pageContent: {
      paddingBottom: 130,
    },

    /*
     * HEADER
     */

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 15,
    },

    headerText: {
      flex: 1,
      paddingRight: 14,
    },

    eyebrow: {
      fontSize: 12,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: 5,
    },

    title: {
      fontSize: 23,
      lineHeight: 29,
      fontWeight: '600',
    },

    subtitle: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      maxWidth: 280,
    },

    selectionCounter: {
      minWidth: 66,
      paddingHorizontal: 9,
      paddingVertical: 8,
      borderRadius: 15,
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectionCounterRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
    },

    selectionCounterValue: {
      fontSize: 19,
      lineHeight: 22,
      fontWeight: '600',
    },

    selectionCounterSlash: {
      marginHorizontal: 3,
      color: theme.text.muted,
    },

    selectionCounterTotal: {
      color: theme.text.secondary,
      fontWeight: '600',
    },

    selectionCounterLabel: {
      marginTop: 2,
      fontSize: 9,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    /*
     * PROPERTY
     */

    propertyContext: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 13,
      borderRadius: 17,
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    propertyIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 11,
    },

    propertyInfo: {
      flex: 1,
    },

    propertyEyebrow: {
      fontSize: 10,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },

    propertyName: {
      fontSize: 15,
      fontWeight: '600',
    },

    propertyLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },

    propertyLocation: {
      flex: 1,
      marginLeft: 4,
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    /*
     * STICKY HEADER
     */

    stickyHeaderContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 5,
      backgroundColor:
        theme.background.default,
      paddingTop: 8,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border.default,
      shadowColor:
        theme.shadow?.color ||
        '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.08,
      shadowRadius: 4,
      elevation: 3,
    },

    propertyContextSticky: {
      marginBottom: 8,
    },

    /*
     * GROUP REQUIREMENTS
     */

    groupRequirements: {
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 14,
      borderRadius: 17,
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    groupRequirementsSticky: {
      marginBottom: 8,
    },

    groupRequirementsHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    groupRequirementsTitleBlock: {
      flex: 1,
      paddingRight: 10,
    },

    groupRequirementsTitle: {
      fontSize: 15,
      fontWeight: '600',
    },

    groupRequirementsSubtitle: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
    },

    completionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 9,
    },

    completionBadgeComplete: {
      backgroundColor:
        theme.status.success + '18',
    },

    completionBadgeIncomplete: {
      backgroundColor:
        theme.status.warning + '18',
    },

    completionBadgeText: {
      marginLeft: 4,
      fontSize: 10,
      fontWeight: '600',
    },

    completionBadgeTextComplete: {
      color: theme.status.success,
    },

    completionBadgeTextIncomplete: {
      color: theme.status.warning,
    },

    groupRequirementsList: {
      marginTop: 10,
    },

    groupRequirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
    },

    groupRequirementLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    groupRequirementName: {
      marginLeft: 8,
      fontSize: 13,
      fontWeight: '500',
    },

    groupRequirementCount: {
      fontSize: 12,
      color: theme.status.warning,
      fontWeight: '600',
    },

    groupRequirementCountComplete: {
      color: theme.status.success,
    },

    /*
     * AVAILABLE CLEANERS
     */

    list: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },

    availableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 11,
      paddingHorizontal: 2,
    },

    availableTitle: {
      fontSize: 17,
      fontWeight: '600',
    },

    availableSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: theme.text.secondary,
    },

    waitingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        theme.status.warning + '18',
    },

    waitingBadgeText: {
      marginLeft: 4,
      fontSize: 10,
      color: theme.status.warning,
      fontWeight: '600',
    },

    /*
     * CLEANER CARD
     */

    cleanerCard: {
      marginBottom: 11,
      padding: 13,
      borderRadius: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      shadowColor:
        theme.shadow?.color ||
        '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.05,
      shadowRadius: 5,
      elevation: 2,
    },

    cleanerCardSelected: {
      borderColor:
        theme.brand.primary,
      backgroundColor:
        theme.brand.primaryLight,
    },

    cleanerCardMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    /*
     * AVATAR
     */

    avatarWrapper: {
      position: 'relative',
      width: 58,
      height: 58,
      marginRight: 0,
    },

    avatarFallback: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        theme.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /*
     * TRUST BADGES
     */

    premiumBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.warning,
      borderWidth: 2,
      borderColor:
        theme.card.background,
    },

    verifiedBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.info,
      borderWidth: 2,
      borderColor:
        theme.card.background,
    },

    avatarCheck: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor:
        theme.status.success,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor:
        theme.card.background,
    },

    trustBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      minHeight: 20,
    },

    premiumLabel: {
      marginLeft: 5,
      fontSize: 13,
      fontWeight: '600',
      color: theme.status.warning,
    },

    verifiedLabel: {
      marginLeft: 5,
      fontSize: 13,
      fontWeight: '600',
      color: theme.status.info,
    },

    /*
     * CLEANER INFO
     */

    cleanerMainInfo: {
      flex: 1,
      marginLeft: 12,
      paddingRight: 4,
    },

    cleanerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    cleanerName: {
      flex: 1,
      marginRight: 7,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
    },

    ratingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor:
        theme.status.warning + '18',
    },

    ratingPillText: {
      marginLeft: 3,
      fontSize: 11,
      color: theme.status.warning,
      fontWeight: '500',
    },

    distanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },

    distanceText: {
      marginLeft: 3,
      fontSize: 11,
      color: theme.text.secondary,
    },

    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 8,
    },

    groupPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        theme.brand.primaryLight,
    },

    groupPillWarning: {
      backgroundColor:
        theme.status.warning + '18',
    },

    groupPillText: {
      marginLeft: 4,
      fontSize: 10,
      color: theme.brand.primary,
      fontWeight: '500',
    },

    groupPillWarningText: {
      color: theme.status.warning,
    },

    performancePill: {
      marginLeft: 6,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        theme.background.sunken,
    },

    performancePillText: {
      fontSize: 10,
      color: theme.text.secondary,
      fontWeight: '500',
    },

    recommendationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },

    recommendationIcon: {
      width: 22,
      height: 22,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
    },

    recommendationText: {
      marginLeft: 6,
      fontSize: 11,
      color: theme.brand.primary,
      fontWeight: '500',
    },

    acceptedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 7,
    },

    acceptedText: {
      marginLeft: 5,
      fontSize: 11,
      color: theme.status.success,
      fontWeight: '500',
    },

    groupNotice: {
      marginTop: 5,
      fontSize: 10,
      lineHeight: 14,
      color: theme.status.warning,
    },

    cardChevron: {
      width: 25,
      alignItems: 'flex-end',
      paddingTop: 2,
    },

    /*
     * SELECT BUTTON
     */

    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      height: 40,
      borderRadius: 11,
      borderWidth: 1,
      borderColor:
        theme.brand.primary,
      backgroundColor:
        theme.surface.default,
    },

    selectButtonSelected: {
      backgroundColor:
        theme.button.primaryBackground,
      borderColor:
        theme.button.primaryBackground,
    },

    selectButtonDisabled: {
      borderColor:
        theme.border.default,
      backgroundColor:
        theme.button.disabledBackground,
    },

    selectButtonText: {
      marginLeft: 5,
      fontSize: 12,
      color: theme.brand.primary,
      fontWeight: '600',
    },

    selectButtonTextSelected: {
      color: theme.button.primaryText,
    },

    selectButtonTextDisabled: {
      color: theme.button.disabledText,
    },

    /*
     * CHECKOUT
     */

    checkoutArea: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 18,
      backgroundColor:
        theme.background.elevated,
      borderTopWidth: 1,
      borderTopColor:
        theme.border.default,
      shadowColor:
        theme.shadow?.color ||
        '#000000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.08,
      shadowRadius: 5,
      elevation: 8,
    },

    checkoutWarning: {
      marginBottom: 8,
      fontSize: 11,
      lineHeight: 16,
      color: theme.status.warning,
      textAlign: 'center',
    },

    checkoutButton: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      borderRadius: 14,
      backgroundColor:
        theme.button.primaryBackground,
    },

    checkoutButtonDisabled: {
      backgroundColor:
        theme.button.disabledBackground,
    },

    checkoutButtonText: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },

    checkoutArrow: {
      marginLeft: 8,
    },

    /*
     * LOADING / ERROR
     */

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
      backgroundColor:
        theme.background.default,
    },

    loadingIconContainer: {
      width: 68,
      height: 68,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
    },

    loadingTitle: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },

    loadingSubtitle: {
      marginTop: 6,
      maxWidth: 290,
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    errorIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.error + '18',
      marginBottom: 15,
    },

    errorTitle: {
      fontSize: 17,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 7,
    },

    errorText: {
      maxWidth: 310,
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      marginBottom: 18,
    },

    retryButton: {
      minWidth: 110,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor:
        theme.button.primaryBackground,
      alignItems: 'center',
    },

    retryText: {
      fontSize: 13,
      fontWeight: '600',
    },

    /*
     * EMPTY / WAITING
     */

    selectionEmptyContainer: {
      minHeight: 360,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingVertical: 40,
    },

    selectionEmptyIcon: {
      width: 66,
      height: 66,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginBottom: 16,
    },

    selectionEmptyTitle: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 7,
    },

    selectionEmptyText: {
      maxWidth: 310,
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    pendingSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 18,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor:
        theme.status.warning + '18',
    },

    pendingSummaryText: {
      marginLeft: 6,
      fontSize: 11,
      color: theme.status.warning,
      fontWeight: '500',
    },

    /*
     * PROFILE MODAL
     */

    profileModal: {
      justifyContent: 'flex-end',
      margin: 0,
    },

    profileContainer: {
      height: '92%',
      backgroundColor:
        theme.background.elevated,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },

    modalHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        theme.border.strong,
      marginTop: 8,
      marginBottom: 7,
    },

    profileHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 11,
    },

    profileIdentity: {
      flexDirection: 'row',
      flex: 1,
    },

    profileAvatarWrapper: {
      position: 'relative',
      width: 70,
      height: 70,
    },

    profilePremiumBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.warning,
      borderWidth: 2,
      borderColor:
        theme.background.elevated,
    },

    profileVerifiedBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.status.info,
      borderWidth: 2,
      borderColor:
        theme.background.elevated,
    },

    profileTrustRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },

    profilePremiumText: {
      marginLeft: 4,
      fontSize: 11,
      fontWeight: '600',
      color: theme.status.warning,
    },

    profileVerifiedText: {
      marginLeft: 4,
      fontSize: 11,
      fontWeight: '500',
      color: theme.status.info,
    },

    profileNameContainer: {
      flex: 1,
      marginLeft: 13,
      paddingRight: 5,
    },

    profileName: {
      fontSize: 20,
      lineHeight: 25,
      fontWeight: '600',
    },

    profileLocation: {
      marginTop: 2,
      fontSize: 13,
      color: theme.text.secondary,
    },

    profileDistanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },

    profileDistance: {
      marginLeft: 3,
      fontSize: 12,
      color: theme.text.secondary,
    },

    profileGroupBadge: {
      alignSelf: 'flex-start',
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor:
        theme.brand.primaryLight,
    },

    profileGroupBadgeText: {
      fontSize: 10,
      fontWeight: '500',
    },

    profileRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },

    ratingText: {
      marginLeft: 5,
      fontSize: 12,
      color: theme.text.secondary,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.background.sunken,
    },

    profileStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 18,
      marginBottom: 8,
      paddingHorizontal: 11,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor:
        theme.background.sunken,
    },

    profileStatusText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '500',
    },

    acceptedStatus: {
      color: theme.status.success,
    },

    pendingStatus: {
      color: theme.status.warning,
    },

    profileTabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    profileTab: {
      flex: 1,
      paddingVertical: 13,
      alignItems: 'center',
    },

    profileTabActive: {
      borderBottomWidth: 2,
      borderBottomColor:
        theme.brand.primary,
    },

    profileTabText: {
      fontSize: 13,
      color: theme.text.secondary,
    },

    profileTabTextActive: {
      color: theme.brand.primary,
      fontWeight: '600',
    },

    profileScroll: {
      flex: 1,
    },

    profileScrollContent: {
      paddingHorizontal: 18,
      paddingVertical: 15,
      paddingBottom: 35,
    },

    profileLoading: {
      alignItems: 'center',
      paddingVertical: 55,
    },

    profileLoadingText: {
      marginTop: 12,
      fontSize: 13,
      color: theme.text.secondary,
    },

    sectionTitle: {
      marginTop: 10,
      marginBottom: 11,
      fontSize: 17,
      fontWeight: '600',
    },

    performanceGrid: {
      flexDirection: 'row',
    },

    performanceItem: {
      flex: 1,
      marginRight: 8,
      paddingVertical: 13,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor:
        theme.background.sunken,
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    performanceValue: {
      fontSize: 18,
      fontWeight: '600',
    },

    performanceLabel: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 14,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    profileFooter: {
      paddingHorizontal: 18,
      paddingTop: 11,
      paddingBottom: 15,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      backgroundColor:
        theme.background.elevated,
    },

    profileSelectButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 15,
      borderRadius: 13,
      backgroundColor:
        theme.button.primaryBackground,
    },

    profileSelectButtonDisabled: {
      backgroundColor:
        theme.button.disabledBackground,
    },

    profileSelectButtonText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
