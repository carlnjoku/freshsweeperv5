import React, {useRef, useEffect, useContext, useState} from 'react';
import { 
  SafeAreaView, 
  StatusBar, 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  Animated, 
  ScrollView, 
  Button,
  Linking,
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
import CleaningRequestItem from '../../components/cleaner/CleaningRequestItem';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import { useFocusEffect } from '@react-navigation/native';
import { verification_items } from '../../data';
import NoScheduleMessage from '../../components/cleaner/NoScheduleMessage';
import { get_clean_future_requests } from '../../utils/get_cleaner_future_request';
import { useTranslation } from "react-i18next";
// import { useNotification } from '../../hooks/useNotification';

const Dashboard = () => {
  const navigation = useNavigation();
  const { currentUserId, currentUser, currency, notificationUnreadCount } = useContext(AuthContext);

  const { t, i18n } = useTranslation();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [upcoming_schedule, setUpcomingSchedule] = useState([]);
  const [cleaning_requests, setCleaningRequests] = useState([]);
  const [pending_payment, setPendingPayment] = useState([]);
  const [all_cleaning_requests, setAllCleaningRequests] = useState([]);
  const [accountStatus, setAccountStatus] = useState(null);
  const [weekly_earning, setWeeklyEarning] = useState(0);
  const [accountId, setAccountId] = useState(null);
  const [business_type, setBusinessType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setCleanerRatings] = useState([]);
  const [location, setLocation] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [performance, setPerformance] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;



  // Add this near other useState declarations
const [showDevMenu, setShowDevMenu] = useState(false);
const [devTapCount, setDevTapCount] = useState(0);
const devTapTimeoutRef = useRef(null);


  useEffect(() => {
    const headerTitle = `Welcome back, ${currentUser?.firstname || ''}`;
    navigation.setOptions({
      title: headerTitle,
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 20,
      },
      headerStyle: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: COLORS.gray,
      headerRight: () => (
        <TouchableOpacity 
          style={styles.notificationWrapper}
          onPress={() => navigation.navigate(ROUTES.notification)}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
          {notificationUnreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationUnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentUser]);
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);


  // Add this useEffect for hidden developer menu
useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (devTapTimeoutRef.current) {
        clearTimeout(devTapTimeoutRef.current);
      }
    };
  }, []);


  // Function to handle secret tap gesture
const handleSecretTap = () => {
    setDevTapCount(prev => {
      const newCount = prev + 1;
      
      if (newCount === 5) {
        setShowDevMenu(true);
        return 0;
      }
      
      // Reset count after 2 seconds
      if (devTapTimeoutRef.current) {
        clearTimeout(devTapTimeoutRef.current);
      }
      
      devTapTimeoutRef.current = setTimeout(() => {
        setDevTapCount(0);
      }, 2000);
      
      return newCount;
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAllData().then(() => setRefreshing(false));
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUser(),
      fetchAssignTasks(),
      fetchRequests(),
      fetchallRequests(),
      fetchPendingPayment(),
      fetchWeeklyEarnings(),
      fetchCleanerRatings()
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAllData();
    }, [])
  );

  const fetchUser = async () => {
    try {
      await userService.getUser(currentUserId).then((response) => {
        const res = response.data;
        setEmail(res.email || "");
        setFirstname(res.firstname || "");
        setLastname(res.lastname || "");
        setAccountStatus(res.stripe_accountStatus || 'not_started');
        setAccountId(res.stripe_account_id);
        setBusinessType(res.stripe_business_type);

        setPerformance(res.calculated_performance);

        console.log("calculated_performance", performance)
        
        // Handle location - check if it's an object and extract city/country
        if (res.location) {
          if (typeof res.location === 'string') {
            setLocation(res.location);
          } else if (typeof res.location === 'object') {
            // Extract city and country from location object
            const city = res.location.city || '';
            const country = res.location.country_name || '';
            if (city || country) {
              setLocation(`${city}${city && country ? ', ' : ''}${country}`);
            } else {
              setLocation('');
            }
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

  const fetchRequests = async () => {
    try {
      await userService.getMyCleaningRequest(currentUserId).then((response) => {
        const res = response.data;
        console.log("Reqeeeeeeeeeeeeeeeust",res[0])
        setCleaningRequests(res);
        // alert(res[0])
        
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchPendingPayment = async () => {
    try {
      await userService.getMyCleaningPendingPayment(currentUserId).then((response) => {
        const res = response.data;
        const pendingPay = res.filter(
          (request) => request.status === "pending_payment"
        );
        setPendingPayment(pendingPay);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchallRequests = async () => {
    try {
      await userService.getAllCleaningRequest(currentUserId).then((response) => {
        const res = response.data;
        const new_request = get_clean_future_requests(res);
        setAllCleaningRequests(new_request);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchAssignTasks = async () => {
    try {
      await userService.getMySchedules(currentUserId).then((response) => {
        const res = response.data;
        setUpcomingSchedule(res);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchWeeklyEarnings = async () => {
    try {
      await userService.getWeeklyEarningToDate(currentUserId).then((response) => {
        const res = response.data;
        setWeeklyEarning(res.total_earnings || 0);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchCleanerRatings = async () => {
    try {
      const response = await userService.getCleanerFeedbacks(currentUserId);
      setCleanerRatings(response.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  // const calculateOverallRating = (ratings, cleanerId) => {
  //   const cleanerRatings = ratings.filter(rating => rating.cleanerId === cleanerId);
  //   if (cleanerRatings.length === 0) return 0;
  //   const totalRating = cleanerRatings.reduce((sum, rating) => sum + rating.averageRating, 0);
  //   const averageRating = totalRating / cleanerRatings.length;
  //   return averageRating.toFixed(1);
  // };

  const calculateOverallRating = (ratings, cleanerId) => {
    const cleanerRatings = ratings.filter(rating => rating.cleanerId === cleanerId);
    if (cleanerRatings.length === 0) return '0.0';
    const totalRating = cleanerRatings.reduce((sum, rating) => sum + rating.averageRating, 0);
    const averageRating = totalRating / cleanerRatings.length;
    return averageRating.toFixed(1);
  };
  

  const getCompletedJobsCount = () => {
    return upcoming_schedule.filter(schedule => schedule.status === 'completed').length;
  };

  const handleUpdateProfile = () => {
    navigation.navigate(ROUTES.cleaner_profile);
  };

  const StatCard = ({ icon, value, label, color = COLORS.primary }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SectionHeader = ({ title, count, onViewAll, showViewAll = true }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      {showViewAll && count > 0 && (
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        {/* <View style={styles.welcomeCard}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser?.firstname || 'Cleaner'}</Text>
            <Text style={styles.locationText}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.gray} /> 
              {location || 'Location not set'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate(ROUTES.cleaner_profile)}
          >
            <View style={styles.profileIcon}>
              <MaterialCommunityIcons name="account-circle" size={40} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View> */}

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsContent}>
            <View>
              <Text style={styles.earningsLabel}>This Week's Earnings</Text>
              <Text style={styles.earningsAmount}>${weekly_earning.toFixed(2)}</Text>
            </View>
            <View style={styles.earningTrend}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#10B981" />
            </View>
          </View>
          <View style={styles.earningsProgress}>
            <View style={[styles.progressBar, { width: `${Math.min(weekly_earning/1000 * 100, 100)}%` }]} />
          </View>
          <Text style={styles.earningsSubtitle}>Keep up the great work! 🎉</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="check-circle"
            value={getCompletedJobsCount()}
            label="Completed"
            color="#10B981"
          />
          <StatCard
            icon="star"
            value={calculateOverallRating(ratings, currentUserId)}
            label="Rating"
            color="#F59E0B"
          />
          <StatCard
            icon="calendar-clock"
            value={upcoming_schedule.length}
            label="Upcoming"
            color={COLORS.primary}
          />
        </View>

        {/* Cleaning Requests Section */}
        {cleaning_requests.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="New Requests"
              count={cleaning_requests.length}
              onViewAll={() => navigation.navigate(ROUTES.cleaner_all_requests,{active_requests:cleaning_requests})}
            />
            <FlatList
              data={cleaning_requests.slice(0, 30)}
              renderItem={({ item }) => (
                <CleaningRequestItem 
                  item={{item}}
                  status={item.status}
                  currency={currency}
                />
              )}
              scrollEnabled={false}
              keyExtractor={(item) => item._id || item.id}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          </View>
        )}

        {pending_payment.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Pending Payments"
              count={pending_payment.length}
              onViewAll={() => navigation.navigate(ROUTES.cleaner_payments)}
            />
            <FlatList
              data={pending_payment.slice(0, 3)}
              renderItem={({ item }) => (
                <CleaningRequestItem 
                  item={{item}}
                  status={item.status}
                  currency={currency}
                />
              )}
              scrollEnabled={false}
              keyExtractor={(item) => item._id || item.id}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          </View>
        )}

        {/* Upcoming Schedule Section */}
        {upcoming_schedule.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Upcoming Schedule"
              count={upcoming_schedule.length}
              onViewAll={() => navigation.navigate(ROUTES.cleaner_schedule)}
            />
            <FlatList
              data={upcoming_schedule.slice(0, 3)}
              renderItem={({ item }) => <UpcomingScheduleListItem item={item} />}
              scrollEnabled={false}
              keyExtractor={(item) => item._id || item.id}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          </View>
        )}

        {/* Empty State */}
        {upcoming_schedule.length === 0 && cleaning_requests.length === 0 && pending_payment.length === 0 && (
          <NoScheduleMessage onUpdateProfile={handleUpdateProfile} />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate(ROUTES.cleaner_schedules)}
              // onPress={() => navigation.navigate(ROUTES.cleaner_property_preview, {"propertyId":"69919983e80500161f7ac364"})}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate(ROUTES.cleaner_all_requests, {active_requests:cleaning_requests})}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                <MaterialCommunityIcons name="clipboard-list" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate(ROUTES.cleaner_payment_history)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
                <MaterialCommunityIcons name="cash" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Payments</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate(ROUTES.cleaner_profile)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                <MaterialCommunityIcons name="account-cog" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testing Section - Collapsible */}
        <TouchableOpacity 
          style={styles.testingHeader}
          onPress={() => navigation.navigate(ROUTES.developer_testing)}
        >
          <Text style={styles.testingTitle}>Developer Tools</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>

      </Animated.ScrollView>
    </SafeAreaView>
  );
};


// Dashboard Dev Menu Component
const DashboardDevMenu = ({ visible, onClose, onTriggerError }) => {
    const { setError } = useError(); // Make sure you have access to error context
    
    const errorTests = [
      {
        name: "Render Error",
        description: "Triggers ErrorBoundary fallback",
        action: () => {
          // This will be caught by ErrorBoundary
          throw new Error("Dashboard render error test");
        },
        color: "#FF3B30"
      },
      {
        name: "Network Error Modal",
        description: "Shows global error modal",
        action: () => {
          setError({
            type: "NETWORK_ERROR",
            message: "Failed to fetch dashboard data. Please check your internet connection.",
            metadata: { 
              endpoint: "/api/dashboard", 
              status: 0,
              timestamp: new Date().toISOString()
            },
            recoverable: true
          });
        },
        color: "#FF9500"
      },
      {
        name: "API Error",
        description: "Simulates API failure",
        action: () => {
          setError({
            type: "API_ERROR",
            message: "Server responded with 500 Internal Server Error",
            metadata: { 
              endpoint: "/api/user-data", 
              status: 500,
              requestId: "req_dash_123"
            },
            recoverable: true
          });
        },
        color: "#5856D6"
      },
      {
        name: "Slow Network",
        description: "Simulates slow loading",
        action: () => {
          // Simulate slow loading by delaying data fetch
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setError({
              type: "NETWORK_ERROR",
              message: "Request timeout. The server is taking too long to respond.",
              metadata: { timeout: 10000 },
              recoverable: true
            });
          }, 3000);
        },
        color: "#FFCC00"
      },
      {
        name: "Empty State",
        description: "Triggers all empty states",
        action: async () => {
          setUpcomingSchedule([]);
          setCleaningRequests([]);
          setPendingPayment([]);
          setAllCleaningRequests([]);
          setCleanerRatings([]);
          setWeeklyEarning(0);
          setLocation("");
          
          setError({
            type: "INFO",
            message: "All data cleared for testing empty states",
            recoverable: true
          });
        },
        color: "#34C759"
      },
      {
        name: "Restore Data",
        description: "Reloads all data",
        action: () => {
          fetchAllData();
          setError({
            type: "SUCCESS",
            message: "Dashboard data restored successfully",
            recoverable: true
          });
        },
        color: "#007AFF"
      }
    ];
  
    if (!visible) return null;
  
    return (
      <Modal
        transparent
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={devMenuStyles.container}>
          <View style={devMenuStyles.content}>
            <View style={devMenuStyles.header}>
              <Text style={devMenuStyles.title}>🧪 Dashboard Error Tests</Text>
              <TouchableOpacity onPress={onClose} style={devMenuStyles.closeButton}>
                <Text style={devMenuStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={devMenuStyles.scrollView}>
              <Text style={devMenuStyles.description}>
                Test different error scenarios to verify error handling
              </Text>
              
              <View style={devMenuStyles.testsGrid}>
                {errorTests.map((test, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[devMenuStyles.testButton, { backgroundColor: test.color }]}
                    onPress={() => {
                      test.action();
                      onClose();
                    }}
                  >
                    <Text style={devMenuStyles.testName}>{test.name}</Text>
                    <Text style={devMenuStyles.testDescription}>{test.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={devMenuStyles.infoBox}>
                <Text style={devMenuStyles.infoTitle}>What to Test:</Text>
                <Text style={devMenuStyles.infoText}>• Render Error → Should show ErrorBoundary fallback</Text>
                <Text style={devMenuStyles.infoText}>• Network Error → Orange modal with Dismiss button</Text>
                <Text style={devMenuStyles.infoText}>• API Error → Purple modal with metadata</Text>
                <Text style={devMenuStyles.infoText}>• Check console logs for error details</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  const devMenuStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: '#F5F5F5',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeText: {
      fontSize: 18,
      color: '#666',
    },
    scrollView: {
      padding: 20,
    },
    description: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
    },
    testsGrid: {
      gap: 12,
      marginBottom: 20,
    },
    testButton: {
      padding: 16,
      borderRadius: 10,
      backgroundColor: '#007AFF',
    },
    testName: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
      marginBottom: 4,
    },
    testDescription: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
    },
    infoBox: {
      backgroundColor: '#E3F2FD',
      padding: 16,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#2196F3',
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0D47A1',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 12,
      color: '#1565C0',
      marginBottom: 4,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.gray,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  earningsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.dark,
  },
  earningTrend: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsProgress: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  earningsSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  listSeparator: {
    height: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  notificationWrapper: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9FAFB',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  testingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  testingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
});

export default Dashboard;