import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import moment from "moment";

import { AuthContext } from "../../context/AuthContext";
import userService from "../../services/connection/userService";
import ROUTES from "../../constants/routes";
import { tSafe } from "../../utils/tSafe";

import { useTheme } from "../../theme";
import AppText from "../../ui/AppText";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const getStatusConfig = (status, theme) => {
  switch (String(status || "").toLowerCase()) {
    case "upcoming":
      return {
        label: tSafe("status_upcoming", "UPCOMING"),
        color: theme.status.info,
        icon: "calendar-clock-outline",
      };

    case "completed":
      return {
        label: tSafe("status_completed", "COMPLETED"),
        color: theme.status.success,
        icon: "check-circle-outline",
      };

    case "cancelled":
      return {
        label: tSafe("status_cancelled", "CANCELLED"),
        color: theme.status.error,
        icon: "close-circle-outline",
      };

    default:
      return {
        label: tSafe("status_unknown", "UNKNOWN"),
        color: theme.text.muted,
        icon: "help-circle-outline",
      };
  }
};

const formatGigDate = (date) => {
  if (!date) {
    return null;
  }

  const parsed = moment(date);

  if (!parsed.isValid()) {
    return null;
  }

  return parsed.format("MMM DD, YYYY");
};

const formatGigPay = (pay) => {
  const numericPay = Number(pay);

  if (!Number.isFinite(numericPay)) {
    return "$0.00";
  }

  return `$${numericPay.toFixed(2)}`;
};

/* -------------------------------------------------------------------------- */
/* GIG CARD                                                                   */
/* -------------------------------------------------------------------------- */

const GigCard = ({ gig, onPress, index, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: Math.min(index * 70, 350),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 70, 350),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [fadeAnim, translateY, index]);

  const status = getStatusConfig(gig?.status, theme);

  const formattedDate = formatGigDate(gig?.date);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.card.background,
            borderColor: theme.card.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={tSafe(
          "view_cleaning_job",
          "View cleaning job"
        )}
      >
        {/* -------------------------- CARD HEADER -------------------------- */}

        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View
              style={[
                styles.jobIcon,
                {
                  backgroundColor: theme.brand.primaryLight,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="broom"
                size={19}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.titleContent}>
              <AppText
                variant="subtitle"
                style={[
                  styles.gigTitle,
                  {
                    color: theme.text.primary,
                  },
                ]}
              >
                {tSafe("cleaning_job", "Cleaning Job")}
              </AppText>

              {!!gig?.property_name && (
                <AppText
                  variant="caption"
                  style={[
                    styles.propertyName,
                    {
                      color: theme.text.secondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {gig.property_name}
                </AppText>
              )}
            </View>
          </View>

          {/* Status */}

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: status.color,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={status.icon}
              size={13}
              color={theme.text.inverse}
            />

            <AppText
              variant="caption"
              style={[
                styles.statusText,
                {
                  color: theme.text.inverse,
                },
              ]}
            >
              {status.label}
            </AppText>
          </View>
        </View>

        {/* ---------------------------- DETAILS ---------------------------- */}

        <View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: theme.background.sunken,
              borderColor: theme.border.default,
            },
          ]}
        >
          {/* Date */}

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={18}
              color={theme.icon.default}
            />

            <View style={styles.detailContent}>
              <AppText
                variant="caption"
                style={[
                  styles.detailLabel,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe("date", "Date")}
              </AppText>

              <AppText
                variant="body"
                style={[
                  styles.detailText,
                  {
                    color: theme.text.primary,
                  },
                ]}
              >
                {formattedDate ||
                  tSafe("date_tbd", "Date TBD")}
              </AppText>
            </View>
          </View>

          {/* Time */}

          <View style={styles.detailRow}>
            <MaterialIcons
              name="access-time"
              size={18}
              color={theme.icon.default}
            />

            <View style={styles.detailContent}>
              <AppText
                variant="caption"
                style={[
                  styles.detailLabel,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe("time", "Time")}
              </AppText>

              <AppText
                variant="body"
                style={[
                  styles.detailText,
                  {
                    color: theme.text.primary,
                  },
                ]}
              >
                {gig?.time ||
                  tSafe("time_tbd", "Time TBD")}
              </AppText>
            </View>
          </View>

          {/* Pay */}

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={18}
              color={theme.icon.default}
            />

            <View style={styles.detailContent}>
              <AppText
                variant="caption"
                style={[
                  styles.detailLabel,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe("earnings", "Earnings")}
              </AppText>

              <AppText
                variant="body"
                style={[
                  styles.detailText,
                  styles.payText,
                  {
                    color: theme.status.success,
                  },
                ]}
              >
                {formatGigPay(gig?.pay)}
              </AppText>
            </View>
          </View>
        </View>

        {/* ----------------------------- FOOTER ---------------------------- */}

        <View
          style={[
            styles.cardFooter,
            {
              borderTopColor: theme.divider,
            },
          ]}
        >
          <AppText
            variant="body"
            style={[
              styles.viewDetails,
              {
                color: theme.brand.primary,
              },
            ]}
          >
            {tSafe("view_details", "View Details")}
          </AppText>

          <MaterialIcons
            name="arrow-forward-ios"
            size={14}
            color={theme.brand.primary}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/* SECTION HEADER                                                             */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({
  title,
  count,
  icon,
  color,
  theme,
  style,
}) => {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View
        style={[
          styles.sectionIcon,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <AppText
        variant="h3"
        style={[
          styles.sectionTitle,
          {
            color: theme.text.primary,
          },
        ]}
      >
        {title}
      </AppText>

      <View
        style={[
          styles.countBadge,
          {
            backgroundColor: theme.surface.selected,
            borderColor: theme.border.default,
          },
        ]}
      >
        <AppText
          variant="caption"
          style={[
            styles.countText,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {count}
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN SCREEN                                                                */
/* -------------------------------------------------------------------------- */

export default function PropertyGigs() {
  const route = useRoute();
  const navigation = useNavigation();

  const { theme } = useTheme();

  const { property } = route.params || {};
  const { userToken } = useContext(AuthContext);

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* FETCH GIGS                                                               */
  /* ------------------------------------------------------------------------ */

  const fetchGigs = useCallback(
    async ({ silent = false } = {}) => {
      if (!property?.property_id) {
        setError(
          tSafe(
            "property_not_available",
            "Property information is not available."
          )
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!silent) {
        setError(null);
      }

      try {
        const response = await userService.getPropertyGigs(
          property.property_id,
          userToken
        );

        const incomingGigs = Array.isArray(response?.data)
          ? response.data
          : [];

        setGigs(incomingGigs);
        setError(null);
      } catch (err) {
        console.log("PropertyGigs fetch error:", err);

        if (!silent) {
          setError(
            tSafe(
              "load_gigs_error",
              "Could not load gigs. Please try again."
            )
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [property?.property_id, userToken]
  );

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  /* ------------------------------------------------------------------------ */
  /* REFRESH                                                                   */
  /* ------------------------------------------------------------------------ */

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGigs({ silent: true });
  }, [fetchGigs]);

  /* ------------------------------------------------------------------------ */
  /* NAVIGATION                                                                */
  /* ------------------------------------------------------------------------ */

  const handleGigPress = useCallback(
    (gig) => {
      if (!gig?.scheduleId) {
        return;
      }

      navigation.navigate(
        ROUTES.cleaner_schedule_details_view,
        {
          scheduleId: gig.scheduleId,
        }
      );
    },
    [navigation]
  );

  /* ------------------------------------------------------------------------ */
  /* DERIVED DATA                                                              */
  /* ------------------------------------------------------------------------ */

  const upcoming = gigs.filter(
    (gig) => gig?.status === "upcoming"
  );

  const past = gigs.filter(
    (gig) => gig?.status !== "upcoming"
  );

  const upcomingCount = upcoming.length;
  const pastCount = past.length;

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                   */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: theme.background.default,
          },
        ]}
      >
        <View
          style={[
            styles.stateIconContainer,
            {
              backgroundColor: theme.brand.primaryLight,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="briefcase-clock-outline"
            size={34}
            color={theme.brand.primary}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
          style={styles.loadingIndicator}
        />

        <AppText
          variant="body"
          style={[
            styles.stateMessage,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {tSafe("loading_gigs", "Loading your gigs...")}
        </AppText>
      </View>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                     */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: theme.background.default,
          },
        ]}
      >
        <View
          style={[
            styles.stateIconContainer,
            {
              backgroundColor: theme.status.error + "18",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={40}
            color={theme.status.error}
          />
        </View>

        <AppText
          variant="h3"
          style={[
            styles.stateTitle,
            {
              color: theme.text.primary,
            },
          ]}
        >
          {tSafe("something_went_wrong", "Something went wrong")}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.errorText,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {error}
        </AppText>

        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.button.primaryBackground,
            },
          ]}
          onPress={() => fetchGigs()}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={theme.button.primaryText}
          />

          <AppText
            variant="body"
            style={[
              styles.retryText,
              {
                color: theme.button.primaryText,
              },
            ]}
          >
            {tSafe("try_again", "Try Again")}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* EMPTY                                                                     */
  /* ------------------------------------------------------------------------ */

  if (gigs.length === 0) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: theme.background.default,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIconContainer,
            {
              backgroundColor: theme.surface.selected,
              borderColor: theme.border.default,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={46}
            color={theme.icon.muted}
          />
        </View>

        <AppText
          variant="h2"
          style={[
            styles.emptyTitle,
            {
              color: theme.text.primary,
            },
          ]}
        >
          {tSafe("no_gigs_found", "No Gigs Found")}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.emptyText,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {tSafe(
            "no_gigs_for_property",
            "No cleaning jobs yet for {propertyName}",
            {
              propertyName:
                property?.property_name ||
                tSafe("this_property", "this property"),
            }
          )}
        </AppText>

        <TouchableOpacity
          style={[
            styles.emptyRefreshButton,
            {
              borderColor: theme.border.default,
              backgroundColor: theme.surface.elevated,
            },
          ]}
          onPress={() => fetchGigs()}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={theme.brand.primary}
          />

          <AppText
            variant="body"
            style={[
              styles.emptyRefreshText,
              {
                color: theme.brand.primary,
              },
            ]}
          >
            {tSafe("refresh", "Refresh")}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <FlatList
      data={[]}
      renderItem={null}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContent,
        {
          backgroundColor: theme.background.default,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.brand.primary}
          colors={[theme.brand.primary]}
        />
      }
      ListHeaderComponent={
        <View>
          {/* ---------------------------------------------------------------- */}
          {/* PAGE HEADER                                                       */}
          {/* ---------------------------------------------------------------- */}

          <View
            style={[
              styles.pageHeader,
              {
                backgroundColor: theme.surface.elevated,
                borderColor: theme.card.border,
              },
            ]}
          >
            <View style={styles.pageHeaderTop}>
              <View style={styles.pageHeaderIcon}>
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={23}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.pageHeaderContent}>
                <AppText
                  variant="h2"
                  style={[
                    styles.pageTitle,
                    {
                      color: theme.text.primary,
                    },
                  ]}
                >
                  {tSafe("property_gigs", "Property Gigs")}
                </AppText>

                <AppText
                  variant="body"
                  style={[
                    styles.pageSubtitle,
                    {
                      color: theme.text.secondary,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {property?.property_name ||
                    tSafe("your_property", "Your Property")}
                </AppText>
              </View>
            </View>

            {/* Summary */}

            <View
              style={[
                styles.summaryRow,
                {
                  borderTopColor: theme.divider,
                },
              ]}
            >
              <View style={styles.summaryItem}>
                <AppText
                  variant="h3"
                  style={[
                    styles.summaryValue,
                    {
                      color: theme.brand.primary,
                    },
                  ]}
                >
                  {gigs.length}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.summaryLabel,
                    {
                      color: theme.text.muted,
                    },
                  ]}
                >
                  {tSafe("total_jobs", "Total Jobs")}
                </AppText>
              </View>

              <View
                style={[
                  styles.summaryDivider,
                  {
                    backgroundColor: theme.divider,
                  },
                ]}
              />

              <View style={styles.summaryItem}>
                <AppText
                  variant="h3"
                  style={[
                    styles.summaryValue,
                    {
                      color: theme.status.info,
                    },
                  ]}
                >
                  {upcomingCount}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.summaryLabel,
                    {
                      color: theme.text.muted,
                    },
                  ]}
                >
                  {tSafe("upcoming", "Upcoming")}
                </AppText>
              </View>

              <View
                style={[
                  styles.summaryDivider,
                  {
                    backgroundColor: theme.divider,
                  },
                ]}
              />

              <View style={styles.summaryItem}>
                <AppText
                  variant="h3"
                  style={[
                    styles.summaryValue,
                    {
                      color: theme.status.success,
                    },
                  ]}
                >
                  {pastCount}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.summaryLabel,
                    {
                      color: theme.text.muted,
                    },
                  ]}
                >
                  {tSafe("past", "Past")}
                </AppText>
              </View>
            </View>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* UPCOMING                                                          */}
          {/* ---------------------------------------------------------------- */}

          {upcoming.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title={tSafe("upcoming_section", "Upcoming")}
                count={upcoming.length}
                icon="calendar-clock-outline"
                color={theme.status.info}
                theme={theme}
              />

              {upcoming.map((item, index) => (
                <View
                  key={
                    item?.scheduleId ||
                    item?._id ||
                    `upcoming-${index}`
                  }
                  style={styles.timelineRow}
                >
                  <View style={styles.timelineColumn}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: theme.status.info,
                          borderColor:
                            theme.background.default,
                        },
                      ]}
                    />

                    {index !== upcoming.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor:
                              theme.border.default,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <GigCard
                    gig={item}
                    index={index}
                    theme={theme}
                    onPress={() => handleGigPress(item)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* PAST                                                               */}
          {/* ---------------------------------------------------------------- */}

          {past.length > 0 && (
            <View style={[styles.section, styles.pastSection]}>
              <SectionHeader
                title={tSafe("past_jobs_section", "Past Jobs")}
                count={past.length}
                icon="history"
                color={theme.text.muted}
                theme={theme}
              />

              {past.map((item, index) => (
                <View
                  key={
                    item?.scheduleId ||
                    item?._id ||
                    `past-${index}`
                  }
                  style={styles.timelineRow}
                >
                  <View style={styles.timelineColumn}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: theme.text.muted,
                          borderColor:
                            theme.background.default,
                        },
                      ]}
                    />

                    {index !== past.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor:
                              theme.divider,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <GigCard
                    gig={item}
                    index={index}
                    theme={theme}
                    onPress={() => handleGigPress(item)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing */}

          <View style={styles.bottomSpacer} />
        </View>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                      */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* ----------------------------- PAGE HEADER ----------------------------- */

  pageHeader: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },

  pageHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  pageHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  pageHeaderContent: {
    flex: 1,
    marginLeft: 13,
  },

  pageTitle: {
    fontSize: 21,
    fontWeight: "800",
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 14,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  summaryDivider: {
    width: 1,
    height: 30,
  },

  /* ----------------------------- SECTIONS -------------------------------- */

  section: {
    width: "100%",
  },

  pastSection: {
    marginTop: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },

  countBadge: {
    minWidth: 30,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* ----------------------------- TIMELINE -------------------------------- */

  timelineRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  timelineColumn: {
    width: 30,
    alignItems: "center",
  },

  timelineDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 3,
    marginTop: 10,
    zIndex: 2,
  },

  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: -1,
    marginBottom: -16,
  },

  /* ------------------------------- CARD ---------------------------------- */

  cardWrapper: {
    flex: 1,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  titleContent: {
    flex: 1,
    marginLeft: 10,
  },

  gigTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  propertyName: {
    marginTop: 2,
    fontSize: 12,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  /* ------------------------------ DETAILS -------------------------------- */

  detailsContainer: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 11,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 45,
  },

  detailContent: {
    flex: 1,
    marginLeft: 10,
  },

  detailLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  detailText: {
    marginTop: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  payText: {
    fontWeight: "800",
  },

  /* ------------------------------- FOOTER -------------------------------- */

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },

  viewDetails: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 6,
  },

  /* --------------------------- STATE SCREENS ------------------------------ */

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  stateIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIndicator: {
    marginTop: 20,
  },

  stateTitle: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
  },

  stateMessage: {
    marginTop: 12,
    textAlign: "center",
  },

  errorText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 7,
  },

  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* ------------------------------- EMPTY --------------------------------- */

  emptyIconContainer: {
    width: 92,
    height: 92,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 20,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 330,
  },

  emptyRefreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 7,
  },

  emptyRefreshText: {
    fontSize: 14,
    fontWeight: "700",
  },

  bottomSpacer: {
    height: 10,
  },
});