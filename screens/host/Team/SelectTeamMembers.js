// screens/host/team/SelectTeamMembers.js
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';

import {
  AppText,
  AppCard,
  AppButton,
} from '../../../ui';

import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getMemberId = (member) => {
  const id = member?._id ?? member?.id;

  return id == null ? '' : String(id);
};

const getMemberName = (member) => {
  const name = String(member?.name || '').trim();

  return name || tSafe('team_member', 'Team Member');
};

const getMemberPhone = (member) => {
  return String(member?.phone || '').trim();
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const SelectTeamMembers = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const {
    scheduleId,
    incident,
  } = route.params || {};

  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  // ───────────────────────────────────────────────────────────
  // Fetch team members
  // ───────────────────────────────────────────────────────────

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await userService.getTeamMembers();

      const members = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setTeamMembers(members);
    } catch (error) {
      console.error(
        'Failed to load team members:',
        error
      );

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'could_not_load_team',
          'Could not load team members. Please try again.'
        ),
        [
          {
            text: tSafe('cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: tSafe('retry', 'Retry'),
            onPress: fetchTeamMembers,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!scheduleId || !incident) {
      setLoading(false);

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'missing_required_data',
          'Missing required data.'
        ),
        [
          {
            text: tSafe('ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );

      return;
    }

    fetchTeamMembers();
  }, [scheduleId, incident, navigation, fetchTeamMembers]);

  // ───────────────────────────────────────────────────────────
  // Selection
  // ───────────────────────────────────────────────────────────

  const toggleSelection = useCallback((id) => {
    if (!id) {
      return;
    }

    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (selectedId) => selectedId !== id
        );
      }

      return [...previous, id];
    });
  }, []);

  const selectedCount = selectedIds.length;

  const allSelected =
    teamMembers.length > 0 &&
    teamMembers.every((member) => {
      const id = getMemberId(member);

      return id && selectedIds.includes(id);
    });

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    const allIds = teamMembers
      .map(getMemberId)
      .filter(Boolean);

    setSelectedIds([...new Set(allIds)]);
  }, [allSelected, teamMembers]);

  // ───────────────────────────────────────────────────────────
  // Send notifications
  // ───────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (sending) {
      return;
    }

    if (selectedIds.length === 0) {
      Alert.alert(
        tSafe('no_selection', 'No selection'),
        tSafe(
          'select_at_least_one',
          'Please select at least one team member.'
        )
      );

      return;
    }

    if (!scheduleId || !incident) {
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'missing_required_data',
          'Missing required data.'
        )
      );

      return;
    }

    setSending(true);

    try {
      await userService.notifyTeamMembers({
        scheduleId,

        incident: {
          groupIndex: incident.groupIndex,
          incidentIndex: incident.incidentIndex,
        },

        teamMemberIds: selectedIds,

        message: message.trim(),
      });

      Alert.alert(
        tSafe('success_title', 'Success'),
        tSafe(
          'notifications_sent',
          `Notifications sent to ${selectedIds.length} team member(s).`
        ),
        [
          {
            text: tSafe('ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error(
        'Failed to send notifications:',
        error
      );

      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        tSafe(
          'send_failed',
          'Failed to send notifications. Please try again.'
        );

      Alert.alert(
        tSafe('error_title', 'Error'),
        typeof errorMessage === 'string'
          ? errorMessage
          : tSafe(
              'send_failed',
              'Failed to send notifications. Please try again.'
            )
      );
    } finally {
      setSending(false);
    }
  }, [
    sending,
    selectedIds,
    scheduleId,
    incident,
    message,
    navigation,
  ]);

  // ───────────────────────────────────────────────────────────
  // Team member card
  // ───────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }) => {
      const memberId = getMemberId(item);

      const isSelected =
        memberId !== '' &&
        selectedIds.includes(memberId);

      const name = getMemberName(item);
      const phone = getMemberPhone(item);

      const workTypes = Array.isArray(item?.workTypes)
        ? item.workTypes.filter(Boolean)
        : [];

      return (
        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: isSelected,
            disabled: !memberId,
          }}
          accessibilityLabel={`${name}${
            phone ? `, ${phone}` : ''
          }`}
          key={memberId || `team-member-${index}`}
          style={[
            styles.memberItem,
            isSelected && styles.memberItemSelected,
          ]}
          onPress={() => toggleSelection(memberId)}
          disabled={!memberId || sending}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.memberAvatar,
              isSelected && styles.memberAvatarSelected,
            ]}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color={
                isSelected
                  ? theme.brand.primary
                  : theme.icon.muted
              }
            />
          </View>

          <View style={styles.memberInfo}>
            <AppText
              variant="subtitle"
              style={styles.memberName}
              numberOfLines={1}
            >
              {name}
            </AppText>

            {phone ? (
              <View style={styles.phoneRow}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={13}
                  color={theme.icon.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  numberOfLines={1}
                >
                  {phone}
                </AppText>
              </View>
            ) : null}

            {workTypes.length > 0 ? (
              <View style={styles.workTypeTags}>
                {workTypes.slice(0, 2).map(
                  (workType, typeIndex) => (
                    <View
                      key={`${String(workType)}-${typeIndex}`}
                      style={styles.tag}
                    >
                      <AppText
                        variant="caption"
                        style={styles.tagText}
                        numberOfLines={1}
                      >
                        {String(workType)}
                      </AppText>
                    </View>
                  )
                )}

                {workTypes.length > 2 ? (
                  <View style={styles.moreTagContainer}>
                    <AppText
                      variant="caption"
                      style={styles.moreTag}
                    >
                      +{workTypes.length - 2}
                    </AppText>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.selectionIndicator,
              isSelected &&
                styles.selectionIndicatorSelected,
            ]}
          >
            {isSelected ? (
              <MaterialCommunityIcons
                name="check"
                size={17}
                color={theme.text.inverse}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [
      selectedIds,
      sending,
      styles,
      theme,
      toggleSelection,
    ]
  );

  // ───────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={38}
          color={theme.brand.primary}
        />
      </View>

      <AppText
        variant="heading"
        style={styles.emptyTitle}
      >
        {tSafe(
          'no_team_members',
          'No team members found'
        )}
      </AppText>

      <AppText
        color={theme.text.secondary}
        style={styles.emptyDescription}
      >
        {tSafe(
          'add_members_first',
          'Add team members in the team management section.'
        )}
      </AppText>

      <AppButton
        title={tSafe('retry', 'Retry')}
        variant="outline"
        icon="refresh"
        onPress={fetchTeamMembers}
        style={styles.retryButton}
      />
    </View>
  );

  // ───────────────────────────────────────────────────────────
  // Loading state
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={theme.background.default}
          barStyle={
            isDark ? 'light-content' : 'dark-content'
          }
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_team_members',
              'Loading team members...'
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Main render
  // ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 90 : 0
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={24}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.headerTextContainer}>
              <AppText
                variant="heading"
                style={styles.title}
              >
                {tSafe(
                  'notify_team_members',
                  'Notify Team Members'
                )}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.secondary}
                style={styles.headerCaption}
              >
                {tSafe(
                  'select_members_subtitle',
                  'Choose who should receive this incident notification.'
                )}
              </AppText>
            </View>
          </View>

          <View style={styles.incidentSummary}>
            <View style={styles.incidentSummaryIcon}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={19}
                color={theme.status.warning}
              />
            </View>

            <View style={styles.incidentSummaryContent}>
              <AppText
                variant="label"
                color={theme.text.secondary}
              >
                {tSafe(
                  'incident_desc',
                  'Incident'
                )}
              </AppText>

              <AppText
                variant="body"
                style={styles.incidentDescription}
              >
                {incident?.description ||
                  tSafe(
                    'no_description',
                    'No description provided.'
                  )}
              </AppText>
            </View>
          </View>
        </View>

        {/* Optional message */}

        <View style={styles.messageSection}>
          <View style={styles.sectionHeading}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={18}
              color={theme.icon.muted}
            />

            <AppText
              variant="subtitle"
              style={styles.sectionTitle}
            >
              {tSafe(
                'message_optional',
                'Message (Optional)'
              )}
            </AppText>
          </View>

          <TextInput
            style={styles.messageInput}
            placeholder={tSafe(
              'optional_message',
              'Add a message for the selected team members...'
            )}
            placeholderTextColor={theme.input.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            maxLength={1000}
            textAlignVertical="top"
            editable={!sending}
            selectionColor={theme.input.focus}
            accessibilityLabel={tSafe(
              'optional_message',
              'Optional message'
            )}
          />

          <AppText
            variant="caption"
            color={theme.text.muted}
            style={styles.characterCount}
          >
            {message.length}/1000
          </AppText>
        </View>

        {/* Team member heading */}

        <View style={styles.membersHeader}>
          <View style={styles.membersHeaderLeft}>
            <AppText
              variant="title"
              style={styles.membersTitle}
            >
              {tSafe(
                'select_members',
                'Select team members'
              )}
            </AppText>

            <View style={styles.selectedBadge}>
              <AppText
                variant="caption"
                style={styles.selectedBadgeText}
              >
                {selectedCount}
              </AppText>
            </View>
          </View>

          {teamMembers.length > 0 ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={toggleSelectAll}
              disabled={sending}
              activeOpacity={0.7}
            >
              <AppText
                variant="bodyMedium"
                color={theme.brand.primary}
              >
                {allSelected
                  ? tSafe('deselect_all', 'Deselect all')
                  : tSafe('select_all', 'Select all')}
              </AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Member list */}

        <FlatList
          data={teamMembers}
          keyExtractor={(item, index) =>
            getMemberId(item) || `team-member-${index}`
          }
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            teamMembers.length === 0 &&
              styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          extraData={selectedIds}
        />

        {/* Send notification button */}

        <View style={styles.footer}>
          <AppButton
            title={
              sending
                ? tSafe('sending', 'Sending...')
                : `${tSafe(
                    'send_notifications',
                    'Send Notifications'
                  )} (${selectedCount})`
            }
            variant="primary"
            size="large"
            fullWidth
            loading={sending}
            disabled={
              selectedCount === 0 ||
              sending ||
              teamMembers.length === 0
            }
            icon="send"
            onPress={handleSend}
          />

          <AppText
            variant="caption"
            color={theme.text.muted}
            style={styles.footerHint}
          >
            {tSafe(
              'notification_footer_hint',
              'Only selected team members will be notified.'
            )}
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// Theme-aware styles
// ─────────────────────────────────────────────────────────────

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    keyboardContainer: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    loadingText: {
      marginTop: 14,
      fontSize: 14,
      textAlign: 'center',
    },

    header: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 16,
      backgroundColor: theme.surface.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 12,
    },

    headerTextContainer: {
      flex: 1,
    },

    title: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 4,
    },

    headerCaption: {
      fontSize: 12,
      lineHeight: 17,
    },

    incidentSummary: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 16,
      padding: 12,
      borderRadius: 13,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    incidentSummaryIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 10,
    },

    incidentSummaryContent: {
      flex: 1,
    },

    incidentDescription: {
      marginTop: 4,
      lineHeight: 20,
    },

    messageSection: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 12,
    },

    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 9,
      gap: 8,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
    },

    messageInput: {
      minHeight: 90,
      maxHeight: 150,
      paddingHorizontal: 13,
      paddingVertical: 12,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: theme.input.border,
      backgroundColor: theme.input.background,
      color: theme.input.text,
      fontSize: 14,
      lineHeight: 20,
    },

    characterCount: {
      textAlign: 'right',
      marginTop: 5,
    },

    membersHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 12,
    },

    membersHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    membersTitle: {
      fontSize: 16,
      fontWeight: '800',
    },

    selectedBadge: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: 7,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
    },

    selectedBadgeText: {
      color: theme.brand.primary,
      fontWeight: '800',
    },

    listContent: {
      paddingHorizontal: 18,
      paddingBottom: 12,
      flexGrow: 1,
    },

    listContentEmpty: {
      justifyContent: 'center',
    },

    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 13,
      marginBottom: 9,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.card.border,
      backgroundColor: theme.card.background,
    },

    memberItemSelected: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.surface.selected,
    },

    memberAvatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 12,
    },

    memberAvatarSelected: {
      backgroundColor: theme.brand.primaryLight,
    },

    memberInfo: {
      flex: 1,
      minWidth: 0,
    },

    memberName: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
    },

    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 1,
    },

    workTypeTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: 7,
      gap: 5,
    },

    tag: {
      maxWidth: 150,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    tagText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.text.secondary,
    },

    moreTagContainer: {
      paddingHorizontal: 5,
      paddingVertical: 3,
    },

    moreTag: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
    },

    selectionIndicator: {
      width: 25,
      height: 25,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: theme.border.strong,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },

    selectionIndicatorSelected: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },

    emptyIconContainer: {
      width: 76,
      height: 76,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginBottom: 16,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 7,
    },

    emptyDescription: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 18,
      minWidth: 140,
    },

    footer: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 12 : 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border.default,
      backgroundColor: theme.surface.default,
    },

    footerHint: {
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
      marginTop: 8,
    },
  });

export default SelectTeamMembers;