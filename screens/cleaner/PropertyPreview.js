import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";

import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
  Image,
  Alert,
  Modal,
} from "react-native";

import { useRoute } from "@react-navigation/native";

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import * as Haptics from "expo-haptics";

import CustomCard from "../../components/shared/CustomCard";
import userService from "../../services/connection/userService";
import { AuthContext } from "../../context/AuthContext";
import { tSafe } from "../../utils/tSafe";
import { MAP_BOX_SECRET_KEY } from "../../env";

import { useTheme } from "../../theme";
import AppText from "../../ui/AppText";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const getRoomIcon = (type = "") => {
  const normalizedType = String(type).toLowerCase();

  if (normalizedType.includes("bedroom")) {
    return "bed-queen-outline";
  }

  if (normalizedType.includes("bathroom")) {
    return "shower-head";
  }

  if (normalizedType.includes("livingroom") || normalizedType.includes("living room")) {
    return "sofa-outline";
  }

  if (normalizedType.includes("kitchen")) {
    return "fridge-outline";
  }

  if (normalizedType.includes("dining")) {
    return "table-chair";
  }

  if (normalizedType.includes("office")) {
    return "desk";
  }

  return "door-open";
};

const formatPhone = (phone) => {
  if (!phone) {
    return tSafe("na", "N/A");
  }

  const cleaned = String(phone).replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(
      3,
      6
    )}-${cleaned.slice(6)}`;
  }

  return String(phone);
};

const countTasksInRoom = (room) => {
  if (!room || !Array.isArray(room.tasks)) {
    return 0;
  }

  return room.tasks.length;
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
};

const formatPropertyType = (type) => {
  if (!type) {
    return tSafe("property", "PROPERTY");
  }

  return String(type)
    .replace(/_/g, " ")
    .toUpperCase();
};

const getRoomDisplayName = (roomKey) => {
  return String(roomKey || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/* -------------------------------------------------------------------------- */
/* INVITE BANNER                                                              */
/* -------------------------------------------------------------------------- */

const InviteBanner = ({
  onAccept,
  onDecline,
  processing,
  theme,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.inviteCard,
        {
          backgroundColor: theme.surface.elevated,
          borderColor: theme.brand.primary,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.inviteHeader}>
        <View
          style={[
            styles.inviteIconContainer,
            {
              backgroundColor: theme.brand.primaryLight,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="email-check-outline"
            size={25}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.inviteHeaderContent}>
          <AppText
            variant="h3"
            style={[
              styles.inviteTitle,
              {
                color: theme.text.primary,
              },
            ]}
          >
            {tSafe("youre_invited", "You're Invited!")}
          </AppText>

          <AppText
            variant="caption"
            style={[
              styles.inviteSubtitle,
              {
                color: theme.text.secondary,
              },
            ]}
          >
            {tSafe(
              "property_cleaning_invitation",
              "Property cleaning invitation"
            )}
          </AppText>
        </View>
      </View>

      <AppText
        variant="body"
        style={[
          styles.inviteText,
          {
            color: theme.text.secondary,
          },
        ]}
      >
        {tSafe(
          "invite_text",
          "You've been invited to clean this property. Would you like to accept?"
        )}
      </AppText>

      <View style={styles.inviteButtons}>
        <TouchableOpacity
          style={[
            styles.acceptBtn,
            {
              backgroundColor: theme.button.primaryBackground,
            },
            processing && styles.disabledBtn,
          ]}
          onPress={onAccept}
          disabled={processing}
          activeOpacity={0.85}
        >
          {processing ? (
            <ActivityIndicator
              size="small"
              color={theme.button.primaryText}
            />
          ) : (
            <>
              <MaterialCommunityIcons
                name="check"
                size={18}
                color={theme.button.primaryText}
              />

              <AppText
                variant="body"
                style={[
                  styles.acceptText,
                  {
                    color: theme.button.primaryText,
                  },
                ]}
              >
                {tSafe("accept", "Accept")}
              </AppText>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.declineBtn,
            {
              backgroundColor: theme.surface.elevated,
              borderColor: theme.status.error,
            },
            processing && styles.disabledBtn,
          ]}
          onPress={onDecline}
          disabled={processing}
          activeOpacity={0.85}
        >
          {processing ? (
            <ActivityIndicator
              size="small"
              color={theme.status.error}
            />
          ) : (
            <>
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={theme.status.error}
              />

              <AppText
                variant="body"
                style={[
                  styles.declineText,
                  {
                    color: theme.status.error,
                  },
                ]}
              >
                {tSafe("decline", "Decline")}
              </AppText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/* INFO ROW                                                                   */
/* -------------------------------------------------------------------------- */

const InfoRow = ({
  icon,
  label,
  value,
  theme,
}) => {
  return (
    <View
      style={[
        styles.infoRow,
        {
          borderBottomColor: theme.divider,
        },
      ]}
    >
      <View
        style={[
          styles.infoIconContainer,
          {
            backgroundColor: theme.surface.selected,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={18}
          color={theme.icon.default}
        />
      </View>

      <View style={styles.infoContent}>
        <AppText
          variant="caption"
          style={[
            styles.infoLabel,
            {
              color: theme.text.muted,
            },
          ]}
        >
          {label}
        </AppText>

        <AppText
          variant="body"
          style={[
            styles.infoValue,
            {
              color: theme.text.primary,
            },
          ]}
          numberOfLines={2}
        >
          {value || tSafe("na", "N/A")}
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* CHECKLIST ITEM                                                             */
/* -------------------------------------------------------------------------- */

const ChecklistItem = ({
  checklist,
  onPress,
  theme,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.checklistItem,
        {
          backgroundColor: theme.surface.selected,
          borderColor: theme.border.default,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View
        style={[
          styles.checklistIconContainer,
          {
            backgroundColor: theme.brand.primaryLight,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="clipboard-list-outline"
          size={23}
          color={theme.brand.primary}
        />
      </View>

      <View style={styles.checklistInfo}>
        <AppText
          variant="subtitle"
          style={[
            styles.checklistName,
            {
              color: theme.text.primary,
            },
          ]}
          numberOfLines={2}
        >
          {checklist?.checklistName ||
            tSafe("unnamed_checklist", "Unnamed Checklist")}
        </AppText>

        <View style={styles.checklistMetaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={theme.text.muted}
            />

            <AppText
              variant="caption"
              style={[
                styles.checklistMeta,
                {
                  color: theme.text.secondary,
                },
              ]}
            >
              {checklist?.totalTime || 0}{" "}
              {tSafe("minutes_abbr", "min")}
            </AppText>
          </View>

          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={14}
              color={theme.status.success}
            />

            <AppText
              variant="caption"
              style={[
                styles.checklistMeta,
                {
                  color: theme.status.success,
                },
              ]}
            >
              {formatCurrency(checklist?.totalFee)}
            </AppText>
          </View>
        </View>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={24}
        color={theme.icon.muted}
      />
    </TouchableOpacity>
  );
};

/* -------------------------------------------------------------------------- */
/* ROOM CARD                                                                  */
/* -------------------------------------------------------------------------- */

const RoomCard = ({
  room,
  theme,
}) => {
  const roomType = room?.type || tSafe("room", "Room");

  return (
    <View
      style={[
        styles.roomGridItem,
        {
          backgroundColor: theme.surface.selected,
          borderColor: theme.border.default,
        },
      ]}
    >
      <View
        style={[
          styles.roomIconContainer,
          {
            backgroundColor: theme.brand.primaryLight,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={getRoomIcon(roomType)}
          size={25}
          color={theme.brand.primary}
        />
      </View>

      <AppText
        variant="subtitle"
        style={[
          styles.roomType,
          {
            color: theme.text.primary,
          },
        ]}
        numberOfLines={2}
      >
        {roomType}
      </AppText>

      <View style={styles.roomStats}>
        <AppText
          variant="caption"
          style={[
            styles.roomCount,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {room?.number || 0}{" "}
          {(Number(room?.number) || 0) > 1
            ? tSafe("rooms", "rooms")
            : tSafe("room", "room")}
        </AppText>

        {room?.size !== undefined &&
          room?.size !== null &&
          room?.size !== "" && (
            <>
              <AppText
                variant="caption"
                style={[
                  styles.roomSeparator,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                •
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.roomSize,
                  {
                    color: theme.text.secondary,
                  },
                ]}
              >
                {room.size} {tSafe("sq_ft", "sq ft")}
              </AppText>
            </>
          )}
      </View>

      {!!room?.size_range && (
        <AppText
          variant="caption"
          style={[
            styles.roomSizeRange,
            {
              color: theme.text.muted,
            },
          ]}
        >
          {room.size_range}
        </AppText>
      )}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN SCREEN                                                                */
/* -------------------------------------------------------------------------- */

export default function PropertyPreview() {
  const route = useRoute();
  const { theme } = useTheme();

  const { propertyId, inviteToken } = route.params || {};
  const { currentUserId } = useContext(AuthContext);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inviteStatus, setInviteStatus] = useState(
    inviteToken ? "pending" : null
  );

  const [inviteDetails, setInviteDetails] = useState(null);
  const [processingInvite, setProcessingInvite] = useState(false);

  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [mapError, setMapError] = useState(false);

  const [checklists, setChecklists] = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [checklistsError, setChecklistsError] = useState(null);

  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* CHECKLIST FETCH                                                           */
  /* ------------------------------------------------------------------------ */

  const fetchChecklists = useCallback(async (checklistIds) => {
    if (!Array.isArray(checklistIds) || checklistIds.length === 0) {
      setChecklists([]);
      return;
    }

    setChecklistsLoading(true);
    setChecklistsError(null);

    try {
      const response =
        await userService.getCustomChecklistsByProperty(
          checklistIds
        );

      const incomingChecklists =
        response?.data?.data;

      setChecklists(
        Array.isArray(incomingChecklists)
          ? incomingChecklists
          : []
      );
    } catch (err) {
      console.error("Failed to load checklists:", err);

      setChecklistsError(
        tSafe(
          "could_not_load_checklists",
          "Could not load checklists."
        )
      );
    } finally {
      setChecklistsLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* PROPERTY FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  const loadProperty = useCallback(async () => {
    if (!propertyId) {
      setError(
        tSafe(
          "no_property_id",
          "No property ID provided."
        )
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await userService.getApartmentById(propertyId);

      const propData = response?.data;

      if (!propData) {
        throw new Error("Property data was empty");
      }

      setProperty(propData);

      if (
        Array.isArray(propData.checklists) &&
        propData.checklists.length > 0
      ) {
        await fetchChecklists(propData.checklists);
      } else {
        setChecklists([]);
      }
    } catch (err) {
      console.error("Failed to load property:", err);

      setError(
        tSafe(
          "unable_to_load_property",
          "Unable to load property details. Please try again."
        )
      );

      Alert.alert(
        tSafe("error_title", "Error"),
        tSafe(
          "failed_to_load_property",
          "Failed to load property details."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId, fetchChecklists]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  /* ------------------------------------------------------------------------ */
  /* MAP                                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const latitude = Number(property?.latitude);
    const longitude = Number(property?.longitude);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      MAP_BOX_SECRET_KEY
    ) {
      const url =
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
        `pin-s+ff0000(${longitude},${latitude})/` +
        `${longitude},${latitude},15,0/400x200` +
        `?access_token=${MAP_BOX_SECRET_KEY}`;

      setMapImageUrl(url);
      setMapError(false);
    } else {
      setMapImageUrl(null);
      setMapError(false);
    }
  }, [property]);

  /* ------------------------------------------------------------------------ */
  /* INVITE STATUS                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const checkInviteStatus = async () => {
      if (!propertyId || !currentUserId) {
        return;
      }

      try {
        const response =
          await userService.getInviteStatus(
            propertyId,
            currentUserId
          );

        if (response?.data?.invite) {
          const invite = response.data.invite;

          setInviteDetails(invite);
          setInviteStatus("pending");
        } else if (!inviteToken) {
          setInviteStatus(null);
        }
      } catch (err) {
        console.log(
          "No pending invite or invite lookup failed:",
          err
        );

        // Preserve deep-link invite state if one exists.
      }
    };

    checkInviteStatus();
  }, [propertyId, currentUserId, inviteToken]);

  /* ------------------------------------------------------------------------ */
  /* ACCEPT INVITE                                                             */
  /* ------------------------------------------------------------------------ */

  const handleAcceptInvite = async () => {
    if (!currentUserId || processingInvite) {
      return;
    }

    setProcessingInvite(true);

    try {
      if (
        inviteDetails &&
        inviteDetails.type === "platform"
      ) {
        await userService.acceptPlatformInvite({
          propertyId,
          cleanerId: currentUserId,
        });
      } else if (
        inviteToken ||
        (inviteDetails && inviteDetails.token)
      ) {
        /*
         * Preserve the existing API behavior.
         *
         * The existing backend contract accepts the propertyId
         * and cleanerId here. The deep-link token is used to
         * establish the invite context.
         */
        await userService.acceptInvite({
          propertyId,
          cleanerId: currentUserId,
        });
      } else {
        throw new Error("No valid invite found");
      }

      setInviteStatus("accepted");

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (err) {
      console.error("Accept invite failed:", err);

      Alert.alert(
        tSafe("error_title", "Error"),
        err?.response?.data?.error ||
          tSafe(
            "failed_to_accept_invitation",
            "Failed to accept invitation."
          )
      );

      setInviteStatus("pending");
    } finally {
      setProcessingInvite(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* DECLINE INVITE                                                            */
  /* ------------------------------------------------------------------------ */

  const handleDeclineInvite = async () => {
    if (!currentUserId || processingInvite) {
      return;
    }

    setProcessingInvite(true);

    try {
      if (
        inviteDetails &&
        inviteDetails.type === "platform"
      ) {
        await userService.declinePlatformInvite({
          inviteId: inviteDetails._id,
          cleanerId: currentUserId,
        });
      } else if (
        inviteToken ||
        (inviteDetails && inviteDetails.token)
      ) {
        const token =
          inviteToken || inviteDetails.token;

        await userService.declineInvite({
          token,
          cleanerId: currentUserId,
        });
      } else {
        throw new Error("No valid invite found");
      }

      setInviteStatus("declined");

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
    } catch (err) {
      console.error("Decline invite failed:", err);

      Alert.alert(
        tSafe("error_title", "Error"),
        err?.response?.data?.error ||
          tSafe(
            "failed_to_decline_invitation",
            "Failed to decline invitation."
          )
      );

      setInviteStatus("pending");
    } finally {
      setProcessingInvite(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* DIRECTIONS                                                                */
  /* ------------------------------------------------------------------------ */

  const openDirections = useCallback(() => {
    const latitude = Number(property?.latitude);
    const longitude = Number(property?.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      Alert.alert(
        tSafe("directions_unavailable", "Directions unavailable"),
        tSafe(
          "property_coordinates_missing",
          "This property does not have valid location coordinates."
        )
      );

      return;
    }

    const url =
      `https://maps.apple.com/?daddr=${latitude},${longitude}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        tSafe("error_title", "Error"),
        tSafe(
          "unable_to_open_maps",
          "Unable to open maps."
        )
      );
    });
  }, [property]);

  /* ------------------------------------------------------------------------ */
  /* CHECKLIST MODAL                                                           */
  /* ------------------------------------------------------------------------ */

  const openChecklistModal = useCallback((checklist) => {
    setSelectedChecklist(checklist);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedChecklist(null);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* STATES                                                                    */
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
            name="home-search-outline"
            size={38}
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
            styles.loadingText,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          {tSafe(
            "loading_property",
            "Loading property..."
          )}
        </AppText>
      </View>
    );
  }

  if (error || !property) {
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
              backgroundColor:
                theme.status.error + "18",
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
            styles.errorTitle,
            {
              color: theme.text.primary,
            },
          ]}
        >
          {tSafe(
            "property_not_found",
            "Property not found"
          )}
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
          {error ||
            tSafe(
              "property_not_found",
              "Property not found"
            )}
        </AppText>

        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.button.primaryBackground,
            },
          ]}
          onPress={loadProperty}
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

  const showInviteBanner =
    inviteStatus === "pending" &&
    Boolean(inviteDetails || inviteToken);

  const roomDetails = Array.isArray(property.roomDetails)
    ? property.roomDetails
    : [];

  const propertyChecklists = Array.isArray(
    property.checklists
  )
    ? property.checklists
    : [];

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: theme.background.default,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {
            backgroundColor: theme.background.default,
          },
        ]}
      >
        {/* ------------------------------------------------------------------ */}
        {/* INVITATION                                                          */}
        {/* ------------------------------------------------------------------ */}

        {showInviteBanner && (
          <InviteBanner
            onAccept={handleAcceptInvite}
            onDecline={handleDeclineInvite}
            processing={processingInvite}
            theme={theme}
          />
        )}

        {inviteStatus === "accepted" && (
          <View
            style={[
              styles.inviteAcceptedCard,
              {
                backgroundColor: theme.status.success + "12",
                borderColor: theme.status.success + "40",
              },
            ]}
          >
            <View
              style={[
                styles.acceptedIcon,
                {
                  backgroundColor:
                    theme.status.success + "18",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={23}
                color={theme.status.success}
              />
            </View>

            <View style={styles.acceptedContent}>
              <AppText
                variant="subtitle"
                style={[
                  styles.acceptedTitle,
                  {
                    color: theme.status.success,
                  },
                ]}
              >
                {tSafe(
                  "invitation_accepted_title",
                  "Invitation Accepted"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.acceptedText,
                  {
                    color: theme.text.secondary,
                  },
                ]}
              >
                {tSafe(
                  "invitation_accepted",
                  "You can now schedule a cleaning."
                )}
              </AppText>
            </View>
          </View>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PROPERTY HERO                                                       */}
        {/* ------------------------------------------------------------------ */}

        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: theme.brand.primary,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconContainer,
                {
                  backgroundColor:
                    "rgba(255,255,255,0.16)",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="home-outline"
                size={29}
                color={theme.text.inverse}
              />
            </View>

            <View style={styles.heroContent}>
              <AppText
                variant="h1"
                style={[
                  styles.propertyName,
                  {
                    color: theme.text.inverse,
                  },
                ]}
                numberOfLines={2}
              >
                {property.apt_name ||
                  tSafe(
                    "property",
                    "Property"
                  )}
              </AppText>

              <View
                style={[
                  styles.propertyTypeBadge,
                  {
                    backgroundColor:
                      "rgba(255,255,255,0.16)",
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.propertyTypeText,
                    {
                      color: theme.text.inverse,
                    },
                  ]}
                >
                  {formatPropertyType(property.apt_type)}
                </AppText>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.heroBottomRow,
              {
                borderTopColor:
                  "rgba(255,255,255,0.15)",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={17}
              color="rgba(255,255,255,0.8)"
            />

            <AppText
              variant="caption"
              style={[
                styles.heroAddress,
                {
                  color: "rgba(255,255,255,0.85)",
                },
              ]}
              numberOfLines={2}
            >
              {property.address ||
                tSafe(
                  "address_not_available",
                  "Address not available"
                )}
            </AppText>
          </View>
        </View>

        {/* ------------------------------------------------------------------ */}
        {/* MAP                                                                 */}
        {/* ------------------------------------------------------------------ */}

        <View
          style={[
            styles.mapCard,
            {
              backgroundColor:
                theme.surface.elevated,
              borderColor: theme.card.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    theme.brand.primaryLight,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="map-outline"
                size={20}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.sectionHeaderContent}>
              <AppText
                variant="h3"
                style={[
                  styles.cardTitle,
                  {
                    color: theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "property_location",
                  "Property Location"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.sectionSubtitle,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "property_location_subtitle",
                  "View location and get directions"
                )}
              </AppText>
            </View>
          </View>

          {mapImageUrl && !mapError ? (
            <Image
              source={{ uri: mapImageUrl }}
              style={styles.mapImage}
              resizeMode="cover"
              onError={() => setMapError(true)}
            />
          ) : (
            <View
              style={[
                styles.mapPlaceholder,
                {
                  backgroundColor:
                    theme.background.sunken,
                  borderColor: theme.border.default,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={38}
                color={theme.icon.muted}
              />

              <AppText
                variant="caption"
                style={[
                  styles.placeholderText,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "map_unavailable",
                  "Map unavailable"
                )}
              </AppText>
            </View>
          )}

          <View
            style={[
              styles.addressRow,
              {
                borderTopColor: theme.divider,
              },
            ]}
          >
            <View
              style={[
                styles.addressIconContainer,
                {
                  backgroundColor:
                    theme.brand.primaryLight,
                },
              ]}
            >
              <MaterialIcons
                name="location-on"
                size={19}
                color={theme.brand.primary}
              />
            </View>

            <AppText
              variant="body"
              style={[
                styles.addressText,
                {
                  color: theme.text.primary,
                },
              ]}
              numberOfLines={3}
            >
              {property.address ||
                tSafe(
                  "address_not_available",
                  "Address not available"
                )}
            </AppText>

            <TouchableOpacity
              style={[
                styles.directionsButton,
                {
                  backgroundColor:
                    theme.surface.selected,
                  borderColor: theme.border.default,
                },
              ]}
              onPress={openDirections}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="navigation-variant-outline"
                size={16}
                color={theme.brand.primary}
              />

              <AppText
                variant="caption"
                style={[
                  styles.directionsText,
                  {
                    color: theme.brand.primary,
                  },
                ]}
              >
                {tSafe(
                  "directions",
                  "Directions"
                )}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ------------------------------------------------------------------ */}
        {/* OWNER CONTACT                                                       */}
        {/* ------------------------------------------------------------------ */}

        <CustomCard
          style={[
            styles.card,
            {
              backgroundColor:
                theme.card.background,
              borderColor: theme.card.border,
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
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={21}
                color={theme.icon.default}
              />
            </View>

            <View style={styles.sectionHeaderContent}>
              <AppText
                variant="h3"
                style={[
                  styles.cardTitle,
                  {
                    color: theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "owner_and_contact",
                  "Owner & Contact"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.sectionSubtitle,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "property_owner_information",
                  "Property owner information"
                )}
              </AppText>
            </View>
          </View>

          <InfoRow
            icon="person-outline"
            label={tSafe("name_label", "Name")}
            value={
              property.owner_info?.firstname ||
              tSafe("na", "N/A")
            }
            theme={theme}
          />

          <InfoRow
            icon="email"
            label={tSafe("email_label", "Email")}
            value={
              property.owner_info?.email ||
              tSafe("na", "N/A")
            }
            theme={theme}
          />

          <InfoRow
            icon="phone"
            label={tSafe("phone_label", "Phone")}
            value={formatPhone(
              property.contact_phone ||
                property.owner_info?.phone
            )}
            theme={theme}
          />
        </CustomCard>

        {/* ------------------------------------------------------------------ */}
        {/* INSTRUCTIONS                                                        */}
        {/* ------------------------------------------------------------------ */}

        {!!property.instructions && (
          <CustomCard
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.card.background,
                borderColor: theme.card.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor:
                      theme.status.warning + "15",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={21}
                  color={theme.status.warning}
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <AppText
                  variant="h3"
                  style={[
                    styles.cardTitle,
                    {
                      color: theme.text.primary,
                    },
                  ]}
                >
                  {tSafe(
                    "special_instructions",
                    "Special Instructions"
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.text.muted,
                    },
                  ]}
                >
                  {tSafe(
                    "important_property_notes",
                    "Important property notes"
                  )}
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.instructionsContainer,
                {
                  backgroundColor:
                    theme.background.sunken,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={19}
                color={theme.status.info}
              />

              <AppText
                variant="body"
                style={[
                  styles.instructionsText,
                  {
                    color: theme.text.secondary,
                  },
                ]}
              >
                {property.instructions}
              </AppText>
            </View>
          </CustomCard>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CHECKLISTS                                                          */}
        {/* ------------------------------------------------------------------ */}

        {propertyChecklists.length > 0 && (
          <CustomCard
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.card.background,
                borderColor: theme.card.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor:
                      theme.brand.primaryLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={21}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <AppText
                  variant="h3"
                  style={[
                    styles.cardTitle,
                    {
                      color: theme.text.primary,
                    },
                  ]}
                >
                  {tSafe(
                    "cleaning_checklists",
                    "Cleaning Checklists"
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.text.muted,
                    },
                  ]}
                >
                  {checklists.length}{" "}
                  {checklists.length === 1
                    ? tSafe(
                        "checklist",
                        "checklist"
                      )
                    : tSafe(
                        "checklists",
                        "checklists"
                      )}
                </AppText>
              </View>

              {checklistsLoading && (
                <ActivityIndicator
                  size="small"
                  color={theme.brand.primary}
                />
              )}
            </View>

            {checklistsError ? (
              <View
                style={[
                  styles.inlineError,
                  {
                    backgroundColor:
                      theme.status.error + "10",
                    borderColor:
                      theme.status.error + "30",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={19}
                  color={theme.status.error}
                />

                <AppText
                  variant="caption"
                  style={[
                    styles.inlineErrorText,
                    {
                      color: theme.status.error,
                    },
                  ]}
                >
                  {checklistsError}
                </AppText>
              </View>
            ) : checklists.length === 0 &&
              !checklistsLoading ? (
              <AppText
                variant="body"
                style={[
                  styles.emptyText,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "no_checklists_found",
                  "No checklists found."
                )}
              </AppText>
            ) : (
              <View style={styles.checklistList}>
                {checklists.map((checklist, index) => (
                  <ChecklistItem
                    key={
                      checklist?._id ||
                      `checklist-${index}`
                    }
                    checklist={checklist}
                    onPress={() =>
                      openChecklistModal(checklist)
                    }
                    theme={theme}
                  />
                ))}
              </View>
            )}
          </CustomCard>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* ROOM DETAILS                                                        */}
        {/* ------------------------------------------------------------------ */}

        <CustomCard
          style={[
            styles.card,
            {
              backgroundColor:
                theme.card.background,
              borderColor: theme.card.border,
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
                },
              ]}
            >
              <MaterialCommunityIcons
                name="floor-plan"
                size={21}
                color={theme.icon.default}
              />
            </View>

            <View style={styles.sectionHeaderContent}>
              <AppText
                variant="h3"
                style={[
                  styles.cardTitle,
                  {
                    color: theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "room_details",
                  "Room Details"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.sectionSubtitle,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {roomDetails.length}{" "}
                {roomDetails.length === 1
                  ? tSafe("room", "room")
                  : tSafe("rooms", "rooms")}
              </AppText>
            </View>
          </View>

          {roomDetails.length > 0 ? (
            <View style={styles.roomGrid}>
              {roomDetails.map((room, index) => (
                <RoomCard
                  key={
                    room?._id ||
                    `${room?.type || "room"}-${index}`
                  }
                  room={room}
                  theme={theme}
                />
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.noRoomsContainer,
                {
                  backgroundColor:
                    theme.background.sunken,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="floor-plan"
                size={28}
                color={theme.icon.muted}
              />

              <AppText
                variant="caption"
                style={[
                  styles.emptyText,
                  {
                    color: theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "no_room_details",
                  "No room details available."
                )}
              </AppText>
            </View>
          )}
        </CustomCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* -------------------------------------------------------------------- */}
      {/* CHECKLIST DETAILS MODAL                                              */}
      {/* -------------------------------------------------------------------- */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: theme.overlay,
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor:
                  theme.background.default,
              },
            ]}
          >
            {/* Modal Header */}

            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: theme.divider,
                },
              ]}
            >
              <View style={styles.modalHeaderContent}>
                <View
                  style={[
                    styles.modalHeaderIcon,
                    {
                      backgroundColor:
                        theme.brand.primaryLight,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clipboard-list-outline"
                    size={22}
                    color={theme.brand.primary}
                  />
                </View>

                <View style={styles.modalTitleContainer}>
                  <AppText
                    variant="h2"
                    style={[
                      styles.modalTitle,
                      {
                        color: theme.text.primary,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {selectedChecklist?.checklistName ||
                      tSafe(
                        "checklist_details",
                        "Checklist Details"
                      )}
                  </AppText>

                  <AppText
                    variant="caption"
                    style={[
                      styles.modalSubtitle,
                      {
                        color: theme.text.muted,
                      },
                    ]}
                  >
                    {tSafe(
                      "checklist_overview",
                      "Checklist overview"
                    )}
                  </AppText>
                </View>
              </View>

              <TouchableOpacity
                onPress={closeModal}
                style={[
                  styles.modalCloseButton,
                  {
                    backgroundColor:
                      theme.surface.selected,
                  },
                ]}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="close"
                  size={22}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={
                styles.modalScrollContent
              }
              showsVerticalScrollIndicator={false}
            >
              {selectedChecklist && (
                <>
                  {/* Summary */}

                  <View style={styles.modalSummaryRow}>
                    <View
                      style={[
                        styles.modalSummaryCard,
                        {
                          backgroundColor:
                            theme.surface.selected,
                          borderColor:
                            theme.border.default,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={21}
                        color={theme.brand.primary}
                      />

                      <AppText
                        variant="caption"
                        style={[
                          styles.modalSummaryLabel,
                          {
                            color: theme.text.muted,
                          },
                        ]}
                      >
                        {tSafe(
                          "total_time_label",
                          "Total Time"
                        )}
                      </AppText>

                      <AppText
                        variant="h3"
                        style={[
                          styles.modalSummaryValue,
                          {
                            color: theme.text.primary,
                          },
                        ]}
                      >
                        {selectedChecklist.totalTime || 0}{" "}
                        {tSafe(
                          "minutes_abbr",
                          "min"
                        )}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.modalSummaryCard,
                        {
                          backgroundColor:
                            theme.status.success +
                            "10",
                          borderColor:
                            theme.status.success +
                            "30",
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={21}
                        color={
                          theme.status.success
                        }
                      />

                      <AppText
                        variant="caption"
                        style={[
                          styles.modalSummaryLabel,
                          {
                            color: theme.text.muted,
                          },
                        ]}
                      >
                        {tSafe(
                          "total_fee_label",
                          "Total Fee"
                        )}
                      </AppText>

                      <AppText
                        variant="h3"
                        style={[
                          styles.modalSummaryValue,
                          {
                            color:
                              theme.status.success,
                          },
                        ]}
                      >
                        {formatCurrency(
                          selectedChecklist.totalFee
                        )}
                      </AppText>
                    </View>
                  </View>

                  {/* Group A Details */}

                  {selectedChecklist.checklist?.group_a
                    ?.details &&
                    Object.entries(
                      selectedChecklist.checklist.group_a
                        .details
                    ).map(([roomKey, room]) => {
                      if (!room) {
                        return null;
                      }

                      return (
                        <View
                          key={roomKey}
                          style={[
                            styles.modalRoomSection,
                            {
                              backgroundColor:
                                theme.surface.elevated,
                              borderColor:
                                theme.border.default,
                            },
                          ]}
                        >
                          <View
                            style={
                              styles.modalRoomHeader
                            }
                          >
                            <View
                              style={[
                                styles.modalRoomIcon,
                                {
                                  backgroundColor:
                                    theme.brand
                                      .primaryLight,
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={getRoomIcon(
                                  roomKey
                                )}
                                size={19}
                                color={
                                  theme.brand.primary
                                }
                              />
                            </View>

                            <View
                              style={
                                styles.modalRoomHeaderText
                              }
                            >
                              <AppText
                                variant="subtitle"
                                style={[
                                  styles.modalRoomTitle,
                                  {
                                    color:
                                      theme.text
                                        .primary,
                                  },
                                ]}
                              >
                                {getRoomDisplayName(
                                  roomKey
                                )}
                              </AppText>

                              <AppText
                                variant="caption"
                                style={[
                                  styles.modalTaskCount,
                                  {
                                    color:
                                      theme.text
                                        .muted,
                                  },
                                ]}
                              >
                                {countTasksInRoom(
                                  room
                                )}{" "}
                                {tSafe(
                                  "tasks",
                                  "tasks"
                                )}
                              </AppText>
                            </View>
                          </View>

                          {/* Tasks */}

                          {Array.isArray(
                            room.tasks
                          ) &&
                          room.tasks.length > 0 ? (
                            <View
                              style={
                                styles.tasksGrid
                              }
                            >
                              {room.tasks.map(
                                (task, idx) => {
                                  const completed =
                                    Boolean(
                                      task?.value
                                    );

                                  return (
                                    <View
                                      key={
                                        task?._id ||
                                        `${roomKey}-task-${idx}`
                                      }
                                      style={[
                                        styles.modalTaskItem,
                                        {
                                          backgroundColor:
                                            completed
                                              ? theme
                                                  .status
                                                  .success +
                                                "0D"
                                              : theme
                                                  .background
                                                  .sunken,
                                          borderColor:
                                            completed
                                              ? theme
                                                  .status
                                                  .success +
                                                "25"
                                              : theme
                                                  .border
                                                  .default,
                                        },
                                      ]}
                                    >
                                      <MaterialCommunityIcons
                                        name={
                                          completed
                                            ? "check-circle"
                                            : "checkbox-blank-circle-outline"
                                        }
                                        size={15}
                                        color={
                                          completed
                                            ? theme
                                                .status
                                                .success
                                            : theme
                                                .icon
                                                .muted
                                        }
                                      />

                                      <AppText
                                        variant="caption"
                                        style={[
                                          styles.modalTaskText,
                                          {
                                            color:
                                              completed
                                                ? theme
                                                    .text
                                                    .muted
                                                : theme
                                                    .text
                                                    .secondary,
                                          },
                                          completed &&
                                            styles.modalTaskCompleted,
                                        ]}
                                      >
                                        {task?.label ||
                                          tSafe(
                                            "task",
                                            "Task"
                                          )}
                                      </AppText>
                                    </View>
                                  );
                                }
                              )}
                            </View>
                          ) : (
                            <AppText
                              variant="caption"
                              style={[
                                styles.noTasksText,
                                {
                                  color:
                                    theme.text
                                      .muted,
                                },
                              ]}
                            >
                              {tSafe(
                                "no_tasks",
                                "No tasks listed."
                              )}
                            </AppText>
                          )}

                          {/* Notes */}

                          {!!room.notes?.text && (
                            <View
                              style={[
                                styles.modalNotes,
                                {
                                  backgroundColor:
                                    theme.status
                                      .info + "0D",
                                  borderColor:
                                    theme.status
                                      .info + "25",
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="note-text-outline"
                                size={17}
                                color={
                                  theme.status.info
                                }
                              />

                              <AppText
                                variant="caption"
                                style={[
                                  styles.modalNotesText,
                                  {
                                    color:
                                      theme.text
                                        .secondary,
                                  },
                                ]}
                              >
                                {room.notes.text}
                              </AppText>
                            </View>
                          )}
                        </View>
                      );
                    })}

                  {/* Extra Tasks */}

                  {selectedChecklist.checklist?.group_a
                    ?.details?.Extra && (
                    <View
                      style={[
                        styles.modalRoomSection,
                        {
                          backgroundColor:
                            theme.surface.elevated,
                          borderColor:
                            theme.border.default,
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.modalRoomHeader
                        }
                      >
                        <View
                          style={[
                            styles.modalRoomIcon,
                            {
                              backgroundColor:
                                theme.status.warning +
                                "15",
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="star-outline"
                            size={19}
                            color={
                              theme.status.warning
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.modalRoomHeaderText
                          }
                        >
                          <AppText
                            variant="subtitle"
                            style={[
                              styles.modalRoomTitle,
                              {
                                color:
                                  theme.text
                                    .primary,
                              },
                            ]}
                          >
                            {tSafe(
                              "extra_tasks",
                              "Extra Tasks"
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={[
                              styles.modalTaskCount,
                              {
                                color:
                                  theme.text
                                    .muted,
                              },
                            ]}
                          >
                            {Array.isArray(
                              selectedChecklist
                                .checklist.group_a
                                .details.Extra.tasks
                            )
                              ? selectedChecklist
                                  .checklist
                                  .group_a
                                  .details
                                  .Extra
                                  .tasks.length
                              : 0}{" "}
                            {tSafe(
                              "tasks",
                              "tasks"
                            )}
                          </AppText>
                        </View>
                      </View>

                      <View
                        style={
                          styles.tasksGrid
                        }
                      >
                        {selectedChecklist.checklist.group_a.details.Extra.tasks?.map(
                          (task, idx) => {
                            const completed =
                              Boolean(task?.value);

                            return (
                              <View
                                key={
                                  task?._id ||
                                  `extra-task-${idx}`
                                }
                                style={[
                                  styles.modalTaskItem,
                                  {
                                    width: "100%",
                                    backgroundColor:
                                      completed
                                        ? theme
                                            .status
                                            .success +
                                          "0D"
                                        : theme
                                            .background
                                            .sunken,
                                    borderColor:
                                      completed
                                        ? theme
                                            .status
                                            .success +
                                          "25"
                                        : theme
                                            .border
                                            .default,
                                  },
                                ]}
                              >
                                <MaterialCommunityIcons
                                  name={
                                    completed
                                      ? "check-circle"
                                      : "checkbox-blank-circle-outline"
                                  }
                                  size={16}
                                  color={
                                    completed
                                      ? theme
                                          .status
                                          .success
                                      : theme
                                          .icon
                                          .muted
                                  }
                                />

                                <AppText
                                  variant="caption"
                                  style={[
                                    styles.modalTaskText,
                                    {
                                      color:
                                        completed
                                          ? theme
                                              .text
                                              .muted
                                          : theme
                                              .text
                                              .secondary,
                                    },
                                    completed &&
                                      styles.modalTaskCompleted,
                                  ]}
                                >
                                  {task?.label ||
                                    tSafe(
                                      "task",
                                      "Task"
                                    )}

                                  {!!task?.time &&
                                    ` • ${task.time} ${tSafe(
                                      "minutes_abbr",
                                      "min"
                                    )}`}

                                  {!!task?.price &&
                                    ` • +${formatCurrency(
                                      task.price
                                    )}`}
                                </AppText>
                              </View>
                            );
                          }
                        )}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}

            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: theme.divider,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.modalDoneButton,
                  {
                    backgroundColor:
                      theme.button.primaryBackground,
                  },
                ]}
                onPress={closeModal}
                activeOpacity={0.85}
              >
                <AppText
                  variant="body"
                  style={[
                    styles.modalDoneText,
                    {
                      color:
                        theme.button.primaryText,
                    },
                  ]}
                >
                  {tSafe("done", "Done")}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                      */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },

  /* ------------------------------ STATES --------------------------------- */

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  stateIconContainer: {
    width: 82,
    height: 82,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIndicator: {
    marginTop: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
  },

  errorTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 330,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 15,
  },

  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* ------------------------------- INVITE -------------------------------- */

  inviteCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    marginBottom: 14,
  },

  inviteHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  inviteIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  inviteHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },

  inviteTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  inviteSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  inviteText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
  },

  inviteButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 17,
  },

  acceptBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  acceptText: {
    fontSize: 14,
    fontWeight: "700",
  },

  declineBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  declineText: {
    fontSize: 14,
    fontWeight: "700",
  },

  disabledBtn: {
    opacity: 0.55,
  },

  inviteAcceptedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 14,
  },

  acceptedIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  acceptedContent: {
    flex: 1,
    marginLeft: 11,
  },

  acceptedTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  acceptedText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },

  /* ------------------------------ HERO ----------------------------------- */

  headerCard: {
    borderRadius: 23,
    padding: 19,
    marginBottom: 14,
    overflow: "hidden",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    flex: 1,
    marginLeft: 14,
  },

  propertyName: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
  },

  propertyTypeBadge: {
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  propertyTypeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  heroBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
  },

  heroAddress: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 18,
  },

  /* ------------------------------ CARDS ---------------------------------- */

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },

  mapCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
  },

  /* ------------------------------- MAP ----------------------------------- */

  mapImage: {
    width: "100%",
    height: 165,
  },

  mapPlaceholder: {
    width: "100%",
    height: 165,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    marginTop: 7,
    fontSize: 12,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderTopWidth: 1,
  },

  addressIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  addressText: {
    flex: 1,
    marginHorizontal: 9,
    fontSize: 13,
    lineHeight: 19,
  },

  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
  },

  directionsText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* ---------------------------- INFO ROW --------------------------------- */

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  infoIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  infoValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
  },

  /* --------------------------- INSTRUCTIONS ------------------------------ */

  instructionsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },

  instructionsText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    lineHeight: 21,
  },

  /* ----------------------------- CHECKLISTS ------------------------------- */

  checklistList: {
    gap: 9,
  },

  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
    padding: 11,
  },

  checklistIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  checklistInfo: {
    flex: 1,
    marginLeft: 11,
  },

  checklistName: {
    fontSize: 14,
    fontWeight: "700",
  },

  checklistMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 14,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  checklistMeta: {
    fontSize: 11,
  },

  inlineError: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
  },

  inlineErrorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 18,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    paddingVertical: 10,
  },

  /* ----------------------------- ROOMS ----------------------------------- */

  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  roomGridItem: {
    width: "48.5%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    alignItems: "center",
  },

  roomIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  roomType: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  roomStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  roomCount: {
    fontSize: 11,
  },

  roomSeparator: {
    marginHorizontal: 4,
    fontSize: 11,
  },

  roomSize: {
    fontSize: 11,
  },

  roomSizeRange: {
    marginTop: 3,
    fontSize: 10,
    textAlign: "center",
  },

  noRoomsContainer: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ------------------------------ MODAL ---------------------------------- */

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContent: {
    height: "91%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },

  modalHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  modalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitleContainer: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 8,
  },

  modalTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },

  modalSubtitle: {
    marginTop: 2,
    fontSize: 11,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    flex: 1,
  },

  modalScrollContent: {
    padding: 16,
    paddingBottom: 20,
  },

  modalSummaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  modalSummaryCard: {
    flex: 1,
    minHeight: 105,
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
  },

  modalSummaryLabel: {
    marginTop: 8,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  modalSummaryValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
  },

  modalRoomSection: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    marginBottom: 12,
  },

  modalRoomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  modalRoomIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalRoomHeaderText: {
    flex: 1,
    marginLeft: 9,
  },

  modalRoomTitle: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  modalTaskCount: {
    marginTop: 2,
    fontSize: 10,
  },

  tasksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  modalTaskItem: {
    width: "48%",
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },

  modalTaskText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 11,
    lineHeight: 16,
  },

  modalTaskCompleted: {
    textDecorationLine: "line-through",
  },

  noTasksText: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 7,
  },

  modalNotes: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 11,
    padding: 10,
    marginTop: 10,
  },

  modalNotesText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 17,
  },

  modalFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
  },

  modalDoneButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  modalDoneText: {
    fontSize: 14,
    fontWeight: "800",
  },

  bottomSpacer: {
    height: 10,
  },
});