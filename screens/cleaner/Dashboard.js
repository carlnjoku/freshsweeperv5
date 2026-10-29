// import React, { useRef, useEffect, useContext, useState } from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   Animated,
//   TouchableOpacity,
//   RefreshControl,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import CleaningRequestItem from '../../components/cleaner/CleaningRequestItem';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import NoScheduleMessage from '../../components/cleaner/NoScheduleMessage';
// import { get_clean_future_requests } from '../../utils/get_cleaner_future_request';
// import { useTranslation } from 'react-i18next';
// import InviteBanner from '../../components/cleaner/InviteBanner';
// import UpcomingSummaryCard from '../../components/shared/UpcomingSummaryCard';

// import NewRequestsSummaryCard from '../../components/cleaner/NewRequestSummaryCard';
// import { tSafe } from '../../utils/tSafe';
// import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';

// /* ---------------------------------- tokens --------------------------------- */

// const BG = '#F6F7FB';
// const SURFACE = '#FFFFFF';
// const BORDER = '#EEF0F5';
// const TEXT = '#0F172A';
// const MUTED = '#7C8798';

// const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
// const R = { sm: 12, md: 18, lg: 24, xl: 28, pill: 999 };

// const cardShadow = {
//   shadowColor: '#0F172A',
//   shadowOffset: { width: 0, height: 6 },
//   shadowOpacity: 0.06,
//   shadowRadius: 14,
//   elevation: 3,
// };

// /* ------------------------------ small components --------------------------- */

// const StatPill = ({ icon, value, label, color }) => (
//   <View style={styles.statPill}>
//     <View style={[styles.statPillIcon, { backgroundColor: color + '14' }]}>
//       <MaterialCommunityIcons name={icon} size={18} color={color} />
//     </View>
//     <Text style={styles.statPillValue} numberOfLines={1}>
//       {value}
//     </Text>
//     <Text style={styles.statPillLabel} numberOfLines={1}>
//       {label}
//     </Text>
//   </View>
// );

// const SectionHeader = ({ title, count, onViewAll, showViewAll = true }) => (
//   <View style={styles.sectionHeader}>
//     <View style={styles.sectionTitleRow}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {count > 0 && (
//         <View style={styles.countBadge}>
//           <Text style={styles.countBadgeText}>{count}</Text>
//         </View>
//       )}
//     </View>
//     {showViewAll && count > 0 && (
//       <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton} activeOpacity={0.7}>
//         <Text style={styles.viewAllText}>{tSafe('view_all', 'View all')}</Text>
//         <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
//       </TouchableOpacity>
//     )}
//   </View>
// );

// // const QuickAction = ({ icon, label, color, tint, onPress }) => (
// //   <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.85}>
// //     <View style={[styles.quickActionIcon, { backgroundColor: tint }]}>
// //       <MaterialCommunityIcons name={icon} size={22} color={color} />
// //     </View>
// //     <Text style={styles.quickActionLabel} numberOfLines={1}>
// //       {label}
// //     </Text>
// //   </TouchableOpacity>
// // );

// const QuickAction = ({ icon, label, onPress }) => (
//   <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.85}>
//     <View style={styles.quickActionIcon}>
//       <MaterialCommunityIcons name={icon} size={22} color={TEXT} />
//     </View>
//     <Text style={styles.quickActionLabel} numberOfLines={1}>
//       {label}
//     </Text>
//   </TouchableOpacity>
// );

// /* --------------------------------- dashboard ------------------------------- */

// const Dashboard = () => {
//   const navigation = useNavigation();
//   const { currentUserId, currentUser, currency, notificationUnreadCount } = useContext(AuthContext);
//   const { t, i18n } = useTranslation();

//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [email, setEmail] = useState('');
//   const [avatar, setAvatar] = useState('');
//   const [upcoming_schedule, setUpcomingSchedule] = useState([]);
//   const [cleaning_requests, setCleaningRequests] = useState([]);
//   const [pending_payment, setPendingPayment] = useState([]);
//   const [all_cleaning_requests, setAllCleaningRequests] = useState([]);
//   const [accountStatus, setAccountStatus] = useState(null);
//   const [weekly_earning, setWeeklyEarning] = useState(0);
//   const [accountId, setAccountId] = useState(null);
//   const [business_type, setBusinessType] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [ratings, setCleanerRatings] = useState([]);
//   const [location, setLocation] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [performance, setPerformance] = useState(null);

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   const [showBanner, setShowBanner] = useState(false);
//   const [inviteCount, setInviteCount] = useState(0);
//   const [pendingInvites, setPendingInvites] = useState([]);

//   useEffect(() => {
//     checkPendingInvites();
//   }, []);

//   const checkPendingInvites = async () => {
//     const response = await userService.getPendingInvites(currentUserId);
//     if (response.data.length > 0) {
//       setPendingInvites(response.data);
//       setInviteCount(response.data.length);
//       setShowBanner(true);
//     }
//   };

//   const handleAccept = () => {
//     if (pendingInvites.length === 0) return;
//     const invite = pendingInvites[0];
//     navigation.navigate(ROUTES.cleaner_property_preview, {
//       propertyId: invite.property_id,
//       inviteToken: invite.token,
//     });
//     setShowBanner(false);
//   };

//   const handleDismiss = () => setShowBanner(false);

//   /* ------------------------------- header bar ------------------------------ */

//   useEffect(() => {
//     navigation.setOptions({
//       title: `${tSafe('welcome_back', 'Welcome back')}, ${currentUser?.firstname || ''}`,
//       headerTitleStyle: {
//         fontWeight: '700',
//         fontSize: 18,
//         color: TEXT,
//         letterSpacing: -0.3,
//       },
//       headerStyle: {
//         backgroundColor: BG,
//         borderBottomWidth: 0,
//         elevation: 0,
//         shadowOpacity: 0,
//       },
//       headerTintColor: TEXT,
//       headerShadowVisible: false,
//       headerRight: () => (
//         <TouchableOpacity
//           style={styles.notificationWrapper}
//           onPress={() => navigation.navigate(ROUTES.notification)}
//           activeOpacity={0.8}
//         >
//           <MaterialCommunityIcons name="bell-outline" size={22} color={TEXT} />
//           {notificationUnreadCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>
//                 {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation, currentUser, notificationUnreadCount, i18n.language]);

//   /* -------------------------------- animation ------------------------------ */

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   /* ------------------------------- data loading ---------------------------- */

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchAllData().then(() => setRefreshing(false));
//   }, []);

//   const fetchAllData = async () => {
//     await Promise.all([
//       fetchUser(),
//       fetchAssignTasks(),
//       fetchRequests(),
//       fetchallRequests(),
//       fetchPendingPayment(),
//       fetchWeeklyEarnings(),
//       fetchCleanerRatings(),
//     ]);
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchAllData();
//     }, [])
//   );

//   const fetchUser = async () => {
//     try {
//       await userService.getUser(currentUserId).then((response) => {
//         const res = response.data;
//         setEmail(res.email || '');
//         setFirstname(res.firstname || '');
//         setLastname(res.lastname || '');
//         setAccountStatus(res.stripe_accountStatus || 'not_started');
//         setAccountId(res.stripe_account_id);
//         setBusinessType(res.stripe_business_type);
//         setPerformance(res.calculated_performance);

//         if (res.location) {
//           if (typeof res.location === 'string') {
//             setLocation(res.location);
//           } else if (typeof res.location === 'object') {
//             const city = res.location.city || '';
//             const country = res.location.country_name || '';
//             setLocation(city || country ? `${city}${city && country ? ', ' : ''}${country}` : '');
//           }
//         } else {
//           setLocation('');
//         }

//         setLoading(false);
//       });
//     } catch (e) {
//       console.log(e);
//       setLoading(false);
//     }
//   };

//   const fetchRequests = async () => {
//     try {
//       await userService.getMyCleaningRequest(currentUserId).then((response) => {
//         setCleaningRequests(response.data);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchPendingPayment = async () => {
//     try {
//       await userService.getMyCleaningPendingPayment(currentUserId).then((response) => {
//         const pendingPay = response.data.filter((request) => request.status === 'pending_payment');
//         setPendingPayment(pendingPay);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchallRequests = async () => {
//     try {
//       await userService.getAllCleaningRequest(currentUserId).then((response) => {
//         setAllCleaningRequests(get_clean_future_requests(response.data));
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchAssignTasks = async () => {
//     try {
//       await userService.getMySchedules(currentUserId).then((response) => {
//         setUpcomingSchedule(response.data);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchWeeklyEarnings = async () => {
//     try {
//       await userService.getWeeklyEarningToDate(currentUserId).then((response) => {
//         setWeeklyEarning(response.data.total_earnings || 0);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchCleanerRatings = async () => {
//     try {
//       const response = await userService.getCleanerFeedbacks(currentUserId);
//       setCleanerRatings(response.data.data || []);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   /* --------------------------------- helpers ------------------------------- */

//   const calculateOverallRating = (ratingList, cleanerId) => {
//     const cleanerRatings = ratingList.filter((r) => r.cleanerId === cleanerId);
//     if (cleanerRatings.length === 0) return '0.0';
//     const total = cleanerRatings.reduce((sum, r) => sum + r.averageRating, 0);
//     return (total / cleanerRatings.length).toFixed(1);
//   };

//   const getCompletedJobsCount = () =>
//     upcoming_schedule.filter((schedule) => schedule.status === 'completed').length;

//   const handleUpdateProfile = () => navigation.navigate(ROUTES.cleaner_profile);

//   /* --------------------------------- loading ------------------------------- */

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>
//           {tSafe('loading_dashboard', 'Loading your dashboard...')}
//         </Text>
//       </View>
//     );
//   }

//   const weeklyGoalPct = Math.min((weekly_earning / 1000) * 100, 100);
//   const hasAnything =
//     upcoming_schedule.length > 0 || cleaning_requests.length > 0 || pending_payment.length > 0;

//   /* ---------------------------------- render ------------------------------- */

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={BG} />

//       <Animated.ScrollView
//         style={[
//           styles.scrollView,
//           { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
//         ]}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={COLORS.primary}
//             colors={[COLORS.primary]}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {showBanner && (
//           <InviteBanner
//             onAccept={handleAccept}
//             onDismiss={handleDismiss}
//             inviteCount={inviteCount}
//             propertyName={pendingInvites[0]?.property_name}
//           />
//         )}

//         {/* ------------------------------ hero card ----------------------------- */}
//         <View style={styles.heroCard}>
//           <View style={[styles.heroOrb, styles.heroOrbOne]} />
//           <View style={[styles.heroOrb, styles.heroOrbTwo]} />

//           <View style={styles.heroTopRow}>
//             <View style={styles.heroLabelRow}>
//               <MaterialCommunityIcons name="wallet-outline" size={14} color="rgba(255,255,255,0.85)" />
//               <Text style={styles.heroLabel}>
//                 {tSafe('this_weeks_earnings', "This Week's Earnings")}
//               </Text>
//             </View>
//             <View style={styles.heroTrendBadge}>
//               <MaterialCommunityIcons name="trending-up" size={14} color={COLORS.primary} />
//             </View>
//           </View>

//           <Text style={styles.heroAmount}>${weekly_earning.toFixed(2)}</Text>

//           <View style={styles.heroProgressTrack}>
//             <View style={[styles.heroProgressFill, { width: `${weeklyGoalPct}%` }]} />
//           </View>

//           <View style={styles.heroFooterRow}>
//             <Text style={styles.heroSubtitle}>
//               {tSafe('keep_up_great_work', 'Keep up the great work!')}
//             </Text>
//             <TouchableOpacity
//               style={styles.heroCta}
//               activeOpacity={0.85}
//               onPress={() => navigation.navigate(ROUTES.cleaner_payment_history)}
//             >
//               <Text style={styles.heroCtaText}>{tSafe('details', 'Details')}</Text>
//               <MaterialCommunityIcons name="arrow-right" size={14} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ------------------------------ stat pills ---------------------------- */}
//         <View style={styles.statsRow}>
//           <StatPill
//             icon="check-circle-outline"
//             value={getCompletedJobsCount()}
//             label={tSafe('completed', 'Completed')}
//             color="#10B981"
//           />
//           <StatPill
//             icon="star-outline"
//             value={calculateOverallRating(ratings, currentUserId)}
//             label={tSafe('rating', 'Rating')}
//             color="#F59E0B"
//           />
//           <StatPill
//             icon="calendar-clock"
//             value={upcoming_schedule.length}
//             label={tSafe('upcoming', 'Upcoming')}
//             color={COLORS.primary}
//           />
//         </View>

//         {/* ---------------------------- new requests --------------------------- */}
//         {cleaning_requests.length > 0 && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               {tSafe('new_requests', 'New Requests')}
//             </Text>

//             <NewRequestsSummaryCard
//               requests={cleaning_requests}
//               onPress={() =>
//                 navigation.navigate(ROUTES.cleaner_all_requests, {
//                   active_requests: cleaning_requests,
//                 })
//               }
//             />
//           </View>
//         )}

//         {/* --------------------------- pending payments ------------------------ */}
//         {pending_payment.length > 0 && (
//           <View style={styles.section}>
//             <SectionHeader
//               title={tSafe('pending_payments', 'Pending Payments')}
//               count={pending_payment.length}
//               onViewAll={() => navigation.navigate(ROUTES.cleaner_payments)}
//             />
//             <FlatList
//               data={pending_payment.slice(0, 3)}
//               renderItem={({ item }) => (
//                 <CleaningRequestItem item={item} status={item.status} currency={currency} />
//               )}
//               scrollEnabled={false}
//               keyExtractor={(item) => item._id || item.id}
//               ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
//             />
//           </View>
//         )}

//         {/* -------------------------- upcoming schedule ------------------------ */}
//         {/* {upcoming_schedule.length > 0 && (
//           <View style={styles.section}>
//             <SectionHeader
//               title={tSafe('upcoming_schedule', 'Upcoming Schedule')}
//               count={upcoming_schedule.length}
//               onViewAll={() => navigation.navigate(ROUTES.cleaner_schedules)}
//             />
//             <UpcomingSummaryCard schedules={upcoming_schedule} />
//           </View>
//         )} */}

//         {upcoming_schedule.length > 0 && (
//           <View style={styles.section}>
//             <SectionHeader
//               title={tSafe('upcoming_schedule', 'Upcoming Schedule')}
//               count={upcoming_schedule.length}
//               showViewAll={false}
//             />

//             <UpcomingScheduleListItem
//               item={upcoming_schedule[0]}
//               currency={currency}
//               replacementWorkflows={upcoming_schedule[0]?.replacementWorkflows || []}
//             />

//             {upcoming_schedule.length > 1 && (
//               <TouchableOpacity
//                 style={styles.viewAllSchedulesLink}
//                 onPress={() => navigation.navigate(ROUTES.cleaner_schedules)}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.viewAllSchedulesText}>
//                   {`${tSafe('view_all', 'View all')} ${upcoming_schedule.length} ${tSafe(
//                     'upcoming_schedules',
//                     'upcoming schedules'
//                   )}`}
//                 </Text>
//                 <MaterialCommunityIcons
//                   name="arrow-right"
//                   size={16}
//                   color={COLORS.primary}
//                 />
//               </TouchableOpacity>
//             )}
//           </View>
//         )}

//         {/* ------------------------------ empty state -------------------------- */}
//         {!hasAnything && <NoScheduleMessage onUpdateProfile={handleUpdateProfile} />}

//         {/* ----------------------------- quick actions ------------------------- */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>{tSafe('quick_actions', 'Quick Actions')}</Text>
//           <View style={styles.quickActionsRow}>
//             <QuickAction
//               icon="calendar-month-outline"
//               label={tSafe('schedule', 'Schedule')}
//               onPress={() => navigation.navigate(ROUTES.cleaner_schedules)}
//             />
//             <QuickAction
//               icon="clipboard-text-outline"
//               label={tSafe('requests', 'Requests')}
//               onPress={() =>
//                 navigation.navigate(ROUTES.cleaner_all_requests, {
//                   active_requests: cleaning_requests,
//                 })
//               }
//             />
//             <QuickAction
//               icon="cash-multiple"
//               label={tSafe('payments', 'Payments')}
//               onPress={() => navigation.navigate(ROUTES.cleaner_payment_history)}
//             />
//             <QuickAction
//               icon="account-cog-outline"
//               label={tSafe('profile', 'Profile')}
//               onPress={() => navigation.navigate(ROUTES.cleaner_profile)}
//             />
//           </View>
//         </View>
//       </Animated.ScrollView>
//     </SafeAreaView>
//   );
// };

// /* ---------------------------------- styles --------------------------------- */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: BG },
//   scrollView: { flex: 1 },
//   scrollContent: { paddingTop: S.sm, paddingBottom: 56 },

//   /* loading */
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: BG,
//   },
//   loadingText: { marginTop: 14, fontSize: 15, color: MUTED, fontWeight: '500' },

//   /* hero */
//   heroCard: {
//     marginHorizontal: S.xl,
//     marginTop: S.md,
//     borderRadius: R.xl,
//     padding: 22,
//     backgroundColor: COLORS.primary,
//     overflow: 'hidden',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.28,
//     shadowRadius: 20,
//     elevation: 8,
//   },
//   heroOrb: {
//     position: 'absolute',
//     borderRadius: R.pill,
//     backgroundColor: 'rgba(255,255,255,0.10)',
//   },
//   heroOrbOne: { width: 190, height: 190, top: -100, right: -55 },
//   heroOrbTwo: {
//     width: 130,
//     height: 130,
//     bottom: -80,
//     left: -35,
//     backgroundColor: 'rgba(255,255,255,0.07)',
//   },
//   heroTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   heroLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: 'rgba(255,255,255,0.85)',
//     letterSpacing: 0.2,
//   },
//   heroTrendBadge: {
//     width: 30,
//     height: 30,
//     borderRadius: R.pill,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heroAmount: {
//     fontSize: 40,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     letterSpacing: -1,
//     marginTop: 10,
//   },
//   heroProgressTrack: {
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: 'rgba(255,255,255,0.22)',
//     marginTop: 18,
//     overflow: 'hidden',
//   },
//   heroProgressFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFFFFF' },
//   heroFooterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: '500' },
//   heroCta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: R.pill,
//   },
//   heroCtaText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

//   /* stats */
//   statsRow: {
//     flexDirection: 'row',
//     paddingHorizontal: S.xl,
//     marginTop: S.xl,
//     gap: S.md,
//   },
//   statPill: {
//     flex: 1,
//     backgroundColor: SURFACE,
//     borderRadius: R.md,
//     paddingVertical: 16,
//     paddingHorizontal: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: BORDER,
//     ...cardShadow,
//   },
//   statPillIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 13,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   statPillValue: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: TEXT,
//     letterSpacing: -0.4,
//   },
//   statPillLabel: {
//     fontSize: 10,
//     color: MUTED,
//     fontWeight: '700',
//     marginTop: 3,
//     letterSpacing: 0.6,
//     textTransform: 'uppercase',
//   },

//   /* sections */
//   section: { marginTop: S.xxl, paddingHorizontal: S.xl },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: S.lg,
//   },
//   sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: TEXT,
//     letterSpacing: -0.25,
//     marginBottom:10
//   },
//   countBadge: {
//     minWidth: 22,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: R.pill,
//     backgroundColor: COLORS.primary + '16',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   countBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
//   viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
//   viewAllText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
//   listSeparator: { height: S.md },

//   /* quick actions */
//   quickActionsRow: { flexDirection: 'row', gap: S.md, marginTop: S.lg },
//   quickAction: {
//     flex: 1,
//     backgroundColor: SURFACE,
//     borderRadius: R.md,
//     paddingVertical: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: BORDER,
//     ...cardShadow,
//   },
//   quickActionIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   quickActionLabel: { fontSize: 11.5, fontWeight: '600', color: TEXT },

//   /* notification */
//   notificationWrapper: {
//     position: 'relative',
//     width: 40,
//     height: 40,
//     borderRadius: 14,
//     backgroundColor: SURFACE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: BORDER,
//   },
//   badge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     backgroundColor: '#EF4444',
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     paddingHorizontal: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: BG,
//   },
//   badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
//   requestsSummaryCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: SURFACE,
//     borderRadius: R.lg,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: BORDER,
//     ...cardShadow,
//   },
//   requestsSummaryIcon: {
//     width: 54,
//     height: 54,
//     borderRadius: 18,
//     backgroundColor: COLORS.primary + '12',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   requestsSummaryContent: {
//     flex: 1,
//   },
//   requestsSummaryCount: {
//     fontSize: 26,
//     fontWeight: '800',
//     color: TEXT,
//     letterSpacing: -0.6,
//   },
//   requestsSummaryLabel: {
//     fontSize: 14,
//     color: MUTED,
//     fontWeight: '500',
//     marginTop: 2,
//   },

//   /* ---------------------------- new requests summary --------------------------- */
// summaryCard: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   backgroundColor: '#F4F8FF',
//   borderRadius: R.lg,
//   paddingVertical: 18,
//   paddingHorizontal: 18,
//   borderWidth: 1,
//   borderColor: COLORS.primary + '22',
//   overflow: 'hidden',
//   marginTop: S.md,
//   ...cardShadow,
// },
// summaryOrb: {
//   position: 'absolute',
//   borderRadius: R.pill,
//   backgroundColor: COLORS.primary + '0F',
// },
// summaryOrbOne: { width: 150, height: 150, top: -80, right: -40 },
// summaryOrbTwo: {
//   width: 90,
//   height: 90,
//   bottom: -50,
//   left: -25,
//   backgroundColor: COLORS.primary + '0A',
// },

// summaryIconWrap: {
//   width: 56,
//   height: 56,
//   borderRadius: 18,
//   backgroundColor: '#FFFFFF',
//   justifyContent: 'center',
//   alignItems: 'center',
//   marginRight: 16,
//   borderWidth: 1,
//   borderColor: COLORS.primary + '1F',
//   ...cardShadow,
// },
// liveDot: {
//   position: 'absolute',
//   top: 8,
//   right: 8,
//   width: 10,
//   height: 10,
//   borderRadius: 5,
//   backgroundColor: '#EF4444',
//   borderWidth: 2,
//   borderColor: '#FFFFFF',
// },

// summaryCenter: { flex: 1 },
// summaryCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// summaryCount: {
//   fontSize: 30,
//   fontWeight: '800',
//   color: TEXT,
//   letterSpacing: -1,
// },
// newPill: {
//   paddingHorizontal: 8,
//   paddingVertical: 3,
//   borderRadius: R.pill,
//   backgroundColor: COLORS.primary,
// },
// newPillText: {
//   fontSize: 9,
//   fontWeight: '800',
//   color: '#FFFFFF',
//   letterSpacing: 0.8,
// },
// summaryLabel: {
//   fontSize: 14,
//   fontWeight: '600',
//   color: TEXT,
//   marginTop: 2,
// },
// summaryHint: {
//   fontSize: 12,
//   color: MUTED,
//   marginTop: 3,
//   fontWeight: '500',
// },

// summaryRight: { alignItems: 'flex-end', gap: 10, marginLeft: 8 },
// avatarStack: { flexDirection: 'row', alignItems: 'center' },
// avatar: {
//   width: 30,
//   height: 30,
//   borderRadius: 15,
//   backgroundColor: COLORS.primary + '14',
//   borderWidth: 2,
//   borderColor: '#F4F8FF',
//   justifyContent: 'center',
//   alignItems: 'center',
// },
// avatarOverflow: { backgroundColor: COLORS.primary },
// avatarOverflowText: {
//   fontSize: 10,
//   fontWeight: '800',
//   color: '#FFFFFF',
// },
// summaryArrow: {
//   width: 34,
//   height: 34,
//   borderRadius: 17,
//   backgroundColor: COLORS.primary,
//   justifyContent: 'center',
//   alignItems: 'center',
//   shadowColor: COLORS.primary,
//   shadowOffset: { width: 0, height: 6 },
//   shadowOpacity: 0.35,
//   shadowRadius: 10,
//   elevation: 4,
// },




// viewAllSchedulesLink: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'center',
//   gap: 6,
//   marginTop: S.lg,
//   paddingVertical: 14,
//   borderRadius: R.md,
//   backgroundColor: COLORS.primary + '0F',
//   borderWidth: 1,
//   borderColor: COLORS.primary + '22',
// },
// viewAllSchedulesText: {
//   fontSize: 13,
//   fontWeight: '700',
//   color: COLORS.primary,
// },
// quickActionIcon: {
//   width: 44,
//   height: 44,
//   borderRadius: 14,
//   justifyContent: 'center',
//   alignItems: 'center',
//   marginBottom: 10,
//   backgroundColor: '#F1F3F7',
//   borderWidth: 1,
//   borderColor: BORDER,
// },
// });

// export default Dashboard;





import React, {
  useRef,
  useEffect,
  useContext,
  useState,
} from 'react';

import {
  SafeAreaView,
  StatusBar,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import {
  AppText,
  AppCard,
  AppButton,
  AppIconButton,
  AppSection,
} from '../../ui';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import ROUTES from '../../constants/routes';

import CleaningRequestItem from '../../components/cleaner/CleaningRequestItem';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import NoScheduleMessage from '../../components/cleaner/NoScheduleMessage';
import {
  get_clean_future_requests,
} from '../../utils/get_cleaner_future_request';

import { useTranslation } from 'react-i18next';

import InviteBanner from '../../components/cleaner/InviteBanner';
import NewRequestsSummaryCard from '../../components/cleaner/NewRequestSummaryCard';

import { tSafe } from '../../utils/tSafe';

import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';

import { useTheme } from '../../theme';

/* ---------------------------------- tokens --------------------------------- */

const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const R = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
};

/* ------------------------------ small components --------------------------- */

const StatPill = ({
  icon,
  value,
  label,
  color,
  styles,
}) => (
  <AppCard
    padding="small"
    radius="medium"
    bordered
    elevated
    style={styles.statPill}
  >
    <View style={styles.statPillContent}>
      <View
        style={[
          styles.statPillIcon,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <AppText
        variant="title"
        numberOfLines={1}
        style={styles.statPillValue}
      >
        {value}
      </AppText>

      <AppText
        variant="caption"
        numberOfLines={1}
        style={styles.statPillLabel}
      >
        {label}
      </AppText>
    </View>
  </AppCard>
);

const QuickAction = ({
  icon,
  label,
  onPress,
  styles,
  theme,
}) => (
  <AppCard
    padding="small"
    radius="medium"
    bordered
    elevated
    style={styles.quickAction}
  >
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.quickActionTouchable}
    >
      <View style={styles.quickActionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={theme.icon.default}
        />
      </View>

      <AppText
        variant="label"
        numberOfLines={1}
        style={styles.quickActionLabel}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  </AppCard>
);

/* --------------------------------- dashboard ------------------------------- */

const Dashboard = () => {
  const navigation = useNavigation();

  const {
    currentUserId,
    currentUser,
    currency,
    notificationUnreadCount,
  } = useContext(AuthContext);

  const {
    theme,
    isDark,
  } = useTheme();

  const { i18n } = useTranslation();

  const styles = createStyles(theme);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  const [
    upcoming_schedule,
    setUpcomingSchedule,
  ] = useState([]);

  const [
    cleaning_requests,
    setCleaningRequests,
  ] = useState([]);

  const [
    pending_payment,
    setPendingPayment,
  ] = useState([]);

  const [
    all_cleaning_requests,
    setAllCleaningRequests,
  ] = useState([]);

  const [
    accountStatus,
    setAccountStatus,
  ] = useState(null);

  const [
    weekly_earning,
    setWeeklyEarning,
  ] = useState(0);

  const [
    accountId,
    setAccountId,
  ] = useState(null);

  const [
    business_type,
    setBusinessType,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    ratings,
    setCleanerRatings,
  ] = useState([]);

  const [
    location,
    setLocation,
  ] = useState('');

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    performance,
    setPerformance,
  ] = useState(null);

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const slideAnim =
    useRef(new Animated.Value(20)).current;

  const [
    showBanner,
    setShowBanner,
  ] = useState(false);

  const [
    inviteCount,
    setInviteCount,
  ] = useState(0);

  const [
    pendingInvites,
    setPendingInvites,
  ] = useState([]);

  /* ------------------------------- invites -------------------------------- */

  useEffect(() => {
    checkPendingInvites();
  }, [currentUserId]);

  const checkPendingInvites = async () => {
    try {
      const response =
        await userService.getPendingInvites(
          currentUserId
        );

      if (
        response.data &&
        response.data.length > 0
      ) {
        setPendingInvites(
          response.data
        );

        setInviteCount(
          response.data.length
        );

        setShowBanner(true);
      }
    } catch (error) {
      console.log(
        'Error checking pending invites:',
        error
      );
    }
  };

  const handleAccept = () => {
    if (
      pendingInvites.length === 0
    ) {
      return;
    }

    const invite =
      pendingInvites[0];

    navigation.navigate(
      ROUTES.cleaner_property_preview,
      {
        propertyId:
          invite.property_id,

        inviteToken:
          invite.token,
      }
    );

    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  /* ------------------------------- header bar ------------------------------ */

  useEffect(() => {
    navigation.setOptions({
      title: `${tSafe(
        'welcome_back',
        'Welcome back'
      )}, ${
        currentUser?.firstname || ''
      }`,

      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
        color: theme.text.primary,
        letterSpacing: -0.3,
      },

      headerStyle: {
        backgroundColor:
          theme.background.default,

        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },

      headerTintColor:
        theme.text.primary,

      headerShadowVisible: false,

      headerRight: () => (
        <View
          style={
            styles.notificationContainer
          }
        >
          <AppIconButton
            icon="bell-outline"
            size={40}
            iconSize={22}
            onPress={() =>
              navigation.navigate(
                ROUTES.notification
              )
            }
          />

          {notificationUnreadCount >
            0 && (
            <View
              style={styles.badge}
            >
              <AppText
                variant="caption"
                style={
                  styles.badgeText
                }
              >
                {notificationUnreadCount >
                9
                  ? '9+'
                  : notificationUnreadCount}
              </AppText>
            </View>
          )}
        </View>
      ),
    });
  }, [
    navigation,
    currentUser,
    notificationUnreadCount,
    i18n.language,
    theme,
    isDark,
  ]);

  /* -------------------------------- animation ------------------------------ */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        slideAnim,
        {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }
      ),
    ]).start();
  }, []);

  /* ------------------------------- data loading ---------------------------- */

  const onRefresh =
    React.useCallback(() => {
      setRefreshing(true);

      fetchAllData()
        .then(() => {
          setRefreshing(false);
        })
        .catch(() => {
          setRefreshing(false);
        });
    }, [currentUserId]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUser(),
      fetchAssignTasks(),
      fetchRequests(),
      fetchallRequests(),
      fetchPendingPayment(),
      fetchWeeklyEarnings(),
      fetchCleanerRatings(),
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAllData();
    }, [currentUserId])
  );

  const fetchUser = async () => {
    try {
      await userService
        .getUser(currentUserId)
        .then((response) => {
          const res =
            response.data;

          setEmail(
            res.email || ''
          );

          setFirstname(
            res.firstname || ''
          );

          setLastname(
            res.lastname || ''
          );

          setAccountStatus(
            res.stripe_accountStatus ||
              'not_started'
          );

          setAccountId(
            res.stripe_account_id
          );

          setBusinessType(
            res.stripe_business_type
          );

          setPerformance(
            res.calculated_performance
          );

          if (res.location) {
            if (
              typeof res.location ===
              'string'
            ) {
              setLocation(
                res.location
              );
            } else if (
              typeof res.location ===
              'object'
            ) {
              const city =
                res.location.city ||
                '';

              const country =
                res.location
                  .country_name ||
                '';

              setLocation(
                city || country
                  ? `${city}${
                      city && country
                        ? ', '
                        : ''
                    }${country}`
                  : ''
              );
            }
          } else {
            setLocation('');
          }

          setLoading(false);
        });
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const fetchRequests =
    async () => {
      try {
        await userService
          .getMyCleaningRequest(
            currentUserId
          )
          .then((response) => {
            setCleaningRequests(
              response.data
            );
          });
      } catch (e) {
        console.log(e);
      }
    };

  const fetchPendingPayment =
    async () => {
      try {
        await userService
          .getMyCleaningPendingPayment(
            currentUserId
          )
          .then((response) => {
            const pendingPay =
              response.data.filter(
                (request) =>
                  request.status ===
                  'pending_payment'
              );

            setPendingPayment(
              pendingPay
            );
          });
      } catch (e) {
        console.log(e);
      }
    };

  const fetchallRequests =
    async () => {
      try {
        await userService
          .getAllCleaningRequest(
            currentUserId
          )
          .then((response) => {
            setAllCleaningRequests(
              get_clean_future_requests(
                response.data
              )
            );
          });
      } catch (e) {
        console.log(e);
      }
    };

  const fetchAssignTasks =
    async () => {
      try {
        await userService
          .getMySchedules(
            currentUserId
          )
          .then((response) => {
            setUpcomingSchedule(
              response.data
            );
          });
      } catch (e) {
        console.log(e);
      }
    };

  const fetchWeeklyEarnings =
    async () => {
      try {
        await userService
          .getWeeklyEarningToDate(
            currentUserId
          )
          .then((response) => {
            setWeeklyEarning(
              response.data
                .total_earnings || 0
            );
          });
      } catch (e) {
        console.log(e);
      }
    };

  const fetchCleanerRatings =
    async () => {
      try {
        const response =
          await userService.getCleanerFeedbacks(
            currentUserId
          );

        setCleanerRatings(
          response.data.data || []
        );
      } catch (e) {
        console.log(e);
      }
    };

  /* --------------------------------- helpers ------------------------------- */

  const calculateOverallRating = (
    ratingList,
    cleanerId
  ) => {
    const cleanerRatings =
      ratingList.filter(
        (r) =>
          r.cleanerId ===
          cleanerId
      );

    if (
      cleanerRatings.length ===
      0
    ) {
      return '0.0';
    }

    const total =
      cleanerRatings.reduce(
        (sum, r) =>
          sum +
          r.averageRating,
        0
      );

    return (
      total /
      cleanerRatings.length
    ).toFixed(1);
  };

  const getCompletedJobsCount =
    () =>
      upcoming_schedule.filter(
        (schedule) =>
          schedule.status ===
          'completed'
      ).length;

  const handleUpdateProfile =
    () =>
      navigation.navigate(
        ROUTES.cleaner_profile
      );

  /* --------------------------------- loading ------------------------------- */

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
          variant="bodyMedium"
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_dashboard',
            'Loading your dashboard...'
          )}
        </AppText>
      </View>
    );
  }

  const weeklyGoalPct =
    Math.min(
      (weekly_earning / 1000) *
        100,
      100
    );

  const hasAnything =
    upcoming_schedule.length >
      0 ||
    cleaning_requests.length >
      0 ||
    pending_payment.length >
      0;

  /* ---------------------------------- render ------------------------------- */

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background.default
        }
      />

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY:
                  slideAnim,
              },
            ],
          },
        ]}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              theme.brand.primary
            }
            colors={[
              theme.brand.primary,
            ]}
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* -------------------------------- invite banner ------------------------------- */}

        {showBanner && (
          <InviteBanner
            onAccept={
              handleAccept
            }
            onDismiss={
              handleDismiss
            }
            inviteCount={
              inviteCount
            }
            propertyName={
              pendingInvites[0]
                ?.property_name
            }
          />
        )}

        {/* -------------------------------- hero card ----------------------------- */}

        <AppCard
          variant="hero"
          padding="none"
          radius="large"
          bordered={false}
          fullWidth={false}
          style={styles.heroCard}
        >
          <View
            style={[
              styles.heroOrb,
              styles.heroOrbOne,
            ]}
          />

          <View
            style={[
              styles.heroOrb,
              styles.heroOrbTwo,
            ]}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroLabelRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={14}
                  color={theme.hero.foreground}
                />

                <AppText
                  variant="label"
                  color={theme.hero.foreground}
                  style={styles.heroLabel}
                >
                  {tSafe(
                    'this_weeks_earnings',
                    "This Week's Earnings"
                  )}
                </AppText>
              </View>

              <View style={styles.heroTrendBadge}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={14}
                  color={theme.hero.badgeIcon}
                />
              </View>
            </View>

            <AppText
              variant="display"
              color={theme.hero.foreground}
              style={styles.heroAmount}
            >
              ${weekly_earning.toFixed(2)}
            </AppText>

            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  {
                    width: `${weeklyGoalPct}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.heroFooterRow}>
              <AppText
                variant="caption"
                color={theme.hero.mutedForeground}
                style={styles.heroSubtitle}
              >
                {tSafe(
                  'keep_up_great_work',
                  'Keep up the great work!'
                )}
              </AppText>

              <AppButton
                title={tSafe(
                  'details',
                  'Details'
                )}
                icon="arrow-right"
                iconPosition="right"
                size="small"
                variant="inverse"
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_payment_history
                  )
                }
                style={styles.heroCta}
              />
            </View>
          </View>
        </AppCard>
  

        {/* -------------------------------- stat pills ---------------------------- */}

        <View
          style={
            styles.statsRow
          }
        >
          <StatPill
            icon="check-circle-outline"
            value={
              getCompletedJobsCount()
            }
            label={tSafe(
              'completed',
              'Completed'
            )}
            color={
              theme.status
                .success
            }
            styles={styles}
          />

          <StatPill
            icon="star-outline"
            value={calculateOverallRating(
              ratings,
              currentUserId
            )}
            label={tSafe(
              'rating',
              'Rating'
            )}
            color={
              theme.status
                .warning
            }
            styles={styles}
          />

          <StatPill
            icon="calendar-clock"
            value={
              upcoming_schedule.length
            }
            label={tSafe(
              'upcoming',
              'Upcoming'
            )}
            color={
              theme.brand.primary
            }
            styles={styles}
          />
        </View>

        {/* ---------------------------- new requests --------------------------- */}

        {cleaning_requests.length >
          0 && (
          <View
            style={
              styles.section
            }
          >
            <AppSection
              title={tSafe(
                'new_requests',
                'New Requests'
              )}
            >
              <NewRequestsSummaryCard
                requests={
                  cleaning_requests
                }
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_all_requests,
                    {
                      active_requests:
                        cleaning_requests,
                    }
                  )
                }
              />
            </AppSection>
          </View>
        )}

        {/* --------------------------- pending payments ------------------------ */}

        {pending_payment.length >
          0 && (
          <View
            style={
              styles.section
            }
          >
            <AppSection
              title={`${tSafe(
                'pending_payments',
                'Pending Payments'
              )} (${
                pending_payment.length
              })`}
              actionLabel={tSafe(
                'view_all',
                'View all'
              )}
              onAction={() =>
                navigation.navigate(
                  ROUTES.cleaner_payments
                )
              }
            >
              <FlatList
                data={pending_payment.slice(
                  0,
                  3
                )}
                renderItem={({
                  item,
                }) => (
                  <CleaningRequestItem
                    item={item}
                    status={
                      item.status
                    }
                    currency={
                      currency
                    }
                  />
                )}
                scrollEnabled={
                  false
                }
                keyExtractor={(
                  item
                ) =>
                  item._id ||
                  item.id
                }
                ItemSeparatorComponent={() => (
                  <View
                    style={
                      styles.listSeparator
                    }
                  />
                )}
              />
            </AppSection>
          </View>
        )}

        {/* -------------------------- upcoming schedule ------------------------ */}

        {upcoming_schedule.length >
          0 && (
          <View
            style={
              styles.section
            }
          >
            <AppSection
              title={`${tSafe(
                'upcoming_schedule',
                'Upcoming Schedule'
              )} (${
                upcoming_schedule.length
              })`}
            >
              <UpcomingScheduleListItem
                item={
                  upcoming_schedule[0]
                }
                currency={
                  currency
                }
                replacementWorkflows={
                  upcoming_schedule[0]
                    ?.replacementWorkflows ||
                  []
                }
              />

              {upcoming_schedule.length >
                1 && (
                <TouchableOpacity
                  style={
                    styles.viewAllSchedulesLink
                  }
                  onPress={() =>
                    navigation.navigate(
                      ROUTES.cleaner_schedules
                    )
                  }
                  activeOpacity={
                    0.85
                  }
                >
                  <AppText
                    variant="label"
                    style={
                      styles.viewAllSchedulesText
                    }
                  >
                    {`${tSafe(
                      'view_all',
                      'View all'
                    )} ${
                      upcoming_schedule.length
                    } ${tSafe(
                      'upcoming_schedules',
                      'upcoming schedules'
                    )}`}
                  </AppText>

                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={
                      theme.brand
                        .primary
                    }
                  />
                </TouchableOpacity>
              )}
            </AppSection>
          </View>
        )}

        {/* ------------------------------ empty state -------------------------- */}

        {!hasAnything && (
          <NoScheduleMessage
            onUpdateProfile={
              handleUpdateProfile
            }
          />
        )}

        {/* ----------------------------- quick actions ------------------------- */}

        <View
            style={
              styles.section
            }
          >
          <AppSection
            title={tSafe(
              'quick_actions',
              'Quick Actions'
            )}
          >
            <View
              style={
                styles.quickActionsRow
              }
            >
              <QuickAction
                icon="calendar-month-outline"
                label={tSafe(
                  'schedule',
                  'Schedule'
                )}
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_schedules
                  )
                }
                styles={
                  styles
                }
                theme={
                  theme
                }
              />

              <QuickAction
                icon="clipboard-text-outline"
                label={tSafe(
                  'requests',
                  'Requests'
                )}
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_all_requests,
                    {
                      active_requests:
                        cleaning_requests,
                    }
                  )
                }
                styles={
                  styles
                }
                theme={
                  theme
                }
              />

              <QuickAction
                icon="cash-multiple"
                label={tSafe(
                  'payments',
                  'Payments'
                )}
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_payment_history
                  )
                }
                styles={
                  styles
                }
                theme={
                  theme
                }
              />

              {/* <QuickAction
                icon="account-cog-outline"
                label={tSafe(
                  'profile',
                  'Profile'
                )}
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_profile
                  )
                }
                styles={
                  styles
                }
                theme={
                  theme
                }
              /> */}
            </View>
          </AppSection>
          </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

/* ---------------------------------- styles --------------------------------- */

const createStyles = (theme) => {
  const cardShadow = {
    shadowColor:
      theme.shadow?.color ||
      '#000000',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity:
      theme.shadow?.opacity ||
      0.08,

    shadowRadius: 14,
    elevation: 3,
  };

  return StyleSheet.create({
    /* -------------------------------- container ------------------------------- */

    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingTop: S.sm,
      paddingBottom: 56,
    },

    /* -------------------------------- loading -------------------------------- */

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 14,
      color:
        theme.text.secondary,
    },

    /* -------------------------------- hero ----------------------------------- */

    heroCard: {
      marginHorizontal: S.xl,
      marginTop: S.md,
      minHeight: 220,

      backgroundColor:
        theme.hero.background,

      overflow: 'hidden',

      shadowColor:
        theme.hero.background,

      shadowOffset: {
        width: 0,
        height: 12,
      },

      shadowOpacity: 0.28,
      shadowRadius: 20,
      elevation: 8,
    },

    heroContent: {
      padding: 22,
    },

    heroOrb: {
      position: 'absolute',
      borderRadius: R.pill,
      backgroundColor:
        theme.hero.orb,
    },

    heroOrbOne: {
      width: 190,
      height: 190,
      top: -100,
      right: -55,
    },

    heroOrbTwo: {
      width: 130,
      height: 130,
      bottom: -80,
      left: -35,

      backgroundColor:
        theme.hero.orbSecondary,
    },

    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    heroLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    heroLabel: {
      letterSpacing: 0.2,
    },

    heroTrendBadge: {
      width: 30,
      height: 30,

      borderRadius: R.pill,

      backgroundColor:
        theme.hero.badgeBackground,

      justifyContent: 'center',
      alignItems: 'center',
    },

    heroAmount: {
      letterSpacing: -1,
      marginTop: 10,
    },

    heroProgressTrack: {
      height: 6,
      borderRadius: 3,

      backgroundColor:
        theme.hero.progressTrack,

      marginTop: 18,

      overflow: 'hidden',
    },

    heroProgressFill: {
      height: '100%',
      borderRadius: 3,

      backgroundColor:
        theme.hero.progressFill,
    },

    heroFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginTop: 16,
      gap: 10,
    },

    heroSubtitle: {
      flex: 1,
    },

    heroCta: {
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: R.pill,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: S.xl,
      marginTop: S.xl,
      gap: S.md,
    },

    statPillContent: {
      alignItems: 'center',
      justifyContent: 'center',   
      width: '100%', 
    },

    statPill: {
      flex: 1,
    },
    
    statPillIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    
    statPillValue: {
      fontSize: 20,
      letterSpacing: -0.4,
      textAlign: 'center',
    },
    
    statPillLabel: {
      fontSize: 10,
      marginTop: 3,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      textAlign: 'center',
    },

    /* -------------------------------- sections ------------------------------- */

    section: {
      marginTop: S.xxl,
      paddingHorizontal: S.xl,
    },

    listSeparator: {
      height: S.md,
    },

    /* ---------------------------- quick actions ----------------------------- */

    quickActionsRow: {
      flexDirection: 'row',
      gap: S.md,
    },

    quickAction: {
      flex: 1,
    },

    quickActionTouchable: {
      alignItems: 'center',
      width: '100%',
    },

    quickActionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,

      justifyContent: 'center',
      alignItems: 'center',

      marginBottom: 10,

      backgroundColor:
        theme.surface.selected,

      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    quickActionLabel: {
      textAlign: 'center',
    },

    /* ------------------------------ notification ---------------------------- */

    notificationContainer: {
      position: 'relative',
      marginRight: 12,
    },

    badge: {
      position: 'absolute',
      top: -4,
      right: -4,

      backgroundColor:
        theme.status.error,

      borderRadius: 10,

      minWidth: 18,
      height: 18,

      paddingHorizontal: 4,

      justifyContent: 'center',
      alignItems: 'center',

      borderWidth: 2,
      borderColor:
        theme.background.default,
    },

    badgeText: {
      color:
        theme.text.inverse,

      fontSize: 10,
      lineHeight: 13,
      fontWeight: '700',
    },

    /* ------------------------- schedule link ------------------------------- */

    viewAllSchedulesLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      gap: 6,

      marginTop: S.lg,
      paddingVertical: 14,

      borderRadius: R.md,

      backgroundColor:
        `${theme.brand.primary}0F`,

      borderWidth: 1,

      borderColor:
        `${theme.brand.primary}22`,
    },

    viewAllSchedulesText: {
      color:
        theme.brand.primary,
    },
  });
};

export default Dashboard;

// import React, { useRef, useEffect, useContext, useState } from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   Animated,
//   ScrollView,
//   Button,
//   Linking,
//   TouchableOpacity,
//   RefreshControl,
//   Modal,
// } from 'react-native';
// import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
// import CleaningRequestItem from '../../components/cleaner/CleaningRequestItem';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import { useFocusEffect } from '@react-navigation/native';
// import NoScheduleMessage from '../../components/cleaner/NoScheduleMessage';
// import { get_clean_future_requests } from '../../utils/get_cleaner_future_request';
// import { useTranslation } from 'react-i18next';
// import InviteBanner from '../../components/cleaner/InviteBanner';
// import UpcomingSummaryCard from '../../components/shared/UpcomingSummaryCard';
// import { tSafe } from '../../utils/tSafe'; // added import


// const Dashboard = () => {
//   const navigation = useNavigation();
//   const { currentUserId, currentUser, currency, notificationUnreadCount } = useContext(AuthContext);

//   const { t, i18n } = useTranslation();

//   const [firstname, setFirstname] = useState('');
//   const [lastname, setLastname] = useState('');
//   const [email, setEmail] = useState('');
//   const [avatar, setAvatar] = useState('');
//   const [upcoming_schedule, setUpcomingSchedule] = useState([]);
//   const [cleaning_requests, setCleaningRequests] = useState([]);
//   const [pending_payment, setPendingPayment] = useState([]);
//   const [all_cleaning_requests, setAllCleaningRequests] = useState([]);
//   const [accountStatus, setAccountStatus] = useState(null);
//   const [weekly_earning, setWeeklyEarning] = useState(0);
//   const [accountId, setAccountId] = useState(null);
//   const [business_type, setBusinessType] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [ratings, setCleanerRatings] = useState([]);
//   const [location, setLocation] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [performance, setPerformance] = useState(null);

//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   // Add this near other useState declarations
//   const [showDevMenu, setShowDevMenu] = useState(false);
//   const [devTapCount, setDevTapCount] = useState(0);
//   const devTapTimeoutRef = useRef(null);

//   const [showBanner, setShowBanner] = useState(false);
//   const [inviteCount, setInviteCount] = useState(0);
//   const [pendingInvites, setPendingInvites] = useState([]);

//   useEffect(() => {
//     checkPendingInvites();
//   }, []);

//   const checkPendingInvites = async () => {
//     const response = await userService.getPendingInvites(currentUserId);
//     if (response.data.length > 0) {
//       // console.log('Pending---------DT', response.data);
//       setPendingInvites(response.data);
//       setInviteCount(response.data.length);
//       setShowBanner(true);
//     }
//   };


//   const handleAccept = () => {
//     if (pendingInvites.length === 0) return;
//     const invite = pendingInvites[0];
//     navigation.navigate(ROUTES.cleaner_property_preview, {
//       propertyId: invite.property_id,
//       inviteToken: invite.token,
//     });
//     setShowBanner(false);
//   };

//   const handleDismiss = () => {
//     // Optionally store that user dismissed, or just hide
//     setShowBanner(false);
//   };

//   useEffect(() => {
//     const headerTitle = `${tSafe('welcome_back', 'Welcome back')}, ${currentUser?.firstname || ''}`;
//     navigation.setOptions({
//       title: headerTitle,
//       headerTitleStyle: {
//         fontWeight: '600',
//         fontSize: 20,
//       },
//       headerStyle: {
//         backgroundColor: COLORS.white,
//         borderBottomWidth: 0,
//         elevation: 0,
//         shadowOpacity: 0,
//       },
//       headerTintColor: COLORS.gray,
//       headerRight: () => (
//         <TouchableOpacity
//           style={styles.notificationWrapper}
//           onPress={() => navigation.navigate(ROUTES.notification)}
//         >
//           <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
//           {notificationUnreadCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{notificationUnreadCount}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation, currentUser]);

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   // Add this useEffect for hidden developer menu
//   useEffect(() => {
//     // Clear timeout on unmount
//     return () => {
//       if (devTapTimeoutRef.current) {
//         clearTimeout(devTapTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Function to handle secret tap gesture
//   const handleSecretTap = () => {
//     setDevTapCount((prev) => {
//       const newCount = prev + 1;

//       if (newCount === 5) {
//         setShowDevMenu(true);
//         return 0;
//       }

//       // Reset count after 2 seconds
//       if (devTapTimeoutRef.current) {
//         clearTimeout(devTapTimeoutRef.current);
//       }

//       devTapTimeoutRef.current = setTimeout(() => {
//         setDevTapCount(0);
//       }, 2000);

//       return newCount;
//     });
//   };

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchAllData().then(() => setRefreshing(false));
//   }, []);

//   const fetchAllData = async () => {
//     await Promise.all([
//       fetchUser(),
//       fetchAssignTasks(),
//       fetchRequests(),
//       fetchallRequests(),
//       fetchPendingPayment(),
//       fetchWeeklyEarnings(),
//       fetchCleanerRatings(),
//     ]);
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchAllData();
//     }, [])
//   );

//   const fetchUser = async () => {
//     try {
//       await userService.getUser(currentUserId).then((response) => {
//         const res = response.data;
//         setEmail(res.email || '');
//         setFirstname(res.firstname || '');
//         setLastname(res.lastname || '');
//         setAccountStatus(res.stripe_accountStatus || 'not_started');
//         setAccountId(res.stripe_account_id);
//         setBusinessType(res.stripe_business_type);

//         setPerformance(res.calculated_performance);

//         console.log('calculated_performance', performance);

//         // Handle location - check if it's an object and extract city/country
//         if (res.location) {
//           if (typeof res.location === 'string') {
//             setLocation(res.location);
//           } else if (typeof res.location === 'object') {
//             // Extract city and country from location object
//             const city = res.location.city || '';
//             const country = res.location.country_name || '';
//             if (city || country) {
//               setLocation(`${city}${city && country ? ', ' : ''}${country}`);
//             } else {
//               setLocation('');
//             }
//           }
//         } else {
//           setLocation('');
//         }

//         setLoading(false);
//       });
//     } catch (e) {
//       console.log(e);
//       setLoading(false);
//     }
//   };

//   const fetchRequests = async () => {
//     try {
//       await userService.getMyCleaningRequest(currentUserId).then((response) => {
//         const res = response.data;
//         console.log('Reqeeeeeeeeeeeeeeeust', res[0]);
//         setCleaningRequests(res);
        
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchPendingPayment = async () => {
//     try {
//       await userService.getMyCleaningPendingPayment(currentUserId).then((response) => {
//         const res = response.data;
//         const pendingPay = res.filter((request) => request.status === 'pending_payment');
//         setPendingPayment(pendingPay);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchallRequests = async () => {
//     try {
//       await userService.getAllCleaningRequest(currentUserId).then((response) => {
//         const res = response.data;
//         const new_request = get_clean_future_requests(res);
//         setAllCleaningRequests(new_request);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchAssignTasks = async () => {
//     try {
//       await userService.getMySchedules(currentUserId).then((response) => {
//         const res = response.data;
//         console.log('My Upcoming--------QTP', res);
//         setUpcomingSchedule(res);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchWeeklyEarnings = async () => {
//     try {
//       await userService.getWeeklyEarningToDate(currentUserId).then((response) => {
//         const res = response.data;
//         setWeeklyEarning(res.total_earnings || 0);
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchCleanerRatings = async () => {
//     try {
//       const response = await userService.getCleanerFeedbacks(currentUserId);
//       setCleanerRatings(response.data.data || []);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   // const calculateOverallRating = (ratings, cleanerId) => {
//   //   const cleanerRatings = ratings.filter(rating => rating.cleanerId === cleanerId);
//   //   if (cleanerRatings.length === 0) return 0;
//   //   const totalRating = cleanerRatings.reduce((sum, rating) => sum + rating.averageRating, 0);
//   //   const averageRating = totalRating / cleanerRatings.length;
//   //   return averageRating.toFixed(1);
//   // };

//   const calculateOverallRating = (ratings, cleanerId) => {
//     const cleanerRatings = ratings.filter((rating) => rating.cleanerId === cleanerId);
//     if (cleanerRatings.length === 0) return '0.0';
//     const totalRating = cleanerRatings.reduce((sum, rating) => sum + rating.averageRating, 0);
//     const averageRating = totalRating / cleanerRatings.length;
//     return averageRating.toFixed(1);
//   };

//   const getCompletedJobsCount = () => {
//     return upcoming_schedule.filter((schedule) => schedule.status === 'completed').length;
//   };

//   const handleUpdateProfile = () => {
//     navigation.navigate(ROUTES.cleaner_profile);
//   };

//   const StatCard = ({ icon, value, label, color = COLORS.primary }) => (
//     <View style={styles.statCard}>
//       <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
//         <MaterialCommunityIcons name={icon} size={22} color={color} />
//       </View>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );

//   const SectionHeader = ({ title, count, onViewAll, showViewAll = true }) => (
//     <View style={styles.sectionHeader}>
//       <View style={styles.sectionTitleContainer}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         {count > 0 && (
//           <View style={styles.countBadge}>
//             <Text style={styles.countText}>{count}</Text>
//           </View>
//         )}
//       </View>
//       {showViewAll && count > 0 && (
//         <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
//           <Text style={styles.viewAllText}>{tSafe('view_all', 'View All')}</Text>
//           <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_dashboard', 'Loading your dashboard...')}</Text>
//       </View>
//     );
//   }



//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <Animated.ScrollView
//         style={[
//           styles.scrollView,
//           {
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }],
//           },
//         ]}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Welcome Header */}
//         {/* <View style={styles.welcomeCard}>
//           <View>
//             <Text style={styles.welcomeText}>Welcome back,</Text>
//             <Text style={styles.userName}>{currentUser?.firstname || 'Cleaner'}</Text>
//             <Text style={styles.locationText}>
//               <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.gray} /> 
//               {location || 'Location not set'}
//             </Text>
//           </View>
//           <TouchableOpacity 
//             style={styles.profileButton}
//             onPress={() => navigation.navigate(ROUTES.cleaner_profile)}
//           >
//             <View style={styles.profileIcon}>
//               <MaterialCommunityIcons name="account-circle" size={40} color={COLORS.primary} />
//             </View>
//           </TouchableOpacity>
//         </View> */}

//         {showBanner && (
//           <InviteBanner
//             onAccept={handleAccept}
//             onDismiss={handleDismiss}
//             inviteCount={inviteCount}
//             propertyName={pendingInvites[0]?.property_name} // optional: show property name
//           />
//         )}
//         {/* Earnings Card */}
//         <View style={styles.earningsCard}>
//           <View style={styles.earningsContent}>
//             <View>
//               <Text style={styles.earningsLabel}>{tSafe('this_weeks_earnings', 'This Week\'s Earnings')}</Text>
//               <Text style={styles.earningsAmount}>${weekly_earning.toFixed(2)}</Text>
//             </View>
//             <View style={styles.earningTrend}>
//               <MaterialCommunityIcons name="trending-up" size={24} color="#10B981" />
//             </View>
//           </View>
//           <View style={styles.earningsProgress}>
//             <View
//               style={[styles.progressBar, { width: `${Math.min((weekly_earning / 1000) * 100, 100)}%` }]}
//             />
//           </View>
//           <Text style={styles.earningsSubtitle}>{tSafe('keep_up_great_work', 'Keep up the great work!')}</Text>
//         </View>

//         {/* Stats Grid */}
//         <View style={styles.statsGrid}>
//           <StatCard
//             icon="check-circle"
//             value={getCompletedJobsCount()}
//             label={tSafe('completed', 'Completed')}
//             color="#10B981"
//           />
//           <StatCard
//             icon="star"
//             value={calculateOverallRating(ratings, currentUserId)}
//             label={tSafe('rating', 'Rating')}
//             color="#F59E0B"
//           />
//           <StatCard
//             icon="calendar-clock"
//             value={upcoming_schedule.length}
//             label={tSafe('upcoming', 'Upcoming')}
//             color={COLORS.primary}
//           />
//         </View>
        

        

//         {/* Cleaning Requests Section */}
//         {cleaning_requests.length > 0 && (
//           <View style={styles.section}>
//             <SectionHeader
//               title={tSafe('new_requests', 'New Requests')}
//               count={cleaning_requests.length}
//               onViewAll={() =>
//                 navigation.navigate(ROUTES.cleaner_all_requests, { active_requests: cleaning_requests })
//               }
//             />
//             <FlatList
//               data={cleaning_requests.slice(0, 30)}
//               renderItem={({ item }) => (
//                 <CleaningRequestItem item={{ item }} status={item.status} currency={currency} />
//               )}
//               scrollEnabled={false}
//               keyExtractor={(item) => item._id || item.id}
//               ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
//             />
//           </View>
//         )}

//         {pending_payment.length > 0 && (
//           <View style={styles.section}>
//             <SectionHeader
//               title={tSafe('pending_payments', 'Pending Payments')}
//               count={pending_payment.length}
//               onViewAll={() => navigation.navigate(ROUTES.cleaner_payments)}
//             />
//             <FlatList
//               data={pending_payment.slice(0, 3)}
//               renderItem={({ item }) => (
//                 <CleaningRequestItem item={ item } status={item.status} currency={currency} />
//               )}
//               scrollEnabled={false}
//               keyExtractor={(item) => item._id || item.id}
//               ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
//             />
//           </View>
//         )}

//         {/* Upcoming Schedule Section */}
//         {upcoming_schedule.length > 0 && (
//           <View style={styles.section}>
//             <SectionHeader
//               title={tSafe('upcoming_schedule', 'Upcoming Schedule')}
//               count={upcoming_schedule.length}
//               onViewAll={() => navigation.navigate(ROUTES.cleaner_schedules)}
//             />
//             <UpcomingSummaryCard schedules={upcoming_schedule}/>
//             {/* <FlatList
//               data={upcoming_schedule.slice(0, 3)}
//               // renderItem={({ item }) => <UpcomingScheduleListItem item={item} />}
//               renderItem={renderUpcomingScheduleItem}
//               scrollEnabled={false}
//               keyExtractor={(item) => item._id || item.id}
//               ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
//             /> */}
//           </View>
//         )}

//         {/* Empty State */}
//         {upcoming_schedule.length === 0 &&
//           cleaning_requests.length === 0 &&
//           pending_payment.length === 0 && <NoScheduleMessage onUpdateProfile={handleUpdateProfile} />}

//         {/* Quick Actions */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>{tSafe('quick_actions', 'Quick Actions')}</Text>
//           <View style={styles.actionsGrid}>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => navigation.navigate(ROUTES.cleaner_schedules)}
//               // onPress={() => navigation.navigate(ROUTES.cleaner_property_preview, {"propertyId":"69919983e80500161f7ac364"})}
//             >
//               <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
//                 <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
//               </View>
//               <Text style={styles.actionText}>{tSafe('schedule', 'Schedule')}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() =>
//                 navigation.navigate(ROUTES.cleaner_all_requests, { active_requests: cleaning_requests })
//               }
//             >
//               <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
//                 <MaterialCommunityIcons name="clipboard-list" size={24} color="#10B981" />
//               </View>
//               <Text style={styles.actionText}>{tSafe('requests', 'Requests')}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => navigation.navigate(ROUTES.cleaner_payment_history)}
//             >
//               <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
//                 <MaterialCommunityIcons name="cash" size={24} color="#F59E0B" />
//               </View>
//               <Text style={styles.actionText}>{tSafe('payments', 'Payments')}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate(ROUTES.cleaner_profile)}>
//               <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
//                 <MaterialCommunityIcons name="account-cog" size={24} color="#8B5CF6" />
//               </View>
//               <Text style={styles.actionText}>{tSafe('profile', 'Profile')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Animated.ScrollView>
//     </SafeAreaView>
//   );
// };



// const devMenuStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'flex-end',
//   },
//   content: {
//     backgroundColor: '#F5F5F5',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '80%',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   closeButton: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#F0F0F0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeText: {
//     fontSize: 18,
//     color: '#666',
//   },
//   scrollView: {
//     padding: 20,
//   },
//   description: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   testsGrid: {
//     gap: 12,
//     marginBottom: 20,
//   },
//   testButton: {
//     padding: 16,
//     borderRadius: 10,
//     backgroundColor: '#007AFF',
//   },
//   testName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: 'white',
//     marginBottom: 4,
//   },
//   testDescription: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.9)',
//   },
//   infoBox: {
//     backgroundColor: '#E3F2FD',
//     padding: 16,
//     borderRadius: 10,
//     borderLeftWidth: 4,
//     borderLeftColor: '#2196F3',
//   },
//   infoTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#0D47A1',
//     marginBottom: 8,
//   },
//   infoText: {
//     fontSize: 12,
//     color: '#1565C0',
//     marginBottom: 4,
//   },
// });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   welcomeCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     marginHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 16,
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   welcomeText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   locationText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   profileButton: {
//     padding: 8,
//   },
//   profileIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#EFF6FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   earningsCard: {
//     backgroundColor: COLORS.white,
//     marginHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 20,
//     padding: 24,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   earningsContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   earningsLabel: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   earningsAmount: {
//     fontSize: 36,
//     fontWeight: '800',
//     color: COLORS.dark,
//   },
//   earningTrend: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#D1FAE5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   earningsProgress: {
//     height: 6,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 3,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 3,
//   },
//   earningsSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     fontWeight: '500',
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     paddingHorizontal: 18,
//     marginBottom: 24,
//     gap: 12,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   statIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statValue: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     fontWeight: '500',
//     letterSpacing: 0.5,
//   },
//   section: {
//     marginBottom: 24,
//     paddingHorizontal: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginRight: 8,
//   },
//   countBadge: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   countText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.white,
//   },
//   viewAllButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   viewAllText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginRight: 2,
//   },
//   listSeparator: {
//     height: 12,
//   },
//   actionsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   actionButton: {
//     width: '48%',
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   actionIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   actionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   notificationWrapper: {
//     position: 'relative',
//     padding: 8,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//     marginRight: 10,
//   },
//   badge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     backgroundColor: '#EF4444',
//     borderRadius: 10,
//     paddingHorizontal: 5,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#F9FAFB',
//   },
//   badgeText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   testingHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     marginHorizontal: 20,
//     marginBottom: 32,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//   },
//   testingTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.gray,
//   },
// });

// export default Dashboard;