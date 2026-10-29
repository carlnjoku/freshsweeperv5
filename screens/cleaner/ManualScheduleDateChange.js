import React, {
  useCallback,
  useContext,
  useState,
} from "react";

import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import {
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";

import userService from "../../services/connection/userService";

import { AuthContext } from "../../context/AuthContext";
import { tSafe } from "../../utils/tSafe";

import { useTheme } from "../../theme";
import AppText from "../../ui/AppText";
import AppCard from "../../ui/AppCard";
import AppButton from "../../ui/AppButton";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const formatGroup = (groupValue) => {
  if (!groupValue) {
    return "";
  }

  return String(groupValue)
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

/*
 * Treat YYYY-MM-DD as a calendar date rather than UTC.
 *
 * This prevents:
 *
 * new Date("2026-09-15")
 *
 * from displaying as September 14 in US time zones.
 */
const formatDate = (date) => {
  if (!date) {
    return tSafe("na", "N/A");
  }

  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    const [
      year,
      month,
      day,
    ] = date.split("-").map(Number);

    const localDate = new Date(
      year,
      month - 1,
      day
    );

    return localDate.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
};

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  return String(time);
};

/*
 * Safely add alpha to a six-digit hex theme color.
 *
 * This avoids relying on:
 *
 * theme.status.success + "18"
 *
 * if the theme implementation ever changes.
 */
const withAlpha = (
  color,
  alpha,
  fallback
) => {
  if (
    typeof color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};

/* -------------------------------------------------------------------------- */
/* SCHEDULE DATE/TIME COMPARISON                                              */
/* -------------------------------------------------------------------------- */

const ScheduleComparison = ({
  oldCleaningDate,
  newCleaningDate,
  oldCleaningTime,
  newCleaningTime,
  theme,
}) => {
  return (
    <View style={styles.scheduleComparison}>
      {/* ORIGINAL SCHEDULE */}

      <View
        style={[
          styles.schedulePanel,
          {
            backgroundColor:
              theme.background.sunken,
            borderColor:
              theme.border.default,
          },
        ]}
      >
        <View
          style={[
            styles.scheduleIcon,
            {
              backgroundColor:
                theme.surface.selected,
              borderColor:
                theme.border.default,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-clock-outline"
            size={22}
            color={theme.icon.muted}
          />
        </View>

        <AppText
          variant="caption"
          style={[
            styles.scheduleLabel,
            {
              color: theme.text.muted,
            },
          ]}
        >
          {tSafe(
            "previous_schedule",
            "PREVIOUS"
          )}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.previousDate,
            {
              color:
                theme.text.secondary,
            },
          ]}
        >
          {formatDate(
            oldCleaningDate
          )}
        </AppText>

        {!!oldCleaningTime && (
          <View
            style={[
              styles.timePill,
              {
                backgroundColor:
                  theme.surface.elevated,
                borderColor:
                  theme.border.default,
              },
            ]}
          >
            <MaterialIcons
              name="access-time"
              size={14}
              color={theme.icon.muted}
            />

            <AppText
              variant="caption"
              style={[
                styles.timePillText,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              {formatTime(
                oldCleaningTime
              )}
            </AppText>
          </View>
        )}
      </View>

      {/* CHANGE ARROW */}

      <View
        style={[
          styles.changeArrow,
          {
            backgroundColor:
              theme.brand.primary,
            borderColor:
              theme.brand.primary,
          },
        ]}
      >
        <MaterialIcons
          name="arrow-forward"
          size={20}
          color={theme.icon.inverse}
        />
      </View>

      {/* NEW SCHEDULE */}

      <View
        style={[
          styles.schedulePanel,
          {
            backgroundColor:
              withAlpha(
                theme.status.success,
                "0C",
                theme.surface.selected
              ),
            borderColor:
              withAlpha(
                theme.status.success,
                "45",
                theme.border.default
              ),
          },
        ]}
      >
        <View
          style={[
            styles.scheduleIcon,
            {
              backgroundColor:
                withAlpha(
                  theme.status.success,
                  "18",
                  theme.surface.selected
                ),
              borderColor:
                withAlpha(
                  theme.status.success,
                  "35",
                  theme.border.default
                ),
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={22}
            color={
              theme.status.success
            }
          />
        </View>

        <AppText
          variant="caption"
          style={[
            styles.scheduleLabel,
            {
              color:
                theme.status.success,
            },
          ]}
        >
          {tSafe(
            "new_schedule",
            "NEW"
          )}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.newDate,
            {
              color:
                theme.text.primary,
            },
          ]}
        >
          {formatDate(
            newCleaningDate
          )}
        </AppText>

        {!!newCleaningTime && (
          <View
            style={[
              styles.timePill,
              {
                backgroundColor:
                  withAlpha(
                    theme.status.success,
                    "12",
                    theme.surface.elevated
                  ),
                borderColor:
                  withAlpha(
                    theme.status.success,
                    "35",
                    theme.border.default
                  ),
              },
            ]}
          >
            <MaterialIcons
              name="access-time"
              size={14}
              color={
                theme.status.success
              }
            />

            <AppText
              variant="caption"
              style={[
                styles.timePillText,
                {
                  color:
                    theme.status.success,
                },
              ]}
            >
              {formatTime(
                newCleaningTime
              )}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* STATUS CARD                                                                */
/* -------------------------------------------------------------------------- */

const ResponseStatusCard = ({
  responseStatus,
  newCleaningDate,
  newCleaningTime,
  theme,
}) => {
  const isAvailable =
    responseStatus === "available";

  const statusColor = isAvailable
    ? theme.status.success
    : theme.status.error;

  const backgroundColor = withAlpha(
    statusColor,
    "0D",
    theme.surface.selected
  );

  const borderColor = withAlpha(
    statusColor,
    "45",
    theme.border.default
  );

  return (
    <View
      style={[
        styles.statusCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View
        style={[
          styles.statusIconContainer,
          {
            backgroundColor:
              withAlpha(
                statusColor,
                "18",
                theme.surface.elevated
              ),
            borderColor:
              withAlpha(
                statusColor,
                "35",
                theme.border.default
              ),
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            isAvailable
              ? "check-circle-outline"
              : "close-circle-outline"
          }
          size={42}
          color={statusColor}
        />
      </View>

      <AppText
        variant="h2"
        style={[
          styles.statusTitle,
          {
            color:
              theme.text.primary,
          },
        ]}
      >
        {isAvailable
          ? tSafe(
              "date_change_accepted",
              "Date Change Accepted"
            )
          : tSafe(
              "date_change_unavailable",
              "New Date Unavailable"
            )}
      </AppText>

      <AppText
        variant="body"
        style={[
          styles.statusMessage,
          {
            color:
              theme.text.secondary,
          },
        ]}
      >
        {isAvailable
          ? tSafe(
              "date_change_accepted_message",
              "You have confirmed that you are available for the new cleaning date and time. You will remain assigned to this cleaning."
            )
          : tSafe(
              "date_change_unavailable_message",
              "You've let the host know that you can't make the new cleaning date and time. The host can now arrange a replacement."
            )}
      </AppText>

      <View
        style={[
          styles.confirmedSchedule,
          {
            backgroundColor:
              theme.surface.elevated,
            borderColor:
              theme.border.default,
          },
        ]}
      >
        <AppText
          variant="caption"
          style={[
            styles.confirmedLabel,
            {
              color:
                theme.text.muted,
            },
          ]}
        >
          {tSafe(
            "updated_cleaning_schedule",
            "UPDATED CLEANING SCHEDULE"
          )}
        </AppText>

        <AppText
          variant="h3"
          style={[
            styles.confirmedDate,
            {
              color:
                statusColor,
            },
          ]}
        >
          {formatDate(
            newCleaningDate
          )}
        </AppText>

        {!!newCleaningTime && (
          <View
            style={styles.confirmedTimeRow}
          >
            <MaterialIcons
              name="access-time"
              size={16}
              color={theme.icon.muted}
            />

            <AppText
              variant="caption"
              style={[
                styles.confirmedTime,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              {formatTime(
                newCleaningTime
              )}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* INFORMATION CARD                                                           */
/* -------------------------------------------------------------------------- */

const InformationCard = ({
  responseStatus,
  theme,
}) => {
  const isAvailable =
    responseStatus === "available";

  const isUnavailable =
    responseStatus === "unavailable";

  return (
    <AppCard
      variant="bordered"
      style={[
        styles.infoCard,
        {
          backgroundColor:
            theme.surface.selected,
          borderColor:
            theme.border.default,
        },
      ]}
    >
      <View
        style={[
          styles.infoIcon,
          {
            backgroundColor:
              theme.surface.elevated,
            borderColor:
              theme.border.default,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={21}
          color={
            theme.brand.primary
          }
        />
      </View>

      <View
        style={styles.infoContent}
      >
        <AppText
          variant="subtitle"
          style={[
            styles.infoTitle,
            {
              color:
                theme.text.primary,
            },
          ]}
        >
          {tSafe(
            "what_happens_next",
            "What happens next?"
          )}
        </AppText>

        {responseStatus ===
          "pending" && (
          <>
            <InfoBullet
              text={tSafe(
                "manual_change_available_result",
                "If you're available, you'll remain assigned to this cleaning."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "manual_change_unavailable_result",
                "If you're unavailable, the host will be notified."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "manual_change_replacement_result",
                "The replacement workflow can then find another cleaner if necessary."
              )}
              theme={theme}
            />
          </>
        )}

        {isAvailable && (
          <>
            <InfoBullet
              icon="check"
              iconColor={
                theme.status.success
              }
              text={tSafe(
                "manual_change_accepted_next_step",
                "The host has been notified that you accepted the schedule change."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "manual_change_accepted_assignment",
                "You will remain assigned to this cleaning."
              )}
              theme={theme}
            />
          </>
        )}

        {isUnavailable && (
          <>
            <InfoBullet
              text={tSafe(
                "manual_change_unavailable_next_step",
                "The host has been notified that you are unavailable."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "manual_change_replacement_result",
                "The replacement workflow can now find another cleaner."
              )}
              theme={theme}
            />
          </>
        )}
      </View>
    </AppCard>
  );
};

/* -------------------------------------------------------------------------- */
/* INFO BULLET                                                                */
/* -------------------------------------------------------------------------- */

const InfoBullet = ({
  text,
  theme,
  icon = "circle",
  iconColor,
}) => {
  return (
    <View style={styles.infoBullet}>
      <MaterialCommunityIcons
        name={
          icon === "check"
            ? "check"
            : "circle-small"
        }
        size={18}
        color={
          iconColor ||
          theme.icon.muted
        }
        style={
          styles.infoBulletIcon
        }
      />

      <AppText
        variant="caption"
        style={[
          styles.infoText,
          {
            color:
              theme.text.secondary,
          },
        ]}
      >
        {text}
      </AppText>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const ManualScheduleDateChange = () => {
  const route = useRoute();

  const { theme } = useTheme();

  const { currentUserId } =
    useContext(AuthContext);

  const {
    scheduleId,
    requestId,
    cleanerId,

    oldCleaningDate,
    newCleaningDate,

    oldCleaningTime,
    newCleaningTime,

    propertyName,
    group,
  } = route.params || {};

  /*
   * Prefer the authenticated cleaner ID when available,
   * while retaining cleanerId from existing notification
   * / deep-link flows.
   */
  const effectiveCleanerId =
    cleanerId || currentUserId;

  const [loading, setLoading] =
    useState(false);

  const [
    selectedResponse,
    setSelectedResponse,
  ] = useState(null);

  const [
    responseStatus,
    setResponseStatus,
  ] = useState("pending");

  const [
    requestStatus,
    setRequestStatus,
  ] = useState("loading");

  /* ------------------------------------------------------------------------ */
  /* FETCH REQUEST                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchManualScheduleChangeRequest =
    useCallback(async () => {
      if (!requestId) {
        console.warn(
          "No manual schedule change requestId"
        );

        setRequestStatus("error");

        return;
      }

      try {
        setRequestStatus(
          "loading"
        );

        setLoading(true);

        const response =
          await userService.getManualScheduleChangeRequest(
            requestId
          );

        const request =
          response?.data;

        if (!request) {
          setRequestStatus(
            "error"
          );

          return;
        }

        /*
         * Database is the source of truth.
         */
        switch (request.status) {
          case "accepted":
            setSelectedResponse(
              "available"
            );

            setResponseStatus(
              "available"
            );

            break;

          case "declined":
          case "rejected":
            setSelectedResponse(
              "unavailable"
            );

            setResponseStatus(
              "unavailable"
            );

            break;

          case "pending":
          case "open":
            setSelectedResponse(
              null
            );

            setResponseStatus(
              "pending"
            );

            break;

          default:
            console.warn(
              "Unknown manual request status:",
              request.status
            );

            setSelectedResponse(
              null
            );

            setResponseStatus(
              "pending"
            );
        }

        setRequestStatus(
          "loaded"
        );
      } catch (error) {
        console.error(
          "Failed to fetch manual schedule change:",
          error?.response?.data ||
            error
        );

        setRequestStatus(
          "error"
        );

        Alert.alert(
          tSafe(
            "unable_to_load",
            "Unable to Load"
          ),
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            tSafe(
              "failed_to_fetch_date_change",
              "Unable to load the schedule change request."
            )
        );
      } finally {
        setLoading(false);
      }
    }, [requestId]);

  /* ------------------------------------------------------------------------ */
  /* REFRESH ON FOCUS                                                         */
  /* ------------------------------------------------------------------------ */

  useFocusEffect(
    useCallback(() => {
      fetchManualScheduleChangeRequest();
    }, [
      fetchManualScheduleChangeRequest,
    ])
  );

  /* ------------------------------------------------------------------------ */
  /* RESPOND                                                                  */
  /* ------------------------------------------------------------------------ */

  const respondToManualScheduleChange =
    async (acceptance) => {
      if (
        !scheduleId ||
        !requestId ||
        !effectiveCleanerId
      ) {
        Alert.alert(
          tSafe(
            "error_title",
            "Error"
          ),
          tSafe(
            "missing_date_change_information",
            "The schedule information is missing. Please reopen the notification and try again."
          )
        );

        return;
      }

      if (loading) {
        return;
      }

      const selectedStatus =
        acceptance === 1
          ? "available"
          : "unavailable";

      /*
       * Optimistic selection.
       *
       * Final status is committed only after
       * the backend successfully accepts the response.
       */
      setSelectedResponse(
        selectedStatus
      );

      setLoading(true);

      try {
        await userService.respondToManualScheduleChange(
          {
            scheduleId,
            requestId,
            cleanerId:
              effectiveCleanerId,
            acceptance,
          }
        );

        setResponseStatus(
          selectedStatus
        );

        setRequestStatus(
          "loaded"
        );
      } catch (error) {
        console.error(
          "Manual schedule change response failed:",
          error?.response?.data ||
            error
        );

        setSelectedResponse(
          null
        );

        setResponseStatus(
          "pending"
        );

        const message =
          error?.response?.data
            ?.detail ||
          error?.response?.data
            ?.message ||
          tSafe(
            "failed_to_respond_to_date_change",
            "Something went wrong while submitting your response. Please try again."
          );

        Alert.alert(
          tSafe(
            "unable_to_submit",
            "Unable to Submit"
          ),
          message
        );
      } finally {
        setLoading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* ACCEPT                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleAvailable = () => {
    let message =
      `${tSafe(
        "available_for_new_date_question",
        "Are you available for this cleaning on"
      )} ${formatDate(
        newCleaningDate
      )}`;

    if (newCleaningTime) {
      message +=
        ` ${tSafe(
          "at_time",
          "at"
        )} ${formatTime(
          newCleaningTime
        )}`;
    }

    message += "?";

    Alert.alert(
      tSafe(
        "confirm_availability",
        "Confirm Availability"
      ),
      message,
      [
        {
          text: tSafe(
            "cancel",
            "Cancel"
          ),
          style: "cancel",
        },
        {
          text: tSafe(
            "yes_im_available",
            "Yes, I'm Available"
          ),
          onPress: () =>
            respondToManualScheduleChange(
              1
            ),
        },
      ]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* DECLINE                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleUnavailable = () => {
    Alert.alert(
      tSafe(
        "cant_make_this_date",
        "Can't Make This Change?"
      ),
      tSafe(
        "date_change_unavailable_warning",
        "If you can't make the new schedule, the host will be notified and may need to find another cleaner."
      ),
      [
        {
          text: tSafe(
            "go_back",
            "Go Back"
          ),
          style: "cancel",
        },
        {
          text: tSafe(
            "yes_continue",
            "Yes, Continue"
          ),
          style: "destructive",
          onPress: () =>
            respondToManualScheduleChange(
              0
            ),
        },
      ]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOADING                                                          */
  /* ------------------------------------------------------------------------ */

  if (
    requestStatus ===
    "loading"
  ) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.background.default,
          },
        ]}
      >
        <View
          style={[
            styles.loadingScreen,
            {
              backgroundColor:
                theme.background.default,
            },
          ]}
        >
          <View
            style={[
              styles.loadingIcon,
              {
                backgroundColor:
                  theme.surface.selected,
                borderColor:
                  theme.border.default,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-sync-outline"
              size={40}
              color={
                theme.brand.primary
              }
            />
          </View>

          <ActivityIndicator
            size="large"
            color={
              theme.brand.primary
            }
            style={
              styles.loadingSpinner
            }
          />

          <AppText
            variant="body"
            style={[
              styles.loadingScreenText,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {tSafe(
              "loading_date_change",
              "Loading schedule change..."
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                    */
  /* ------------------------------------------------------------------------ */

  if (
    requestStatus ===
    "error"
  ) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.background.default,
          },
        ]}
      >
        <View
          style={styles.errorScreen}
        >
          <View
            style={[
              styles.errorIcon,
              {
                backgroundColor:
                  withAlpha(
                    theme.status.error,
                    "15",
                    theme.surface.selected
                  ),
                borderColor:
                  withAlpha(
                    theme.status.error,
                    "40",
                    theme.border.default
                  ),
              },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={42}
              color={
                theme.status.error
              }
            />
          </View>

          <AppText
            variant="h2"
            style={[
              styles.errorTitle,
              {
                color:
                  theme.text.primary,
              },
            ]}
          >
            {tSafe(
              "unable_to_load",
              "Unable to Load"
            )}
          </AppText>

          <AppText
            variant="body"
            style={[
              styles.errorMessage,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {tSafe(
              "failed_to_fetch_date_change",
              "Unable to load the schedule change request."
            )}
          </AppText>

          <AppButton
            variant="primary"
            onPress={
              fetchManualScheduleChangeRequest
            }
            style={
              styles.retryButton
            }
          >
            {tSafe(
              "try_again",
              "Try Again"
            )}
          </AppButton>
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* MAIN RENDER                                                              */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background.default,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor:
              theme.background.default,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}

        <View
          style={styles.header}
        >
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor:
                  responseStatus ===
                  "available"
                    ? withAlpha(
                        theme.status.success,
                        "15",
                        theme.surface.selected
                      )
                    : responseStatus ===
                        "unavailable"
                      ? withAlpha(
                          theme.status.error,
                          "15",
                          theme.surface.selected
                        )
                      : theme.surface.selected,

                borderColor:
                  responseStatus ===
                  "available"
                    ? withAlpha(
                        theme.status.success,
                        "40",
                        theme.border.default
                      )
                    : responseStatus ===
                        "unavailable"
                      ? withAlpha(
                          theme.status.error,
                          "40",
                          theme.border.default
                        )
                      : theme.border.default,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                responseStatus ===
                "available"
                  ? "check-circle-outline"
                  : responseStatus ===
                      "unavailable"
                    ? "close-circle-outline"
                    : "calendar-sync-outline"
              }
              size={40}
              color={
                responseStatus ===
                "available"
                  ? theme.status.success
                  : responseStatus ===
                      "unavailable"
                    ? theme.status.error
                    : theme.brand.primary
              }
            />
          </View>

          <AppText
            variant="h1"
            style={[
              styles.title,
              {
                color:
                  theme.text.primary,
              },
            ]}
          >
            {responseStatus ===
            "available"
              ? tSafe(
                  "date_change_accepted",
                  "Schedule Change Accepted"
                )
              : responseStatus ===
                  "unavailable"
                ? tSafe(
                    "date_change_unavailable",
                    "New Schedule Unavailable"
                  )
                : tSafe(
                    "cleaning_schedule_changed",
                    "Cleaning Schedule Changed"
                  )}
          </AppText>

          <AppText
            variant="body"
            style={[
              styles.subtitle,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {responseStatus ===
            "available"
              ? tSafe(
                  "manual_change_accepted_header",
                  "You confirmed that you are available for the updated cleaning schedule."
                )
              : responseStatus ===
                  "unavailable"
                ? tSafe(
                    "manual_change_unavailable_header",
                    "You've let the host know that you can't make the updated schedule."
                  )
                : tSafe(
                    "manual_change_description",
                    "The host has requested a change to the cleaning date or time."
                  )}
          </AppText>
        </View>

        {/* ================================================================ */}
        {/* CLEANING DETAILS                                                 */}
        {/* ================================================================ */}

        <AppCard
          variant="bordered"
          style={[
            styles.card,
            {
              backgroundColor:
                theme.card.background,
              borderColor:
                theme.card.border,
            },
          ]}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    theme.surface.selected,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="broom"
                size={22}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <View
              style={
                styles.sectionHeaderContent
              }
            >
              <AppText
                variant="h3"
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "cleaning_details",
                  "Cleaning Details"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "schedule_information",
                  "Schedule information"
                )}
              </AppText>
            </View>
          </View>

          <AppText
            variant="h3"
            style={[
              styles.propertyName,
              {
                color:
                  theme.text.primary,
              },
            ]}
          >
            {propertyName ||
              tSafe(
                "cleaning",
                "Cleaning"
              )}
          </AppText>

          {group && (
            <DetailRow
              icon={
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={19}
                />
              }
              label={tSafe(
                "cleaning_group",
                "Cleaning Group"
              )}
              value={formatGroup(group)}
              theme={theme}
            />
          )}
        </AppCard>

        {/* ================================================================ */}
        {/* SCHEDULE CHANGE                                                  */}
        {/* ================================================================ */}

        <AppCard
          variant="bordered"
          style={[
            styles.card,
            {
              backgroundColor:
                theme.card.background,
              borderColor:
                theme.card.border,
            },
          ]}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    theme.surface.selected,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-edit-outline"
                size={22}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <View
              style={
                styles.sectionHeaderContent
              }
            >
              <AppText
                variant="h3"
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "schedule_change",
                  "Schedule Change"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "compare_schedule_dates",
                  "Compare the original and updated schedule"
                )}
              </AppText>
            </View>
          </View>

          <ScheduleComparison
            oldCleaningDate={
              oldCleaningDate
            }
            newCleaningDate={
              newCleaningDate
            }
            oldCleaningTime={
              oldCleaningTime
            }
            newCleaningTime={
              newCleaningTime
            }
            theme={theme}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  theme.divider,
              },
            ]}
          />

          <AppText
            variant="body"
            style={[
              styles.explanation,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {responseStatus ===
            "pending"
              ? tSafe(
                  "confirm_new_cleaning_schedule",
                  "Please confirm whether you can still complete this cleaning at the new date and time."
                )
              : responseStatus ===
                  "available"
                ? tSafe(
                    "schedule_change_confirmed_explanation",
                    "You have confirmed that you can complete this cleaning at the new date and time."
                  )
                : tSafe(
                    "schedule_change_declined_explanation",
                    "You have indicated that you cannot complete this cleaning at the new date and time."
                  )}
          </AppText>
        </AppCard>

        {/* ================================================================ */}
        {/* RESPONSE                                                         */}
        {/* ================================================================ */}

        {responseStatus ===
        "pending" ? (
          <View
            style={
              styles.responseSection
            }
          >
            <AppText
              variant="h2"
              style={[
                styles.responseTitle,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              {tSafe(
                "can_you_make_schedule_change",
                "Can you make this change?"
              )}
            </AppText>

            <AppText
              variant="body"
              style={[
                styles.responseSubtitle,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              {tSafe(
                "response_sent_to_host",
                "Your response will be sent to the host."
              )}
            </AppText>

            <AppButton
              variant="primary"
              onPress={
                handleAvailable
              }
              disabled={loading}
              loading={
                loading &&
                selectedResponse ===
                  "available"
              }
              icon="check"
              style={
                styles.responseButton
              }
            >
              {tSafe(
                "im_available",
                "I'm Available"
              )}
            </AppButton>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                handleUnavailable
              }
              disabled={loading}
              style={[
                styles.declineButton,
                {
                  backgroundColor:
                    theme.surface.elevated,
                  borderColor:
                    theme.status.error,
                  opacity:
                    loading ? 0.55 : 1,
                },
              ]}
            >
              {loading &&
              selectedResponse ===
                "unavailable" ? (
                <ActivityIndicator
                  size="small"
                  color={
                    theme.status.error
                  }
                />
              ) : (
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={
                    theme.status.error
                  }
                />
              )}

              <AppText
                variant="body"
                style={[
                  styles.declineButtonText,
                  {
                    color:
                      theme.status.error,
                  },
                ]}
              >
                {tSafe(
                  "i_cant_make_this_change",
                  "I Can't Make This Change"
                )}
              </AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <ResponseStatusCard
            responseStatus={
              responseStatus
            }
            newCleaningDate={
              newCleaningDate
            }
            newCleaningTime={
              newCleaningTime
            }
            theme={theme}
          />
        )}

        {/* ================================================================ */}
        {/* INFORMATION                                                      */}
        {/* ================================================================ */}

        <InformationCard
          responseStatus={
            responseStatus
          }
          theme={theme}
        />

        {/* ================================================================ */}
        {/* SUBMITTING                                                       */}
        {/* ================================================================ */}

        {loading &&
          responseStatus ===
            "pending" && (
            <View
              style={[
                styles.loadingContainer,
                {
                  backgroundColor:
                    theme.surface.selected,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <ActivityIndicator
                size="small"
                color={
                  theme.brand.primary
                }
              />

              <AppText
                variant="caption"
                style={[
                  styles.loadingText,
                  {
                    color:
                      theme.text.secondary,
                  },
                ]}
              >
                {tSafe(
                  "submitting_response",
                  "Submitting your response..."
                )}
              </AppText>
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* -------------------------------------------------------------------------- */
/* DETAIL ROW                                                                 */
/* -------------------------------------------------------------------------- */

const DetailRow = ({
  icon,
  label,
  value,
  theme,
}) => {
  return (
    <View
      style={[
        styles.detailRow,
        {
          borderTopColor:
            theme.divider,
        },
      ]}
    >
      <View
        style={
          styles.detailLabelContainer
        }
      >
        <View
          style={[
            styles.detailIcon,
            {
              backgroundColor:
                theme.background.sunken,
              borderColor:
                theme.border.default,
            },
          ]}
        >
          {React.cloneElement(
            icon,
            {
              color:
                theme.icon.muted,
            }
          )}
        </View>

        <AppText
          variant="caption"
          style={[
            styles.detailLabel,
            {
              color:
                theme.text.muted,
            },
          ]}
        >
          {label}
        </AppText>
      </View>

      <AppText
        variant="body"
        style={[
          styles.detailValue,
          {
            color:
              theme.text.primary,
          },
        ]}
      >
        {value}
      </AppText>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* EXPORT                                                                     */
/* -------------------------------------------------------------------------- */

export default ManualScheduleDateChange;

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 44,
  },

  /* ---------------------------------------------------------------------- */
  /* HEADER                                                                 */
  /* ---------------------------------------------------------------------- */

  header: {
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },

  headerIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 360,
  },

  /* ---------------------------------------------------------------------- */
  /* CARDS                                                                  */
  /* ---------------------------------------------------------------------- */

  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  propertyName: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    marginBottom: 3,
  },

  /* ---------------------------------------------------------------------- */
  /* DETAILS                                                                */
  /* ---------------------------------------------------------------------- */

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
  },

  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  detailLabel: {
    fontSize: 12,
  },

  detailValue: {
    maxWidth: "50%",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  /* ---------------------------------------------------------------------- */
  /* SCHEDULE COMPARISON                                                    */
  /* ---------------------------------------------------------------------- */

  scheduleComparison: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  schedulePanel: {
    flex: 1,
    minHeight: 145,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  scheduleLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  previousDate: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  newDate: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  timePill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  timePillText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "600",
  },

  changeArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 7,
  },

  divider: {
    height: 1,
    marginVertical: 17,
  },

  explanation: {
    fontSize: 13,
    lineHeight: 21,
  },

  /* ---------------------------------------------------------------------- */
  /* RESPONSE                                                               */
  /* ---------------------------------------------------------------------- */

  responseSection: {
    marginBottom: 16,
  },

  responseTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    marginBottom: 5,
  },

  responseSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 15,
  },

  responseButton: {
    marginBottom: 11,
  },

  declineButton: {
    minHeight: 54,
    borderWidth: 1.5,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  declineButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "800",
  },

  /* ---------------------------------------------------------------------- */
  /* STATUS                                                                 */
  /* ---------------------------------------------------------------------- */

  statusCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 21,
    marginBottom: 16,
    alignItems: "center",
  },

  statusIconContainer: {
    width: 78,
    height: 78,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  statusTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  statusMessage: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 340,
  },

  confirmedSchedule: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginTop: 18,
    alignItems: "center",
  },

  confirmedLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  confirmedDate: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  confirmedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  confirmedTime: {
    marginLeft: 5,
    fontSize: 12,
  },

  /* ---------------------------------------------------------------------- */
  /* INFORMATION                                                            */
  /* ---------------------------------------------------------------------- */

  infoCard: {
    flexDirection: "row",
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 7,
  },

  infoBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },

  infoBulletIcon: {
    marginTop: 1,
    marginRight: 3,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
  },

  /* ---------------------------------------------------------------------- */
  /* LOADING                                                                */
  /* ---------------------------------------------------------------------- */

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingSpinner: {
    marginTop: 20,
  },

  loadingScreenText: {
    marginTop: 11,
    fontSize: 14,
  },

  /* ---------------------------------------------------------------------- */
  /* ERROR                                                                  */
  /* ---------------------------------------------------------------------- */

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  errorTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 330,
  },

  retryButton: {
    marginTop: 20,
    minWidth: 150,
  },
});