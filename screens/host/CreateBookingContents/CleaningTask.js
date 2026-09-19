import React, { useState, useEffect, useContext, useCallback } from "react";

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";

import { Text, Button } from "react-native-paper";

import COLORS from "../../../constants/colors";
import { AuthContext } from "../../../context/AuthContext";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import userService from "../../../services/connection/userService";
import { tSafe } from "../../../utils/tSafe";
import { minutesToDuration } from "../../../utils/minuteToDuration";

const { height } = Dimensions.get("window");

export default function CleaningTask({
  onExtraSelect,
  extraTasks,
  totalTaskTime,
  roomBathChange,
  formData,
  setFormData,
  extras,
  validateForm,
}) {
  const { currency } = useContext(AuthContext);

  const [predefinedChecklists, setPredefinedChecklists] = useState([]);

  const [selectedChecklistId, setSelectedChecklistId] = useState(
    formData?.checklistId || null,
  );

  const [selectedChecklistForModal, setSelectedChecklistForModal] =
    useState(null);

  /*
   * ============================================================
   * SYNC SELECTED CHECKLIST WITH FORM DATA
   * ============================================================
   *
   * IMPORTANT:
   *
   * formData.checklists
   * -------------------
   * Contains ALL checklist IDs attached to the property.
   *
   * Example:
   *
   * [
   *   "checklist-id-1",
   *   "checklist-id-2",
   *   "checklist-id-3"
   * ]
   *
   *
   * formData.checklistId
   * --------------------
   * Contains ONLY the currently selected checklist.
   *
   * Example:
   *
   * "checklist-id-2"
   *
   * These two fields must NOT be confused.
   */

  useEffect(() => {
    const incomingChecklistId = formData?.checklistId || null;

    if (incomingChecklistId !== selectedChecklistId) {
      console.log(
        "CleaningTask: Syncing selected checklist ID:",
        incomingChecklistId,
      );

      setSelectedChecklistId(incomingChecklistId);
    }
  }, [formData?.checklistId, selectedChecklistId]);

  /*
   * ============================================================
   * VALIDATE CURRENT STEP
   * ============================================================
   */

  const validateCurrentStep = useCallback(() => {
    const checklistId = formData?.checklistId;

    const totalCleaningFee = formData?.total_cleaning_fee;

    const hasChecklistSelected = !!checklistId;

    const hasValidFee =
      totalCleaningFee !== null &&
      totalCleaningFee !== undefined &&
      !isNaN(totalCleaningFee) &&
      parseFloat(totalCleaningFee) > 0;

    const isValid = hasChecklistSelected && hasValidFee;

    console.log("CleaningTask validation:", {
      checklistId,
      totalCleaningFee,
      hasChecklistSelected,
      hasValidFee,
      isValid,
    });

    return isValid;
  }, [formData?.checklistId, formData?.total_cleaning_fee]);

  /*
   * Send validation result back to parent.
   */

  useEffect(() => {
    const isFormValid = validateCurrentStep();

    if (validateForm) {
      validateForm(isFormValid);
    }
  }, [validateCurrentStep, validateForm]);

  /*
   * ============================================================
   * FETCH CHECKLISTS
   * ============================================================
   *
   * formData.checklists contains CHECKLIST IDS.
   *
   * Example:
   *
   * formData.checklists = [
   *   "6a90118bff96a53fcda299f5",
   *   "6a90118bff96a53fcda299f6"
   * ]
   *
   * We pass those IDs to the API to retrieve the actual
   * checklist objects.
   */

  const fetchChecklists = useCallback(async () => {
    try {
      const checklistIds = Array.isArray(formData?.checklists)
        ? formData.checklists
        : [];

      console.log("CleaningTask: Property checklist IDs:", checklistIds);

      /*
       * ------------------------------------------------------
       * PROPERTY HAS NO CHECKLISTS
       * ------------------------------------------------------
       */

      if (checklistIds.length === 0) {
        console.log("CleaningTask: No checklists attached to this property");

        setPredefinedChecklists([]);
        setSelectedChecklistId(null);

        setFormData((prev) => ({
          ...prev,
          checklistId: null,
          checklistName: null,
          checklistTasks: [],
          total_cleaning_fee: prev.regular_cleaning_fee || 0,
          total_cleaning_time: prev.regular_cleaning_time || 0,
          
        }));

        return;
      }

      /*
       * ------------------------------------------------------
       * FETCH ACTUAL CHECKLIST OBJECTS
       * ------------------------------------------------------
       */

      const response =
        await userService.getCustomChecklistsByProperty(checklistIds);

      const fetchedChecklists = response?.data?.data || [];

      console.log(
        "CleaningTask: Fetched checklist objects:",
        fetchedChecklists.length,
      );

      console.log(
        "CleaningTask: Fetched checklist IDs:",
        fetchedChecklists.map((checklist) => checklist?._id),
      );

      setPredefinedChecklists(fetchedChecklists);

      /*
       * ------------------------------------------------------
       * CHECK EXISTING SELECTED CHECKLIST
       * ------------------------------------------------------
       */

      const currentChecklistId = formData?.checklistId || null;

      /*
       * There is currently a selected checklist.
       *
       * Make sure that checklist actually belongs to the
       * current property's checklist array.
       */

      if (currentChecklistId) {
        const existingChecklist = fetchedChecklists.find(
          (checklist) => String(checklist?._id) === String(currentChecklistId),
        );

        if (existingChecklist) {
          console.log("CleaningTask: Existing selected checklist is valid:", {
            id: existingChecklist._id,
            name: existingChecklist.checklistName,
          });

          setSelectedChecklistId(existingChecklist._id);

          return;
        }

        /*
         * The selected checklist came from a previous
         * property and does not belong to the new property.
         */

        console.log(
          "CleaningTask: Previous checklist does not belong to this property. Resetting.",
        );

        setSelectedChecklistId(null);

        setFormData((prev) => ({
          ...prev,

          checklistId: null,
          checklistName: null,
          checklistTasks: [],

          total_cleaning_fee: prev.regular_cleaning_fee || 0,

          total_cleaning_time: prev.regular_cleaning_time || 0,
        }));

        return;
      }

      /*
       * ------------------------------------------------------
       * NO CURRENTLY SELECTED CHECKLIST
       * ------------------------------------------------------
       *
       * We intentionally DO NOT automatically select the
       * first checklist.
       *
       * The user must select one.
       */

      console.log("CleaningTask: No checklist currently selected.");

      setSelectedChecklistId(null);
    } catch (error) {
      console.error("CleaningTask: Error fetching checklists:", error);

      setPredefinedChecklists([]);

      setSelectedChecklistId(null);
    }
  }, [formData?.checklists, formData?.checklistId, setFormData]);

  /*
   * Reload whenever the property's checklist array changes.
   */

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  /*
   * ============================================================
   * HANDLE CHECKLIST SELECTION
   * ============================================================
   */

  const handleChecklistSelect = useCallback(
    (checklist) => {
      if (!checklist?._id) {
        console.warn("CleaningTask: Cannot select checklist without an ID");

        return;
      }

      console.log("CleaningTask: Selecting checklist:", {
        checklistId: checklist._id,
        checklistName: checklist.checklistName,
      });

      /*
       * This is the ONE selected checklist.
       */

      setSelectedChecklistId(checklist._id);

      /*
       * ------------------------------------------------------
       * EXTRACT ALL TASKS
       * ------------------------------------------------------
       *
       * Checklist structure:
       *
       * checklist
       *   group
       *     details
       *       room
       *         tasks
       */

      const allTasks = [];

      if (checklist.checklist && typeof checklist.checklist === "object") {
        Object.values(checklist.checklist).forEach((group) => {
          if (!group?.details || typeof group.details !== "object") {
            return;
          }

          Object.values(group.details).forEach((room) => {
            if (room?.tasks && Array.isArray(room.tasks)) {
              room.tasks.forEach((task) => {
                if (task?.label) {
                  allTasks.push(task.label);
                }
              });
            }
          });
        });
      }

      /*
       * Remove duplicate task labels.
       */

      const uniqueTasks = [...new Set(allTasks)];

      console.log("CleaningTask: Selected checklist data:", {
        checklistId: checklist._id,
        checklistName: checklist.checklistName,
        taskCount: uniqueTasks.length,
        totalFee: checklist.totalFee,
        totalTime: checklist.totalTime,
      });

      /*
       * ------------------------------------------------------
       * UPDATE FORM DATA
       * ------------------------------------------------------
       *
       * IMPORTANT:
       *
       * We DO NOT replace formData.checklists.
       *
       * That array belongs to the property and contains ALL
       * checklist IDs.
       *
       * Only checklistId changes here.
       */

      setFormData((prev) => ({
        ...prev,
        /*
         * Preserve ALL property checklist IDs.
         */
        checklists: Array.isArray(prev.checklists) ? prev.checklists : [],
        /*
         * Set ONLY the selected checklist ID.
         */
        checklistId: checklist._id,

        /*
         * Selected checklist information.
         */
        checklistName: checklist.checklistName,

        checklistTasks: uniqueTasks,

        /*
         * Selected checklist pricing.
         */
        total_cleaning_fee: Number(checklist.totalFee) || 0,

        /*
         * Selected checklist time.
         */
        total_cleaning_time: Number(checklist.totalTime) || 0,
        selectedChecklist: checklist,
      }));
    },
    [setFormData],
  );

  /*
   * ============================================================
   * GET GROUP COUNT
   * ============================================================
   */

  const getGroupCount = (checklist) => {
    if (!checklist?.checklist || typeof checklist.checklist !== "object") {
      return 0;
    }

    return Object.keys(checklist.checklist).length;
  };

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  const formatDate = (dateObj) => {
    if (!dateObj) {
      return "--";
    }

    try {
      const dateValue = dateObj?.$date || dateObj;

      return moment(dateValue).format("MMM D, YYYY");
    } catch (error) {
      return "--";
    }
  };

  /*
   * ============================================================
   * CHECKLIST MODAL
   * ============================================================
   */

  const openChecklistDetails = (checklist) => {
    setSelectedChecklistForModal(checklist);
  };

  const closeModal = () => {
    setSelectedChecklistForModal(null);
  };

  /*
   * ============================================================
   * FORMAT ROOM LABEL
   * ============================================================
   */

  const formatRoomLabel = (roomKey) => {
    if (!roomKey) {
      return tSafe("room", "Room");
    }

    const parts = roomKey.split("_");

    let roomType = parts[0];

    let roomNumber = 1;

    if (parts.length > 1 && !isNaN(parts[1])) {
      roomNumber = parseInt(parts[1], 10) + 1;
    }

    roomType = roomType.charAt(0).toUpperCase() + roomType.slice(1);

    return `${roomType} #${roomNumber}`;
  };

  /*
   * ============================================================
   * RENDER TASK ITEM
   * ============================================================
   */

  const renderTaskItem = (task) => (
    <View key={task?.id || task?.label} style={styles.taskItem}>
      <MaterialIcons
        name="fiber-manual-record"
        size={10}
        color={COLORS.primary}
        style={styles.taskIcon}
      />

      <Text style={styles.taskText} numberOfLines={2}>
        {task?.label || ""}
      </Text>
    </View>
  );

  /*
   * ============================================================
   * RENDER ROOM TASKS
   * ============================================================
   */

  const renderRoomTasks = (roomData, roomKey) => {
    const tasks = Array.isArray(roomData?.tasks) ? roomData.tasks : [];

    if (tasks.length === 0) {
      return null;
    }

    /*
     * Split tasks into two columns.
     */

    const halfIndex = Math.ceil(tasks.length / 2);

    const leftColumn = tasks.slice(0, halfIndex);

    const rightColumn = tasks.slice(halfIndex);

    return (
      <View style={styles.roomTasksContainer}>
        <View style={styles.twoColumnLayout}>
          {/* LEFT COLUMN */}

          <View style={styles.column}>
            {leftColumn.map((task, index) => (
              <View
                key={`left-${task?.id || task?.label}-${index}`}
                style={styles.taskItemWrapper}
              >
                {renderTaskItem(task)}
              </View>
            ))}
          </View>

          {/* RIGHT COLUMN */}

          <View style={styles.column}>
            {rightColumn.map((task, index) => (
              <View
                key={`right-${task?.id || task?.label}-${index}`}
                style={styles.taskItemWrapper}
              >
                {renderTaskItem(task)}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  /*
   * ============================================================
   * FORMAT ROOM COUNTS
   * ============================================================
   */

  const formatRoomCounts = (rooms) => {
    if (!Array.isArray(rooms)) {
      return "--";
    }

    const roomCounts = {};

    rooms.forEach((room) => {
      const roomType = room.split("_")[0];

      roomCounts[roomType] = (roomCounts[roomType] || 0) + 1;
    });

    return Object.entries(roomCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
      .join(", ");
  };

  /*
   * ============================================================
   * CURRENT UI STATE
   * ============================================================
   */

  const isStepValid = validateCurrentStep();

  const selectedChecklist = predefinedChecklists.find(
    (checklist) => String(checklist?._id) === String(selectedChecklistId),
  );

  console.log("CleaningTask render state:", {
    selectedChecklistId,
    formDataChecklistId: formData?.checklistId,
    propertyChecklistIds: formData?.checklists,
    predefinedChecklistsCount: predefinedChecklists.length,
    isStepValid,
    selectedChecklistName: selectedChecklist?.checklistName,
  });

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {tSafe("assign_cleaning_tasks", "Assign Cleaning Tasks")}
        </Text>

        <Text style={styles.subtitle}>
          {tSafe(
            "select_checklist_desc",
            "Select a predefined checklist to automatically populate tasks",
          )}
        </Text>

        {/* ====================================================
            SELECTED CHECKLIST SUMMARY
            ==================================================== */}

        {selectedChecklistId && selectedChecklist && (
          <View style={styles.selectedSummary}>
            <View style={styles.summaryHeader}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={COLORS.success}
              />

              <Text style={styles.summaryTitle}>
                {tSafe("selected_checklist", "Selected Checklist")}
              </Text>
            </View>

            <View style={styles.summaryContent}>
              <Text style={styles.summaryName}>
                {selectedChecklist.checklistName}
              </Text>

              <Text style={styles.summaryFee}>
                {currency}
                {Number(selectedChecklist.totalFee || 0).toFixed(2)}
              </Text>
            </View>

            <Text style={styles.summaryHint}>
              {getGroupCount(selectedChecklist)} {tSafe("cleaners", "cleaners")}{" "}
              • {minutesToDuration(Number(selectedChecklist.totalTime || 0))}
            </Text>
          </View>
        )}

        {/* ====================================================
            VALIDATION MESSAGE
            ==================================================== */}

        {!isStepValid && (
          <View style={styles.validationMessage}>
            <MaterialIcons name="error-outline" size={16} color="#FF6B6B" />

            <Text style={styles.validationText}>
              {tSafe(
                "select_checklist_required",
                "Please select a cleaning checklist to continue",
              )}
            </Text>
          </View>
        )}

        {/* ====================================================
            PREDEFINED CHECKLIST CARDS
            ==================================================== */}

        {predefinedChecklists.map((checklist) => (
          <TouchableOpacity
            key={checklist._id}
            onPress={() => handleChecklistSelect(checklist)}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.card,

                String(selectedChecklistId) === String(checklist._id) &&
                  styles.selectedCard,
              ]}
            >
              {/* CARD HEADER */}

              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{checklist.checklistName}</Text>

                <View style={styles.groupBadge}>
                  <Text style={styles.groupText}>
                    {getGroupCount(checklist)} {tSafe("cleaners", "Cleaners")}
                  </Text>
                </View>
              </View>

              {/* CARD CONTENT */}

              <View style={styles.cardContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {tSafe("total_fee", "Total Fee")}
                  </Text>

                  <Text style={styles.totalFee}>
                    {currency}
                    {Number(checklist.totalFee || 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* SELECTED INDICATOR */}

              {String(selectedChecklistId) === String(checklist._id) && (
                <View style={styles.selectedIndicator}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={COLORS.primary}
                  />

                  <Text style={styles.selectedText}>
                    {tSafe("selected", "Selected")}
                  </Text>
                </View>
              )}

              {/* DETAILS BUTTON */}

              <TouchableOpacity
                onPress={() => openChecklistDetails(checklist)}
                style={styles.detailsButton}
              >
                <Text style={styles.detailsButtonText}>
                  {tSafe("view_details", "View Details")}
                </Text>

                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* ====================================================
            NO CHECKLISTS
            ==================================================== */}

        {predefinedChecklists.length === 0 && (
          <View style={styles.noChecklistsContainer}>
            <MaterialIcons
              name="cleaning-services"
              size={40}
              color={COLORS.gray}
            />

            <Text style={styles.noChecklistsText}>
              {tSafe(
                "no_checklists_available",
                "No cleaning checklists available for this property",
              )}
            </Text>

            <Text style={styles.noChecklistsSubtext}>
              {tSafe(
                "create_checklist_first",
                "Please create a checklist first or contact support",
              )}
            </Text>
          </View>
        )}

        {/* ====================================================
            CHECKLIST DETAILS MODAL
            ==================================================== */}

        <Modal
          visible={selectedChecklistForModal !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {selectedChecklistForModal && (
                <>
                  {/* MODAL HEADER */}

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {selectedChecklistForModal.checklistName}{" "}
                      {tSafe("details", "Details")}
                    </Text>

                    <TouchableOpacity onPress={closeModal}>
                      <MaterialIcons
                        name="close"
                        size={24}
                        color={COLORS.gray}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* MODAL CONTENT */}

                  <ScrollView
                    style={styles.modalContent}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={styles.modalSection}>
                      {/* OVERVIEW */}

                      <Text style={styles.sectionTitle}>
                        {tSafe("overview", "Overview")}
                      </Text>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {tSafe("created", "Created:")}
                        </Text>

                        <Text style={styles.infoValue}>
                          {formatDate(selectedChecklistForModal.createdAt)}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {tSafe("total_fee", "Total Fee:")}
                        </Text>

                        <Text style={styles.modalTotalFee}>
                          {currency}
                          {Number(
                            selectedChecklistForModal.totalFee || 0,
                          ).toFixed(2)}
                        </Text>
                      </View>

                      {/* GROUPS & TASKS */}

                      <Text style={styles.sectionTitle}>
                        {tSafe("groups_tasks", "Groups & Tasks")}
                      </Text>

                      {selectedChecklistForModal.checklist &&
                        Object.entries(selectedChecklistForModal.checklist).map(
                          ([groupId, group]) => {
                            const groupNumber = groupId.includes("_")
                              ? groupId.split("_")[1]
                              : groupId;

                            return (
                              <View key={groupId} style={styles.groupContainer}>
                                {/* GROUP HEADER */}

                                <View style={styles.groupHeader}>
                                  <Text style={styles.groupTitle}>
                                    {tSafe("group", "Group")} {groupNumber}
                                  </Text>

                                  <View style={styles.groupPriceTime}>
                                    <View style={styles.timeBadge}>
                                      <Text style={styles.timeText}>
                                        {minutesToDuration(
                                          Number(group?.totalTime || 0),
                                        )}{" "}
                                        {tSafe("mins", "mins")}
                                      </Text>
                                    </View>

                                    <View style={styles.priceBadge}>
                                      <Text style={styles.priceText}>
                                        {currency}
                                        {Number(group?.price || 0).toFixed(2)}
                                      </Text>
                                    </View>
                                  </View>
                                </View>

                                {/* GROUP DETAILS */}

                                <View style={styles.groupDetails}>
                                  {/* ROOMS */}

                                  <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>
                                      {tSafe("rooms", "Rooms:")}
                                    </Text>

                                    <Text style={styles.infoValue}>
                                      {formatRoomCounts(group?.rooms)}
                                    </Text>
                                  </View>

                                  {/* EXTRAS */}

                                  {group?.extras && group.extras.length > 0 && (
                                    <View style={styles.infoRow}>
                                      <Text style={styles.infoLabel}>
                                        {tSafe("extras", "Extras:")}
                                      </Text>

                                      <Text style={styles.infoValue}>
                                        {group.extras.join(", ")}
                                      </Text>
                                    </View>
                                  )}

                                  {/* TASKS BY ROOM */}

                                  <View style={styles.roomsTasksContainer}>
                                    {group?.details &&
                                      Object.entries(group.details).map(
                                        ([roomKey, roomData]) => {
                                          if (
                                            roomData?.tasks ||
                                            !Array.isArray(roomData.tasks) ||
                                            roomData.tasks.length === 0
                                          ) {
                                            return null;
                                          }

                                          return (
                                            <View
                                              key={`${roomKey}-${groupId}`}
                                              style={styles.roomSection}
                                            >
                                              {/* ROOM TITLE */}

                                              <Text style={styles.roomTitle}>
                                                {formatRoomLabel(roomKey)}
                                              </Text>

                                              {/* ROOM TASKS */}

                                              {renderRoomTasks(
                                                roomData,
                                                roomKey,
                                              )}
                                            </View>
                                          );
                                        },
                                      )}
                                  </View>
                                </View>
                              </View>
                            );
                          },
                        )}
                    </View>
                  </ScrollView>

                  {/* MODAL FOOTER */}

                  <View style={styles.modalFooter}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        handleChecklistSelect(selectedChecklistForModal);

                        closeModal();
                      }}
                      style={[
                        styles.selectButton,

                        String(selectedChecklistId) ===
                          String(selectedChecklistForModal._id) &&
                          styles.alreadySelectedButton,
                      ]}
                      disabled={
                        String(selectedChecklistId) ===
                        String(selectedChecklistForModal._id)
                      }
                    >
                      {String(selectedChecklistId) ===
                      String(selectedChecklistForModal._id)
                        ? tSafe("already_selected", "✓ Already Selected")
                        : tSafe("select_checklist", "Select This Checklist")}
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.dark,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    color: COLORS.gray,
  },

  /*
   * Selected checklist summary
   */

  selectedSummary: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#B3E0FF",
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 8,
  },

  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  summaryName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.dark,
    flex: 1,
  },

  summaryFee: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },

  summaryHint: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: "italic",
  },

  /*
   * Validation message
   */

  validationMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },

  validationText: {
    marginLeft: 8,
    color: "#FF6B6B",
    fontSize: 14,
  },

  /*
   * Selected indicator
   */

  selectedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F7E9",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  selectedText: {
    marginLeft: 6,
    color: COLORS.success,
    fontWeight: "500",
    fontSize: 14,
  },

  /*
   * No checklists
   */

  noChecklistsContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginTop: 20,
  },

  noChecklistsText: {
    fontSize: 16,
    color: COLORS.dark,
    marginTop: 12,
    textAlign: "center",
  },

  noChecklistsSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: "center",
  },

  /*
   * Checklist card
   */

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eaeaea",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: "#f8fbff",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    color: COLORS.dark,
  },

  groupBadge: {
    backgroundColor: "#e6f2ff",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  groupText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },

  cardContent: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.dark,
  },

  totalFee: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },

  detailsButtonText: {
    color: COLORS.primary,
    fontWeight: "500",
    marginRight: 4,
  },

  /*
   * Modal
   */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 0,
    height: height * 0.9,
    marginTop: height * 0.1,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.dark,
    flex: 1,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  modalSection: {
    paddingBottom: 20,
  },

  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.dark,
    marginTop: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  infoLabel: {
    fontSize: 15,
    color: COLORS.gray,
    flex: 1,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.dark,
    flex: 1,
    textAlign: "right",
  },

  modalTotalFee: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  /*
   * Group container
   */

  groupContainer: {
    backgroundColor: "#f9f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
  },

  groupPriceTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timeBadge: {
    backgroundColor: "#e6f2ff",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },

  priceBadge: {
    backgroundColor: "#e6f7e9",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  priceText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.success,
  },

  groupDetails: {
    paddingTop: 8,
  },

  /*
   * Rooms and tasks
   */

  roomsTasksContainer: {
    marginTop: 12,
  },

  roomSection: {
    marginBottom: 16,
  },

  roomTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
    color: COLORS.primary,
    paddingLeft: 4,
  },

  roomTasksContainer: {
    marginTop: 4,
  },

  /*
   * Two column tasks
   */

  twoColumnLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  column: {
    width: "48%",
  },

  taskItemWrapper: {
    marginBottom: 6,
  },

  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 2,
  },

  taskIcon: {
    marginTop: 4,
    marginRight: 6,
  },

  taskText: {
    fontSize: 13,
    color: COLORS.dark,
    flex: 1,
    lineHeight: 16,
  },

  /*
   * Buttons
   */

  selectButton: {
    borderRadius: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },

  alreadySelectedButton: {
    backgroundColor: COLORS.success,
  },
});

// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import { AuthContext } from '../../../context/AuthContext';
// import moment from 'moment';
// import { MaterialIcons } from '@expo/vector-icons';
// import userService from '../../../services/connection/userService';
// import { tSafe } from '../../../utils/tSafe'; // added import
// import { minutesToDuration } from '../../../utils/minuteToDuration';

// const { height } = Dimensions.get('window');

// export default function CleaningTask({
//   onExtraSelect,
//   extraTasks,
//   totalTaskTime,
//   roomBathChange,
//   formData,
//   setFormData,
//   extras,
//   validateForm
// }) {
//   const { currency } = useContext(AuthContext);
//   const [predefinedChecklists, setPredefinedChecklists] = useState([]);
//   const [selectedChecklistId, setSelectedChecklistId] = useState(null);
//   const [selectedChecklistForModal, setSelectedChecklistForModal] = useState(null);

//   // 🔥 FIXED: Initialize selectedChecklistId from formData when component mounts
//   useEffect(() => {
//     console.log("CleaningTask: Initializing with formData", {
//       checklistId: formData.checklistId,
//       checklistName: formData.checklistName
//     });

//     if (formData.checklistId) {
//       setSelectedChecklistId(formData.checklistId);
//     }
//   }, []);

//   useEffect(() => {
//     console.log("CleaningTask: Checking if property changed...", {
//       currentChecklistId: formData.checklistId,
//       selectedChecklistId: selectedChecklistId
//     });

//     // If formData has no checklistId but we have a selectedChecklistId,
//     // it means property was changed and checklist should be reset
//     if (!formData.checklistId && selectedChecklistId) {
//       console.log("CleaningTask: Property changed, resetting selected checklist");
//       setSelectedChecklistId(null);
//     }

//     // If formData has a different checklistId than what we have selected,
//     // sync the selection (this handles when property changes to one with different checklist)
//     if (formData.checklistId && formData.checklistId !== selectedChecklistId) {
//       console.log("CleaningTask: Syncing selectedChecklistId from formData", formData.checklistId);
//       setSelectedChecklistId(formData.checklistId);
//     }
//   }, [formData.checklistId, selectedChecklistId]);

//   // 🔥 FIXED: Sync selectedChecklistId with formData when it changes
//   useEffect(() => {
//     if (formData.checklistId && formData.checklistId !== selectedChecklistId) {
//       console.log("CleaningTask: Syncing selectedChecklistId from formData", formData.checklistId);
//       setSelectedChecklistId(formData.checklistId);
//     }
//   }, [formData.checklistId, selectedChecklistId]);

//   const validateCurrentStep = useCallback(() => {
//     const { checklistId, total_cleaning_fee } = formData;

//     const hasChecklistSelected = !!checklistId;
//     const hasValidFee = total_cleaning_fee && !isNaN(total_cleaning_fee) && parseFloat(total_cleaning_fee) > 0;

//     const isValid = hasChecklistSelected && hasValidFee;
//     console.log("CleaningTask validation:", {
//       hasChecklistSelected,
//       hasValidFee,
//       isValid,
//       checklistId,
//       total_cleaning_fee
//     });

//     return isValid;
//   }, [formData.checklistId, formData.total_cleaning_fee]);

//   useEffect(() => {
//     const isFormValid = validateCurrentStep();
//     if (validateForm) {
//       validateForm(isFormValid);
//     }
//   }, [validateCurrentStep, validateForm]);

//   // 🔹 Load predefined checklists
//   useEffect(() => {
//     fetchChecklists();
//   }, []);

//   // const fetchChecklists = async () => {
//   //   try {
//   //     const chcklist_array = formData.checklists;
//   //     console.log("CleaningTask: Fetching checklists for:", chcklist_array);
//   //     const response = await userService.getCustomChecklistsByProperty(chcklist_array);
//   //     const res = response.data.data;
//   //     console.log("CleaningTask: Fetched checklists:", res.length);
//   //     setPredefinedChecklists(res);

//   //     // 🔥 FIXED: If there's a selected checklist in formData but not in state, update it
//   //     if (formData.checklistId && !selectedChecklistId) {
//   //       const existingChecklist = res.find(c => c._id === formData.checklistId);
//   //       if (existingChecklist) {
//   //         console.log("CleaningTask: Found existing selected checklist", existingChecklist.checklistName);
//   //         setSelectedChecklistId(formData.checklistId);
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching checklists:", error);
//   //   }
//   // };

//   const fetchChecklists = async () => {
//     try {
//       const chcklist_array = formData.checklists;
//       console.log("CleaningTask: Fetching checklists for:", chcklist_array);

//       // If no checklists array or it's empty, reset everything
//       if (!chcklist_array || chcklist_array.length === 0) {
//         console.log("CleaningTask: No checklists for this property");
//         setPredefinedChecklists([]);
//         setSelectedChecklistId(null);
//         return;
//       }

//       const response = await userService.getCustomChecklistsByProperty(chcklist_array);
//       const res = response.data.data;
//       console.log("CleaningTask: Fetched checklists:", res.length);
//       setPredefinedChecklists(res);

//       // If there's a selected checklist in formData, sync it
//       if (formData.checklistId) {
//         const existingChecklist = res.find(c => c._id === formData.checklistId);
//         if (existingChecklist) {
//           console.log("CleaningTask: Found existing selected checklist", existingChecklist.checklistName);
//           setSelectedChecklistId(formData.checklistId);
//         } else {
//           // The checklist from previous property doesn't exist in new property
//           console.log("CleaningTask: Previous checklist not found in new property, resetting");
//           setSelectedChecklistId(null);

//           // Also update formData to clear the checklist
//           setFormData(prev => ({
//             ...prev,
//             checklistId: null,
//             checklistName: null,
//             checklistTasks: [],
//             total_cleaning_fee: prev.regular_cleaning_fee || 0,
//             total_cleaning_time: prev.regular_cleaning_time || 0
//           }));
//         }
//       } else {
//         // No checklist in formData, ensure we don't have a selected one
//         setSelectedChecklistId(null);
//       }
//     } catch (error) {
//       console.error("Error fetching checklists:", error);
//       setPredefinedChecklists([]);
//       setSelectedChecklistId(null);
//     }
//   };

//   const handleChecklistSelect = (checklist) => {
//     console.log("CleaningTask: Selecting checklist", checklist._id, checklist.checklistName);

//     setSelectedChecklistId(checklist._id);

//     // Extract all tasks from all groups and rooms
//     const allTasks = [];
//     Object.values(checklist.checklist).forEach(group => {
//       Object.values(group.details).forEach(room => {
//         if (room.tasks) {
//           allTasks.push(...room.tasks.map(task => task.label));
//         }
//       });
//     });

//     // Get unique tasks
//     const uniqueTasks = [...new Set(allTasks)];

//     setFormData((prev) => ({
//       ...prev,
//       checklistId: checklist._id,
//       checklistName: checklist.checklistName,
//       checklistTasks: uniqueTasks,
//       total_cleaning_fee: checklist.totalFee,
//       total_cleaning_time: checklist.totalTime
//     }));
//   };

//   const getGroupCount = (checklist) => {
//     return Object.keys(checklist.checklist).length;
//   };

//   const formatDate = (dateObj) => {
//     return moment(dateObj.$date).format('MMM D, YYYY');
//   };

//   const openChecklistDetails = (checklist) => {
//     setSelectedChecklistForModal(checklist);
//   };

//   const closeModal = () => {
//     setSelectedChecklistForModal(null);
//   };

//   // 🔥 NEW: Format room labels (e.g., "bathroom_0" to "Bathroom #1")
//   const formatRoomLabel = (roomKey) => {
//     if (!roomKey) return tSafe('room', 'Room');

//     // Split the room key by underscore
//     const parts = roomKey.split('_');
//     let roomType = parts[0];
//     let roomNumber = 1;

//     // Extract room number if available
//     if (parts.length > 1 && !isNaN(parts[1])) {
//       roomNumber = parseInt(parts[1]) + 1;
//     }

//     // Capitalize first letter of room type
//     roomType = roomType.charAt(0).toUpperCase() + roomType.slice(1);

//     return `${roomType} #${roomNumber}`;
//   };

//   // 🔥 NEW: Render individual task item with dot
//   const renderTaskItem = (task) => (
//     <View key={task.id} style={styles.taskItem}>
//       <MaterialIcons
//         name="fiber-manual-record"
//         size={10}
//         color={COLORS.primary}
//         style={styles.taskIcon}
//       />
//       <Text style={styles.taskText} numberOfLines={2}>
//         {task.label}
//       </Text>
//     </View>
//   );

//   // 🔥 UPDATED: Render room tasks in two columns
//   const renderRoomTasks = (roomData, roomKey) => {
//     const tasks = roomData.tasks || [];

//     if (tasks.length === 0) return null;

//     // Split tasks into two columns
//     const halfIndex = Math.ceil(tasks.length / 2);
//     const leftColumn = tasks.slice(0, halfIndex);
//     const rightColumn = tasks.slice(halfIndex);

//     return (
//       <View style={styles.roomTasksContainer}>
//         <View style={styles.twoColumnLayout}>
//           {/* Left Column */}
//           <View style={styles.column}>
//             {leftColumn.map((task, index) => (
//               <View key={`${task.id}-${index}`} style={styles.taskItemWrapper}>
//                 {renderTaskItem(task)}
//               </View>
//             ))}
//           </View>

//           {/* Right Column */}
//           <View style={styles.column}>
//             {rightColumn.map((task, index) => (
//               <View key={`${task.id}-${index}-right`} style={styles.taskItemWrapper}>
//                 {renderTaskItem(task)}
//               </View>
//             ))}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const formatRoomCounts = (rooms) => {
//     const roomCounts = {};
//     rooms.forEach(room => {
//       const roomType = room.split('_')[0];
//       roomCounts[roomType] = (roomCounts[roomType] || 0) + 1;
//     });

//     return Object.entries(roomCounts)
//       .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
//       .join(', ');
//   };

//   // 🔥 FIXED: Compute validation status for display
//   const isStepValid = validateCurrentStep();

//   // 🔥 FIXED: Get the selected checklist object for display
//   const selectedChecklist = predefinedChecklists.find(c => c._id === selectedChecklistId);

//   console.log("CleaningTask render state:", {
//     selectedChecklistId,
//     formDataChecklistId: formData.checklistId,
//     predefinedChecklistsCount: predefinedChecklists.length,
//     isStepValid,
//     selectedChecklistName: selectedChecklist?.checklistName
//   });

//   return (
//     <ScrollView showsVerticalScrollIndicator={false}>
//       <View style={styles.container}>
//         <Text style={styles.title}>
//           {tSafe('assign_cleaning_tasks', 'Assign Cleaning Tasks')}
//         </Text>
//         <Text style={styles.subtitle}>
//           {tSafe('select_checklist_desc', 'Select a predefined checklist to automatically populate tasks')}
//         </Text>

//         {/* 🔥 FIXED: Show selected checklist summary if one is selected */}
//         {selectedChecklistId && selectedChecklist && (
//           <View style={styles.selectedSummary}>
//             <View style={styles.summaryHeader}>
//               <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
//               <Text style={styles.summaryTitle}>
//                 {tSafe('selected_checklist', 'Selected Checklist')}
//               </Text>
//             </View>
//             <View style={styles.summaryContent}>
//               <Text style={styles.summaryName}>{selectedChecklist.checklistName}</Text>
//               <Text style={styles.summaryFee}>
//                 {currency}{selectedChecklist.totalFee.toFixed(2)}
//               </Text>
//             </View>
//             <Text style={styles.summaryHint}>
//               {getGroupCount(selectedChecklist)} {tSafe('cleaners', 'cleaners')} • {minutesToDuration(selectedChecklist.totalTime)}
//             </Text>
//           </View>
//         )}

//         {/* 🔥 FIXED: Validation message - only show if step is invalid */}
//         {!isStepValid && (
//           <View style={styles.validationMessage}>
//             <MaterialIcons name="error-outline" size={16} color="#FF6B6B" />
//             <Text style={styles.validationText}>
//               {tSafe('select_checklist_required', 'Please select a cleaning checklist to continue')}
//             </Text>
//           </View>
//         )}

//         {/* 🔹 Predefined Checklist Cards */}
//         {predefinedChecklists.map((checklist) => (
//           <TouchableOpacity
//             key={checklist._id}
//             onPress={() => handleChecklistSelect(checklist)}
//             activeOpacity={0.9}
//           >
//             <View style={[
//               styles.card,
//               selectedChecklistId === checklist._id && styles.selectedCard
//             ]}>
//               <View style={styles.cardHeader}>
//                 <Text style={styles.cardTitle}>{checklist.checklistName}</Text>
//                 <View style={styles.groupBadge}>
//                   <Text style={styles.groupText}>
//                     {getGroupCount(checklist)} {tSafe('cleaners', 'Cleaners')}
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.cardContent}>
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>{tSafe('total_fee', 'Total Fee')}</Text>
//                   <Text style={styles.totalFee}>
//                     {currency}{checklist.totalFee.toFixed(2)}
//                   </Text>
//                 </View>
//               </View>

//               {/* Show selected indicator */}
//               {selectedChecklistId === checklist._id && (
//                 <View style={styles.selectedIndicator}>
//                   <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
//                   <Text style={styles.selectedText}>
//                     {tSafe('selected', 'Selected')}
//                   </Text>
//                 </View>
//               )}

//               <TouchableOpacity
//                 onPress={() => openChecklistDetails(checklist)}
//                 style={styles.detailsButton}
//               >
//                 <Text style={styles.detailsButtonText}>
//                   {tSafe('view_details', 'View Details')}
//                 </Text>
//                 <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         ))}

//         {/* No checklists message */}
//         {predefinedChecklists.length === 0 && (
//           <View style={styles.noChecklistsContainer}>
//             <MaterialIcons name="cleaning-services" size={40} color={COLORS.gray} />
//             <Text style={styles.noChecklistsText}>
//               {tSafe('no_checklists_available', 'No cleaning checklists available for this property')}
//             </Text>
//             <Text style={styles.noChecklistsSubtext}>
//               {tSafe('create_checklist_first', 'Please create a checklist first or contact support')}
//             </Text>
//           </View>
//         )}

//         {/* Checklist Details Modal */}
//         <Modal
//           visible={selectedChecklistForModal !== null}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={closeModal}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               {selectedChecklistForModal && (
//                 <>
//                   <View style={styles.modalHeader}>
//                     <Text style={styles.modalTitle}>
//                       {selectedChecklistForModal.checklistName} {tSafe('details', 'Details')}
//                     </Text>
//                     <TouchableOpacity onPress={closeModal}>
//                       <MaterialIcons name="close" size={24} color={COLORS.gray} />
//                     </TouchableOpacity>
//                   </View>

//                   <ScrollView
//                     style={styles.modalContent}
//                     showsVerticalScrollIndicator={true}
//                   >
//                     <View style={styles.modalSection}>
//                       <Text style={styles.sectionTitle}>
//                         {tSafe('overview', 'Overview')}
//                       </Text>
//                       <View style={styles.infoRow}>
//                         <Text style={styles.infoLabel}>{tSafe('created', 'Created:')}</Text>
//                         <Text style={styles.infoValue}>
//                           {formatDate(selectedChecklistForModal.createdAt)}
//                         </Text>
//                       </View>
//                       <View style={styles.infoRow}>
//                         <Text style={styles.infoLabel}>{tSafe('total_fee', 'Total Fee:')}</Text>
//                         <Text style={styles.modalTotalFee}>
//                           {currency}{selectedChecklistForModal.totalFee.toFixed(2)}
//                         </Text>
//                       </View>

//                       <Text style={styles.sectionTitle}>
//                         {tSafe('groups_tasks', 'Groups & Tasks')}
//                       </Text>

//                       {Object.entries(selectedChecklistForModal.checklist).map(([groupId, group]) => {
//                         const groupNumber = groupId.split('_')[1];

//                         return (
//                           <View key={groupId} style={styles.groupContainer}>
//                             {/* Group Header */}
//                             <View style={styles.groupHeader}>
//                               <Text style={styles.groupTitle}>
//                                 {tSafe('group', 'Group')} {groupNumber}
//                               </Text>
//                               <View style={styles.groupPriceTime}>
//                                 <View style={styles.timeBadge}>
//                                   <Text style={styles.timeText}>
//                                     {minutesToDuration(group.totalTime)}  {tSafe('mins', 'mins')}
//                                   </Text>
//                                 </View>
//                                 <View style={styles.priceBadge}>
//                                   <Text style={styles.priceText}>
//                                     {currency}{group.price.toFixed(2)}
//                                   </Text>
//                                 </View>
//                               </View>
//                             </View>

//                             {/* Group Details */}
//                             <View style={styles.groupDetails}>
//                               <View style={styles.infoRow}>
//                                 <Text style={styles.infoLabel}>{tSafe('rooms', 'Rooms:')}</Text>
//                                 <Text style={styles.infoValue}>
//                                   {formatRoomCounts(group.rooms)}
//                                 </Text>
//                               </View>

//                               {group.extras && group.extras.length > 0 && (
//                                 <View style={styles.infoRow}>
//                                   <Text style={styles.infoLabel}>{tSafe('extras', 'Extras:')}</Text>
//                                   <Text style={styles.infoValue}>
//                                     {group.extras.join(', ')}
//                                   </Text>
//                                 </View>
//                               )}

//                               {/* Tasks by Room - 🔥 UPDATED: With formatted room labels */}
//                               <View style={styles.roomsTasksContainer}>
//                                 {Object.entries(group.details).map(([roomKey, roomData]) => {
//                                   if (!roomData.tasks || !Array.isArray(roomData.tasks) || roomData.tasks.length === 0) {
//                                     return null;
//                                   }

//                                   return (
//                                     <View key={`${roomKey}-${groupId}`} style={styles.roomSection}>
//                                       {/* 🔥 UPDATED: Use formatted room label */}
//                                       <Text style={styles.roomTitle}>
//                                         {formatRoomLabel(roomKey)}
//                                       </Text>

//                                       {/* 🔥 UPDATED: Render tasks in two columns */}
//                                       {renderRoomTasks(roomData, roomKey)}
//                                     </View>
//                                   );
//                                 })}
//                               </View>
//                             </View>
//                           </View>
//                         );
//                       })}
//                     </View>
//                   </ScrollView>

//                   <View style={styles.modalFooter}>
//                     <Button
//                       mode="contained"
//                       onPress={() => {
//                         handleChecklistSelect(selectedChecklistForModal);
//                         closeModal();
//                       }}
//                       style={[
//                         styles.selectButton,
//                         selectedChecklistId === selectedChecklistForModal._id && styles.alreadySelectedButton
//                       ]}
//                       disabled={selectedChecklistId === selectedChecklistForModal._id}
//                     >
//                       {selectedChecklistId === selectedChecklistForModal._id
//                         ? tSafe('already_selected', '✓ Already Selected')
//                         : tSafe('select_checklist', 'Select This Checklist')}
//                     </Button>
//                   </View>
//                 </>
//               )}
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 0,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: COLORS.dark,
//   },
//   subtitle: {
//     fontSize: 14,
//     marginBottom: 24,
//     color: COLORS.gray,
//   },

//   // 🔥 NEW: Selected checklist summary
//   selectedSummary: {
//     backgroundColor: '#F0F9FF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#B3E0FF',
//   },
//   summaryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 8,
//   },
//   summaryContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   summaryName: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   summaryFee: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   summaryHint: {
//     fontSize: 13,
//     color: COLORS.gray,
//     fontStyle: 'italic',
//   },

//   // Validation message styles
//   validationMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF5F5',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#FFE5E5',
//   },
//   validationText: {
//     marginLeft: 8,
//     color: '#FF6B6B',
//     fontSize: 14,
//   },

//   // Selected indicator
//   selectedIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E6F7E9',
//     padding: 8,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   selectedText: {
//     marginLeft: 6,
//     color: COLORS.success,
//     fontWeight: '500',
//     fontSize: 14,
//   },

//   // No checklists message
//   noChecklistsContainer: {
//     alignItems: 'center',
//     padding: 30,
//     backgroundColor: '#F9F9F9',
//     borderRadius: 12,
//     marginTop: 20,
//   },
//   noChecklistsText: {
//     fontSize: 16,
//     color: COLORS.dark,
//     marginTop: 12,
//     textAlign: 'center',
//   },
//   noChecklistsSubtext: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   // Card styles
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#eaeaea',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//     shadowColor: COLORS.primary,
//     shadowOpacity: 0.1,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     flex: 1,
//     color: COLORS.dark,
//   },
//   groupBadge: {
//     backgroundColor: '#e6f2ff',
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//   },
//   groupText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   cardContent: {
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     paddingTop: 16,
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 2,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   detailValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
//   totalFee: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   detailsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     marginTop: 8,
//   },
//   detailsButtonText: {
//     color: COLORS.primary,
//     fontWeight: '500',
//     marginRight: 4,
//   },

//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 0,
//     height: height * 0.9,
//     marginTop: height * 0.1,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   modalContent: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   modalSection: {
//     paddingBottom: 20,
//   },
//   modalFooter: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 16,
//     color: COLORS.dark,
//     marginTop: 10,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     paddingHorizontal: 8,
//   },
//   infoLabel: {
//     fontSize: 15,
//     color: COLORS.gray,
//     flex: 1,
//   },
//   infoValue: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: COLORS.dark,
//     flex: 1,
//     textAlign: 'right',
//   },
//   modalTotalFee: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },

//   // Group container styles
//   groupContainer: {
//     backgroundColor: '#f9f9ff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   groupHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   groupTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   groupPriceTime: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   timeBadge: {
//     backgroundColor: '#e6f2ff',
//     borderRadius: 8,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//   },
//   timeText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   priceBadge: {
//     backgroundColor: '#e6f7e9',
//     borderRadius: 8,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//   },
//   priceText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.success,
//   },
//   groupDetails: {
//     paddingTop: 8,
//   },

//   // Rooms and tasks container
//   roomsTasksContainer: {
//     marginTop: 12,
//   },
//   roomSection: {
//     marginBottom: 16,
//   },
//   roomTitle: {
//     fontSize: 15,
//     fontWeight: '500',
//     marginBottom: 8,
//     color: COLORS.primary,
//     paddingLeft: 4,
//   },
//   roomTasksContainer: {
//     marginTop: 4,
//   },

//   // Two-column layout for tasks
//   twoColumnLayout: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 4,
//   },
//   column: {
//     width: '48%',
//   },
//   taskItemWrapper: {
//     marginBottom: 6,
//   },
//   taskItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     paddingVertical: 2,
//   },
//   taskIcon: {
//     marginTop: 4,
//     marginRight: 6,
//   },
//   taskText: {
//     fontSize: 13,
//     color: COLORS.dark,
//     flex: 1,
//     lineHeight: 16,
//   },

//   // Button styles
//   selectButton: {
//     borderRadius: 12,
//     paddingVertical: 8,
//     backgroundColor: COLORS.primary,
//   },
//   alreadySelectedButton: {
//     backgroundColor: COLORS.success,
//   },
// });
