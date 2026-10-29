// ProjectTimelineBar.js

import React, { useMemo, useState, useEffect } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

import { useTheme } from '../../theme';

const MILESTONES = [
    {
        key: 'published',
        stage: 0,
        step: 0,
        label: 'Published',
        description: 'Job published and available for cleaner matching.',
        icon: 'cloud-upload',
        statuses: ['open'],
        actions: [
            'schedule_created',
            'job_published',
            'publish_schedule',
            'schedule_published',
        ],
    },
    {
        key: 'assigned',
        stage: 1,
        step: 0,
        label: 'Cleaner accepted',
        description: 'A cleaner accepted the cleaning request.',
        icon: 'account-check',
        statuses: ['pending_payment'],
        actions: [
            'cleaner_accepts',
            'cleaner_accepted',
            'cleaner_accepts_request',
        ],
    },
    {
        key: 'payment_confirmed',
        stage: 1,
        step: 1,
        label: 'Payment confirmed',
        description: 'Payment was confirmed by the backend.',
        icon: 'credit-card-check',
        statuses: ['payment_confirmed'],
        actions: [
            'payment_made',
            'payment_confirmed',
            'payment_succeeded',
        ],
    },
    {
        key: 'upcoming',
        stage: 1,
        step: 2,
        label: 'Upcoming',
        description: 'The cleaning is scheduled to take place.',
        icon: 'calendar-clock',
        statuses: ['upcoming'],
        actions: [
            'schedule_confirmed',
            'cleaning_scheduled',
        ],
    },
    {
        key: 'clocked_in',
        stage: 1,
        step: 3,
        label: 'Clocked in',
        description: 'The cleaner recorded their arrival.',
        icon: 'map-marker-check',
        statuses: ['clocked_in'],
        actions: ['clock_in', 'cleaner_clocked_in'],
    },
    {
        key: 'in_progress',
        stage: 1,
        step: 4,
        label: 'Cleaning in progress',
        description: 'Cleaning work is underway.',
        icon: 'broom',
        statuses: ['in_progress'],
        actions: [
            'start_cleaning',
            'cleaning_started',
        ],
    },
    {
        key: 'pending_review',
        stage: 2,
        step: 0,
        label: 'Pending review',
        description: 'The cleaning is awaiting host review.',
        icon: 'clipboard-check-outline',
        statuses: ['pending_review'],
        actions: [
            'cleaning_completed',
            'submit_for_review',
            'pending_review',
        ],
    },
    {
        key: 'approved',
        stage: 2,
        step: 1,
        label: 'Host approved',
        description: 'The host approved the cleaning.',
        icon: 'check-decagram',
        statuses: ['approved'],
        actions: ['host_approves', 'host_approved'],
    },
    {
        key: 'completed',
        stage: 2,
        step: 2,
        label: 'Completed',
        description: 'The schedule reached its final completed state.',
        icon: 'check-circle',
        statuses: ['completed', 'reviewed'],
        actions: [
            'host_final_approves',
            'schedule_completed',
            'cleaning_finalized',
        ],
    },
];

const STAGES = [
    {
        id: 0,
        title: 'Step 1: Publish Job',
        icon: 'cloud-upload',
        milestoneKeys: ['published'],
    },
    {
        id: 1,
        title: 'Step 2: Cleaning & Assignment',
        icon: 'broom',
        milestoneKeys: [
            'assigned',
            'payment_confirmed',
            'upcoming',
            'clocked_in',
            'in_progress',
        ],
    },
    {
        id: 2,
        title: 'Step 3: Review & Close',
        icon: 'clipboard-check-outline',
        milestoneKeys: [
            'pending_review',
            'approved',
            'completed',
        ],
    },
];

const STATUS_ALIASES = {
    created: 'published',
    published: 'published',
    open: 'published',

    accepted: 'assigned',
    pending_payment: 'assigned',
    cleaner_accepted: 'assigned',

    payment_made: 'payment_confirmed',
    payment_succeeded: 'payment_confirmed',

    upcoming: 'upcoming',

    clock_in: 'clocked_in',

    cleaning_started: 'in_progress',

    cleaning_completed: 'pending_review',

    host_approved: 'approved',

    host_final_approves: 'completed',
    reviewed: 'completed',
    completed: 'completed',
};

const TERMINAL_STATUSES = [
    'cancelled',
    'canceled',
    'host_cancelled',
    'host_canceled',
];

const REPLACEMENT_ACTIONS = [
    'cleaner_cancels',
    'cleaner_cancelled',
    'cleaner_canceled',
    'host_removes_cleaner',
    'replacement_required',
];

const REPLACEMENT_STATUSES = [
    'replacement_required',
    'waiting_for_cleaners',
    'cleaner_available',
    'payment_required',
];

const normalize = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');

const getHistoryAction = (entry) =>
    normalize(
        entry?.action ||
        entry?.event ||
        entry?.type
    );

const getHistoryStatus = (entry) =>
    normalize(
        entry?.status ||
        entry?.new_status ||
        entry?.to_status
    );

const getHistoryTimestamp = (entry) =>
    entry?.timestamp ||
    entry?.created_at ||
    entry?.createdAt ||
    entry?.updated_at ||
    entry?.date ||
    null;

const getHistoryNote = (entry) =>
    entry?.note ||
    entry?.message ||
    entry?.description ||
    null;

const parseTimestamp = (value) => {
    if (!value) {
        return null;
    }

    const parsed = moment(value);

    return parsed.isValid() ? parsed : null;
};

const formatTimestamp = (value) => {
    const parsed = parseTimestamp(value);

    if (!parsed) {
        return null;
    }

    return parsed.format('MMM D, YYYY [at] h:mm A');
};

const findMilestoneForHistoryEntry = (entry) => {
    const action = getHistoryAction(entry);
    const status = getHistoryStatus(entry);

    // Prefer an explicit transition action because history entries
    // may contain a status representing the state before a transition.
    for (const milestone of MILESTONES) {
        if (milestone.actions.includes(action)) {
            return milestone;
        }
    }

    // Fall back to the status recorded in the history entry.
    for (const milestone of MILESTONES) {
        if (milestone.statuses.includes(status)) {
            return milestone;
        }
    }

    return null;
};

const getCurrentMilestoneKey = (status) => {
    const normalizedStatus = normalize(status);

    return STATUS_ALIASES[normalizedStatus] || null;
};

const ProjectTimelineBar = ({
    currentStatus,
    scheduledDate,
    history = [],
    onReviewPress,
    onContactCleaner,
}) => {
    const { theme } = useTheme();

    const [expandedStages, setExpandedStages] = useState({
        0: true,
        1: true,
        2: true,
    });

    useEffect(() => {
        const activeKey = getCurrentMilestoneKey(currentStatus);

        const activeMilestone = MILESTONES.find(
            (milestone) => milestone.key === activeKey
        );

        if (activeMilestone) {
            setExpandedStages((previous) => ({
                ...previous,
                [activeMilestone.stage]: true,
            }));
        }
    }, [currentStatus]);

    const colors = useMemo(() => ({
        background: theme.background.default,

        surface: theme.surface.default,
        elevated: theme.surface.elevated,
        selected: theme.surface.selected,

        primary: theme.brand.primary,

        text: theme.text.primary,
        secondaryText: theme.text.secondary,
        mutedText: theme.text.muted,

        border: theme.border.default,

        success: theme.status.success,
        warning: theme.status.warning,
        error: theme.status.error,

        icon: theme.icon.default,
        mutedIcon: theme.icon.muted,

        shadow: theme.shadow.color,
        shadowOpacity: theme.shadow.opacity,
    }), [theme]);

    const styles = useMemo(
        () => createStyles(colors),
        [colors]
    );

    const normalizedHistory = useMemo(() => {
        if (!Array.isArray(history)) {
            return [];
        }

        return history
            .map((entry, originalIndex) => ({
                ...entry,
                originalIndex,
                parsedTimestamp: parseTimestamp(
                    getHistoryTimestamp(entry)
                ),
            }))
            .sort((a, b) => {
                if (
                    a.parsedTimestamp &&
                    b.parsedTimestamp
                ) {
                    return (
                        a.parsedTimestamp.valueOf() -
                        b.parsedTimestamp.valueOf()
                    );
                }

                // Preserve original order when timestamps are absent.
                return a.originalIndex - b.originalIndex;
            });
    }, [history]);

    const currentStatusNormalized = normalize(currentStatus);

    const currentMilestoneKey =
        getCurrentMilestoneKey(currentStatus);

    const currentMilestone = MILESTONES.find(
        (milestone) =>
            milestone.key === currentMilestoneKey
    );

    const isCancelled = TERMINAL_STATUSES.includes(
        currentStatusNormalized
    );

    const isReplacementRequired =
        currentStatusNormalized === 'replacement_required' ||
        normalizedHistory.some((entry) => {
            const action = getHistoryAction(entry);
            const status = getHistoryStatus(entry);

            return (
                REPLACEMENT_ACTIONS.includes(action) ||
                REPLACEMENT_STATUSES.includes(status)
            );
        });

    /*
     * Build a history-backed record for each milestone.
     *
     * The history entry is the source for timestamps and notes.
     * The current status can establish that a milestone has been
     * reached even if that particular transition lacks a history entry.
     */
    const milestoneRecords = useMemo(() => {
        const records = {};

        normalizedHistory.forEach((entry) => {
            const milestone =
                findMilestoneForHistoryEntry(entry);

            if (!milestone) {
                return;
            }

            const existing = records[milestone.key];

            const timestamp = getHistoryTimestamp(entry);

            if (
                !existing ||
                (
                    timestamp &&
                    (
                        !existing.timestamp ||
                        (
                            parseTimestamp(timestamp) &&
                            parseTimestamp(existing.timestamp) &&
                            parseTimestamp(timestamp).isAfter(
                                parseTimestamp(existing.timestamp)
                            )
                        )
                    )
                )
            ) {
                records[milestone.key] = {
                    key: milestone.key,
                    timestamp,
                    note: getHistoryNote(entry),
                    action: getHistoryAction(entry),
                    status: getHistoryStatus(entry),
                    source: 'history',
                };
            }
        });

        return records;
    }, [normalizedHistory]);

    /*
     * Determine the furthest known milestone from the current backend
     * status. This helps keep the active indicator accurate even when
     * older history entries are missing.
     */
    const furthestReachedIndex = useMemo(() => {
        let furthest = -1;

        MILESTONES.forEach((milestone, index) => {
            if (milestoneRecords[milestone.key]) {
                furthest = Math.max(furthest, index);
            }
        });

        if (currentMilestone) {
            const currentIndex = MILESTONES.findIndex(
                (milestone) =>
                    milestone.key === currentMilestone.key
            );

            furthest = Math.max(furthest, currentIndex);
        }

        return furthest;
    }, [milestoneRecords, currentMilestone]);

    const milestoneStates = useMemo(() => {
        const result = {};

        MILESTONES.forEach((milestone, index) => {
            const record = milestoneRecords[milestone.key];

            const isCurrent =
                milestone.key === currentMilestoneKey;

            const hasHistoryRecord = Boolean(record);

            let state = 'upcoming';

            if (isCancelled) {
                // Cancellation is a terminal exception, not successful
                // completion of all the later milestones.
                if (hasHistoryRecord) {
                    state = 'completed';
                }
            } else if (hasHistoryRecord) {
                state = 'completed';
            } else if (isCurrent) {
                state = 'active';
            } else if (
                index < furthestReachedIndex
            ) {
                /*
                 * The backend's current status or a later recorded
                 * milestone proves this milestone was passed, but its
                 * individual history event was not found.
                 */
                state = 'completed';
            } else if (
                index === furthestReachedIndex &&
                !hasHistoryRecord &&
                currentMilestone
            ) {
                state = isCurrent ? 'active' : 'upcoming';
            }

            if (isCurrent && !isCancelled) {
                state = 'active';
            }

            result[milestone.key] = {
                state,
                record,
                hasHistoryRecord,
                inferred:
                    state === 'completed' &&
                    !hasHistoryRecord,
            };
        });

        return result;
    }, [
        milestoneRecords,
        currentMilestoneKey,
        furthestReachedIndex,
        currentMilestone,
        isCancelled,
    ]);

    const getMilestoneColor = (state) => {
        switch (state) {
            case 'completed':
                return colors.success;

            case 'active':
                return colors.primary;

            default:
                return colors.border;
        }
    };

    const getStageState = (stage) => {
        const states = stage.milestoneKeys.map(
            (key) => milestoneStates[key]?.state || 'upcoming'
        );

        if (states.includes('active')) {
            return 'active';
        }

        if (
            states.length > 0 &&
            states.every((state) => state === 'completed')
        ) {
            return 'completed';
        }

        if (states.some((state) => state === 'completed')) {
            return 'active';
        }

        return 'upcoming';
    };

    const getStageColor = (state) =>
        getMilestoneColor(state);

    const toggleStage = (stageIndex) => {
        setExpandedStages((previous) => ({
            ...previous,
            [stageIndex]: !previous[stageIndex],
        }));
    };

    const getProgress = () => {
        if (isCancelled) {
            return 0;
        }

        if (
            currentMilestoneKey === 'completed' ||
            currentStatusNormalized === 'reviewed'
        ) {
            return 100;
        }

        if (currentMilestoneKey === 'approved') {
            return 90;
        }

        if (currentMilestoneKey === 'pending_review') {
            return 80;
        }

        if (currentMilestoneKey === 'in_progress') {
            return 65;
        }

        if (currentMilestoneKey === 'clocked_in') {
            return 55;
        }

        if (currentMilestoneKey === 'upcoming') {
            return 45;
        }

        if (currentMilestoneKey === 'payment_confirmed') {
            return 35;
        }

        if (currentMilestoneKey === 'assigned') {
            return 25;
        }

        if (currentMilestoneKey === 'published') {
            return 10;
        }

        return 0;
    };

    const progressPercent = getProgress();

    const renderMilestone = (milestone, index, stage) => {
        const milestoneState =
            milestoneStates[milestone.key] || {
                state: 'upcoming',
                record: null,
                hasHistoryRecord: false,
                inferred: false,
            };

        const state = milestoneState.state;
        const record = milestoneState.record;

        const isActive = state === 'active';
        const isCompleted = state === 'completed';

        const milestoneColor =
            getMilestoneColor(state);

        const eventTimestamp = record?.timestamp
            ? formatTimestamp(record.timestamp)
            : null;

        const displayNote = record?.note;

        return (
            <View
                key={milestone.key}
                style={styles.milestoneRow}
            >
                <View style={styles.milestoneIndicator}>
                    <View
                        style={[
                            styles.milestoneCircle,
                            {
                                borderColor: milestoneColor,
                                backgroundColor: isCompleted
                                    ? milestoneColor
                                    : isActive
                                        ? colors.selected
                                        : colors.surface,
                            },
                        ]}
                    >
                        {isCompleted ? (
                            <MaterialCommunityIcons
                                name="check"
                                size={13}
                                color="#FFFFFF"
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name={milestone.icon}
                                size={12}
                                color={milestoneColor}
                            />
                        )}
                    </View>

                    {index < stage.milestoneKeys.length - 1 && (
                        <View
                            style={[
                                styles.milestoneLine,
                                {
                                    backgroundColor:
                                        isCompleted
                                            ? colors.success
                                            : colors.border,
                                },
                            ]}
                        />
                    )}
                </View>

                <View style={styles.milestoneContent}>
                    <View style={styles.milestoneTitleRow}>
                        <Text
                            style={[
                                styles.milestoneTitle,
                                {
                                    color: isActive
                                        ? colors.primary
                                        : isCompleted
                                            ? colors.text
                                            : colors.mutedText,
                                    fontWeight:
                                        isActive || isCompleted
                                            ? '600'
                                            : '400',
                                },
                            ]}
                        >
                            {milestone.label}
                        </Text>

                        {isActive && !isCancelled && (
                            <View
                                style={[
                                    styles.stateBadge,
                                    styles.activeStateBadge,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.stateBadgeText,
                                        {
                                            color: colors.primary,
                                        },
                                    ]}
                                >
                                    Current
                                </Text>
                            </View>
                        )}

                        {isCompleted && (
                            <View
                                style={[
                                    styles.stateBadge,
                                    styles.completedStateBadge,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.stateBadgeText,
                                        {
                                            color: colors.success,
                                        },
                                    ]}
                                >
                                    {milestoneState.hasHistoryRecord
                                        ? 'Recorded'
                                        : 'Reached'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.milestoneDescription}>
                        {milestone.description}
                    </Text>

                    {eventTimestamp && (
                        <View style={styles.timestampRow}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={13}
                                color={colors.secondaryText}
                            />

                            <Text style={styles.timestampText}>
                                {eventTimestamp}
                            </Text>
                        </View>
                    )}

                    {milestoneState.inferred && (
                        <Text style={styles.inferredText}>
                            Reached according to the current schedule
                            status; no matching timestamp was found
                            in history.
                        </Text>
                    )}

                    {displayNote && (
                        <View style={styles.noteContainer}>
                            <Text style={styles.noteText}>
                                {displayNote}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderReplacementBanner = () => {
        if (!isReplacementRequired) {
            return null;
        }

        return (
            <View style={styles.replacementBanner}>
                <MaterialCommunityIcons
                    name="account-switch-outline"
                    size={22}
                    color={colors.warning}
                />

                <View style={styles.bannerContent}>
                    <Text style={styles.replacementTitle}>
                        Cleaner replacement required
                    </Text>

                    <Text style={styles.replacementDescription}>
                        The schedule history indicates that a cleaner
                        cancellation or replacement workflow needs
                        attention. This is separate from successful
                        cleaning completion.
                    </Text>
                </View>
            </View>
        );
    };

    const renderCancellationBanner = () => {
        if (!isCancelled) {
            return null;
        }

        return (
            <View style={styles.cancellationBanner}>
                <MaterialCommunityIcons
                    name="cancel"
                    size={22}
                    color={colors.error}
                />

                <View style={styles.bannerContent}>
                    <Text style={styles.cancellationTitle}>
                        Schedule cancelled
                    </Text>

                    <Text style={styles.cancellationDescription}>
                        This schedule ended through cancellation.
                        Later cleaning and review milestones are not
                        treated as completed.
                    </Text>
                </View>
            </View>
        );
    };

    const renderActionButton = () => {
        if (
            currentStatusNormalized === 'pending_review' &&
            onReviewPress
        ) {
            return (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onReviewPress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>
                        Review Cleaning
                    </Text>

                    <MaterialCommunityIcons
                        name="arrow-right"
                        size={18}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            );
        }

        if (
            [
                'disapproved',
                'revision_needed',
            ].includes(currentStatusNormalized) &&
            onContactCleaner
        ) {
            return (
                <TouchableOpacity
                    style={styles.outlineButton}
                    onPress={onContactCleaner}
                    activeOpacity={0.8}
                >
                    <Text style={styles.outlineButtonText}>
                        Contact Cleaner
                    </Text>

                    <MaterialCommunityIcons
                        name="chat"
                        size={18}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            );
        }

        return null;
    };

    const getSummaryMessage = () => {
        if (isCancelled) {
            return 'This schedule was cancelled. Check its history for the recorded cancellation details.';
        }

        if (isReplacementRequired) {
            return 'A cleaner replacement event was detected. Follow the replacement workflow before treating the assignment as settled.';
        }

        switch (currentStatusNormalized) {
            case 'open':
                return 'The job is open and available for cleaner matching.';

            case 'pending_payment':
                return 'A cleaner has accepted the request. Payment is still pending.';

            case 'payment_confirmed':
                return 'Payment has been confirmed. Check the scheduled cleaning details.';

            case 'upcoming':
                return 'Your cleaner is expected on the scheduled date.';

            case 'clocked_in':
                return 'The cleaner has recorded their arrival.';

            case 'in_progress':
                return 'Cleaning is in progress.';

            case 'pending_review':
                return 'Review the cleaning quality and approve the work or request changes.';

            case 'approved':
                return 'The host approved the cleaning.';

            case 'completed':
            case 'reviewed':
                return 'The schedule has reached its completed state.';

            case 'payment_failed':
                return 'Payment failed. Check the payment status before proceeding.';

            default:
                return 'Follow the recorded schedule history to track the job lifecycle.';
        }
    };

    return (
        <View style={styles.container}>
            {/* Progress */}

            <View style={styles.progressSection}>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>
                        Schedule Progress
                    </Text>

                    <Text style={styles.progressPercent}>
                        {isCancelled
                            ? 'Cancelled'
                            : `${progressPercent}%`}
                    </Text>
                </View>

                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progressPercent}%`,
                                backgroundColor: isCancelled
                                    ? colors.error
                                    : colors.primary,
                            },
                        ]}
                    />
                </View>
            </View>

            {renderCancellationBanner()}
            {renderReplacementBanner()}

            {/* Timeline stages */}

            {STAGES.map((stage) => {
                const stageState = getStageState(stage);
                const isExpanded = expandedStages[stage.id];
                const canCollapse = stage.id !== 0;

                return (
                    <View
                        key={stage.id}
                        style={[
                            styles.stageCard,
                            stageState === 'active' &&
                                styles.activeStageCard,
                        ]}
                    >
                        <TouchableOpacity
                            activeOpacity={canCollapse ? 0.7 : 1}
                            onPress={() => {
                                if (canCollapse) {
                                    toggleStage(stage.id);
                                }
                            }}
                            disabled={!canCollapse}
                            accessibilityRole={
                                canCollapse ? 'button' : undefined
                            }
                            accessibilityState={
                                canCollapse
                                    ? { expanded: isExpanded }
                                    : undefined
                            }
                        >
                            <View style={styles.stageHeader}>
                                <View
                                    style={[
                                        styles.stageIcon,
                                        {
                                            backgroundColor:
                                                getStageColor(stageState),
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={stage.icon}
                                        size={21}
                                        color="#FFFFFF"
                                    />
                                </View>

                                <View style={styles.stageTitleContainer}>
                                    <Text style={styles.stageTitle}>
                                        {stage.title}
                                    </Text>

                                    <View style={styles.stageHeaderRight}>
                                        {stageState === 'completed' && (
                                            <MaterialCommunityIcons
                                                name="check-circle"
                                                size={18}
                                                color={colors.success}
                                            />
                                        )}

                                        {stageState === 'active' && (
                                            <Text
                                                style={[
                                                    styles.stageStateText,
                                                    {
                                                        color: colors.primary,
                                                    },
                                                ]}
                                            >
                                                Active
                                            </Text>
                                        )}

                                        {canCollapse && (
                                            <MaterialCommunityIcons
                                                name={
                                                    isExpanded
                                                        ? 'chevron-up'
                                                        : 'chevron-down'
                                                }
                                                size={22}
                                                color={colors.mutedIcon}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.milestonesContainer}>
                                {stage.milestoneKeys.map(
                                    (milestoneKey, index) => {
                                        const milestone =
                                            MILESTONES.find(
                                                (item) =>
                                                    item.key === milestoneKey
                                            );

                                        if (!milestone) {
                                            return null;
                                        }

                                        return renderMilestone(
                                            milestone,
                                            index,
                                            stage
                                        );
                                    }
                                )}
                            </View>
                        )}
                    </View>
                );
            })}

            {/* Actions */}

            {renderActionButton()}

            {/* Summary */}

            <View style={styles.summaryCard}>
                <MaterialCommunityIcons
                    name="information-outline"
                    size={21}
                    color={colors.primary}
                />

                <Text style={styles.summaryText}>
                    {getSummaryMessage()}
                </Text>
            </View>

            {/* History diagnostic */}

            {normalizedHistory.length === 0 && (
                <View style={styles.historyNotice}>
                    <MaterialCommunityIcons
                        name="history"
                        size={18}
                        color={colors.mutedText}
                    />

                    <Text style={styles.historyNoticeText}>
                        No schedule history entries were provided.
                        The active milestone is based on the current
                        schedule status; historical timestamps cannot
                        be displayed.
                    </Text>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: colors.background,
        },

        progressSection: {
            marginBottom: 20,
        },

        progressLabels: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },

        progressLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },

        progressPercent: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.primary,
        },

        progressTrack: {
            height: 8,
            backgroundColor: colors.border,
            borderRadius: 4,
            overflow: 'hidden',
        },

        progressFill: {
            height: '100%',
            borderRadius: 4,
        },

        stageCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 15,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: colors.border,

            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: colors.shadowOpacity,
            shadowRadius: 6,
            elevation: 2,
        },

        activeStageCard: {
            borderColor: colors.primary,
        },

        stageHeader: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        stageIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },

        stageTitleContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 0,
        },

        stageTitle: {
            color: colors.text,
            fontSize: 15,
            fontWeight: '600',
            flex: 1,
        },

        stageHeaderRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginLeft: 8,
        },

        stageStateText: {
            fontSize: 12,
            fontWeight: '600',
        },

        milestonesContainer: {
            marginTop: 18,
            marginLeft: 4,
        },

        milestoneRow: {
            flexDirection: 'row',
            alignItems: 'stretch',
            minHeight: 68,
        },

        milestoneIndicator: {
            width: 28,
            alignItems: 'center',
            marginRight: 12,
        },

        milestoneCircle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1.5,
            justifyContent: 'center',
            alignItems: 'center',
        },

        milestoneLine: {
            width: 2,
            flex: 1,
            minHeight: 32,
            marginVertical: 3,
        },

        milestoneContent: {
            flex: 1,
            paddingBottom: 20,
            minWidth: 0,
        },

        milestoneTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 6,
        },

        milestoneTitle: {
            fontSize: 14,
            flexShrink: 1,
        },

        milestoneDescription: {
            fontSize: 12,
            lineHeight: 18,
            color: colors.secondaryText,
            marginTop: 3,
        },

        stateBadge: {
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 10,
        },

        activeStateBadge: {
            backgroundColor: colors.selected,
        },

        completedStateBadge: {
            backgroundColor: colors.elevated,
        },

        stateBadgeText: {
            fontSize: 10,
            fontWeight: '700',
        },

        timestampRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
            gap: 5,
        },

        timestampText: {
            fontSize: 11,
            color: colors.secondaryText,
        },

        inferredText: {
            fontSize: 11,
            lineHeight: 16,
            color: colors.mutedText,
            marginTop: 5,
            fontStyle: 'italic',
        },

        noteContainer: {
            backgroundColor: colors.elevated,
            borderLeftWidth: 2,
            borderLeftColor: colors.border,
            padding: 8,
            marginTop: 7,
            borderRadius: 5,
        },

        noteText: {
            fontSize: 12,
            lineHeight: 17,
            color: colors.secondaryText,
        },

        replacementBanner: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.elevated,
            borderWidth: 1,
            borderColor: colors.warning,
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            gap: 10,
        },

        bannerContent: {
            flex: 1,
        },

        replacementTitle: {
            color: colors.warning,
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 4,
        },

        replacementDescription: {
            color: colors.secondaryText,
            fontSize: 12,
            lineHeight: 18,
        },

        cancellationBanner: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.elevated,
            borderWidth: 1,
            borderColor: colors.error,
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            gap: 10,
        },

        cancellationTitle: {
            color: colors.error,
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 4,
        },

        cancellationDescription: {
            color: colors.secondaryText,
            fontSize: 12,
            lineHeight: 18,
        },

        actionButton: {
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 28,
            marginBottom: 14,
        },

        actionButtonText: {
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '600',
        },

        outlineButton: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 28,
            marginBottom: 14,
        },

        outlineButtonText: {
            color: colors.primary,
            fontSize: 15,
            fontWeight: '600',
        },

        summaryCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 10,
        },

        summaryText: {
            flex: 1,
            fontSize: 13,
            lineHeight: 19,
            color: colors.secondaryText,
        },

        historyNotice: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 12,
            padding: 10,
            gap: 8,
        },

        historyNoticeText: {
            flex: 1,
            color: colors.mutedText,
            fontSize: 11,
            lineHeight: 17,
        },
    });

export default ProjectTimelineBar;