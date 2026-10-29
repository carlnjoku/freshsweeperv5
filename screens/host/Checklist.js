import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";

import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

import {
  ActivityIndicator,
  FAB,
  Avatar,
} from "react-native-paper";

import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";

import {
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";

import userService from "../../services/connection/userService";
import { AuthContext } from "../../context/AuthContext";
import ROUTES from "../../constants/routes";
import Toast from "react-native-toast-message";
import { tSafe } from "../../utils/tSafe";

import { useTheme } from "../../theme";
import AppText from "../../ui/AppText";
import AppCard from "../../ui/AppCard";
import AppButton from "../../ui/AppButton";

const { width } = Dimensions.get("window");

/*
 * ================================================================
 * HELPERS
 * ================================================================
 */

const withAlpha = (color, alpha, fallback) => {
  if (
    typeof color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};

const getShadow = (theme) => ({
  shadowColor: theme.shadow.color,

  shadowOpacity: theme.shadow.opacity,

  shadowOffset: {
    width: 0,
    height: 2,
  },

  shadowRadius: 8,

  elevation: 2,
});

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const formatCurrency = (value, decimals = 2) => {
  return `$${safeNumber(value).toFixed(decimals)}`;
};

/*
 * ================================================================
 * COMPONENT
 * ================================================================
 */

export default function Checklist() {
  const {
    currentUserId,
    currentUser,
    userToken,
    logout,
  } = useContext(AuthContext);

  const navigation = useNavigation();
  const route = useRoute();

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

  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [
    selectedChecklistForModal,
    setSelectedChecklistForModal,
  ] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [
    deletingChecklistId,
    setDeletingChecklistId,
  ] = useState(null);

  const alertShownRef = useRef(false);

  /*
   * ==============================================================
   * CHECKLIST MODAL
   * ==============================================================
   */

  const openChecklistModal = useCallback((checklist) => {
    setSelectedChecklistForModal(checklist);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedChecklistForModal(null);
  }, []);

  /*
   * ==============================================================
   * ROUTE REFRESH / LEGACY ALERT
   * ==============================================================
   */

  useFocusEffect(
    useCallback(() => {
      const {
        status,
        message,
        refresh,
      } = route.params || {};

      if (refresh) {
        fetchChecklists();

        navigation.setParams({
          refresh: undefined,
        });

        return undefined;
      }

      if (
        status === "success" &&
        message &&
        !alertShownRef.current
      ) {
        alertShownRef.current = true;

        Alert.alert(
          tSafe(
            "delete_checklist_title",
            "Delete Checklist"
          ),
          message,
          [
            {
              text: tSafe("ok", "OK"),
              onPress: () => {
                navigation.setParams({
                  status: undefined,
                  mode: undefined,
                  message: undefined,
                });

                alertShownRef.current = false;
              },
            },
          ],
          {
            cancelable: true,
          }
        );
      }

      return () => {
        alertShownRef.current = false;
      };
    }, [route.params, navigation])
  );

  /*
   * ==============================================================
   * INITIAL FETCH
   * ==============================================================
   */

  useEffect(() => {
    fetchChecklists();
  }, []);

  /*
   * ==============================================================
   * FORMATTERS
   * ==============================================================
   */

  const formatRoomLabel = (roomKey) => {
    if (!roomKey) {
      return tSafe("room", "Room");
    }

    const parts = String(roomKey).split("_");

    const roomType = parts[0] || "Room";
    const roomNumber = parts[1];

    const formattedType =
      roomType.charAt(0).toUpperCase() +
      roomType.slice(1);

    if (roomNumber !== undefined) {
      const parsedNumber = parseInt(roomNumber, 10);

      if (Number.isFinite(parsedNumber)) {
        return `${formattedType} ${parsedNumber + 1}`;
      }
    }

    return formattedType;
  };

  const formatDuration = (minutes) => {
    const numericMinutes = safeNumber(minutes);

    const totalMinutes = Math.max(
      0,
      Math.round(numericMinutes)
    );

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return `${hours}h : ${String(mins).padStart(2, "0")}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return tSafe("na", "N/A");
    }

    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return tSafe(
          "invalid_date",
          "Invalid Date"
        );
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return tSafe(
        "invalid_date",
        "Invalid Date"
      );
    }
  };

  /*
   * ==============================================================
   * FETCH
   * ==============================================================
   */

  const fetchChecklists = async () => {
    if (!currentUserId) {
      setChecklists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Fetching checklists for user:",
        currentUserId
      );

      const res =
        await userService.getChecklists(
          currentUserId
        );

      let checklistsData = [];

      if (res?.data) {
        if (Array.isArray(res.data)) {
          checklistsData = res.data;
        } else if (Array.isArray(res)) {
          checklistsData = res;
        }
      }

      const sortedChecklists = [
        ...checklistsData,
      ].sort((a, b) => {
        if (a?.createdAt && b?.createdAt) {
          const aDate =
            new Date(a.createdAt).getTime();

          const bDate =
            new Date(b.createdAt).getTime();

          if (
            Number.isFinite(aDate) &&
            Number.isFinite(bDate)
          ) {
            return bDate - aDate;
          }
        }

        return String(
          b?._id || ""
        ).localeCompare(
          String(a?._id || "")
        );
      });

      setChecklists(sortedChecklists);
    } catch (err) {
      console.error(
        "Failed to fetch checklists:",
        err
      );

      Toast.show({
        type: "error",
        text1: tSafe(
          "failed_load_checklists",
          "Failed to load checklists"
        ),
        text2:
          err?.response?.data?.message ||
          err?.message ||
          tSafe(
            "please_try_again",
            "Please try again"
          ),
      });

      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==============================================================
   * REFRESH
   * ==============================================================
   */

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchChecklists();
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * ==============================================================
   * NAVIGATION
   * ==============================================================
   */

  const handleEditChecklist = (checklist) => {
    if (!checklist?._id) {
      return;
    }

    navigation.navigate(
      ROUTES.host_edit_checklist,
      {
        checklistId: checklist._id,
        onChecklistUpdated: fetchChecklists,
      }
    );
  };

  const handleCreateChecklist = () => {
    navigation.navigate(
      ROUTES.host_create_checklist,
      {
        onChecklistCreated: fetchChecklists,
      }
    );
  };

  /*
   * ==============================================================
   * DUPLICATE
   * ==============================================================
   */

  const handleDuplicateChecklist = async (
    checklist
  ) => {
    if (!checklist) {
      return;
    }

    try {
      const duplicateData = {
        ...checklist,

        checklistName: `${
          checklist.checklistName ||
          tSafe(
            "unnamed_checklist",
            "Unnamed Checklist"
          )
        } (${tSafe(
          "copy_suffix",
          "Copy"
        )})`,

        apt_name:
          checklist.apartment_name,

        hostId: currentUserId,
      };

      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      const res =
        await userService.saveChecklist(
          duplicateData,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

      if (res?.status === 200) {
        Alert.alert(
          tSafe(
            "checklist_duplicated_title",
            "Checklist duplicated"
          ),
          tSafe(
            "checklist_duplicated_message",
            "A copy has been created"
          ),
          [
            {
              text: tSafe("ok", "OK"),
              onPress: fetchChecklists,
            },
          ]
        );
      } else {
        throw new Error(
          `Server returned status: ${res?.status}`
        );
      }
    } catch (err) {
      console.error(
        "Failed to duplicate checklist:",
        err
      );

      Alert.alert(
        tSafe(
          "duplicate_failed_title",
          "Duplicate failed"
        ),
        tSafe(
          "duplicate_failed_message",
          "Unable to duplicate this checklist. Please try again."
        ),
        [
          {
            text: tSafe("ok", "OK"),
          },
        ]
      );
    }
  };

  /*
   * ==============================================================
   * UNAUTHORIZED
   * ==============================================================
   */

  const handleUnauthorized = () => {
    Alert.alert(
      tSafe(
        "session_expired_title",
        "Session Expired"
      ),
      tSafe(
        "please_login_again",
        "Please log in again."
      ),
      [
        {
          text: tSafe("ok", "OK"),
          onPress: () => {
            logout();

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: ROUTES.signin,
                },
              ],
            });
          },
        },
      ],
      {
        cancelable: false,
      }
    );
  };

  /*
   * ==============================================================
   * DELETE
   * ==============================================================
   */

  const handleDeleteChecklist = (
    checklistName,
    selectedChecklistId
  ) => {
    if (!selectedChecklistId) {
      return;
    }

    Alert.alert(
      tSafe(
        "delete_checklist_title",
        "Delete Checklist"
      ),
      tSafe(
        "delete_checklist_confirm",
        'Are you sure you want to delete "{name}"? This action cannot be undone.',
        {
          name:
            checklistName ||
            tSafe(
              "unnamed_checklist",
              "Unnamed Checklist"
            ),
        }
      ),
      [
        {
          text: tSafe("cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: tSafe("delete", "Delete"),
          style: "destructive",

          onPress: async () => {
            try {
              if (!userToken) {
                handleUnauthorized();
                return;
              }

              setDeletingChecklistId(
                selectedChecklistId
              );

              const res =
                await userService.deleteChecklist(
                  selectedChecklistId,
                  userToken
                );

              if (
                res?.status === 200 ||
                res?.data?.status ===
                  "success"
              ) {
                Toast.show({
                  type: "success",
                  text1: tSafe(
                    "success_title",
                    "Success"
                  ),
                  text2: tSafe(
                    "checklist_deleted_success",
                    "Checklist has been removed successfully."
                  ),
                });

                setChecklists(
                  (previous) =>
                    previous.filter(
                      (item) =>
                        item._id !==
                        selectedChecklistId
                    )
                );

                return;
              }

              throw new Error(
                `Server returned status: ${res?.status}`
              );
            } catch (err) {
              console.error(
                "Delete error:",
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
                  "please_try_again",
                  "Please try again"
                );

              if (err?.response) {
                const {
                  status,
                  data,
                } = err.response;

                if (status === 404) {
                  errorMessage = tSafe(
                    "checklist_not_found",
                    "Checklist not found. It may have already been deleted."
                  );
                } else if (
                  status === 403
                ) {
                  errorMessage = tSafe(
                    "not_authorized_delete",
                    "You are not authorized to delete this checklist."
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
              } else if (err?.request) {
                errorMessage = tSafe(
                  "network_error",
                  "Network error. Please check your connection."
                );
              } else if (err?.message) {
                errorMessage =
                  err.message;
              }

              Toast.show({
                type: "error",
                text1: tSafe(
                  "failed_delete_checklist",
                  "Failed to delete checklist"
                ),
                text2: errorMessage,
              });
            } finally {
              setDeletingChecklistId(null);
            }
          },
        },
      ]
    );
  };

  /*
   * ==============================================================
   * STATS
   * ==============================================================
   */

  const getChecklistStats = (checklist) => {
    const checklistData =
      checklist?.checklist || {};

    const groups =
      Object.keys(checklistData);

    let totalTasks = 0;

    const totalTime = safeNumber(
      checklist?.totalTime
    );

    const totalFee = safeNumber(
      checklist?.totalFee
    );

    groups.forEach((groupKey) => {
      const group =
        checklistData[groupKey];

      if (group?.details) {
        const roomTypes =
          Object.keys(group.details);

        roomTypes.forEach(
          (roomType) => {
            const room =
              group.details[roomType];

            if (
              Array.isArray(
                room?.tasks
              )
            ) {
              totalTasks +=
                room.tasks.length;
            }
          }
        );
      }
    });

    return {
      groups: groups.length,
      totalTasks,
      totalTime,
      totalFee,
    };
  };

  /*
   * ==============================================================
   * FILTERING
   * ==============================================================
   */

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredChecklists =
    normalizedSearch === ""
      ? checklists
      : checklists.filter(
          (checklist) =>
            String(
              checklist?.checklistName ||
                ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            String(
              checklist?.apartment_name ||
                ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        );

  /*
   * ==============================================================
   * CHECKLIST CARD
   * ==============================================================
   */

  const renderChecklistItem = ({
    item: checklist,
  }) => {
    const stats =
      getChecklistStats(checklist);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.cardWrapper}
      >
        <AppCard
          variant="default"
          style={styles.card}
        >
          <View
            style={styles.cardContent}
          >
            {/* HEADER */}

            <View
              style={styles.cardHeader}
            >
              <View
                style={
                  styles.checklistIconContainer
                }
              >
                <MaterialIcons
                  name="checklist-rtl"
                  size={24}
                  color={
                    theme.text.inverse
                  }
                />
              </View>

              <View
                style={
                  styles.checklistInfo
                }
              >
                <AppText
                  style={
                    styles.cardTitle
                  }
                  numberOfLines={1}
                >
                  {checklist?.checklistName ||
                    tSafe(
                      "unnamed_checklist",
                      "Unnamed Checklist"
                    )}
                </AppText>

                <View
                  style={
                    styles.propertyBadge
                  }
                >
                  <Ionicons
                    name="business-outline"
                    size={13}
                    color={
                      theme.icon.muted
                    }
                  />

                  <AppText
                    variant="caption"
                    color="secondary"
                    style={
                      styles.propertyText
                    }
                    numberOfLines={1}
                  >
                    {checklist?.propertyId
                      ? checklist
                          ?.apartment_name ||
                        tSafe(
                          "no_property_name",
                          "Property"
                        )
                      : tSafe(
                          "no_property",
                          "No Property"
                        )}
                  </AppText>
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.deleteIconButton
                }
                onPress={() =>
                  handleDeleteChecklist(
                    checklist?.checklistName,
                    checklist?._id
                  )
                }
                activeOpacity={0.7}
                disabled={
                  deletingChecklistId ===
                  checklist?._id
                }
              >
                {deletingChecklistId ===
                checklist?._id ? (
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

            {/* STATS */}

            <View
              style={
                styles.statsContainer
              }
            >
              <View
                style={
                  styles.statItem
                }
              >
                <AppText
                  style={
                    styles.statValue
                  }
                >
                  {stats.groups}
                </AppText>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.statLabel
                  }
                >
                  {tSafe(
                    "teams",
                    "Teams"
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={
                  styles.statItem
                }
              >
                <AppText
                  style={
                    styles.statValue
                  }
                >
                  {stats.totalTasks}
                </AppText>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.statLabel
                  }
                >
                  {tSafe(
                    "tasks",
                    "Tasks"
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={
                  styles.statItem
                }
              >
                <AppText
                  style={
                    styles.statValue
                  }
                >
                  {formatDuration(
                    stats.totalTime
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.statLabel
                  }
                >
                  {tSafe(
                    "time",
                    "Time"
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={
                  styles.statItem
                }
              >
                <AppText
                  style={
                    styles.statValue
                  }
                >
                  {formatCurrency(
                    stats.totalFee,
                    0
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.statLabel
                  }
                >
                  {tSafe(
                    "total",
                    "Total"
                  )}
                </AppText>
              </View>
            </View>

            {/* FOOTER */}

            <View
              style={styles.footer}
            >
              <View
                style={
                  styles.dateContainer
                }
              >
                <Feather
                  name="calendar"
                  size={14}
                  color={
                    theme.icon.muted
                  }
                />

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.dateText
                  }
                >
                  {formatDate(
                    checklist?.createdAt
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.actionButtons
                }
              >
                <TouchableOpacity
                  style={
                    styles.viewButton
                  }
                  onPress={(event) => {
                    event?.stopPropagation?.();

                    openChecklistModal(
                      checklist
                    );
                  }}
                  activeOpacity={0.75}
                >
                  <Feather
                    name="eye"
                    size={16}
                    color={
                      theme.status.info
                    }
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.viewButtonText
                    }
                  >
                    {tSafe(
                      "view",
                      "View"
                    )}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.editButton
                  }
                  onPress={(event) => {
                    event?.stopPropagation?.();

                    handleEditChecklist(
                      checklist
                    );
                  }}
                  activeOpacity={0.75}
                >
                  <Feather
                    name="edit-2"
                    size={16}
                    color={
                      theme.button
                        .primaryText
                    }
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.editButtonText
                    }
                  >
                    {tSafe(
                      "edit",
                      "Edit"
                    )}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  /*
   * ==============================================================
   * HEADER
   * ==============================================================
   */

  const renderHeader = () => {
    const totalTasks =
      checklists.reduce(
        (total, checklist) =>
          total +
          getChecklistStats(
            checklist
          ).totalTasks,
        0
      );

    const totalValue =
      checklists.reduce(
        (total, checklist) =>
          total +
          safeNumber(
            checklist?.totalFee
          ),
        0
      );

    return (
      <View style={styles.header}>
        <View
          style={styles.headerTop}
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <AppText
              variant="h3"
              style={
                styles.headerTitle
              }
            >
              {tSafe(
                "checklists_title",
                "Checklists"
              )}
            </AppText>

            <AppText
              variant="body2"
              color="secondary"
              style={
                styles.headerSubtitle
              }
            >
              {tSafe(
                "manage_cleaning_protocols",
                "Manage cleaning protocols"
              )}
            </AppText>
          </View>

          {currentUser?.avatar ? (
            <Avatar.Image
              size={46}
              source={{
                uri: currentUser.avatar,
              }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={46}
              icon="account"
              color={
                theme.text.inverse
              }
              style={
                styles.avatarFallback
              }
            />
          )}
        </View>

        {/* SEARCH */}

        <View
          style={
            styles.searchContainer
          }
        >
          <Feather
            name="search"
            size={20}
            color={
              theme.icon.muted
            }
            style={
              styles.searchIcon
            }
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder={tSafe(
              "search_checklists",
              "Search checklists..."
            )}
            placeholderTextColor={
              theme.input.placeholder
            }
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            selectionColor={
              theme.input.focus
            }
            cursorColor={
              theme.input.focus
            }
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchQuery("")
              }
              style={
                styles.clearSearchButton
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  theme.icon.muted
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* SUMMARY */}

        <View
          style={styles.statsBar}
        >
          <View
            style={styles.statBox}
          >
            <AppText
              style={
                styles.statNumber
              }
            >
              {checklists.length}
            </AppText>

            <AppText
              variant="caption"
              color="secondary"
              style={
                styles.statLabel
              }
            >
              {tSafe(
                "total_checklists",
                "Total Checklists"
              )}
            </AppText>
          </View>

          <View
            style={
              styles.statDividerVertical
            }
          />

          <View
            style={styles.statBox}
          >
            <AppText
              style={
                styles.statNumber
              }
            >
              {totalTasks}
            </AppText>

            <AppText
              variant="caption"
              color="secondary"
              style={
                styles.statLabel
              }
            >
              {tSafe(
                "total_tasks",
                "Total Tasks"
              )}
            </AppText>
          </View>

          <View
            style={
              styles.statDividerVertical
            }
          />

          <View
            style={styles.statBox}
          >
            <AppText
              style={
                styles.statNumber
              }
            >
              {formatCurrency(
                totalValue,
                0
              )}
            </AppText>

            <AppText
              variant="caption"
              color="secondary"
              style={
                styles.statLabel
              }
            >
              {tSafe(
                "total_value",
                "Total Value"
              )}
            </AppText>
          </View>
        </View>
      </View>
    );
  };

  /*
   * ==============================================================
   * LOADING
   * ==============================================================
   */

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            theme.brand.primary
          }
        />

        <AppText
          style={
            styles.loadingText
          }
        >
          {tSafe(
            "loading_checklists",
            "Loading your checklists"
          )}
        </AppText>

        <AppText
          variant="caption"
          color="secondary"
          style={
            styles.loadingSubtext
          }
        >
          {tSafe(
            "please_wait",
            "Please wait..."
          )}
        </AppText>
      </View>
    );
  }

  /*
   * ==============================================================
   * RENDER
   * ==============================================================
   */

  return (
    <View
      style={styles.container}
    >
      {renderHeader()}

      {checklists.length > 0 ? (
        <FlatList
          data={filteredChecklists}
          keyExtractor={(
            item,
            index
          ) =>
            String(
              item?._id ||
                `checklist-${index}`
            )
          }
          renderItem={
            renderChecklistItem
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[
                theme.brand.primary,
              ]}
              tintColor={
                theme.brand.primary
              }
              progressBackgroundColor={
                theme.surface.elevated
              }
            />
          }
          contentContainerStyle={
            styles.listContainer
          }
          showsVerticalScrollIndicator={
            false
          }
          ListFooterComponent={
            <View
              style={
                styles.listFooter
              }
            />
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptySearchContainer
              }
            >
              <View
                style={
                  styles.emptySearchIcon
                }
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={48}
                  color={
                    theme.icon.muted
                  }
                />
              </View>

              <AppText
                variant="h6"
                style={
                  styles.emptyTitle
                }
              >
                {tSafe(
                  "no_checklists_found",
                  "No checklists found"
                )}
              </AppText>

              <AppText
                variant="body2"
                color="secondary"
                style={
                  styles.emptySubtitle
                }
              >
                {tSafe(
                  "try_adjusting_search",
                  "Try adjusting your search"
                )}
              </AppText>
            </View>
          }
        />
      ) : (
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={
              styles.emptyIllustration
            }
          >
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={68}
              color={
                theme.icon.muted
              }
            />
          </View>

          <AppText
            variant="h5"
            style={
              styles.emptyTitle
            }
          >
            {tSafe(
              "no_checklists_yet",
              "No checklists yet"
            )}
          </AppText>

          <AppText
            variant="body2"
            color="secondary"
            style={
              styles.emptySubtitle
            }
          >
            {tSafe(
              "create_first_checklist_prompt",
              "Create your first checklist to streamline your cleaning operations"
            )}
          </AppText>

          <AppButton
            title={tSafe(
              "create_first_checklist",
              "Create First Checklist"
            )}
            variant="primary"
            onPress={
              handleCreateChecklist
            }
            icon="plus"
            style={
              styles.createFirstButton
            }
          />
        </View>
      )}

      {/* FAB */}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={
          handleCreateChecklist
        }
        color={
          theme.button.primaryText
        }
        size="medium"
        animated
      />

      {/* ==========================================================
          CHECKLIST DETAILS MODAL
      =========================================================== */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={
          closeModal
        }
        statusBarTranslucent
      >
        <View
          style={
            styles.detailModalOverlay
          }
        >
          <View
            style={
              styles.detailModalContainer
            }
          >
            {selectedChecklistForModal && (
              <>
                {/* MODAL HEADER */}

                <View
                  style={
                    styles.detailModalHeader
                  }
                >
                  <View
                    style={
                      styles.modalHeaderLeft
                    }
                  >
                    <View
                      style={
                        styles.modalChecklistIcon
                      }
                    >
                      <MaterialIcons
                        name="checklist-rtl"
                        size={23}
                        color={
                          theme.text.inverse
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.modalHeaderText
                      }
                    >
                      <AppText
                        style={
                          styles.modalTitle
                        }
                        numberOfLines={1}
                      >
                        {selectedChecklistForModal?.checklistName ||
                          tSafe(
                            "unnamed_checklist",
                            "Unnamed Checklist"
                          )}
                      </AppText>

                      <AppText
                        variant="caption"
                        color="secondary"
                        style={
                          styles.modalSubtitle
                        }
                        numberOfLines={1}
                      >
                        {selectedChecklistForModal?.apartment_name ||
                          tSafe(
                            "general_checklist",
                            "General Checklist"
                          )}
                      </AppText>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.closeButton
                    }
                    onPress={
                      closeModal
                    }
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="close"
                      size={23}
                      color={
                        theme.icon.default
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* MODAL BODY */}

                <ScrollView
                  style={
                    styles.modalContent
                  }
                  contentContainerStyle={
                    styles.modalContentContainer
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  keyboardShouldPersistTaps="handled"
                >
                  {/* OVERVIEW */}

                  <View
                    style={
                      styles.modalSection
                    }
                  >
                    <AppText
                      variant="h6"
                      style={
                        styles.sectionTitle
                      }
                    >
                      {tSafe(
                        "overview",
                        "Overview"
                      )}
                    </AppText>

                    <View
                      style={
                        styles.infoGrid
                      }
                    >
                      <View
                        style={
                          styles.infoCard
                        }
                      >
                        <Feather
                          name="calendar"
                          size={20}
                          color={
                            theme.icon.active
                          }
                        />

                        <AppText
                          variant="caption"
                          color="secondary"
                          style={
                            styles.infoLabel
                          }
                        >
                          {tSafe(
                            "created",
                            "Created"
                          )}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.infoValue
                          }
                        >
                          {formatDate(
                            selectedChecklistForModal?.createdAt
                          )}
                        </AppText>
                      </View>

                      <View
                        style={
                          styles.infoCard
                        }
                      >
                        <Feather
                          name="clock"
                          size={20}
                          color={
                            theme.icon.active
                          }
                        />

                        <AppText
                          variant="caption"
                          color="secondary"
                          style={
                            styles.infoLabel
                          }
                        >
                          {tSafe(
                            "total_time",
                            "Total Time"
                          )}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.infoValue
                          }
                        >
                          {formatDuration(
                            selectedChecklistForModal?.totalTime
                          )}
                        </AppText>
                      </View>

                      <View
                        style={
                          styles.infoCard
                        }
                      >
                        <Feather
                          name="dollar-sign"
                          size={20}
                          color={
                            theme.status.success
                          }
                        />

                        <AppText
                          variant="caption"
                          color="secondary"
                          style={
                            styles.infoLabel
                          }
                        >
                          {tSafe(
                            "total_fee",
                            "Total Fee"
                          )}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={[
                            styles.infoValue,
                            styles.totalFee,
                          ]}
                        >
                          {formatCurrency(
                            selectedChecklistForModal?.totalFee
                          )}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* TEAMS */}

                  {selectedChecklistForModal?.checklist &&
                    Object.keys(
                      selectedChecklistForModal.checklist
                    ).length > 0 && (
                      <View
                        style={
                          styles.modalSection
                        }
                      >
                        <AppText
                          variant="h6"
                          style={
                            styles.sectionTitle
                          }
                        >
                          {tSafe(
                            "cleaning_teams",
                            "Cleaning Teams"
                          )}
                        </AppText>

                        {Object.entries(
                          selectedChecklistForModal.checklist
                        ).map(
                          (
                            [
                              groupId,
                              group,
                            ],
                            index
                          ) => {
                            const groupNumber =
                              String(
                                groupId
                              )
                                .replace(
                                  "group_",
                                  ""
                                )
                                .replace(
                                  "group",
                                  ""
                                ) ||
                              String(
                                index + 1
                              );

                            const groupTasks =
                              group?.details
                                ? Object.values(
                                    group.details
                                  ).reduce(
                                    (
                                      total,
                                      room
                                    ) =>
                                      total +
                                      (Array.isArray(
                                        room?.tasks
                                      )
                                        ? room
                                            .tasks
                                            .length
                                        : 0),
                                    0
                                  )
                                : 0;

                            return (
                              <View
                                key={
                                  groupId
                                }
                                style={
                                  styles.groupCard
                                }
                              >
                                {/* GROUP HEADER */}

                                <View
                                  style={
                                    styles.groupHeader
                                  }
                                >
                                  <View
                                    style={
                                      styles.groupTitleContainer
                                    }
                                  >
                                    <View
                                      style={
                                        styles.groupIcon
                                      }
                                    >
                                      <AppText
                                        style={
                                          styles.groupIconText
                                        }
                                      >
                                        {
                                          groupNumber
                                        }
                                      </AppText>
                                    </View>

                                    <View
                                      style={
                                        styles.groupTitleText
                                      }
                                    >
                                      <AppText
                                        style={
                                          styles.groupName
                                        }
                                      >
                                        {tSafe(
                                          "team_prefix",
                                          "Team"
                                        )}{" "}
                                        {
                                          groupNumber
                                        }
                                      </AppText>

                                      <AppText
                                        variant="caption"
                                        style={{
                                          color: theme.text.secondary
                                        }}
                                      >
                                        {Array.isArray(
                                          group?.rooms
                                        )
                                          ? group
                                              .rooms
                                              .length
                                          : 0}{" "}
                                        {tSafe(
                                          "rooms",
                                          "rooms"
                                        )}{" "}
                                        •{" "}
                                        {
                                          groupTasks
                                        }{" "}
                                        {tSafe(
                                          "tasks",
                                          "tasks"
                                        )}
                                      </AppText>
                                    </View>
                                  </View>

                                  <View
                                    style={
                                      styles.groupStats
                                    }
                                  >
                                    <View
                                      style={
                                        styles.statBadge
                                      }
                                    >
                                      <Feather
                                        name="clock"
                                        size={12}
                                        color={
                                          theme.icon
                                            .muted
                                        }
                                      />

                                      <AppText
                                        variant="caption"
                                        color="secondary"
                                        style={
                                          styles.statText
                                        }
                                      >
                                        {formatDuration(
                                          group?.totalTime
                                        )}
                                      </AppText>
                                    </View>

                                    <View
                                      style={
                                        styles.priceBadge
                                      }
                                    >
                                      <Feather
                                        name="dollar-sign"
                                        size={12}
                                        color={
                                          theme.text
                                            .inverse
                                        }
                                      />

                                      <AppText
                                        variant="caption"
                                        style={
                                          styles.priceText
                                        }
                                      >
                                        {formatCurrency(
                                          group?.price
                                        )}
                                      </AppText>
                                    </View>
                                  </View>
                                </View>

                                {/* ROOMS */}

                                {Array.isArray(
                                  group?.rooms
                                ) &&
                                  group.rooms
                                    .length > 0 && (
                                    <View
                                      style={
                                        styles.roomsSection
                                      }
                                    >
                                      <AppText
                                        variant="caption"
                                        style={
                                          styles.detailTitle
                                        }
                                      >
                                        {tSafe(
                                          "rooms_included",
                                          "Rooms Included"
                                        )}
                                      </AppText>

                                      <View
                                        style={
                                          styles.roomsGrid
                                        }
                                      >
                                        {group.rooms.map(
                                          (
                                            room,
                                            idx
                                          ) => (
                                            <View
                                              key={`${room}-${idx}`}
                                              style={
                                                styles.roomChip
                                              }
                                            >
                                              <AppText
                                                variant="caption"
                                                style={
                                                  styles.roomChipText
                                                }
                                              >
                                                {formatRoomLabel(
                                                  room
                                                )}
                                              </AppText>
                                            </View>
                                          )
                                        )}
                                      </View>
                                    </View>
                                  )}

                                {/* TASKS */}

                                {group?.details &&
                                  Object.keys(
                                    group.details
                                  ).length > 0 && (
                                    <View
                                      style={
                                        styles.tasksSection
                                      }
                                    >
                                      <AppText
                                        variant="caption"
                                        style={
                                          styles.detailTitle
                                        }
                                      >
                                        {tSafe(
                                          "tasks_by_room",
                                          "Tasks by Room"
                                        )}
                                      </AppText>

                                      {Object.entries(
                                        group.details
                                      ).map(
                                        ([
                                          roomKey,
                                          roomData,
                                        ]) => {
                                          if (
                                            !Array.isArray(
                                              roomData?.tasks
                                            ) ||
                                            roomData
                                              .tasks
                                              .length ===
                                              0
                                          ) {
                                            return null;
                                          }

                                          const mid =
                                            Math.ceil(
                                              roomData
                                                .tasks
                                                .length /
                                                2
                                            );

                                          const leftColumnTasks =
                                            roomData.tasks.slice(
                                              0,
                                              mid
                                            );

                                          const rightColumnTasks =
                                            roomData.tasks.slice(
                                              mid
                                            );

                                          return (
                                            <View
                                              key={`${groupId}-${roomKey}`}
                                              style={
                                                styles.roomTasksContainer
                                              }
                                            >
                                              <View
                                                style={
                                                  styles.roomHeader
                                                }
                                              >
                                                <Feather
                                                  name="square"
                                                  size={16}
                                                  color={
                                                    theme.status
                                                      .info
                                                  }
                                                />

                                                <AppText
                                                  style={
                                                    styles.roomName
                                                  }
                                                >
                                                  {formatRoomLabel(
                                                    roomKey
                                                  )}
                                                </AppText>

                                                <AppText
                                                  variant="caption"
                                                  color="secondary"
                                                >
                                                  {
                                                    roomData
                                                      .tasks
                                                      .length
                                                  }{" "}
                                                  {tSafe(
                                                    "tasks",
                                                    "tasks"
                                                  )}
                                                </AppText>
                                              </View>

                                              <View
                                                style={
                                                  styles.twoColumnGrid
                                                }
                                              >
                                                <View
                                                  style={
                                                    styles.column
                                                  }
                                                >
                                                  {leftColumnTasks.map(
                                                    (
                                                      task,
                                                      taskIndex
                                                    ) => (
                                                      <View
                                                        key={`task-left-${taskIndex}`}
                                                        style={
                                                          styles.taskItem
                                                        }
                                                      >
                                                        <Feather
                                                          name={
                                                            task?.value
                                                              ? "check-square"
                                                              : "square"
                                                          }
                                                          size={
                                                            14
                                                          }
                                                          color={
                                                            task?.value
                                                              ? theme
                                                                  .status
                                                                  .success
                                                              : theme
                                                                  .icon
                                                                  .muted
                                                          }
                                                          style={
                                                            styles.taskIcon
                                                          }
                                                        />

                                                        <AppText
                                                          variant="caption"
                                                          style={
                                                            styles.taskLabel
                                                          }
                                                          numberOfLines={
                                                            2
                                                          }
                                                        >
                                                          {task?.label ||
                                                            task?.name ||
                                                            `${tSafe(
                                                              "task_prefix",
                                                              "Task"
                                                            )} ${
                                                              taskIndex +
                                                              1
                                                            }`}
                                                        </AppText>
                                                      </View>
                                                    )
                                                  )}
                                                </View>

                                                <View
                                                  style={
                                                    styles.column
                                                  }
                                                >
                                                  {rightColumnTasks.map(
                                                    (
                                                      task,
                                                      taskIndex
                                                    ) => (
                                                      <View
                                                        key={`task-right-${mid + taskIndex}`}
                                                        style={
                                                          styles.taskItem
                                                        }
                                                      >
                                                        <Feather
                                                          name={
                                                            task?.value
                                                              ? "check-square"
                                                              : "square"
                                                          }
                                                          size={
                                                            14
                                                          }
                                                          color={
                                                            task?.value
                                                              ? theme
                                                                  .status
                                                                  .success
                                                              : theme
                                                                  .icon
                                                                  .muted
                                                          }
                                                          style={
                                                            styles.taskIcon
                                                          }
                                                        />

                                                        <AppText
                                                          variant="caption"
                                                          style={
                                                            styles.taskLabel
                                                          }
                                                          numberOfLines={
                                                            2
                                                          }
                                                        >
                                                          {task?.label ||
                                                            task?.name ||
                                                            `${tSafe(
                                                              "task_prefix",
                                                              "Task"
                                                            )} ${
                                                              mid +
                                                              taskIndex +
                                                              1
                                                            }`}
                                                        </AppText>
                                                      </View>
                                                    )
                                                  )}
                                                </View>
                                              </View>
                                            </View>
                                          );
                                        }
                                      )}
                                    </View>
                                  )}
                              </View>
                            );
                          }
                        )}
                      </View>
                    )}

                  {/* NOTES */}

                  {selectedChecklistForModal?.notes && (
                    <View
                      style={
                        styles.modalSection
                      }
                    >
                      <AppText
                        variant="h6"
                        style={
                          styles.sectionTitle
                        }
                      >
                        {tSafe(
                          "notes",
                          "Notes"
                        )}
                      </AppText>

                      <View
                        style={
                          styles.notesCard
                        }
                      >
                        <AppText
                          variant="body2"
                          style={
                            styles.notesText
                          }
                        >
                          {
                            selectedChecklistForModal.notes
                          }
                        </AppText>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* FOOTER */}

                <View
                  style={
                    styles.modalFooter
                  }
                >
                  <AppButton
                    title={tSafe(
                      "edit_checklist",
                      "Edit Checklist"
                    )}
                    variant="primary"
                    icon="pencil-outline"
                    onPress={() => {
                      closeModal();

                      handleEditChecklist(
                        selectedChecklistForModal
                      );
                    }}
                    style={
                      styles.modalActionButton
                    }
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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

    /*
     * ------------------------------------------------------------
     * HEADER
     * ------------------------------------------------------------
     */

    header: {
      paddingTop:
        Platform.OS === "ios"
          ? 58
          : 42,
      paddingHorizontal: 20,
      paddingBottom: 18,
      backgroundColor:
        theme.surface.elevated,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    headerTop: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    headerTextContainer: {
      flex: 1,
      paddingRight: 15,
    },

    headerTitle: {
      color: theme.text.primary,
      fontWeight: "800",
      letterSpacing: -0.6,
    },

    headerSubtitle: {
      marginTop: 4,
      color: theme.text.secondary,
    },

    avatar: {
      backgroundColor:
        theme.surface.selected,
    },

    avatarFallback: {
      backgroundColor:
        theme.brand.primary,
    },

    /*
     * ------------------------------------------------------------
     * SEARCH
     * ------------------------------------------------------------
     */

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme.input.background,
      borderRadius: 14,
      paddingHorizontal: 14,
      minHeight: 50,
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        theme.input.border,
    },

    searchIcon: {
      marginRight: 10,
    },

    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.input.text,
      paddingVertical: 0,
      minHeight: 46,
    },

    clearSearchButton: {
      padding: 4,
      marginLeft: 4,
    },

    /*
     * ------------------------------------------------------------
     * SUMMARY BAR
     * ------------------------------------------------------------
     */

    statsBar: {
      flexDirection: "row",
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "12",
          theme.surface.selected
        ),
      borderRadius: 16,
      padding: 15,
      alignItems: "center",
      justifyContent:
        "space-around",
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.brand.primary,
          "25",
          theme.border.default
        ),
    },

    statBox: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    statNumber: {
      fontSize: 19,
      fontWeight: "800",
      color: theme.text.primary,
      marginBottom: 3,
    },

    statLabel: {
      textTransform:
        "uppercase",
      letterSpacing: 0.35,
      textAlign: "center",
      fontSize: 10,
      color: theme.text.secondary,
    },

    statDividerVertical: {
      width: 1,
      height: 30,
      backgroundColor:
        theme.border.default,
    },

    /*
     * ------------------------------------------------------------
     * LIST
     * ------------------------------------------------------------
     */

    listContainer: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 100,
    },

    listFooter: {
      height: 100,
    },

    cardWrapper: {
      marginBottom: 14,
    },

    card: {
      borderRadius: 18,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      overflow: "hidden",
      ...getShadow(theme),
    },

    cardContent: {
      padding: 17,
    },

    /*
     * ------------------------------------------------------------
     * CHECKLIST CARD
     * ------------------------------------------------------------
     */

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },

    checklistIconContainer: {
      backgroundColor:
        theme.brand.primary,
      borderRadius: 13,
      width: 45,
      height: 45,
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    checklistInfo: {
      flex: 1,
      minWidth: 0,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 4,
    },

    propertyBadge: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    propertyText: {
      marginLeft: 5,
      flex: 1,
      color: theme.text.secondary,
    },

    deleteIconButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 8,
      backgroundColor:
        withAlpha(
          theme.status.error,
          "12",
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.error,
          "25",
          theme.border.default
        ),
    },

    /*
     * ------------------------------------------------------------
     * CARD STATS
     * ------------------------------------------------------------
     */

    statsContainer: {
      flexDirection: "row",
      backgroundColor:
        theme.background.sunken,
      borderRadius: 13,
      paddingVertical: 12,
      paddingHorizontal: 8,
      marginBottom: 15,
      justifyContent:
        "space-between",
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    statItem: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 2,
    },

    statValue: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text.primary,
      marginBottom: 2,
      textAlign: "center",
    },

    statDivider: {
      width: 1,
      height: 30,
      backgroundColor:
        theme.divider,
    },

    /*
     * ------------------------------------------------------------
     * FOOTER
     * ------------------------------------------------------------
     */

    footer: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    dateText: {
      marginLeft: 6,
      color: theme.text.secondary,
    },

    actionButtons: {
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
      marginLeft: 8,
    },

    viewButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        withAlpha(
          theme.status.info,
          "12",
          theme.surface.selected
        ),
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 9,
      gap: 5,
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.info,
          "25",
          theme.border.default
        ),
    },

    viewButtonText: {
      color: theme.status.info,
      fontWeight: "700",
    },

    editButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme.button.primaryBackground,
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 9,
      gap: 5,
    },

    editButtonText: {
      color:
        theme.button.primaryText,
      fontWeight: "700",
    },

    /*
     * ------------------------------------------------------------
     * LOADING
     * ------------------------------------------------------------
     */

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        theme.background.default,
      paddingHorizontal: 30,
    },

    loadingText: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.text.primary,
      marginTop: 16,
      textAlign: "center",
    },

    loadingSubtext: {
      marginTop: 5,
      textAlign: "center",
      color: theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * EMPTY STATES
     * ------------------------------------------------------------
     */

    emptyContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 38,
      paddingBottom: 80,
    },

    emptySearchContainer: {
      alignItems: "center",
      paddingTop: 90,
      paddingHorizontal: 30,
    },

    emptySearchIcon: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      marginBottom: 18,
    },

    emptyIllustration: {
      width: 122,
      height: 122,
      borderRadius: 61,
      backgroundColor:
        theme.surface.elevated,
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 22,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      ...getShadow(theme),
    },

    emptyTitle: {
      color: theme.text.primary,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 8,
    },

    emptySubtitle: {
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
      maxWidth: 360,
      color: theme.text.secondary,
    },

    createFirstButton: {
      minWidth: 220,
    },

    /*
     * ------------------------------------------------------------
     * FAB
     * ------------------------------------------------------------
     */

    fab: {
      position: "absolute",
      right: 22,
      bottom: 24,
      backgroundColor:
        theme.button.primaryBackground,
      borderRadius: 28,
      shadowColor:
        theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        theme.shadow.opacity,
      shadowRadius: 10,
      elevation: 6,
    },

    /*
     * ------------------------------------------------------------
     * DETAIL MODAL
     * ------------------------------------------------------------
     */

    detailModalOverlay: {
      flex: 1,
      backgroundColor:
        theme.overlay,
      justifyContent:
        "flex-end",
    },

    detailModalContainer: {
      backgroundColor:
        theme.surface.elevated,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      maxHeight: "92%",
      minHeight: "60%",
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    detailModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
      backgroundColor:
        theme.surface.elevated,
    },

    modalHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    modalChecklistIcon: {
      backgroundColor:
        theme.brand.primary,
      borderRadius: 12,
      width: 44,
      height: 44,
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 11,
    },

    modalHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text.primary,
      marginBottom: 2,
    },

    modalSubtitle: {
      maxWidth:
        width - 150,
        color: theme.text.secondary,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      marginLeft: 10,
    },

    modalContent: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    modalContentContainer: {
      paddingHorizontal: 18,
      paddingVertical: 18,
      paddingBottom: 28,
    },

    modalSection: {
      marginBottom: 24,
    },

    sectionTitle: {
      color: theme.text.primary,
      fontWeight: "800",
      marginBottom: 13,
    },

    /*
     * ------------------------------------------------------------
     * INFO CARDS
     * ------------------------------------------------------------
     */

    infoGrid: {
      flexDirection: "row",
      gap: 9,
    },

    infoCard: {
      flex: 1,
      backgroundColor:
        theme.surface.elevated,
      borderRadius: 14,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    infoLabel: {
      marginTop: 7,
      marginBottom: 3,
      textTransform:
        "uppercase",
      letterSpacing: 0.3,
      textAlign: "center",
      fontSize: 10,
      color: theme.text.secondary,
    },

    infoValue: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.text.primary,
      textAlign: "center",
    },

    totalFee: {
      color: theme.status.success,
    },

    /*
     * ------------------------------------------------------------
     * GROUP CARD
     * ------------------------------------------------------------
     */

    groupCard: {
      backgroundColor:
        theme.card.background,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      padding: 15,
      marginBottom: 13,
      ...getShadow(theme),
    },

    groupHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 15,
    },

    groupTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    groupIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.selected
        ),
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 10,
    },

    groupIconText: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.brand.primary,
    },

    groupTitleText: {
      flex: 1,
      minWidth: 0,
    },

    groupName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 2,
    },

    groupStats: {
      flexDirection: "row",
      gap: 6,
      marginLeft: 8,
    },

    statBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme.surface.selected,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 10,
      gap: 3,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    statText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.text.secondary,
    },

    priceBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme.status.success,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 10,
      gap: 2,
    },

    priceText: {
      color: theme.text.inverse,
      fontWeight: "700",
    },

    /*
     * ------------------------------------------------------------
     * GROUP DETAILS
     * ------------------------------------------------------------
     */

    roomsSection: {
      marginBottom: 17,
    },

    detailTitle: {
      color: theme.text.primary,
      fontWeight: "700",
      marginBottom: 9,
    },

    roomsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },

    roomChip: {
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "12",
          theme.surface.selected
        ),
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.brand.primary,
          "25",
          theme.border.default
        ),
    },

    roomChipText: {
      color: theme.brand.primary,
      fontWeight: "600",
    },

    tasksSection: {
      marginTop: 2,
    },

    roomTasksContainer: {
      backgroundColor:
        theme.background.sunken,
      borderRadius: 13,
      padding: 13,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    roomHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 10,
    },

    roomName: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
    },

    twoColumnGrid: {
      flexDirection: "row",
      gap: 14,
    },

    column: {
      flex: 1,
      minWidth: 0,
    },

    taskItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 9,
      minWidth: 0,
    },

    taskIcon: {
      marginTop: 2,
      marginRight: 6,
    },

    taskLabel: {
      flex: 1,
      color: theme.text.secondary,
      lineHeight: 17,
    },

    /*
     * ------------------------------------------------------------
     * NOTES
     * ------------------------------------------------------------
     */

    notesCard: {
      backgroundColor:
        withAlpha(
          theme.status.warning,
          "12",
          theme.surface.selected
        ),
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.warning,
          "30",
          theme.border.default
        ),
    },

    notesText: {
      color: theme.text.primary,
      lineHeight: 20,
    },

    /*
     * ------------------------------------------------------------
     * MODAL FOOTER
     * ------------------------------------------------------------
     */

    modalFooter: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom:
        Platform.OS === "ios"
          ? 24
          : 16,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      backgroundColor:
        theme.surface.elevated,
    },

    modalActionButton: {
      minHeight: 50,
      borderRadius: 14,
    },
  });