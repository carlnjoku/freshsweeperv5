import React, {
    useEffect,
    useState,
    useContext,
    useMemo,
    useCallback,
} from 'react';

import {
    SafeAreaView,
    StyleSheet,
    Text,
    StatusBar,
    useWindowDimensions,
    Linking,
    FlatList,
    ScrollView,
    View,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';

import {
    MaterialCommunityIcons,
    AntDesign,
} from '@expo/vector-icons';

import {
    Avatar,
} from 'react-native-paper';

import moment from 'moment';

import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme';

import calculateDistance from '../../utils/calculateDistance';

import CustomCard from '../../components/shared/CustomCard';
import CircleIcon from '../../components/shared/CirecleIcon';
import CommunicateItem from '../../components/host/CommunicationItem';
import ProjectTimelineBar from '../../components/shared/ProjectTimeLine';
import CancelScheduleModal from '../../components/shared/CancelScheduleModal';
import CleaningScheduleCard from '../../components/host/CleaningScheduleCard';

import { tSafe } from '../../utils/tSafe';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function ScheduleDetails({
    navigation,
    route,
}) {
    const { theme, isDark } = useTheme();

    const { item, scheduleId } = route.params || {};

    const {
        fbaseUser,
        setTotalUnreadCount,
        friendsWithLastMessagesUnread = [],
    } = useContext(AuthContext);

    const { width } = useWindowDimensions();

    /* ---------------------------------------------------------------------- */
    /* THEME COLORS                                                            */
    /* ---------------------------------------------------------------------- */

    const colors = useMemo(() => ({
        background: theme.background.default,

        surface: theme.surface.default,
        elevated: theme.surface.elevated,
        selected: theme.surface.selected,

        card: theme.card.background,
        cardBorder: theme.card.border,

        primary: theme.brand.primary,

        text: theme.text.primary,
        secondaryText: theme.text.secondary,
        mutedText: theme.text.muted,

        border: theme.border.default,
        divider: theme.divider,

        icon: theme.icon.default,
        mutedIcon: theme.icon.muted,

        success: theme.status.success,
        error: theme.status.error,
        warning: theme.status.warning,

        inverseIcon: theme.icon.inverse,

        softBackground: theme.background.sunken,
    }), [theme]);

    /* ---------------------------------------------------------------------- */
    /* SCREEN STATE                                                            */
    /* ---------------------------------------------------------------------- */

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [schedule, setSchedule] = useState(null);

    const [regular_cleaning, setRegularCleaning] = useState([]);
    const [extra_cleaning, setExtarCleaning] = useState([]);

    const [cleaning_date, setCleaningDate] = useState('');
    const [cleaning_time, setCleaningTime] = useState('');
    const [cleaning_end_time, setCleaningEndTime] = useState('');

    const [apartment_name, setApartmentName] = useState('');
    const [room_type_and_size, setRoomTypeSize] = useState([]);

    const [address, setAddress] = useState('');

    const [assignedTo, setAssignedTo] = useState([]);

    const [cleaner_latitude, setCleanerLatitude] = useState('');
    const [cleaner_longitude, setCleanerLongitude] = useState('');

    const [apartment_latitude, setApartmentLatitude] = useState('');
    const [apartment_longitude, setApartmentLongitude] = useState('');

    const [targetCleanerId, setTargetCleanerId] = useState('');
    const [targetScheduleId, setTargetScheduleId] = useState('');

    /* ---------------------------------------------------------------------- */
    /* CANCELLATION STATE                                                      */
    /* ---------------------------------------------------------------------- */

    const [cancelModalVisible, setCancelModalVisible] = useState(false);

    const [cancellationType, setCancellationType] = useState('full');

    const [targetCleaner, setTargetCleaner] = useState(null);

    const [cancellationLoading, setCancellationLoading] = useState(false);

    /* ---------------------------------------------------------------------- */
    /* ROOM COUNTS                                                             */
    /* ---------------------------------------------------------------------- */

    const bedroomCount =
        room_type_and_size.find(
            room => room.type === 'Bedroom'
        )?.number || 0;

    const bathroomCount =
        room_type_and_size.find(
            room => room.type === 'Bathroom'
        )?.number || 0;

    const kitchen =
        room_type_and_size.find(
            room => room.type === 'Kitchen'
        )?.number || 0;

    const livingroomCount =
        room_type_and_size.find(
            room => room.type === 'Livingroom'
        )?.number || 0;

    const bedroomSize =
        room_type_and_size.find(
            room => room.type === 'Bedroom'
        )?.size || 0;

    const bathroomSize =
        room_type_and_size.find(
            room => room.type === 'Bathroom'
        )?.size || 0;

    const kitchenSize =
        room_type_and_size.find(
            room => room.type === 'Kitchen'
        )?.size || 0;

    const livingroomSize =
        room_type_and_size.find(
            room => room.type === 'Livingroom'
        )?.size || 0;

    /* ---------------------------------------------------------------------- */
    /* CURRENT STATUS                                                          */
    /* ---------------------------------------------------------------------- */

    const getCurrentStatus = () => {
        if (!schedule) {
            return null;
        }

        if (schedule?.status === 'completed') {
            return 'completed';
        }

        if (
            Array.isArray(assignedTo) &&
            assignedTo.length > 0
        ) {
            return 'accepted';
        }

        return 'published';
    };

    /* ---------------------------------------------------------------------- */
    /* CLEANER STATUS HELPERS                                                  */
    /* ---------------------------------------------------------------------- */

    const isCleanerCancelled = (cleaner) => (
        cleaner?.status?.toLowerCase() === 'cancelled'
    );

    /* ---------------------------------------------------------------------- */
    /* CHAT / SELECTED CLEANER                                                 */
    /* ---------------------------------------------------------------------- */

    const selectedChatCleaner = useMemo(() => {
        if (!Array.isArray(assignedTo)) {
            return null;
        }

        const activeCleaner = assignedTo.find(
            cleaner => !isCleanerCancelled(cleaner)
        );

        return activeCleaner || assignedTo[0] || null;
    }, [assignedTo]);

    const selectedFriend = useMemo(() => {
        if (
            !selectedChatCleaner?.cleanerId ||
            !Array.isArray(friendsWithLastMessagesUnread)
        ) {
            return null;
        }

        return friendsWithLastMessagesUnread.find(
            friend =>
                String(friend.userId) ===
                    String(selectedChatCleaner.cleanerId) &&
                String(friend.scheduleId) ===
                    String(scheduleId)
        ) || null;
    }, [
        selectedChatCleaner,
        friendsWithLastMessagesUnread,
        scheduleId,
    ]);

    const selectedUser = useMemo(() => {
        if (!selectedChatCleaner) {
            return null;
        }

        return {
            userId: selectedChatCleaner.cleanerId,
            firstname: selectedChatCleaner.firstname,
            lastname: selectedChatCleaner.lastname,
            avatar: selectedChatCleaner.avatar,
            chatroomId: selectedFriend?.chatroomId,
        };
    }, [
        selectedChatCleaner,
        selectedFriend,
    ]);

    const friendIndex = useMemo(() => {
        if (
            !selectedChatCleaner?.cleanerId ||
            !Array.isArray(friendsWithLastMessagesUnread)
        ) {
            return -1;
        }

        return friendsWithLastMessagesUnread.findIndex(
            friend =>
                String(friend.userId) ===
                    String(selectedChatCleaner.cleanerId) &&
                String(friend.scheduleId) ===
                    String(scheduleId)
        );
    }, [
        selectedChatCleaner,
        friendsWithLastMessagesUnread,
        scheduleId,
    ]);

    /* ---------------------------------------------------------------------- */
    /* TOTAL AMOUNT                                                            */
    /* ---------------------------------------------------------------------- */

    const calculateTotalAmount = () => {
        if (!schedule) {
            return 0;
        }

        let total = 0;

        if (Array.isArray(regular_cleaning)) {
            total += regular_cleaning.reduce(
                (sum, serviceItem) =>
                    sum + Number(serviceItem?.price || 0),
                0
            );
        } else if (
            regular_cleaning &&
            typeof regular_cleaning === 'object'
        ) {
            total += Number(regular_cleaning?.price || 0);
        }

        if (Array.isArray(extra_cleaning)) {
            total += extra_cleaning.reduce(
                (sum, serviceItem) =>
                    sum + Number(serviceItem?.price || 0),
                0
            );
        } else if (
            extra_cleaning &&
            typeof extra_cleaning === 'object'
        ) {
            total += Number(extra_cleaning?.price || 0);
        }

        return total > 0 ? total : 100;
    };

    /* ---------------------------------------------------------------------- */
    /* BOOKING DATA FOR CANCELLATION                                           */
    /* ---------------------------------------------------------------------- */

    const getBookingForCancellation = () => {
        if (!schedule) {
            return null;
        }

        const activeCleaner = Array.isArray(assignedTo)
            ? assignedTo.find(
                cleaner => !isCleanerCancelled(cleaner)
            )
            : null;

        return {
            id: targetScheduleId || scheduleId,

            date: `${cleaning_date}T${cleaning_time}`,

            amount: calculateTotalAmount(),

            service: tSafe(
                'cleaning_service',
                'Cleaning Service'
            ),

            cleaner: activeCleaner
                ? `${activeCleaner.firstname || ''} ${activeCleaner.lastname || ''}`.trim()
                : tSafe('not_assigned', 'Not assigned'),

            status: schedule?.status || 'pending',

            cleaning_date,
            cleaning_time,
        };
    };

    /* ---------------------------------------------------------------------- */
    /* FETCH SCHEDULE                                                          */
    /* ---------------------------------------------------------------------- */

    const fetchSchedule = useCallback(async () => {
        if (!scheduleId) {
            setError(
                tSafe(
                    'no_schedule_id',
                    'No schedule ID provided'
                )
            );

            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await userService.getScheduleById(
                scheduleId
            );

            if (!response?.data) {
                throw new Error(
                    'No data received from server'
                );
            }

            const res = response.data;

            if (!res?.schedule) {
                throw new Error(
                    'Invalid schedule data structure'
                );
            }

            console.log(
                'Schedule details loaded:',
                res
            );

            setSchedule(res);

            setRegularCleaning(
                res.schedule.regular_cleaning || []
            );

            setExtarCleaning(
                res.schedule.extra || []
            );

            setCleaningDate(
                res.schedule.cleaning_date || ''
            );

            setCleaningTime(
                res.schedule.cleaning_time || ''
            );

            setCleaningEndTime(
                res.schedule.cleaning_end_time || ''
            );

            setApartmentName(
                res.schedule.apartment_name || ''
            );

            setRoomTypeSize(
                res.schedule.selected_apt_room_type_and_size || []
            );

            setAddress(
                res.schedule.address || ''
            );

            const cleaners = Array.isArray(res.assignedTo)
                ? res.assignedTo
                : [];

            setAssignedTo(cleaners);

            const firstCleaner = cleaners[0] || {};

            setCleanerLatitude(
                firstCleaner.cleaner_latitude || ''
            );

            setCleanerLongitude(
                firstCleaner.cleaner_longitude || ''
            );

            setApartmentLatitude(
                res.schedule.apartment_latitude || ''
            );

            setApartmentLongitude(
                res.schedule.apartment_longitude || ''
            );

            setTargetCleanerId(
                firstCleaner.cleanerId || ''
            );

            setTargetScheduleId(
                res._id || scheduleId
            );
        } catch (err) {
            console.error(
                'Error fetching schedule:',
                err
            );

            setError(
                err?.message ||
                tSafe(
                    'failed_load_schedule_details',
                    'Failed to load schedule details'
                )
            );

            setSchedule(null);
            setAssignedTo([]);
        } finally {
            setLoading(false);
        }
    }, [scheduleId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    /* ---------------------------------------------------------------------- */
    /* REFRESH                                                                 */
    /* ---------------------------------------------------------------------- */

    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            await fetchSchedule();
        } finally {
            setRefreshing(false);
        }
    }, [fetchSchedule]);

    /* ---------------------------------------------------------------------- */
    /* HOST CANCELLATION HANDLER                                               */
    /* ---------------------------------------------------------------------- */

    // const handleCancelBooking = async (cancellationData) => {
    //     if (!schedule) {
    //         return;
    //     }

    //     setCancellationLoading(true);

    //     console.log(
    //         'HOST CANCELLATION REQUEST:',
    //         {
    //             scheduleId,
    //             cancellationData,
    //         }
    //     );

    //     try {
    //         const response = await userService.cancelSchedule(
    //             scheduleId,
    //             cancellationData
    //         );

    //         console.log(
    //             'HOST CANCELLATION RESPONSE:',
    //             response
    //         );

    //         if (!response?.success) {
    //             throw new Error(
    //                 response?.message ||
    //                 tSafe(
    //                     'failed_cancel_booking',
    //                     'Failed to cancel booking'
    //                 )
    //             );
    //         }

    //         // Financial calculations remain backend-authoritative.
    //         const cancellation = response?.cancellation || {};

    //         if (
    //             cancellationData.cancellationType === 'partial'
    //         ) {
    //             const cleanerName = targetCleaner
    //                 ? `${targetCleaner.firstname || ''} ${targetCleaner.lastname || ''}`.trim()
    //                 : tSafe('cleaner', 'Cleaner');

    //             Alert.alert(
    //                 tSafe(
    //                     'cleaner_removed_title',
    //                     'Cleaner Removed'
    //                 ),

    //                 tSafe(
    //                     'cleaner_removed_message',
    //                     '{name} has been removed from this booking.',
    //                     {
    //                         name: cleanerName || tSafe(
    //                             'cleaner',
    //                             'Cleaner'
    //                         ),
    //                     }
    //                 ),

    //                 [
    //                     {
    //                         text: tSafe('ok', 'OK'),

    //                         onPress: async () => {
    //                             setCancelModalVisible(false);
    //                             setTargetCleaner(null);
    //                             setCancellationType('full');

    //                             await fetchSchedule();
    //                         },
    //                     },
    //                 ]
    //             );

    //             return;
    //         }

    //         const refundAmount = Number(
    //             cancellation?.refund ??
    //             cancellation?.refundAmount ??
    //             0
    //         );

    //         const feeAmount = Number(
    //             cancellation?.fee ??
    //             cancellation?.cancellationFee ??
    //             0
    //         );

    //         let message = tSafe(
    //             'booking_cancelled_message',
    //             'Your booking has been cancelled.'
    //         );

    //         if (refundAmount > 0) {
    //             message += `\n\n${tSafe(
    //                 'refund_amount',
    //                 'Refund/Credit: $${amount}',
    //                 {
    //                     amount: refundAmount.toFixed(2),
    //                 }
    //             )}`;
    //         }

    //         if (feeAmount > 0) {
    //             message += `\n${tSafe(
    //                 'cancellation_fee',
    //                 'Cancellation fee: $${amount}',
    //                 {
    //                     amount: feeAmount.toFixed(2),
    //                 }
    //             )}`;
    //         }

    //         Alert.alert(
    //             tSafe(
    //                 'booking_cancelled_title',
    //                 'Booking Cancelled'
    //             ),

    //             message,

    //             [
    //                 {
    //                     text: tSafe('ok', 'OK'),

    //                     onPress: async () => {
    //                         setCancelModalVisible(false);
    //                         setTargetCleaner(null);
    //                         setCancellationType('full');

    //                         await fetchSchedule();
    //                     },
    //                 },
    //             ]
    //         );
    //     } catch (error) {
    //         console.error(
    //             'Cancellation error:',
    //             error
    //         );

    //         Alert.alert(
    //             tSafe('error_title', 'Error'),

    //             error?.message ||
    //             tSafe(
    //                 'failed_cancel_booking_retry',
    //                 'Failed to cancel booking. Please try again.'
    //             )
    //         );
    //     } finally {
    //         setCancellationLoading(false);
    //     }
    // };

    const handleCancelBooking = async (cancellationData) => {
        if (!schedule) {
            return;
        }
    
        setCancellationLoading(true);
    
        const isPartialCancellation =
            cancellationData?.cancellationType === 'partial';
    
        console.log(
            isPartialCancellation
                ? 'HOST CLEANER REMOVAL REQUEST:'
                : 'HOST FULL SCHEDULE CANCELLATION REQUEST:',
            {
                scheduleId,
                targetCleanerId:
                    cancellationData?.targetCleanerId ||
                    targetCleaner?.cleanerId,
                cancellationData,
            }
        );
    
        try {
            let response;
    
            if (isPartialCancellation) {
                // Host removes a cleaner and requests a replacement.
                const cleanerId =
                    cancellationData?.targetCleanerId ||
                    targetCleaner?.cleanerId;
    
                if (!cleanerId) {
                    throw new Error(
                        'Unable to identify the cleaner to remove.'
                    );
                }
    
                response = await userService.removeCleanerFromSchedule(
                    scheduleId,
                    {
                        targetCleanerId: String(cleanerId),
    
                        reason:
                            cancellationData?.reason ||
                            'Host requested cleaner replacement',
    
                        additionalNotes:
                            cancellationData?.additionalNotes || '',
    
                        replacementRequired: true,
                    }
                );
            } else {
                // Preserve the existing full schedule cancellation flow.
                response = await userService.cancelSchedule(
                    scheduleId,
                    cancellationData
                );
            }
    
            console.log(
                isPartialCancellation
                    ? 'HOST CLEANER REMOVAL RESPONSE:'
                    : 'HOST CANCELLATION RESPONSE:',
                response
            );
    
            // Support either a directly returned object or an Axios response.
            const result = response?.data ?? response;
    
            if (
                result?.success === false ||
                !result?.success
            ) {
                throw new Error(
                    result?.message ||
                    (
                        isPartialCancellation
                            ? 'Failed to remove cleaner.'
                            : 'Failed to cancel booking.'
                    )
                );
            }
    
            // ---------------------------------------------------------
            // PARTIAL CANCELLATION: HOST REMOVES A CLEANER
            // ---------------------------------------------------------
    
            if (isPartialCancellation) {
                const cleanerName = targetCleaner
                    ? `${targetCleaner.firstname || ''} ${
                        targetCleaner.lastname || ''
                    }`.trim()
                    : 'Cleaner';
    
                Alert.alert(
                    'Cleaner Removed',
                    result?.message ||
                        `${cleanerName || 'Cleaner'} has been removed. ` +
                        'The replacement process has been initiated.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                setCancelModalVisible(false);
                                setTargetCleaner(null);
                                setCancellationType('full');
    
                                await fetchSchedule();
                            },
                        },
                    ]
                );
    
                return;
            }
    
            // ---------------------------------------------------------
            // FULL SCHEDULE CANCELLATION
            // ---------------------------------------------------------
    
            // Financial calculations remain backend-authoritative.
            const cancellation = result?.cancellation || {};
    
            const refundAmount = Number(
                cancellation?.refund ??
                cancellation?.refundAmount ??
                0
            );
    
            const feeAmount = Number(
                cancellation?.fee ??
                cancellation?.cancellationFee ??
                0
            );
    
            let message = tSafe(
                'booking_cancelled_message',
                'Your booking has been cancelled.'
            );
    
            if (refundAmount > 0) {
                message += `\n\n${tSafe(
                    'refund_amount',
                    'Refund/Credit: $${amount}',
                    {
                        amount: refundAmount.toFixed(2),
                    }
                )}`;
            }
    
            if (feeAmount > 0) {
                message += `\n${tSafe(
                    'cancellation_fee',
                    'Cancellation fee: $${amount}',
                    {
                        amount: feeAmount.toFixed(2),
                    }
                )}`;
            }
    
            Alert.alert(
                tSafe(
                    'booking_cancelled_title',
                    'Booking Cancelled'
                ),
                message,
                [
                    {
                        text: tSafe('ok', 'OK'),
                        onPress: async () => {
                            setCancelModalVisible(false);
                            setTargetCleaner(null);
                            setCancellationType('full');
    
                            await fetchSchedule();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error(
                'Cancellation/removal error:',
                error?.response?.data || error
            );
    
            const errorMessage =
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.message ||
                (
                    isPartialCancellation
                        ? 'Failed to remove cleaner. Please try again.'
                        : 'Failed to cancel booking. Please try again.'
                );
    
            Alert.alert(
                tSafe('error_title', 'Error'),
                errorMessage
            );
        } finally {
            setCancellationLoading(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* PHONE                                                                   */
    /* ---------------------------------------------------------------------- */

    const makeCall = (number) => {
        const url = `tel:${number}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    Alert.alert(
                        tSafe(
                            'phone_not_available',
                            'Phone number is not available'
                        )
                    );
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => {
                console.log(
                    'Phone call error:',
                    err
                );
            });
    };

    const callPhone = () => {
        if (item?.contact?.phone) {
            makeCall(item.contact.phone);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* CHAT                                                                    */
    /* ---------------------------------------------------------------------- */

    const openExisitingConversation = () => {
        if (
            selectedUser &&
            fbaseUser &&
            schedule
        ) {
            navigation.navigate(
                ROUTES.chat_conversation,
                {
                    selectedUser,
                    fbaseUser,
                    schedule,
                    friendIndex,
                }
            );
        }
    };

    /* ---------------------------------------------------------------------- */
    /* CANCELLATION ELIGIBILITY                                                */
    /* ---------------------------------------------------------------------- */

    const canCancelCleaner = (cleaner) => {
        if (!schedule || !cleaner) {
            return false;
        }

        if (isCleanerCancelled(cleaner)) {
            return false;
        }

        const bookingTime = new Date(
            `${cleaning_date}T${cleaning_time}`
        );

        const hoursUntilBooking =
            (bookingTime - new Date()) /
            (1000 * 60 * 60);

        if (hoursUntilBooking <= 0) {
            return false;
        }

        if (
            cleaner.status === 'in_progress' ||
            cleaner.status === 'completed' ||
            schedule.status === 'cancelled'
        ) {
            return false;
        }

        return true;
    };

    const canCancelBooking = () => {
        if (!schedule) {
            return false;
        }

        if (
            schedule.status === 'completed' ||
            schedule.status === 'cancelled' ||
            schedule.status === 'reviewed'
        ) {
            return false;
        }

        const bookingTime = new Date(
            `${cleaning_date}T${cleaning_time}`
        );

        const hoursUntilBooking =
            (bookingTime - new Date()) /
            (1000 * 60 * 60);

        return hoursUntilBooking > 0;
    };

    /* ---------------------------------------------------------------------- */
    /* CANCELLATION MODALS                                                     */
    /* ---------------------------------------------------------------------- */

    const openFullCancellationModal = () => {
        if (!schedule) {
            return;
        }

        setCancellationType('full');
        setTargetCleaner(null);
        setCancelModalVisible(true);
    };

    const openPartialCancellationModal = (cleaner) => {
        if (
            !schedule ||
            !cleaner ||
            isCleanerCancelled(cleaner)
        ) {
            return;
        }

        setCancellationType('partial');
        setTargetCleaner(cleaner);
        setCancelModalVisible(true);
    };

    /* ---------------------------------------------------------------------- */
    /* DURATION                                                                */
    /* ---------------------------------------------------------------------- */

    const calculateDuration = (
        startTime,
        endTime
    ) => {
        try {
            const start = moment(
                startTime,
                [
                    'h:mm:ss A',
                    'HH:mm:ss',
                    'H:mm:ss',
                ]
            );

            const end = moment(
                endTime,
                [
                    'h:mm:ss A',
                    'HH:mm:ss',
                    'H:mm:ss',
                ]
            );

            const duration = moment.duration(
                end.diff(start)
            );

            const hours = duration.hours();
            const minutes = duration.minutes();

            if (hours > 0) {
                return `${hours}h ${
                    minutes > 0 ? `${minutes}m` : ''
                }`;
            }

            return `${minutes}m`;
        } catch {
            return tSafe(
                'duration_not_available',
                'Duration not available'
            );
        }
    };

    /* ---------------------------------------------------------------------- */
    /* COMMUNICATE ITEM                                                        */
    /* ---------------------------------------------------------------------- */

    const renderCommunicateItem = (
        cleaner,
        index,
        distance
    ) => {
        if (isCleanerCancelled(cleaner)) {
            return null;
        }

        const canCancelThisCleaner =
            canCancelCleaner(cleaner);

        return (
            <View
                key={cleaner?.cleanerId || index}
            >
                <CommunicateItem
                    cleaner={cleaner}
                    index={index}
                    distance={distance}
                    callPhone={callPhone}
                    openExisitingConversation={
                        openExisitingConversation
                    }
                    onCancelCleaner={
                        canCancelThisCleaner
                            ? () => openPartialCancellationModal(cleaner)
                            : null
                    }

                    /*
                     * Preserve your existing cleaner-claim workflow
                     * here if it is implemented in your project.
                     */
                    canCancel={canCancelThisCleaner}
                />
            </View>
        );
    };

    /* ---------------------------------------------------------------------- */
    /* LOADING STATE                                                           */
    /* ---------------------------------------------------------------------- */

    const LoadingFallback = () => (
        <View
            style={[
                styles.fallbackContainer,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <ActivityIndicator
                size="large"
                color={colors.primary}
            />

            <Text
                style={[
                    styles.fallbackTitle,
                    {
                        color: colors.text,
                    },
                ]}
            >
                {tSafe(
                    'loading_schedule_details',
                    'Loading Schedule Details'
                )}
            </Text>

            <Text
                style={[
                    styles.fallbackText,
                    {
                        color: colors.secondaryText,
                    },
                ]}
            >
                {tSafe(
                    'please_wait_fetch_schedule',
                    'Please wait while we fetch your schedule information...'
                )}
            </Text>
        </View>
    );

    /* ---------------------------------------------------------------------- */
    /* ERROR STATE                                                             */
    /* ---------------------------------------------------------------------- */

    const ErrorFallback = () => (
        <View
            style={[
                styles.fallbackContainer,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <MaterialCommunityIcons
                name="alert-circle-outline"
                size={64}
                color={colors.error}
            />

            <Text
                style={[
                    styles.fallbackTitle,
                    {
                        color: colors.text,
                    },
                ]}
            >
                {tSafe(
                    'failed_load_schedule',
                    'Failed to Load Schedule'
                )}
            </Text>

            <Text
                style={[
                    styles.fallbackText,
                    {
                        color: colors.secondaryText,
                    },
                ]}
            >
                {error || tSafe(
                    'unexpected_error',
                    'An unexpected error occurred'
                )}
            </Text>

            <TouchableOpacity
                style={[
                    styles.retryButton,
                    {
                        backgroundColor: colors.primary,
                    },
                ]}
                onPress={fetchSchedule}
            >
                <Text style={styles.retryButtonText}>
                    {tSafe('retry', 'Retry')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.retryButton,
                    styles.backButton,
                    {
                        backgroundColor: colors.elevated,
                        borderColor: colors.border,
                    },
                ]}
                onPress={() => navigation.goBack()}
            >
                <Text
                    style={[
                        styles.retryButtonText,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {tSafe('go_back', 'Go Back')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    /* ---------------------------------------------------------------------- */
    /* NO DATA STATE                                                           */
    /* ---------------------------------------------------------------------- */

    const NoDataFallback = () => (
        <View
            style={[
                styles.fallbackContainer,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <MaterialCommunityIcons
                name="calendar-remove"
                size={64}
                color={colors.mutedIcon}
            />

            <Text
                style={[
                    styles.fallbackTitle,
                    {
                        color: colors.text,
                    },
                ]}
            >
                {tSafe(
                    'schedule_not_found',
                    'Schedule Not Found'
                )}
            </Text>

            <Text
                style={[
                    styles.fallbackText,
                    {
                        color: colors.secondaryText,
                    },
                ]}
            >
                {tSafe(
                    'schedule_not_found_message',
                    "The schedule you're looking for doesn't exist or has been removed."
                )}
            </Text>

            <TouchableOpacity
                style={[
                    styles.retryButton,
                    {
                        backgroundColor: colors.primary,
                    },
                ]}
                onPress={fetchSchedule}
            >
                <Text style={styles.retryButtonText}>
                    {tSafe('refresh', 'Refresh')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.retryButton,
                    styles.backButton,
                    {
                        backgroundColor: colors.elevated,
                        borderColor: colors.border,
                    },
                ]}
                onPress={() => navigation.goBack()}
            >
                <Text
                    style={[
                        styles.retryButtonText,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {tSafe(
                        'go_back_dashboard',
                        'Go Back to Dashboard'
                    )}
                </Text>
            </TouchableOpacity>
        </View>
    );

    /* ---------------------------------------------------------------------- */
    /* NETWORK ERROR                                                           */
    /* ---------------------------------------------------------------------- */

    const NetworkErrorFallback = () => (
        <View
            style={[
                styles.fallbackContainer,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <MaterialCommunityIcons
                name="wifi-off"
                size={64}
                color={colors.warning}
            />

            <Text
                style={[
                    styles.fallbackTitle,
                    {
                        color: colors.text,
                    },
                ]}
            >
                {tSafe(
                    'connection_error',
                    'Connection Error'
                )}
            </Text>

            <Text
                style={[
                    styles.fallbackText,
                    {
                        color: colors.secondaryText,
                    },
                ]}
            >
                {tSafe(
                    'connection_error_message',
                    'Please check your internet connection and try again.'
                )}
            </Text>

            <TouchableOpacity
                style={[
                    styles.retryButton,
                    {
                        backgroundColor: colors.primary,
                    },
                ]}
                onPress={fetchSchedule}
            >
                <Text style={styles.retryButtonText}>
                    {tSafe(
                        'retry_connection',
                        'Retry Connection'
                    )}
                </Text>
            </TouchableOpacity>
        </View>
    );

    /* ---------------------------------------------------------------------- */
    /* MAIN CONTENT                                                            */
    /* ---------------------------------------------------------------------- */

    const renderMainContent = () => {
        const data = [
            { type: 'circleicons' },
            { type: 'taskItem' },
        ];

        const renderItem = ({ item: listItem }) => {
            switch (listItem.type) {
                case 'circleicons':
                    return (
                        <View
                            style={[
                                styles.container,
                                {
                                    backgroundColor: colors.background,
                                },
                            ]}
                        >
                            {/* PROPERTY DETAILS */}

                            <CustomCard>
                                <View style={styles.centerContent}>
                                    <AntDesign
                                        name="home"
                                        size={60}
                                        color={colors.primary}
                                    />

                                    <Text
                                        style={[
                                            styles.headerText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {apartment_name}
                                    </Text>

                                    <View
                                        style={styles.addressContainer}
                                    >
                                        <MaterialCommunityIcons
                                            name="map-marker"
                                            size={16}
                                            color={colors.secondaryText}
                                        />

                                        <Text
                                            style={[
                                                styles.addressText,
                                                {
                                                    color: colors.secondaryText,
                                                },
                                            ]}
                                        >
                                            {address}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={styles.roomCountsContainer}
                                >
                                    <CircleIcon
                                        iconName="bed-empty"
                                        buttonSize={26}
                                        radiusSise={13}
                                        iconSize={16}
                                        title={bedroomCount}
                                        roomSize={bedroomSize}
                                        type={tSafe(
                                            'bedrooms',
                                            'Bedrooms'
                                        )}
                                    />

                                    <CircleIcon
                                        iconName="shower-head"
                                        buttonSize={26}
                                        radiusSise={13}
                                        iconSize={16}
                                        title={bathroomCount}
                                        roomSize={bathroomSize}
                                        type={tSafe(
                                            'bathrooms',
                                            'Bathrooms'
                                        )}
                                    />

                                    <CircleIcon
                                        iconName="silverware-fork-knife"
                                        buttonSize={26}
                                        radiusSise={13}
                                        iconSize={16}
                                        title={kitchen}
                                        roomSize={kitchenSize}
                                        type={tSafe(
                                            'kitchen',
                                            'Kitchen'
                                        )}
                                    />

                                    <CircleIcon
                                        iconName="seat-legroom-extra"
                                        buttonSize={26}
                                        radiusSise={13}
                                        iconSize={16}
                                        title={livingroomCount}
                                        roomSize={livingroomSize}
                                        type={tSafe(
                                            'livingroom',
                                            'Livingroom'
                                        )}
                                    />
                                </View>
                            </CustomCard>

                            {/* CLEANING TIMELINE */}

                            {getCurrentStatus() && (
                                <CustomCard>
                                    <View
                                        style={styles.timelineHeader}
                                    >
                                        <Text
                                            style={[
                                                styles.timelineTitle,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >
                                            {tSafe(
                                                'cleaning_timeline',
                                                'Cleaning Timeline'
                                            )}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.timelineSubtitle,
                                                {
                                                    color: colors.secondaryText,
                                                },
                                            ]}
                                        >
                                            {tSafe(
                                                'track_cleaning_workflow',
                                                'Track your cleaning workflow'
                                            )}
                                        </Text>
                                    </View>

                                    <ProjectTimelineBar
                                        currentStatus={schedule.status}
                                        scheduledDate={
                                            schedule.schedule?.cleaning_date
                                        }
                                    />
                                </CustomCard>
                            )}

                            {/* CLEANING SCHEDULE */}

                            <CleaningScheduleCard
                                cleaning_time={cleaning_time}
                                cleaning_date={cleaning_date}
                                cleaning_end_time={cleaning_end_time}
                            />

                            {/* CANCEL ENTIRE BOOKING */}

                            {canCancelBooking() && (
                                <View
                                    style={
                                        styles.fullCancellationContainer
                                    }
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.fullCancelButton,
                                            {
                                                backgroundColor: colors.error,
                                            },
                                        ]}
                                        onPress={
                                            openFullCancellationModal
                                        }
                                        disabled={cancellationLoading}
                                    >
                                        {cancellationLoading ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#FFFFFF"
                                            />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name="close-circle"
                                                size={20}
                                                color="#FFFFFF"
                                            />
                                        )}

                                        <Text
                                            style={
                                                styles.fullCancelButtonText
                                            }
                                        >
                                            {cancellationLoading
                                                ? tSafe(
                                                    'cancelling',
                                                    'Cancelling...'
                                                )
                                                : tSafe(
                                                    'cancel_entire_booking',
                                                    'Cancel Entire Booking'
                                                )}
                                        </Text>
                                    </TouchableOpacity>

                                    <Text
                                        style={[
                                            styles.cancellationNote,
                                            {
                                                color: colors.secondaryText,
                                            },
                                        ]}
                                    >
                                        {tSafe(
                                            'cancel_entire_booking_note',
                                            'This will cancel the booking for all {count} cleaners',
                                            {
                                                count:
                                                    assignedTo?.filter(
                                                        cleaner =>
                                                            !isCleanerCancelled(
                                                                cleaner
                                                            )
                                                    ).length || 0,
                                            }
                                        )}
                                    </Text>
                                </View>
                            )}

                            {/* ASSIGNED CLEANERS */}

                            {assignedTo.length > 0 ? (
                                <CustomCard>
                                    <View
                                        style={styles.timelineHeader}
                                    >
                                        <Text
                                            style={[
                                                styles.timelineTitle,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >
                                            {assignedTo.length > 1
                                                ? tSafe(
                                                    'assigned_cleaners_plural',
                                                    'Assigned Cleaners'
                                                )
                                                : tSafe(
                                                    'assigned_cleaner_singular',
                                                    'Assigned Cleaner'
                                                )}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.timelineSubtitle,
                                                {
                                                    color: colors.secondaryText,
                                                },
                                            ]}
                                        >
                                            {assignedTo.length > 1
                                                ? tSafe(
                                                    'manage_cleaners_subtitle',
                                                    'Manage individual cleaners or cancel the entire booking'
                                                )
                                                : tSafe(
                                                    'track_cleaner_subtitle',
                                                    'Track your cleaner working on your apartment'
                                                )}
                                        </Text>
                                    </View>

                                    {assignedTo.map(
                                        (cleaner, cleanerIndex) => {
                                            const distance =
                                                calculateDistance(
                                                    cleaner?.cleaner_latitude,
                                                    cleaner?.cleaner_longitude,
                                                    apartment_latitude,
                                                    apartment_longitude
                                                );

                                            if (
                                                isCleanerCancelled(cleaner)
                                            ) {
                                                return (
                                                    <View
                                                        key={
                                                            cleaner?.cleanerId ||
                                                            `cancelled-${cleanerIndex}`
                                                        }
                                                        style={[
                                                            styles.cancelledCleanerCard,
                                                            {
                                                                backgroundColor:
                                                                    colors.elevated,
                                                                borderColor:
                                                                    colors.border,
                                                            },
                                                        ]}
                                                    >
                                                        <View
                                                            style={
                                                                styles.cancelledCleanerContent
                                                            }
                                                        >
                                                            <Avatar.Icon
                                                                size={50}
                                                                icon="account-cancel"
                                                                style={{
                                                                    backgroundColor:
                                                                        colors.selected,
                                                                }}
                                                                color={
                                                                    colors.error
                                                                }
                                                            />

                                                            <View
                                                                style={
                                                                    styles.cancelledCleanerInfo
                                                                }
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.cancelledCleanerName,
                                                                        {
                                                                            color: colors.text,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {`${cleaner?.firstname || ''} ${cleaner?.lastname || ''}`.trim() ||
                                                                        tSafe(
                                                                            'cleaner',
                                                                            'Cleaner'
                                                                        )}
                                                                </Text>

                                                                <View
                                                                    style={[
                                                                        styles.cancelledBadge,
                                                                        {
                                                                            backgroundColor:
                                                                                colors.selected,
                                                                        },
                                                                    ]}
                                                                >
                                                                    <MaterialCommunityIcons
                                                                        name="close-circle"
                                                                        size={14}
                                                                        color={
                                                                            colors.error
                                                                        }
                                                                    />

                                                                    <Text
                                                                        style={[
                                                                            styles.cancelledBadgeText,
                                                                            {
                                                                                color: colors.error,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {tSafe(
                                                                            'cancelled',
                                                                            'CANCELLED'
                                                                        )}
                                                                    </Text>
                                                                </View>

                                                                <Text
                                                                    style={[
                                                                        styles.cancelledNote,
                                                                        {
                                                                            color: colors.secondaryText,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {tSafe(
                                                                        'cleaner_cancelled_note',
                                                                        'This cleaner has been cancelled from this booking.'
                                                                    )}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            }

                                            return renderCommunicateItem(
                                                cleaner,
                                                cleanerIndex,
                                                distance
                                            );
                                        }
                                    )}
                                </CustomCard>
                            ) : (
                                <View
                                    style={[
                                        styles.noCleanersContainer,
                                        {
                                            backgroundColor: colors.elevated,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    <Avatar.Icon
                                        size={60}
                                        icon="account-group"
                                        style={{
                                            backgroundColor: colors.selected,
                                        }}
                                        color={colors.mutedIcon}
                                    />

                                    <Text
                                        style={[
                                            styles.noCleanersText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {tSafe(
                                            'no_cleaners_assigned_yet',
                                            'No cleaners assigned yet'
                                        )}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.noCleanersSubtext,
                                            {
                                                color: colors.secondaryText,
                                            },
                                        ]}
                                    >
                                        {tSafe(
                                            'no_cleaners_assigned_message',
                                            'Cleaners will appear here once they accept your request'
                                        )}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );

                case 'taskItem':
                    return (
                        <View
                            style={styles.taskItemContainer}
                        />
                    );

                default:
                    return null;
            }
        };

        return (
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(listItem, index) =>
                    `${listItem.type}-${index}`
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                style={{
                    backgroundColor: colors.background,
                }}
                contentContainerStyle={{
                    flexGrow: 1,
                    backgroundColor: colors.background,
                }}
            />
        );
    };

    /* ---------------------------------------------------------------------- */
    /* CONTENT                                                                 */
    /* ---------------------------------------------------------------------- */

    const renderContent = () => {
        if (loading) {
            return <LoadingFallback />;
        }

        if (error) {
            const normalizedError = error.toLowerCase();

            if (
                normalizedError.includes('network') ||
                normalizedError.includes('connection')
            ) {
                return <NetworkErrorFallback />;
            }

            return <ErrorFallback />;
        }

        if (!schedule) {
            return <NoDataFallback />;
        }

        return renderMainContent();
    };

    /* ---------------------------------------------------------------------- */
    /* SCREEN                                                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <StatusBar
                barStyle={
                    isDark ? 'light-content' : 'dark-content'
                }
                backgroundColor={colors.background}
                translucent={false}
            />

            {renderContent()}

            {schedule && (
                <CancelScheduleModal
                    visible={cancelModalVisible}
                    onClose={() => {
                        if (!cancellationLoading) {
                            setCancelModalVisible(false);
                            setTargetCleaner(null);
                            setCancellationType('full');
                        }
                    }}
                    booking={getBookingForCancellation()}
                    userType="host"
                    onCancelBooking={handleCancelBooking}
                    cleaners={assignedTo}
                    cancellationType={cancellationType}
                    targetCleaner={targetCleaner}
                />
            )}
        </SafeAreaView>
    );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },

    container: {
        flex: 1,
        marginHorizontal: 0,
        marginBottom: 0,
    },

    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    fallbackTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },

    fallbackText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },

    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
        width: '80%',
        alignItems: 'center',
    },

    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    backButton: {
        borderWidth: 1,
        marginTop: 12,
    },

    centerContent: {
        alignItems: 'center',
        marginVertical: 5,
    },

    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },

    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 10,
        gap: 4,
    },

    addressText: {
        flexShrink: 1,
        fontSize: 13,
        lineHeight: 19,
    },

    roomCountsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },

    timelineHeader: {
        marginBottom: 16,
    },

    timelineTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },

    timelineSubtitle: {
        fontSize: 14,
    },

    fullCancellationContainer: {
        marginHorizontal: 5,
        marginTop: 16,
        marginBottom: 8,
        alignItems: 'center',
    },

    fullCancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        width: '100%',
    },

    fullCancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    cancellationNote: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },

    cancelledCleanerCard: {
        marginBottom: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },

    cancelledCleanerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    cancelledCleanerInfo: {
        flex: 1,
        marginLeft: 12,
    },

    cancelledCleanerName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 5,
    },

    cancelledBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 5,
    },

    cancelledBadgeText: {
        marginLeft: 5,
        fontSize: 11,
        fontWeight: '700',
    },

    cancelledNote: {
        fontSize: 12,
        lineHeight: 17,
    },

    noCleanersContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 16,
    },

    noCleanersText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },

    noCleanersSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },

    taskItemContainer: {
        marginHorizontal: 0,
    },
});





// import React, { useEffect, useState, useContext } from 'react';
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   StatusBar, 
//   useWindowDimensions, 
//   Linking, 
//   FlatList, 
//   ScrollView, 
//   Modal, 
//   Image, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   RefreshControl,
//   Alert
// } from 'react-native';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import { Avatar, Chip, TextInput } from 'react-native-paper';
// import moment from 'moment';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import { AuthContext } from '../../context/AuthContext';
// import calculateDistance from '../../utils/calculateDistance';
// import CircleIconButton1 from '../../components/shared/CircleButton1';
// import CardColored from '../../components/shared/CardColored';
// import CustomCard from '../../components/shared/CustomCard';
// import CircleIcon from '../../components/shared/CirecleIcon';
// import CircularIcon from '../../components/shared/CircularIcon';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CommunicateItem from '../../components/host/CommunicationItem';
// import ProjectTimelineBar from '../../components/shared/ProjectTimeLine';
// import CancelScheduleModal from '../../components/shared/CancelScheduleModal';
// import { tSafe } from '../../utils/tSafe';
// import CleaningScheduleCard from '../../components/host/CleaningScheduleCard';

// export default function ScheduleDetails({ navigation, route }) {
//     const { item, scheduleId } = route.params || {};
//     const {
//         fbaseUser,
//         setTotalUnreadCount,
//         friendsWithLastMessagesUnread
//     } = useContext(AuthContext);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [refreshing, setRefreshing] = useState(false);
//     const [schedule, setSchedule] = useState(null);
//     const [regular_cleaning, setRegularCleaning] = useState([]);
//     const [extra_cleaning, setExtarCleaning] = useState([]);
//     const [cleaning_date, setCleaningDate] = useState("");
//     const [cleaning_time, setCleaningTime] = useState("");
//     const [cleaning_end_time, setCleaningEndTime] = useState("");
//     const [apartment_name, setApartmentName] = useState("");
//     const [room_type_and_size, setRoomTypeSize] = useState([]);
//     const [address, setAddress] = useState("");
//     const [assignedTo, setAssignedTo] = useState([]);
//     const [cleaner_latitude, setCleanerLatitude] = useState("");
//     const [cleaner_longitude, setCleanerLongitude] = useState("");
//     const [apartment_latitude, setApartmentLatitude] = useState("");
//     const [apartment_longitude, setApartmentLongitude] = useState("");
//     const [targetCleanerId, setTargetCleanerId] = useState("");
//     const [targetScheduleId, setTargetScheduleId] = useState("");

//     // Enhanced cancellation states
//     const [cancelModalVisible, setCancelModalVisible] = useState(false);
//     const [cancellationType, setCancellationType] = useState('full');
//     const [targetCleaner, setTargetCleaner] = useState(null);
//     const [cancellationLoading, setCancellationLoading] = useState(false);

//     const { width } = useWindowDimensions();
//     const numColumns2 = 3;
//     const columnWidth2 = width / numColumns2 - 10;

//     // Retrieve the count for each room type
//     const bedroomCount = room_type_and_size.find(room => room.type === "Bedroom")?.number || 0;
//     const bathroomCount = room_type_and_size.find(room => room.type === "Bathroom")?.number || 0;
//     const kitchen = room_type_and_size.find(room => room.type === "Kitchen")?.number || 0;
//     const livingroomCount = room_type_and_size.find(room => room.type === "Livingroom")?.number || 0;
    
//     const bedroomSize = room_type_and_size.find(room => room.type === "Bedroom")?.size || 0;
//     const bathroomSize = room_type_and_size.find(room => room.type === "Bathroom")?.size || 0;
//     const kitchenSize = room_type_and_size.find(room => room.type === "Kitchen")?.size || 0;
//     const livingroomSize = room_type_and_size.find(room => room.type === "Livingroom")?.size || 0;

//     // Determine current status for timeline
//     const getCurrentStatus = () => {
//         if (!schedule) return null;
//         if (schedule?.status === 'completed') return 'completed';
//         if (assignedTo && assignedTo.length > 0) return 'accepted';
//         return 'published';
//     };

//     const isCleanerCancelled = (cleaner) => {
//         return cleaner.status?.toLowerCase() === 'cancelled';
//     };
    

//     const index = friendsWithLastMessagesUnread.findIndex(
//         (friend) =>
//             friend.userId === assignedTo?.cleanerId && friend.scheduleId === scheduleId
//     );

//     const specificFriend = index !== -1 ? friendsWithLastMessagesUnread[index] : null;
  
//     const [selectedUser] = useState({
//         userId: assignedTo?.cleanerId,
//         firstname: assignedTo?.firstname,
//         lastname: assignedTo?.lastname,
//         avatar: assignedTo?.avatar,
//         chatroomId: specificFriend?.chatroomId
//     });

//     const getBookingForCancellation = () => {
//         if (!schedule) return null;
        
//         return {
//             id: targetScheduleId || scheduleId,
//             date: `${cleaning_date}T${cleaning_time}`,
//             amount: calculateTotalAmount(),
//             service: tSafe('cleaning_service', 'Cleaning Service'),
//             cleaner: assignedTo?.firstname ? `${assignedTo.firstname} ${assignedTo.lastname}` : tSafe('not_assigned', 'Not assigned'),
//             status: schedule?.status || 'pending',
//             cleaning_date: cleaning_date,
//             cleaning_time: cleaning_time
//         };
//     };

//     const calculateTotalAmount = () => {
//         if (!schedule) return 0;
        
//         let total = 0;
        
//         if (Array.isArray(regular_cleaning)) {
//             total += regular_cleaning.reduce((sum, item) => sum + (item.price || 0), 0);
//         } else if (regular_cleaning && typeof regular_cleaning === 'object') {
//             total += regular_cleaning.price || 0;
//         }
        
//         if (Array.isArray(extra_cleaning)) {
//             total += extra_cleaning.reduce((sum, item) => sum + (item.price || 0), 0);
//         } else if (extra_cleaning && typeof extra_cleaning === 'object') {
//             total += extra_cleaning.price || 0;
//         }
        
//         return total > 0 ? total : 100;
//     };

//     // Enhanced cancellation handler
//     const handleCancelBooking = async (cancellationData) => {
//         if (!schedule) return;
        
//         setCancellationLoading(true);
//         console.log("my canceldata", cancellationData);

//         try {
//             const response = await userService.cancelSchedule(
//                 scheduleId, cancellationData
//             );

//             if (response.success) {
//                 let message = '';
//                 if (cancellationData.cancellationType === 'partial') {
//                     const cleanerName = targetCleaner ? `${targetCleaner.firstname} ${targetCleaner.lastname}` : tSafe('cleaner', 'Cleaner');
//                     message = tSafe('cleaner_removed_message', '{name} has been removed from this booking.', { name: cleanerName });
//                 } else {
//                     const refundAmount = calculateTotalAmount() - (cancellationData.fee || 0);
//                     message = tSafe('booking_cancelled_message', 'Your booking has been cancelled.{refund}', { 
//                         refund: refundAmount > 0 ? ` Refund: $${refundAmount.toFixed(2)}` : ''
//                     });
//                 }

//                 Alert.alert(
//                     cancellationData.cancellationType === 'partial' 
//                         ? tSafe('cleaner_removed_title', 'Cleaner Removed') 
//                         : tSafe('booking_cancelled_title', 'Booking Cancelled'),
//                     message,
//                     [{ 
//                         text: tSafe('ok', 'OK'), 
//                         onPress: () => {
//                             setCancelModalVisible(false);
//                             fetchSchedule();
//                         }
//                     }]
//                 );
//             } else {
//                 Alert.alert(tSafe('error_title', 'Error'), response.message || tSafe('failed_cancel_booking', 'Failed to cancel booking'));
//             }
//         } catch (error) {
//             console.error('Cancellation error:', error);
//             Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_cancel_booking_retry', 'Failed to cancel booking. Please try again.'));
//         } finally {
//             setCancellationLoading(false);
//         }
//     };

//     // Handle refresh
//     const onRefresh = () => {
//         setRefreshing(true);
//         fetchSchedule().finally(() => setRefreshing(false));
//     };

//     // Fetch schedule data
//     useEffect(() => {
//         fetchSchedule();
//     }, []);

//     const fetchSchedule = async () => {
//         if (!scheduleId) {
//             setError(tSafe('no_schedule_id', 'No schedule ID provided'));
//             setLoading(false);
//             return;
//         }

//         try {
//             setLoading(true);
//             setError(null);
            
//             const response = await userService.getScheduleById(scheduleId);
            
//             if (!response || !response.data) {
//                 throw new Error('No data received from server');
//             }

//             const res = response.data;
            
//             // Validate essential data
//             if (!res || !res.schedule) {
//                 throw new Error('Invalid schedule data structure');
//             }

//             setSchedule(res);
//             setRegularCleaning(res.schedule.regular_cleaning || []);
//             setExtarCleaning(res.schedule.extra || []);
//             setCleaningDate(res.schedule.cleaning_date || "");
//             setCleaningTime(res.schedule.cleaning_time || "");
//             setCleaningEndTime(res.schedule.cleaning_end_time || "");
//             setApartmentName(res.schedule.apartment_name || "");
//             setRoomTypeSize(res.schedule.selected_apt_room_type_and_size || []);
//             setAddress(res.schedule.address || "");
//             setAssignedTo(res.assignedTo || []);
//             setCleanerLatitude(res.assignedTo?.cleaner_latitude || "");
//             setCleanerLongitude(res.assignedTo?.cleaner_longitude || "");
//             setApartmentLatitude(res.schedule.apartment_latitude || "");
//             setApartmentLongitude(res.schedule.apartment_longitude || "");
//             setTargetCleanerId(res?.assignedTo?.cleanerId || "");
//             setTargetScheduleId(res._id || "");
//         } catch (err) {
//             console.error('Error fetching schedule:', err);
//             setError(err.message || tSafe('failed_load_schedule_details', 'Failed to load schedule details'));
//             setSchedule(null);
//             setAssignedTo([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const makeCall = (number) => {
//         const url = `tel:${number}`;
//         Linking.canOpenURL(url)
//             .then((supported) => {
//                 if (!supported) {
//                     Alert.alert(tSafe('phone_not_available', 'Phone number is not available'));
//                 } else {
//                     return Linking.openURL(url);
//                 }
//             })
//             .catch((err) => console.log(err));
//     };

//     const callPhone = () => {
//         if (item?.contact?.phone) {
//             makeCall(item.contact.phone);
//         }
//     };

//     const openExisitingConversation = () => {
//         if (selectedUser && fbaseUser && schedule) {
//             navigation.navigate(ROUTES.chat_conversation, {
//                 selectedUser: selectedUser,
//                 fbaseUser: fbaseUser,
//                 schedule: schedule,
//                 friendIndex: index
//             });
//         }
//     };

//     // Check if individual cleaner can be cancelled
//     const canCancelCleaner = (cleaner) => {
//         if (!schedule || !cleaner) return false;
        
//         const bookingTime = new Date(`${cleaning_date}T${cleaning_time}`);
//         const now = new Date();
//         const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
        
//         if (hoursUntilBooking <= 0) return false;
//         if (cleaner.status === 'in_progress') return false;
//         if (cleaner.status === 'completed') return false;
//         if (schedule.status === 'cancelled') return false;
        
//         return true;
//     };

//     // Check if entire booking can be cancelled
//     const canCancelBooking = () => {
//         if (!schedule) return false;
        
//         const bookingTime = new Date(`${cleaning_date}T${cleaning_time}`);
//         const now = new Date();
//         const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
        
//         if (schedule.status === 'completed' || schedule.status === 'cancelled') {
//             return false;
//         }
        
//         return hoursUntilBooking > 0;
//     };

//     // Enhanced CommunicateItem with cancellation option
//     const renderCommunicateItem = (cleaner, index, distance) => {
//         const canCancelThisCleaner = canCancelCleaner(cleaner);
        
//         return (
//             <View key={cleaner.cleanerId || index}>
//                 <CommunicateItem
//                     cleaner={cleaner}
//                     index={index}
//                     distance={distance}
//                     callPhone={callPhone}
//                     openExisitingConversation={openExisitingConversation}
//                     onCancelCleaner={canCancelThisCleaner ? () => openPartialCancellationModal(cleaner) : null}
//                     onClaimCleaner={() => handleClaim(cleaner)}
//                     canCancel={canCancelThisCleaner}
//                 />
//             </View>
//         );
//     };

//     const openFullCancellationModal = () => {
//         if (!schedule) return;
        
//         setCancellationType('full');
//         setTargetCleaner(null);
//         setCancelModalVisible(true);
//     };

//     const openPartialCancellationModal = (cleaner) => {
//         if (!schedule || !cleaner) return;
        
//         setCancellationType('partial');
//         setTargetCleaner(cleaner);
//         setCancelModalVisible(true);
//     };

//     // Helper function to calculate duration
//     const calculateDuration = (startTime, endTime) => {
//         try {
//             const start = moment(startTime, 'h:mm:ss A');
//             const end = moment(endTime, 'h:mm:ss A');
//             const duration = moment.duration(end.diff(start));
//             const hours = duration.hours();
//             const minutes = duration.minutes();
            
//             if (hours > 0) {
//                 return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
//             }
//             return `${minutes}m`;
//         } catch (error) {
//             return tSafe('duration_not_available', 'Duration not available');
//         }
//     };

//     // Fallback Components
//     const LoadingFallback = () => (
//         <View style={styles.fallbackContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.fallbackTitle}>{tSafe('loading_schedule_details', 'Loading Schedule Details')}</Text>
//             <Text style={styles.fallbackText}>{tSafe('please_wait_fetch_schedule', 'Please wait while we fetch your schedule information...')}</Text>
//         </View>
//     );

//     const ErrorFallback = () => (
//         <View style={styles.fallbackContainer}>
//             <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF3B30" />
//             <Text style={styles.fallbackTitle}>{tSafe('failed_load_schedule', 'Failed to Load Schedule')}</Text>
//             <Text style={styles.fallbackText}>{error || tSafe('unexpected_error', 'An unexpected error occurred')}</Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
//                 <Text style={styles.retryButtonText}>{tSafe('retry', 'Retry')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.retryButton, styles.backButton]} onPress={() => navigation.goBack()}>
//                 <Text style={[styles.retryButtonText, styles.backButtonText]}>{tSafe('go_back', 'Go Back')}</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const NoDataFallback = () => (
//         <View style={styles.fallbackContainer}>
//             <MaterialCommunityIcons name="calendar-remove" size={64} color="#8E8E93" />
//             <Text style={styles.fallbackTitle}>{tSafe('schedule_not_found', 'Schedule Not Found')}</Text>
//             <Text style={styles.fallbackText}>
//                 {tSafe('schedule_not_found_message', "The schedule you're looking for doesn't exist or has been removed.")}
//             </Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
//                 <Text style={styles.retryButtonText}>{tSafe('refresh', 'Refresh')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.retryButton, styles.backButton]} onPress={() => navigation.goBack()}>
//                 <Text style={[styles.retryButtonText, styles.backButtonText]}>{tSafe('go_back_dashboard', 'Go Back to Dashboard')}</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const NetworkErrorFallback = () => (
//         <View style={styles.fallbackContainer}>
//             <MaterialCommunityIcons name="wifi-off" size={64} color="#FF9500" />
//             <Text style={styles.fallbackTitle}>{tSafe('connection_error', 'Connection Error')}</Text>
//             <Text style={styles.fallbackText}>
//                 {tSafe('connection_error_message', 'Please check your internet connection and try again.')}
//             </Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
//                 <Text style={styles.retryButtonText}>{tSafe('retry_connection', 'Retry Connection')}</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     // Main render content
//     const renderMainContent = () => {
//         const data = [
//             { type: 'circleicons' },
//             { type: 'taskItem' },
//         ];

//         const renderItem = ({ item }) => {
//             switch (item.type) {
//                 case 'circleicons':
//                     return (
//                         <View style={styles.container}>
//                             <CustomCard>
//                                 <View style={styles.centerContent}>
//                                     <AntDesign name="home" size={60} color={COLORS.gray} /> 
//                                     <Text style={styles.headerText}>{apartment_name}</Text>
//                                     <Text style={{ color: COLORS.gray, marginBottom: 10, marginLeft: -5 }}> 
//                                         <MaterialCommunityIcons name="map-marker" size={16} />{address}
//                                     </Text>
//                                 </View>

//                                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
//                                     <CircleIcon 
//                                         iconName="bed-empty"
//                                         buttonSize={26}
//                                         radiusSise={13}
//                                         iconSize={16}
//                                         title={bedroomCount}
//                                         roomSize={bedroomSize}
//                                         type={tSafe('bedrooms', 'Bedrooms')}
//                                     /> 
//                                     <CircleIcon 
//                                         iconName="shower-head"
//                                         buttonSize={26}
//                                         radiusSise={13}
//                                         iconSize={16}
//                                         title={bathroomCount}
//                                         roomSize={bathroomSize}
//                                         type={tSafe('bathrooms', 'Bathrooms')}
//                                     /> 
//                                     <CircleIcon 
//                                         iconName="silverware-fork-knife"
//                                         buttonSize={26}
//                                         radiusSise={13}
//                                         iconSize={16}
//                                         title={kitchen}
//                                         roomSize={kitchenSize}
//                                         type={tSafe('kitchen', 'Kitchen')}
//                                     />
//                                     <CircleIcon 
//                                         iconName="seat-legroom-extra"
//                                         buttonSize={26}
//                                         radiusSise={13}
//                                         iconSize={16}
//                                         title={livingroomCount}
//                                         roomSize={livingroomSize}
//                                         type={tSafe('livingroom', 'Livingroom')}
//                                     /> 
//                                 </View>   
//                             </CustomCard>

//                             {getCurrentStatus() && (
//                                 <CustomCard>
//                                     <View style={styles.timelineHeader}>
//                                         <Text style={styles.timelineTitle}>{tSafe('cleaning_timeline', 'Cleaning Timeline')}</Text>
//                                         <Text style={styles.timelineSubtitle}>{tSafe('track_cleaning_workflow', 'Track your cleaning workflow')}</Text>
//                                     </View>
//                                     {/* <ProjectTimelineBar currentStatus={getCurrentStatus()} /> */}
                                    
//                                     <ProjectTimelineBar 
//                                         currentStatus={schedule.status} 
//                                         scheduledDate={schedule.schedule?.cleaning_date} 
//                                     />
//                                 </CustomCard>
//                             )}

//                             <CleaningScheduleCard 
//                                 cleaning_time = {cleaning_time}
//                                 cleaning_date = {cleaning_date}
//                                 cleaning_end_time = {cleaning_end_time}
//                             />
//                             {/* {canCancelBooking() && (
//                                 <View style={styles.fullCancellationContainer}>
//                                     <TouchableOpacity 
//                                         style={styles.fullCancelButton}
//                                         onPress={openFullCancellationModal}
//                                         disabled={cancellationLoading}
//                                     >
//                                         <MaterialCommunityIcons name="close-circle" size={20} color="#FFFFFF" />
//                                         <Text style={styles.fullCancelButtonText}>
//                                             {cancellationLoading ? tSafe('cancelling', 'Cancelling...') : tSafe('cancel_entire_booking', 'Cancel Entire Booking')}
//                                         </Text>
//                                     </TouchableOpacity>
//                                     <Text style={styles.cancellationNote}>
//                                         {tSafe('cancel_entire_booking_note', 'This will cancel the booking for all {count} cleaners', { count: assignedTo?.length || 0 })}
//                                     </Text>
//                                 </View>
//                             )} */}

//                             {/* {assignedTo && assignedTo.length > 0 ? (
//                                 <View>
//                                     <CustomCard>
//                                         <View style={styles.timelineHeader}>
//                                             <Text style={styles.timelineTitle}>
//                                                 {assignedTo.length > 1 
//                                                     ? tSafe('assigned_cleaners_plural', 'Assigned Cleaners')
//                                                     : tSafe('assigned_cleaner_singular', 'Assigned Cleaner')}
//                                             </Text>
//                                             <Text style={styles.timelineSubtitle}>
//                                                 {assignedTo.length > 1 
//                                                     ? tSafe('manage_cleaners_subtitle', 'Manage individual cleaners or cancel the entire booking')
//                                                     : tSafe('track_cleaner_subtitle', 'Track your cleaner working on your apartment')
//                                                 }
//                                             </Text>
//                                         </View>
                                        
//                                         {assignedTo
//                                             .filter(cleaner => {
//                                                 const validStatuses = ['payment_confirmed', 'in_progress', 'pending_review'];
//                                                 return validStatuses.includes(cleaner.status?.toLowerCase());
//                                             })
//                                             .map((cleaner, index) => {
//                                                 const distance = calculateDistance(
//                                                     cleaner.cleaner_latitude,
//                                                     cleaner.cleaner_longitude,
//                                                     apartment_latitude,
//                                                     apartment_longitude
//                                                 );
//                                                 return renderCommunicateItem(cleaner, index, distance);
//                                             })
//                                         }
//                                     </CustomCard>
//                                 </View>
//                             ) : (
//                                 <View style={styles.noCleanersContainer}>
//                                     <MaterialCommunityIcons name="account-group" size={48} color="#CCCCCC" />
//                                     <Text style={styles.noCleanersText}>{tSafe('no_cleaners_assigned_yet', 'No cleaners assigned yet')}</Text>
//                                     <Text style={styles.noCleanersSubtext}>
//                                         {tSafe('no_cleaners_assigned_message', 'Cleaners will appear here once they accept your request')}
//                                     </Text>
//                                 </View>
//                             )} */}

//                             {assignedTo && assignedTo.length > 0 ? (
//                                 <CustomCard>
//                                     <View style={styles.timelineHeader}>
//                                         <Text style={styles.timelineTitle}>
//                                             {assignedTo.length > 1 
//                                                 ? tSafe('assigned_cleaners_plural', 'Assigned Cleaners')
//                                                 : tSafe('assigned_cleaner_singular', 'Assigned Cleaner')}
//                                         </Text>
//                                         <Text style={styles.timelineSubtitle}>
//                                             {assignedTo.length > 1 
//                                                 ? tSafe('manage_cleaners_subtitle', 'Manage individual cleaners or cancel the entire booking')
//                                                 : tSafe('track_cleaner_subtitle', 'Track your cleaner working on your apartment')
//                                             }
//                                         </Text>
//                                     </View>
                                    
//                                     {/* Show ALL cleaners (including cancelled) */}
//                                     {assignedTo.map((cleaner, index) => {
//                                         const distance = calculateDistance(
//                                             cleaner.cleaner_latitude,
//                                             cleaner.cleaner_longitude,
//                                             apartment_latitude,
//                                             apartment_longitude
//                                         );
//                                         const isCancelled = isCleanerCancelled(cleaner);
                                        
                                        

//                                         {/* For cancelled cleaners */}
//                                         {isCancelled && (
//                                             <View key={cleaner.cleanerId || index} style={styles.cancelledCleanerCard}>
//                                                 <View style={styles.cancelledCleanerContent}>
//                                                     <Avatar.Icon 
//                                                         size={50} 
//                                                         icon="account-cancel"   // ✅ fixed icon name
//                                                         style={styles.cancelledAvatar}
//                                                         color="#DC3545"         // optional red tint
//                                                     />
//                                                     <View style={styles.cancelledCleanerInfo}>
//                                                         <Text style={styles.cancelledCleanerName}>
//                                                             {cleaner.firstname} {cleaner.lastname}
//                                                         </Text>
//                                                         <View style={styles.cancelledBadge}>
//                                                             <MaterialCommunityIcons name="close-circle" size={14} color="#DC3545" />
//                                                             <Text style={styles.cancelledBadgeText}>
//                                                                 {tSafe('cancelled', 'CANCELLED')}
//                                                             </Text>
//                                                         </View>
//                                                         <Text style={styles.cancelledNote}>
//                                                             {tSafe('cleaner_cancelled_note', 'This cleaner has been cancelled from this booking.')}
//                                                         </Text>
//                                                     </View>
//                                                 </View>
//                                             </View>
//                                         )}
                                        
//                                         // For active cleaners, render the normal CommunicateItem
//                                         return renderCommunicateItem(cleaner, index, distance);
//                                     })}
//                                 </CustomCard>
//                             ) : (
//                                 // Placeholder when no cleaners are assigned
//                                 // <View style={styles.noCleanersContainer}>
//                                 //     <MaterialCommunityIcons name="account-group" size={48} color="#CCCCCC" />
//                                 //     <Text style={styles.noCleanersText}>{tSafe('no_cleaners_assigned_yet', 'No cleaners assigned yet')}</Text>
//                                 //     <Text style={styles.noCleanersSubtext}>
//                                 //         {tSafe('no_cleaners_assigned_message', 'Cleaners will appear here once they accept your request')}
//                                 //     </Text>
//                                 // </View>
//                                 <View style={styles.noCleanersContainer}>
//                                 <Avatar.Icon 
//                                     size={60} 
//                                     icon="account-group" 
//                                     style={{ backgroundColor: '#F0F0F0' }}
//                                     color="#CCCCCC"
//                                 />
//                                 <Text style={styles.noCleanersText}>{tSafe('no_cleaners_assigned_yet', 'No cleaners assigned yet')}</Text>
//                                 <Text style={styles.noCleanersSubtext}>
//                                     {tSafe('no_cleaners_assigned_message', 'Cleaners will appear here once they accept your request')}
//                                 </Text>
//                             </View>
//                             )}
//                         </View>
//                     );
//                 case 'taskItem':
//                     return (
//                         <View style={{ marginHorizontal: 0 }}>
//                             {/* Additional task items can go here */}
//                         </View>
//                     );
//                 default:
//                     return null;
//             }
//         };

//         return (
//             <FlatList
//                 data={data}
//                 renderItem={renderItem}
//                 keyExtractor={(item, index) => index.toString()}
//                 refreshControl={
//                     <RefreshControl
//                         refreshing={refreshing}
//                         onRefresh={onRefresh}
//                         colors={[COLORS.primary]}
//                         tintColor={COLORS.primary}
//                     />
//                 }
//             />
//         );
//     };

//     // Determine which fallback to show
//     const renderContent = () => {
//         if (loading) {
//             return <LoadingFallback />;
//         }

//         if (error) {
//             if (error.includes('network') || error.includes('connection') || error.includes('Network Error')) {
//                 return <NetworkErrorFallback />;
//             }
//             return <ErrorFallback />;
//         }

//         if (!schedule) {
//             return <NoDataFallback />;
//         }

//         return renderMainContent();
//     };

//     return (
//         <ScrollView style={{ flex: 1, backgroundColor: '#f9f9f9', padding: 20 }}>
//             <StatusBar
//                 barStyle="dark-content"
//                 backgroundColor={COLORS.white}
//                 translucent={false}
//             />

//             {renderContent()}
    
//             {schedule && (
//                 <CancelScheduleModal
//                     visible={cancelModalVisible}
//                     onClose={() => setCancelModalVisible(false)}
//                     booking={getBookingForCancellation()}
//                     userType="host"
//                     onCancelBooking={handleCancelBooking}
//                     cleaners={assignedTo}
//                     cancellationType={cancellationType}
//                     targetCleaner={targetCleaner}
//                 />
//             )}
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         marginHorizontal: 0,
//         marginBottom: 0
//     },
//     loaderContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     fallbackContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 16,
//         marginTop: 20,
//     },
//     fallbackTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#1C1C1E',
//         marginTop: 20,
//         marginBottom: 8,
//         textAlign: 'center',
//     },
//     fallbackText: {
//         fontSize: 14,
//         color: '#8E8E93',
//         textAlign: 'center',
//         lineHeight: 20,
//         marginBottom: 24,
//     },
//     retryButton: {
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 8,
//         marginTop: 8,
//         width: '80%',
//         alignItems: 'center',
//     },
//     retryButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     backButton: {
//         backgroundColor: '#F0F0F0',
//         marginTop: 12,
//     },
//     backButtonText: {
//         color: '#666',
//     },
//     noCleanersContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 40,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 16,
//         marginTop: 16,
//     },
//     noCleanersText: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#8E8E93',
//         marginTop: 16,
//     },
//     noCleanersSubtext: {
//         fontSize: 14,
//         color: '#C7C7CC',
//         textAlign: 'center',
//         marginTop: 8,
//     },
//     title: {
//         fontSize: 16,
//         fontWeight: '60'
//     },
//     button: {
//         flexDirection: 'row',
//         backgroundColor: COLORS.primary,
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         justifyContent: 'center'
//     },
//     buttonText: {
//         color: '#ffffff',
//         fontSize: 18
//     },
//     centerContent: {
//         alignItems: 'center',
//         marginVertical: 5
//     },
//     headerText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     communicate: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center'
//     },
//     chip_container: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         padding: 5,
//         gap: 8,
//     },
//     chip: {
//         height: 35,
//         paddingHorizontal: 0,
//         borderRadius: 17,
//         borderWidth: 0.5,
//         borderColor: COLORS.light_gray,
//         backgroundColor: '#f9f9f9',
//         flexShrink: 1,
//     },
//     chipText: {
//         fontSize: 13,
//         fontWeight: '400',
//         color: COLORS.gray
//     },
//     cardContainer: {
//         padding: 0,
//         backgroundColor: COLORS.white,
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     headerLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     cardTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: COLORS.dark,
//         marginLeft: 8,
//     },
//     statusIndicator: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         borderRadius: 12,
//     },
//     statusText: {
//         fontSize: 12,
//         fontWeight: '600',
//         marginLeft: 4,
//     },
//     timelineContainer: {
//         position: 'relative',
//         marginBottom: 16,
//     },
//     timelineLine: {
//         position: 'absolute',
//         left: 11,
//         top: 20,
//         bottom: 20,
//         width: 1,
//         backgroundColor: COLORS.light_gray,
//     },
//     timelineItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     timelineDot: {
//         width: 24,
//         height: 24,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1,
//     },
//     startDot: {
//         backgroundColor: COLORS.lime_green,
//     },
//     dateDot: {
//         backgroundColor: COLORS.primary,
//     },
//     endDot: {
//         backgroundColor: COLORS.warning,
//     },
//     timelineContent: {
//         marginLeft: 16,
//         flex: 1,
//     },
//     timelineLabel: {
//         fontSize: 12,
//         fontWeight: '500',
//         color: COLORS.gray,
//         marginBottom: 4,
//         textTransform: 'uppercase',
//         letterSpacing: 0.5,
//     },
//     timeContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     timelineTime: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: COLORS.dark,
//         marginLeft: 8,
//     },
//     durationContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 12,
//         backgroundColor: COLORS.light_gray_1 + '40',
//         borderRadius: 8,
//         marginTop: 8,
//     },
//     durationText: {
//         fontSize: 14,
//         fontWeight: '500',
//         color: COLORS.gray,
//         marginLeft: 8,
//     },
//     timelineHeader: {
//         marginBottom: 16,
//     },
//     timelineTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: COLORS.dark,
//         marginBottom: 4,
//     },
//     timelineSubtitle: {
//         fontSize: 14,
//         color: COLORS.gray,
//     },
//     fullCancellationContainer: {
//         marginHorizontal: 5,
//         marginTop: 16,
//         marginBottom: 8,
//         alignItems: 'center',
//     },
//     fullCancelButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#DC3545',
//         paddingVertical: 12,
//         paddingHorizontal: 16,
//         borderRadius: 8,
//         gap: 8,
//         width: '100%',
//     },
//     fullCancelButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     cancellationNote: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 8,
//         textAlign: 'center',
//     },
// });