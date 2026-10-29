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
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/*
 * YYYY-MM-DD is treated as a calendar date.
 *
 * Do NOT use:
 * new Date("2026-09-15")
 *
 * because JavaScript treats that format as UTC and
 * it can display as the previous day in US time zones.
 */
const formatDate = (date) => {
  if (!date) {
    return tSafe("na", "N/A");
  }

  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    const [year, month, day] = date
      .split("-")
      .map(Number);

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

/*
 * Safely create a translucent color from a theme color.
 *
 * The theme normally provides hex values, but this prevents
 * invalid strings if a theme value is ever changed.
 */
const withAlpha = (
  color,
  alphaHex,
  fallback
) => {
  if (
    typeof color === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(color)
  ) {
    return `${color}${alphaHex}`;
  }

  return fallback || color;
};

/* -------------------------------------------------------------------------- */
/* DATE COMPARISON                                                            */
/* -------------------------------------------------------------------------- */

const DateComparison = ({
  oldCleaningDate,
  newCleaningDate,
  theme,
}) => {
  return (
    <View
      style={[
        styles.dateComparison,
        {
          backgroundColor:
            theme.surface.default,
          borderColor:
            theme.border.default,
        },
      ]}
    >
      {/* ORIGINAL DATE */}

      <View style={styles.dateBlock}>
        <View
          style={[
            styles.dateIcon,
            {
              backgroundColor:
                theme.background.sunken,
              borderColor:
                theme.border.default,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-remove-outline"
            size={20}
            color={theme.icon.muted}
          />
        </View>

        <AppText
          variant="caption"
          style={[
            styles.dateLabel,
            {
              color: theme.text.muted,
            },
          ]}
        >
          {tSafe(
            "previous_date",
            "PREVIOUS DATE"
          )}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.oldDate,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {formatDate(oldCleaningDate)}
        </AppText>
      </View>

      {/* CHANGE INDICATOR */}

      <View
        style={[
          styles.dateArrow,
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
          size={19}
          color={theme.icon.inverse}
        />
      </View>

      {/* NEW DATE */}

      <View style={styles.dateBlock}>
        <View
          style={[
            styles.dateIcon,
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
            size={20}
            color={theme.status.success}
          />
        </View>

        <AppText
          variant="caption"
          style={[
            styles.dateLabel,
            {
              color:
                theme.status.success,
            },
          ]}
        >
          {tSafe(
            "new_date",
            "NEW DATE"
          )}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.newDate,
            {
              color: theme.text.primary,
            },
          ]}
        >
          {formatDate(newCleaningDate)}
        </AppText>
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
  cleaningTime,
  theme,
}) => {
  const isAvailable =
    responseStatus === "available";

  const color = isAvailable
    ? theme.status.success
    : theme.status.error;

  const backgroundColor = isAvailable
    ? withAlpha(
        theme.status.success,
        "10",
        theme.surface.selected
      )
    : withAlpha(
        theme.status.error,
        "10",
        theme.surface.selected
      );

  const borderColor = isAvailable
    ? withAlpha(
        theme.status.success,
        "45",
        theme.border.default
      )
    : withAlpha(
        theme.status.error,
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
            backgroundColor: withAlpha(
              color,
              "18",
              theme.surface.selected
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
          size={40}
          color={color}
        />
      </View>

      <AppText
        variant="h2"
        style={[
          styles.statusTitle,
          {
            color: theme.text.primary,
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
            color: theme.text.secondary,
          },
        ]}
      >
        {isAvailable
          ? tSafe(
              "date_change_accepted_message",
              "You have confirmed that you are available for the new cleaning date. You will remain assigned to this cleaning."
            )
          : tSafe(
              "date_change_unavailable_message",
              "You've let the host know that you can't make the new cleaning date. The host can now arrange a replacement."
            )}
      </AppText>

      <View
        style={[
          styles.statusDateBox,
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
            styles.statusDateLabel,
            {
              color: theme.text.muted,
            },
          ]}
        >
          {tSafe(
            "updated_cleaning_date",
            "UPDATED CLEANING DATE"
          )}
        </AppText>

        <AppText
          variant="h3"
          style={[
            styles.statusDate,
            {
              color,
            },
          ]}
        >
          {formatDate(newCleaningDate)}
        </AppText>

        {!!cleaningTime && (
          <AppText
            variant="caption"
            style={[
              styles.statusTime,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {tSafe("at_time", "at")}{" "}
            {cleaningTime}
          </AppText>
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
              theme.brand.primaryLight,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={21}
          color={theme.brand.primary}
        />
      </View>

      <View style={styles.infoContent}>
        <AppText
          variant="subtitle"
          style={[
            styles.infoTitle,
            {
              color: theme.text.primary,
            },
          ]}
        >
          {tSafe(
            "what_happens_next",
            "What happens next?"
          )}
        </AppText>

        {responseStatus === "pending" && (
          <>
            <InfoBullet
              text={tSafe(
                "date_change_available_result",
                "If you're available, you'll remain assigned to this cleaning."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "date_change_unavailable_result",
                "If you're unavailable, the host will be notified."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "date_change_replacement_result",
                "The host can then choose another cleaner for the cleaning."
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
                "date_change_accepted_next_step",
                "The host has been notified that you are available for the new cleaning date."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "date_change_accepted_assignment",
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
                "date_change_unavailable_next_step",
                "The host has been notified that you are unavailable."
              )}
              theme={theme}
            />

            <InfoBullet
              text={tSafe(
                "date_change_replacement_result",
                "The host can now arrange another cleaner for the new date."
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
        style={styles.infoBulletIcon}
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
/* MAIN SCREEN                                                                */
/* -------------------------------------------------------------------------- */

const ScheduleDateChange = () => {
  const route = useRoute();
  const { theme } = useTheme();

  const {
    scheduleId,
    requestId,
    cleanerId,
    oldCleaningDate,
    newCleaningDate,
    propertyName,
    cleaningTime,
    group,
  } = route.params || {};

  const { currentUserId } =
    useContext(AuthContext);

  const effectiveCleanerId =
    cleanerId || currentUserId;

  const [loading, setLoading] =
    useState(false);

  const [selectedResponse, setSelectedResponse] =
    useState(null);

  const [responseStatus, setResponseStatus] =
    useState("pending");

  const [requestStatus, setRequestStatus] =
    useState("loading");

  /* ------------------------------------------------------------------------ */
  /* FETCH REQUEST                                                             */
  /* ------------------------------------------------------------------------ */

  const fetchDateChangeRequest =
    useCallback(async () => {
      if (!requestId) {
        console.warn(
          "No requestId provided"
        );

        setRequestStatus("error");
        return;
      }

      try {
        setLoading(true);
        setRequestStatus("loading");

        const response =
          await userService.getDateChangeRequest(
            requestId
          );

        const request = response?.data;

        if (!request) {
          setRequestStatus("error");
          return;
        }

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
            setSelectedResponse(null);
            setResponseStatus(
              "pending"
            );
            break;

          default:
            setSelectedResponse(null);
            setResponseStatus(
              "pending"
            );
        }

        setRequestStatus("loaded");
      } catch (error) {
        console.error(
          "Failed to fetch date change request:",
          error?.response?.data || error
        );

        setRequestStatus("error");

        Alert.alert(
          tSafe(
            "unable_to_load",
            "Unable to Load"
          ),
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            tSafe(
              "failed_to_fetch_date_change",
              "Unable to load the date change request."
            )
        );
      } finally {
        setLoading(false);
      }
    }, [requestId]);

  /* ------------------------------------------------------------------------ */
  /* REFRESH ON FOCUS                                                          */
  /* ------------------------------------------------------------------------ */

  useFocusEffect(
    useCallback(() => {
      fetchDateChangeRequest();
    }, [fetchDateChangeRequest])
  );

  /* ------------------------------------------------------------------------ */
  /* RESPOND                                                                    */
  /* ------------------------------------------------------------------------ */

  const respondToDateChange =
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

      setSelectedResponse(
        selectedStatus
      );

      setLoading(true);

      try {
        await userService.replyToDateChang({
          scheduleId,
          requestId,
          cleanerId: effectiveCleanerId,
          acceptance,
        });

        setResponseStatus(
          selectedStatus
        );
        setRequestStatus("loaded");
      } catch (error) {
        console.error(
          "Error responding to cleaning date change:",
          error?.response?.data || error
        );

        setSelectedResponse(null);
        setResponseStatus("pending");

        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
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
  /* AVAILABLE                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleAvailable = () => {
    Alert.alert(
      tSafe(
        "confirm_availability",
        "Confirm Availability"
      ),
      `${tSafe(
        "available_for_new_date_question",
        "Are you available for this cleaning on"
      )} ${formatDate(newCleaningDate)}${
        cleaningTime
          ? ` ${tSafe(
              "at_time",
              "at"
            )} ${cleaningTime}`
          : ""
      }?`,
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
            respondToDateChange(1),
        },
      ]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* UNAVAILABLE                                                               */
  /* ------------------------------------------------------------------------ */

  const handleUnavailable = () => {
    Alert.alert(
      tSafe(
        "cant_make_this_date",
        "Can't Make This Date?"
      ),
      tSafe(
        "date_change_unavailable_warning",
        "If you can't make the new date, the host will be notified and may need to find another cleaner."
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
            respondToDateChange(0),
        },
      ]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOADING                                                           */
  /* ------------------------------------------------------------------------ */

  if (requestStatus === "loading") {
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
              size={38}
              color={theme.brand.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
            style={styles.loadingSpinner}
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
              "Loading date change..."
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR STATE                                                               */
  /* ------------------------------------------------------------------------ */

  if (requestStatus === "error") {
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
        <View style={styles.errorScreen}>
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
                    "35",
                    theme.border.default
                  ),
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
              "Unable to load the date change request."
            )}
          </AppText>

          <AppButton
            variant="primary"
            onPress={
              fetchDateChangeRequest
            }
            style={styles.retryButton}
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
  /* MAIN RENDER                                                               */
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
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}

        <View style={styles.header}>
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
                        "35",
                        theme.border.default
                      )
                    : responseStatus ===
                        "unavailable"
                      ? withAlpha(
                          theme.status.error,
                          "35",
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
              size={39}
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
                  "Date Change Accepted"
                )
              : responseStatus ===
                  "unavailable"
                ? tSafe(
                    "date_change_unavailable",
                    "New Date Unavailable"
                  )
                : tSafe(
                    "cleaning_date_changed",
                    "Cleaning Date Changed"
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
                  "date_change_accepted_header",
                  "You confirmed that you are available for the updated cleaning date."
                )
              : responseStatus ===
                  "unavailable"
                ? tSafe(
                    "date_change_unavailable_header",
                    "You've let the host know that you can't make the updated cleaning date."
                  )
                : tSafe(
                    "cleaning_date_changed_description",
                    "The reservation has changed, so the cleaning date has been updated."
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
          <View style={styles.sectionHeader}>
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
                size={21}
                color={theme.brand.primary}
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

          {cleaningTime && (
            <DetailRow
              icon={
                <MaterialIcons
                  name="access-time"
                  size={19}
                />
              }
              label={tSafe(
                "time",
                "Time"
              )}
              value={cleaningTime}
              theme={theme}
            />
          )}
        </AppCard>

        {/* ================================================================ */}
        {/* DATE CHANGE                                                      */}
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
          <View style={styles.sectionHeader}>
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
                size={21}
                color={theme.brand.primary}
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
                  "date_change",
                  "Date Change"
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
                  "Compare the original and updated dates"
                )}
              </AppText>
            </View>
          </View>

          <DateComparison
            oldCleaningDate={
              oldCleaningDate
            }
            newCleaningDate={
              newCleaningDate
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
                  "confirm_new_cleaning_date",
                  "Please confirm whether you can still complete this cleaning on the new date."
                )
              : responseStatus ===
                  "available"
                ? tSafe(
                    "date_change_confirmed_explanation",
                    "You have confirmed that you can complete this cleaning on the new date."
                  )
                : tSafe(
                    "date_change_declined_explanation",
                    "You have indicated that you cannot complete this cleaning on the new date."
                  )}
          </AppText>
        </AppCard>

        {/* ================================================================ */}
        {/* RESPONSE                                                         */}
        {/* ================================================================ */}

        {responseStatus ===
        "pending" ? (
          <View style={styles.responseSection}>
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
                "can_you_make_new_date",
                "Can you make the new date?"
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
                  "i_cant_make_this_date",
                  "I Can't Make This Date"
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
            cleaningTime={
              cleaningTime
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
        style={styles.detailLabelContainer}
      >
        <View
          style={[
            styles.detailIcon,
            {
              backgroundColor:
                theme.background.sunken,
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

export default ScheduleDateChange;

/* -------------------------------------------------------------------------- */
/* STYLES                                                                      */
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
    marginBottom: 24,
    paddingHorizontal: 12,
  },

  headerIcon: {
    width: 82,
    height: 82,
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
    lineHeight: 24,
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
    width: 32,
    height: 32,
    borderRadius: 10,
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
  /* DATE COMPARISON                                                        */
  /* ---------------------------------------------------------------------- */

  dateComparison: {
    minHeight: 132,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  dateBlock: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },

  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  dateLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 4,
    textAlign: "center",
  },

  oldDate: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  newDate: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  dateArrow: {
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
    lineHeight: 26,
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
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  statusTitle: {
    fontSize: 21,
    lineHeight: 27,
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

  statusDateBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginTop: 18,
    alignItems: "center",
  },

  statusDateLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  statusDate: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  statusTime: {
    marginTop: 4,
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
    width: 84,
    height: 84,
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
    width: 84,
    height: 84,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  errorTitle: {
    fontSize: 22,
    lineHeight: 28,
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


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { Button, Card, Divider } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import userService from "../../services/connection/userService";

// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const ScheduleDateChange = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const {
//     scheduleId,
//     requestId,
//     cleanerId,
//     oldCleaningDate,
//     newCleaningDate,
//     propertyName,
//     cleaningTime,
//     group,
//   } = route.params || {};

//   const [loading, setLoading] = useState(false);
//   const [selectedResponse, setSelectedResponse] = useState(null);


//     const formatGroup = (group) => {
//         if (!group) return '';
//         return group
//             .replace(/[_-]+/g, ' ')
//             .trim()
//             .replace(/\b\w/g, char => char.toUpperCase());
//         };

    

//   const formatDate = (date) => {
//     if (!date) {
//       return tSafe('na', 'N/A');
//     }

//     const parsed = new Date(date);

//     if (Number.isNaN(parsed.getTime())) {
//       return date;
//     }

//     return parsed.toLocaleDateString('en-US', {
//       weekday: 'short',
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const respondToDateChange = async (acceptance) => {
//     if (!scheduleId || !requestId || !cleanerId) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe(
//           'missing_date_change_information',
//           'The schedule information is missing. Please reopen the notification and try again.'
//         )
//       );
//       return;
//     }

//     if (loading) return;

//     setSelectedResponse(
//       acceptance === 1 ? 'available' : 'unavailable'
//     );

//     setLoading(true);

//     // const data = {
//     //     scheduleId:scheduleId,
//     //     requestId:requestId,
//     //     cleanerId:cleanerId,
//     //     acceptance: acceptance,
//     // }
//     // console.log(data)
//     try {
//       await userService.replyToDateChang({
//         scheduleId,
//         requestId,
//         cleanerId,
//         acceptance,
//     })

//       if (acceptance === 1) {
//         Alert.alert(
//           tSafe('availability_confirmed', 'Availability Confirmed'),
//           tSafe(
//             'date_change_available_confirmation',
//             'You have confirmed that you are available for the new cleaning date.'
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           tSafe('response_submitted', 'Response Submitted'),
//           tSafe(
//             'date_change_unavailable_confirmation',
//             "We've let the host know that you can't make the new cleaning date. The host can now arrange a replacement."
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       }
//     } catch (error) {
//       console.error(
//         'Error responding to cleaning date change:',
//         error?.response?.data || error
//       );

//       setSelectedResponse(null);

//       const message =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         tSafe(
//           'failed_to_respond_to_date_change',
//           'Something went wrong while submitting your response. Please try again.'
//         );

//       Alert.alert(
//         tSafe('unable_to_submit', 'Unable to Submit'),
//         message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAvailable = () => {
//     Alert.alert(
//       tSafe('confirm_availability', 'Confirm Availability'),
//       `${tSafe(
//         'available_for_new_date_question',
//         "Are you available for this cleaning on"
//       )} ${formatDate(newCleaningDate)}${
//         cleaningTime
//           ? ` ${tSafe('at_time', 'at')} ${cleaningTime}`
//           : ''
//       }?`,
//       [
//         {
//           text: tSafe('cancel', 'Cancel'),
//           style: 'cancel',
//         },
//         {
//           text: tSafe(
//             'yes_im_available',
//             "Yes, I'm Available"
//           ),
//           onPress: () => respondToDateChange(1),
//         },
//       ]
//     );
//   };

//   const handleUnavailable = () => {
//     Alert.alert(
//       tSafe(
//         'cant_make_this_date',
//         "Can't Make This Date?"
//       ),
//       tSafe(
//         'date_change_unavailable_warning',
//         "If you can't make the new date, the host will be notified and may need to find another cleaner."
//       ),
//       [
//         {
//           text: tSafe('go_back', 'Go Back'),
//           style: 'cancel',
//         },
//         {
//           text: tSafe(
//             'yes_continue',
//             'Yes, Continue'
//           ),
//           style: 'destructive',
//           onPress: () => respondToDateChange(0),
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.iconContainer}>
//             <Text style={styles.calendarIcon}>📅</Text>
//           </View>

//           <Text style={styles.title}>
//             {tSafe(
//               'cleaning_date_changed',
//               'Cleaning Date Changed'
//             )}
//           </Text>

//           <Text style={styles.subtitle}>
//             {tSafe(
//               'cleaning_date_changed_description',
//               "The guest's reservation has changed, so the cleaning date has been updated."
//             )}
//           </Text>
//         </View>

//         {/* Cleaning Details */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               {tSafe(
//                 'cleaning_details',
//                 'CLEANING DETAILS'
//               )}
//             </Text>

//             <Text style={styles.propertyName}>
//               {propertyName ||
//                 tSafe('cleaning', 'Cleaning')}
//             </Text>

//             {group ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   {tSafe('cleaning', 'Cleaning')}
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {formatGroup(group)}
//                 </Text>
//               </View>
//             ) : null}

//             {cleaningTime ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   {tSafe('time', 'Time')}
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {cleaningTime}
//                 </Text>
//               </View>
//             ) : null}
//           </Card.Content>
//         </Card>

//         {/* Date Change */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               {tSafe(
//                 'date_change',
//                 'DATE CHANGE'
//               )}
//             </Text>

//             <View style={styles.dateContainer}>
//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   {tSafe(
//                     'previous_date',
//                     'PREVIOUS DATE'
//                   )}
//                 </Text>

//                 <Text style={styles.oldDate}>
//                   {formatDate(oldCleaningDate)}
//                 </Text>
//               </View>

//               <View style={styles.arrowContainer}>
//                 <Text style={styles.arrow}>→</Text>
//               </View>

//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   {tSafe(
//                     'new_date',
//                     'NEW DATE'
//                   )}
//                 </Text>

//                 <Text style={styles.newDate}>
//                   {formatDate(newCleaningDate)}
//                 </Text>
//               </View>
//             </View>

//             <Divider style={styles.divider} />

//             <Text style={styles.explanation}>
//               {tSafe(
//                 'confirm_new_cleaning_date',
//                 'Please confirm whether you can still complete this cleaning on the new date.'
//               )}
//             </Text>
//           </Card.Content>
//         </Card>

//         {/* Response */}
//         <View style={styles.responseSection}>
//           <Text style={styles.responseTitle}>
//             {tSafe(
//               'can_you_make_new_date',
//               'Can you make the new date?'
//             )}
//           </Text>

//           <Text style={styles.responseSubtitle}>
//             {tSafe(
//               'response_sent_to_host',
//               'Your response will be sent to the host.'
//             )}
//           </Text>

//           {/* Available */}
//           <Button
//             mode="contained"
//             onPress={handleAvailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === 'available'
//             }
//             style={styles.availableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.availableButtonLabel}
//           >
//             {tSafe(
//               'im_available',
//               "I'm Available"
//             )}
//           </Button>

//           {/* Unavailable */}
//           <Button
//             mode="outlined"
//             onPress={handleUnavailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === 'unavailable'
//             }
//             style={styles.unavailableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.unavailableButtonLabel}
//           >
//             {tSafe(
//               'i_cant_make_this_date',
//               "I Can't Make This Date"
//             )}
//           </Button>
//         </View>

//         {/* Information */}
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>
//             {tSafe(
//               'what_happens_next',
//               'What happens next?'
//             )}
//           </Text>

//           <Text style={styles.infoText}>
//             •{' '}
//             {tSafe(
//               'date_change_available_result',
//               "If you're available, you'll remain assigned to this cleaning."
//             )}
//           </Text>

//           <Text style={styles.infoText}>
//             •{' '}
//             {tSafe(
//               'date_change_unavailable_result',
//               "If you're unavailable, the host will be notified."
//             )}
//           </Text>

//           <Text style={styles.infoText}>
//             •{' '}
//             {tSafe(
//               'date_change_replacement_result',
//               'The host can then choose another cleaner for the cleaning.'
//             )}
//           </Text>
//         </View>

//         {/* Loading */}
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator
//               size="small"
//               color={COLORS.primary}
//             />

//             <Text style={styles.loadingText}>
//               {tSafe(
//                 'submitting_response',
//                 'Submitting your response...'
//               )}
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ScheduleDateChange;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },

//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   header: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },

//   iconContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: '#e8f8ff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 14,
//   },

//   calendarIcon: {
//     fontSize: 34,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#222',
//     textAlign: 'center',
//     marginBottom: 8,
//   },

//   subtitle: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: '#666',
//     textAlign: 'center',
//     maxWidth: 350,
//   },

//   card: {
//     marginBottom: 16,
//     borderRadius: 16,
//     backgroundColor: '#fff',
  
//     // Softer border
//     borderWidth: 0,
//     borderColor: '#F0F2F4',
  
//     // Very subtle shadow
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.01,
//     shadowRadius: 1,
  
//     // Android
//     elevation: 1,
//   },

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     letterSpacing: 1,
//     color: '#888',
//     marginBottom: 10,
//   },

//   propertyName: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 14,
//   },

//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 7,
//   },

//   detailLabel: {
//     fontSize: 14,
//     color: '#777',
//   },

//   detailValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     maxWidth: '65%',
//     textAlign: 'right',
//   },

//   dateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//   },

//   dateColumn: {
//     flex: 1,
//   },

//   dateLabel: {
//     fontSize: 10,
//     fontWeight: '700',
//     letterSpacing: 0.7,
//     color: '#888',
//     marginBottom: 6,
//   },

//   oldDate: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#666',
//     lineHeight: 21,
//   },

//   newDate: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.primary,
//     lineHeight: 21,
//   },

//   arrowContainer: {
//     paddingHorizontal: 12,
//   },

//   arrow: {
//     fontSize: 25,
//     color: '#999',
//   },

//   divider: {
//     marginVertical: 15,
//   },

//   explanation: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#666',
//   },

//   responseSection: {
//     marginTop: 8,
//     marginBottom: 20,
//   },

//   responseTitle: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 5,
//   },

//   responseSubtitle: {
//     fontSize: 14,
//     color: '#777',
//     marginBottom: 16,
//   },

//   availableButton: {
//     borderRadius: 10,
//     marginBottom: 12,
//     backgroundColor: COLORS.primary,
//   },

//   unavailableButton: {
//     borderRadius: 10,
//     borderColor: COLORS.error,
//   },

//   buttonContent: {
//     height: 52,
//   },

//   availableButtonLabel: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#fff',
//   },

//   unavailableButtonLabel: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.error,
//   },

//   infoBox: {
//     backgroundColor: '#eef9fd',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//   },

//   infoTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#333',
//     marginBottom: 10,
//   },

//   infoText: {
//     fontSize: 13,
//     lineHeight: 20,
//     color: '#555',
//     marginBottom: 5,
//   },

//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 8,
//   },

//   loadingText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: '#777',
//   },
// });





















// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Button, Card, Divider } from "react-native-paper";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import userService from "../../services/connection/userService";


// const ScheduleDateChange = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const {
//     scheduleId,
//     requestId,
//     cleanerId,
//     oldCleaningDate,
//     newCleaningDate,
//     propertyName,
//     cleaningTime,
//     group,
//   } = route.params || {};

//   const [loading, setLoading] = useState(false);
//   const [selectedResponse, setSelectedResponse] = useState(null);

//   const formatDate = (date) => {
//     if (!date) return "—";

//     const parsed = new Date(date);

//     if (Number.isNaN(parsed.getTime())) {
//       return date;
//     }

//     return parsed.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const respondToDateChange = async (acceptance) => {
//     if (!scheduleId || !requestId || !cleanerId) {
//       Alert.alert(
//         "Unable to Respond",
//         "The schedule information is missing. Please reopen the notification and try again."
//       );
//       return;
//     }

//     if (loading) return;

//     setSelectedResponse(
//       acceptance === 1 ? "available" : "unavailable"
//     );

//     setLoading(true);

//     try {
//     //   await axios.post(
//     //     `${API_BASE_URL}/api/schedules/respond_to_date_change`,
//     //     {
//     //       scheduleId,
//     //       requestId,
//     //       cleanerId,
//     //       acceptance,
//     //     }
//     //   );

//       await userService.replyToDateChang({
//         scheduleId,
//         requestId,
//         cleanerId,
//         acceptance,
//       })

//       if (acceptance === 1) {
//         Alert.alert(
//           "Availability Confirmed",
//           "You have confirmed that you are available for the new cleaning date.",
//           [
//             {
//               text: "OK",
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           "Response Submitted",
//           "We've let the host know that you can't make the new cleaning date. The host can now arrange a replacement.",
//           [
//             {
//               text: "OK",
//               onPress: () => navigation.goBack(),
//             },
//           ]
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Error responding to cleaning date change:",
//         error?.response?.data || error
//       );

//       setSelectedResponse(null);

//       const message =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         "Something went wrong while submitting your response. Please try again.";

//       Alert.alert("Unable to Submit", message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAvailable = () => {
//     Alert.alert(
//       "Confirm Availability",
//       `Are you available for this cleaning on ${formatDate(
//         newCleaningDate
//       )}${cleaningTime ? ` at ${cleaningTime}` : ""}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Yes, I'm Available",
//           onPress: () => respondToDateChange(1),
//         },
//       ]
//     );
//   };

//   const handleUnavailable = () => {
//     Alert.alert(
//       "Can't Make This Date?",
//       "If you can't make the new date, the host will be notified and may need to find another cleaner.",
//       [
//         {
//           text: "Go Back",
//           style: "cancel",
//         },
//         {
//           text: "Yes, Continue",
//           style: "destructive",
//           onPress: () => respondToDateChange(0),
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.iconContainer}>
//             <Text style={styles.calendarIcon}>📅</Text>
//           </View>

//           <Text style={styles.title}>
//             Cleaning Date Changed
//           </Text>

//           <Text style={styles.subtitle}>
//             The guest's reservation has changed, so the cleaning
//             date has been updated.
//           </Text>
//         </View>

//         {/* Property Details */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               CLEANING DETAILS
//             </Text>

//             <Text style={styles.propertyName}>
//               {propertyName || "Cleaning"}
//             </Text>

//             {group ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   Cleaning
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {group}
//                 </Text>
//               </View>
//             ) : null}

//             {cleaningTime ? (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>
//                   Time
//                 </Text>

//                 <Text style={styles.detailValue}>
//                   {cleaningTime}
//                 </Text>
//               </View>
//             ) : null}
//           </Card.Content>
//         </Card>

//         {/* Date Change */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionLabel}>
//               DATE CHANGE
//             </Text>

//             <View style={styles.dateContainer}>
//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   PREVIOUS DATE
//                 </Text>

//                 <Text style={styles.oldDate}>
//                   {formatDate(oldCleaningDate)}
//                 </Text>
//               </View>

//               <View style={styles.arrowContainer}>
//                 <Text style={styles.arrow}>
//                   →
//                 </Text>
//               </View>

//               <View style={styles.dateColumn}>
//                 <Text style={styles.dateLabel}>
//                   NEW DATE
//                 </Text>

//                 <Text style={styles.newDate}>
//                   {formatDate(newCleaningDate)}
//                 </Text>
//               </View>
//             </View>

//             <Divider style={styles.divider} />

//             <Text style={styles.explanation}>
//               Please confirm whether you can still complete
//               this cleaning on the new date.
//             </Text>
//           </Card.Content>
//         </Card>

//         {/* Response */}
//         <View style={styles.responseSection}>
//           <Text style={styles.responseTitle}>
//             Can you make the new date?
//           </Text>

//           <Text style={styles.responseSubtitle}>
//             Your response will be sent to the host.
//           </Text>

//           {/* Available */}
//           <Button
//             mode="contained"
//             onPress={handleAvailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === "available"
//             }
//             style={styles.availableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.availableButtonLabel}
//           >
//             I'm Available
//           </Button>

//           {/* Unavailable */}
//           <Button
//             mode="outlined"
//             onPress={handleUnavailable}
//             disabled={loading}
//             loading={
//               loading &&
//               selectedResponse === "unavailable"
//             }
//             style={styles.unavailableButton}
//             contentStyle={styles.buttonContent}
//             labelStyle={styles.unavailableButtonLabel}
//           >
//             I Can't Make This Date
//           </Button>
//         </View>

//         {/* Information */}
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>
//             What happens next?
//           </Text>

//           <Text style={styles.infoText}>
//             • If you're available, you'll remain assigned
//             to this cleaning.
//           </Text>

//           <Text style={styles.infoText}>
//             • If you're unavailable, the host will be
//             notified.
//           </Text>

//           <Text style={styles.infoText}>
//             • The host can then choose another cleaner
//             for the cleaning.
//           </Text>
//         </View>

//         {/* Loading */}
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="small" />

//             <Text style={styles.loadingText}>
//               Submitting your response...
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ScheduleDateChange;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#f9f9f9",
//   },

//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   header: {
//     alignItems: "center",
//     marginBottom: 24,
//   },

//   iconContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "#e8f8ff",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 14,
//   },

//   calendarIcon: {
//     fontSize: 34,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#222",
//     textAlign: "center",
//     marginBottom: 8,
//   },

//   subtitle: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: "#666",
//     textAlign: "center",
//     maxWidth: 350,
//   },

//   card: {
//     marginBottom: 16,
//     borderRadius: 14,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     letterSpacing: 1,
//     color: "#888",
//     marginBottom: 10,
//   },

//   propertyName: {
//     fontSize: 19,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 14,
//   },

//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 7,
//   },

//   detailLabel: {
//     fontSize: 14,
//     color: "#777",
//   },

//   detailValue: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     maxWidth: "65%",
//     textAlign: "right",
//   },

//   dateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//   },

//   dateColumn: {
//     flex: 1,
//   },

//   dateLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.7,
//     color: "#888",
//     marginBottom: 6,
//   },

//   oldDate: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#666",
//     lineHeight: 21,
//   },

//   newDate: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#00BFFF",
//     lineHeight: 21,
//   },

//   arrowContainer: {
//     paddingHorizontal: 12,
//   },

//   arrow: {
//     fontSize: 25,
//     color: "#999",
//   },

//   divider: {
//     marginVertical: 15,
//   },

//   explanation: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: "#666",
//   },

//   responseSection: {
//     marginTop: 8,
//     marginBottom: 20,
//   },

//   responseTitle: {
//     fontSize: 19,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 5,
//   },

//   responseSubtitle: {
//     fontSize: 14,
//     color: "#777",
//     marginBottom: 16,
//   },

//   availableButton: {
//     borderRadius: 10,
//     marginBottom: 12,
//     backgroundColor: "#00BFFF",
//   },

//   unavailableButton: {
//     borderRadius: 10,
//     borderColor: "#d9534f",
//   },

//   buttonContent: {
//     height: 52,
//   },

//   availableButtonLabel: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#fff",
//   },

//   unavailableButtonLabel: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#d9534f",
//   },

//   infoBox: {
//     backgroundColor: "#eef9fd",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//   },

//   infoTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 10,
//   },

//   infoText: {
//     fontSize: 13,
//     lineHeight: 20,
//     color: "#555",
//     marginBottom: 5,
//   },

//   loadingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 8,
//   },

//   loadingText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: "#777",
//   },
// });