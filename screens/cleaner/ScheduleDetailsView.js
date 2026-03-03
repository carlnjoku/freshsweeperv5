import React, { useContext, useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  StatusBar, 
  Linking, 
  ScrollView, 
  View, 
  useWindowDimensions, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import moment from 'moment';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import calculateDistance from '../../utils/calculateDistance';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CancelScheduleModal from '../../components/shared/CancelScheduleModal';
import TaskInfoBanner from './TaskInfoBanner';
import { getAddressFromCoords, getCityState } from '../../utils/getAddressFromCoordinates';
import { calculateEarningsFromChecklist } from '../../utils/earningCalculator';
import EarningsBreakdownCard from '../../components/cleaner/EarningsBreakdownCard';
import ChecklistSummary from '../../components/cleaner/ChecklistSummary';

export default function ScheduleDetailView({route}) {
    const navigation = useNavigation()
    const {item, requestId, scheduleId, hostId} = route.params
    const {geolocationData, currentUserId, currentUser} = useContext(AuthContext)
    const { width } = useWindowDimensions();

    // State management
    const [schedule, setSchedule] = useState({})
    const [cleaning_date, setCleaningDate] = useState("")
    const [cleaning_time, setCleaningTime] = useState("")
    const [cleaning_end_time, setCleaningEndTime] = useState("")
    const [room_type_and_size, setRoomTypeSize] = useState([])
    const [apartment_latitude, setApartmentLatitude] = useState("")
    const [apartment_longitude, setApartmentLongitude] = useState("")
    const [address, setAddress] = useState("")
    const [apartment_name, setApartmentName] = useState("")
    const [total_cleaning_fee, setTotalCleaningFee] = useState("")
    const [regular_cleaning, setRegularCleaning] = useState([])
    const [extra, setExtra] = useState([])
    const [distance, setDistance] = useState([])
    const [status, setStatus] = useState([])
    const [loading, setLoading] = useState(true)

    const[city, setCity] = useState(null)
    const[state, setState] = useState(null)
    const[postalcode, setPostalCode] = useState(null)
    const[country, setCountry] = useState(null)
    
    // Cancellation states
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancellationLoading, setCancellationLoading] = useState(false);
    const [currentCleanerAssignment, setCurrentCleanerAssignment] = useState(null);

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    // Room type data
    const bedroomCount = room_type_and_size.find(room => room.type === "Bedroom")?.number || 0;
    const bathroomCount = room_type_and_size.find(room => room.type === "Bathroom")?.number || 0;
    const kitchen = room_type_and_size.find(room => room.type === "Kitchen")?.number || 0;
    const livingroomCount = room_type_and_size.find(room => room.type === "Livingroom")?.number || 0;

    const bedroomSize = room_type_and_size.find(room => room.type === "Bedroom")?.size || 0;
    const bathroomSize = room_type_and_size.find(room => room.type === "Bathroom")?.size || 0;
    const kitchenSize = room_type_and_size.find(room => room.type === "Kitchen")?.size || 0;
    const livingroomSize = room_type_and_size.find(room => room.type === "Livingroom")?.size || 0;

    
    useEffect(() => {
      fetchSchedule()
    }, [])

    useEffect(() => {
      if (!loading) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ]).start();
      }
    }, [loading]);
   
    const fetchSchedule = async() => {
      try {
        setLoading(true);
        const response = await userService.getScheduleById(scheduleId)
        // .then(response => {
          const res = response.data
          setSchedule(res)
          setRoomTypeSize(res.schedule.selected_apt_room_type_and_size)
          setCleaningDate(res.schedule.cleaning_date)
          setCleaningTime(res.schedule.cleaning_time)
          setCleaningEndTime(res.schedule.cleaning_end_time)
          
          const lat1 = geolocationData.latitude
          const lon1 = geolocationData.longitude
          const lat2 = res.schedule.apartment_latitude
          const lon2 = res.schedule.apartment_longitude
          const dist = calculateDistance(lat1, lon1, lat2, lon2)
          
          setDistance(dist)
          setApartmentLatitude(res.schedule.apartment_latitude)
          setApartmentLongitude(res.schedule.apartment_longitude)
          setAddress(res.schedule.address)
          setApartmentName(res.schedule.apartment_name)
          setTotalCleaningFee(res.schedule.total_cleaning_fee)
          setRegularCleaning(res.schedule.regular_cleaning)
          setExtra(res.schedule.extra)
          setStatus(res.status)

          const coordinate = {
            latitude: lat2,
            longitude: lon2
          };

          

          const result = await getCityState(coordinate);
        
        
          setCity(result.city)
          setState(result.state)
          setPostalCode(result.postalCode)
          setCountry(result.country)
      
          
          if (res.assignedTo && currentUserId) {
            const currentAssignment = res.assignedTo.find(cleaner => 
              cleaner.cleanerId === currentUserId
            );
            setCurrentCleanerAssignment(currentAssignment);
          }
        // })
      } catch(e) {
        console.log(e)
      } finally {
        setLoading(false);
      }
    }

    // Calculate penalty impact for the cleaner
    const calculatePenaltyImpact = () => {
      if (!schedule || !cleaning_date || !cleaning_time) return null;

      const bookingTime = new Date(`${cleaning_date}T${cleaning_time}`);
      const now = new Date();
      const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
      
      let penaltyInfo = {
        points: 0,
        tier: 'NONE',
        description: '',
        reliabilityImpact: 0,
        ratingImpact: 0
      };

      // Calculate penalty based on timing
      if (hoursUntilBooking <= 24) {
        penaltyInfo = {
          points: 20,
          tier: 'SEVERE',
          description: 'Less than 24 hours notice',
          reliabilityImpact: -15,
          ratingImpact: -0.4
        };
      } else if (hoursUntilBooking <= 48) {
        penaltyInfo = {
          points: 10,
          tier: 'MODERATE',
          description: '24-48 hours notice',
          reliabilityImpact: -8,
          ratingImpact: -0.2
        };
      } else if (hoursUntilBooking <= 72) {
        penaltyInfo = {
          points: 5,
          tier: 'MINOR',
          description: '48-72 hours notice',
          reliabilityImpact: -4,
          ratingImpact: -0.1
        };
      } else {
        penaltyInfo = {
          points: 0,
          tier: 'NONE',
          description: 'More than 72 hours notice',
          reliabilityImpact: 0,
          ratingImpact: 0
        };
      }

      return penaltyInfo;
    };

    const canCancelAssignment = () => {
      if (!schedule || !currentCleanerAssignment) return false;
      const bookingTime = new Date(`${cleaning_date}T${cleaning_time}`);
      const now = new Date();
      const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilBooking <= 0) return false;
      if (currentCleanerAssignment.status === 'in_progress') return false;
      if (currentCleanerAssignment.status === 'completed') return false;
      if (schedule.status === 'cancelled') return false;
      
      return true;
    };

    

    // Cleaner cancellation handler with penalty integration
    const handleCancelBooking = async (cancellationData) => {
      setCancellationLoading(true);
      console.log("Cleaner cancellation data:", cancellationData);

      try {
        // Calculate penalty impact
        const penaltyImpact = calculatePenaltyImpact();
        
        const cancellationPayload = {
          ...cancellationData,
          cancellationType: 'partial',
          targetCleanerId: currentUserId,
          cancelledBy: 'cleaner',
          penaltyLevel: penaltyImpact?.tier || 'NONE',
          penaltyPoints: penaltyImpact?.points || 0
        };

        const response = await userService.cancelSchedule(
          scheduleId, 
          cancellationPayload
        );

        if (response.success) {
          let message = 'Your assignment has been cancelled successfully.';
          
          if (penaltyImpact && penaltyImpact.tier !== 'NONE') {
            message += `\n\nPenalty Applied: ${penaltyImpact.tier} Level`;
            message += `\nReliability Impact: ${penaltyImpact.reliabilityImpact}%`;
            message += `\nRating Impact: ${penaltyImpact.ratingImpact} stars`;
            message += `\n\nThis penalty will decay over 30 days with good performance.`;
          }

          Alert.alert(
            penaltyImpact?.tier === 'NONE' ? 'Assignment Cancelled' : 'Assignment Cancelled - Penalty Applied',
            message,
            [{ 
              text: 'OK', 
              onPress: () => {
                setCancelModalVisible(false);
                fetchSchedule();
              }
            }]
          );
        } else {
          Alert.alert('Error', response.message || 'Failed to cancel assignment');
        }
      } catch (error) {
        console.error('Cleaner cancellation error:', error);
        Alert.alert('Error', 'Failed to cancel assignment. Please try again.');
      } finally {
        setCancellationLoading(false);
      }
    };

    const getBookingForCancellation = () => {
      return {
        id: scheduleId,
        date: `${cleaning_date}T${cleaning_time}`,
        amount: calculateEarnings(),
        service: 'Cleaning Service',
        host: schedule?.hostInfo?.firstname ? `${schedule.hostInfo.firstname} ${schedule.hostInfo.lastname}` : 'Host',
        status: currentCleanerAssignment?.status || 'pending',
        cleaning_date: cleaning_date,
        cleaning_time: cleaning_time
      };
    };

     
    


    const calculateEarnings = () => {
      if (!currentCleanerAssignment) return 0;
      
      const earningsData = calculateEarningsFromChecklist(
        schedule.assignedTo, 
        currentUserId
      );
      
      return earningsData.cleanerEarnings;
    };
    
    const calculateTotalAmount = () => {
      const earningsData = calculateEarningsFromChecklist(schedule.assignedTo);
      return earningsData.totalEarnings;
    };
    
    // Add these new functions for detailed earnings display
    const getEarningsBreakdown = () => {
      return calculateEarningsFromChecklist(schedule.assignedTo, currentUserId);
    };

    // Get current cleaner's checklist data
    const getCurrentCleanerChecklist = () => {
  
      if (!currentCleanerAssignment) return null;

      // If schedule has a checklist structure with groups
      if (schedule.checklist && currentCleanerAssignment.group) {
          return {
              [currentCleanerAssignment.group]: schedule.checklist[currentCleanerAssignment.group]
          };
      }
     
      // If checklist is directly in assignedTo
      return currentCleanerAssignment.checklist;
  };
    
    const getGroupEarnings = () => {
      return getEarningsByGroup(schedule.assignedTo);
    };
    
    const getStatusEarnings = () => {
      return getEarningsByStatus(schedule.assignedTo);
    };

    // const calculateEarnings = () => {
    //   if (!currentCleanerAssignment) return 0;
    //   const totalAmount = calculateTotalAmount();
    //   const assignedTo = schedule.assignedTo || [];
    //   const cleanerCount = assignedTo.length || 1;
    //   return totalAmount / cleanerCount;
    // };

    // const calculateTotalAmount = () => {
    //   let total = 0;
    //   if (Array.isArray(regular_cleaning)) {
    //     total += regular_cleaning.reduce((sum, item) => sum + (item.price || 0), 0);
    //   }
    //   if (Array.isArray(extra)) {
    //     total += extra.reduce((sum, item) => sum + (item.price || 0), 0);
    //   }
    //   return total > 0 ? total : 100;
    // };

    const handleOpenDirections = () => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentUser.location.latitude},${currentUser.location.longitude }&destination=${apartment_latitude},${apartment_longitude}&travelmode=driving`;
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open Google Maps", err)
      );
    };

    const gotToTaskScreen = () => {
      navigation.navigate(ROUTES.cleaner_attach_task_photos,{scheduleId:scheduleId})
    }

    const handleClockIn = () => {
      navigation.navigate(ROUTES.cleaner_clock_in, {
        scheduleId:scheduleId,
        schedule:schedule
      })
    }

    const getStatusColor = () => {
      switch(status) {
        case 'upcoming': return '#FFA500';
        case 'in_progress': return COLORS.primary;
        case 'completed': return '#34C759';
        default: return '#8E8E93';
      }
    };

    const getStatusIcon = () => {
      switch(status) {
        case 'upcoming': return 'clock-outline';
        case 'in_progress': return 'progress-clock';
        case 'completed': return 'check-circle';
        default: return 'calendar';
      }
    };

    const RoomDetail = ({ type, count, size }) => {
      const icons = {
        Bedroom: 'bed',
        Bathroom: 'shower',
        Kitchen: 'silverware-fork-knife',
        Livingroom: 'sofa'
      };
      
      return (
        <View style={styles.roomDetail}>
          <View style={styles.roomIconContainer}>
            <MaterialCommunityIcons 
              name={icons[type]} 
              size={20} 
              color={COLORS.gray} 
            />
          </View>
          <View style={styles.roomInfo}>
            <Text style={styles.roomType}>{type}</Text>
            <Text style={styles.roomSpecs}>
              {count} {count === 1 ? 'room' : 'rooms'} • {size} sq ft
            </Text>
          </View>
          <Text style={styles.roomCount}>{count}</Text>
        </View>
      );
    };

    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading schedule details...</Text>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        {/* Header with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Cleaning Details</Text>
              <View style={styles.statusPill}>
                <MaterialCommunityIcons 
                  name={getStatusIcon()} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>
                  {status?.replace('_', ' ') || 'Scheduled'}
                </Text>
              </View>
            </View>
            
            {canCancelAssignment() && (
              <TouchableOpacity 
                style={styles.cancelHeaderButton}
                onPress={() => setCancelModalVisible(true)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <Animated.ScrollView 
          style={[
            styles.scrollView,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            
            <Text style={styles.apartmentName}>{apartment_name}</Text>
            <Text style={styles.address}>{city}, {state} - {postalcode}</Text>
            
            <View style={styles.locationInfo}>
              <View style={styles.distanceBadge}>
                <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" />
                <Text style={styles.distanceText}>{distance || 0} miles away</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.directionButton}
                onPress={handleOpenDirections}
              >
                <MaterialCommunityIcons name="directions" size={16} color={COLORS.primary} />
                <Text style={styles.directionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="home" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Property Details</Text>
            </View>
            
            <View style={styles.roomsList}>
              {room_type_and_size.map((room, index) => (
                <RoomDetail 
                  key={index}
                  type={room.type}
                  count={room.number}
                  size={room.size}
                />
              ))}
            </View>
            
            <View style={styles.totalArea}>
              <MaterialCommunityIcons name="ruler-square" size={16} color="#666" />
              <Text style={styles.totalAreaText}>
                Total Area: {bedroomSize + bathroomSize + kitchenSize + livingroomSize} sq ft
              </Text>
            </View>
          </View>

          {/* Schedule Timeline Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Schedule</Text>
            </View>
            
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.startDot]}>
                  <MaterialCommunityIcons name="play" size={12} color="#34C759" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>START TIME</Text>
                  <Text style={styles.timelineTime}>
                    {moment(cleaning_time, 'h:mm:ss A').format('h:mm A')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineConnector} />
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.dateDot]}>
                  <MaterialCommunityIcons name="calendar-blank" size={12} color={COLORS.primary} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>DATE</Text>
                  <Text style={styles.timelineTime}>
                    {moment(cleaning_date).format('ddd, MMM D, YYYY')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineConnector} />
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.endDot]}>
                  <MaterialCommunityIcons name="stop" size={12} color="#FF9500" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>END TIME</Text>
                  <Text style={styles.timelineTime}>
                    {moment(cleaning_end_time, 'h:mm:ss A').format('h:mm A')}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons name="timer-outline" size={16} color="#666" />
              <Text style={styles.durationText}>
                {(() => {
                  try {
                    const start = moment(cleaning_time, 'h:mm:ss A');
                    const end = moment(cleaning_end_time, 'h:mm:ss A');
                    const duration = moment.duration(end.diff(start));
                    const hours = duration.hours();
                    const minutes = duration.minutes();
                    if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
                    return `${minutes}m`;
                  } catch (error) {
                    return 'Duration not available';
                  }
                })()}
              </Text>
            </View>
          </View>

          <ChecklistSummary
            assignedTo={[currentCleanerAssignment]}
          />

          <EarningsBreakdownCard 
            earningsData={getEarningsBreakdown()}
            currentCleanerId={currentUserId}
          />
        
        

          {/* Cancellation Policy Card */}
          {canCancelAssignment() && (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => setCancelModalVisible(true)}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF9500" />
                <Text style={styles.cardTitle}>Cancellation Policy</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
              </View>
              <Text style={styles.policyText}>
                View cancellation terms and potential penalties
              </Text>
            </TouchableOpacity>
          )}
        </Animated.ScrollView>

        {/* Fixed Action Button */}
        <View style={styles.actionContainer}>
        
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Your Earnings</Text>
            <Text style={styles.priceValue}>
              {geolocationData.currency.symbol}{calculateEarnings().toFixed(2)}
            </Text>
          </View>
   
          
          {status === 'upcoming' && canCancelAssignment() ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setCancelModalVisible(true)}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Cancel Assignment</Text>
            </TouchableOpacity>
          ) : status === 'in_progress' ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleClockIn}
            >
              <MaterialCommunityIcons name="timer-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Clock In</Text>
            </TouchableOpacity>
          ) : status === 'in_progress' ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={gotToTaskScreen}
            >
              <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Continue Work</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Cancellation Modal */}
        <CancelScheduleModal
          visible={cancelModalVisible}
          onClose={() => setCancelModalVisible(false)}
          booking={getBookingForCancellation()}
          userType="cleaner"
          onCancelBooking={handleCancelBooking}
          cleaners={[currentCleanerAssignment].filter(Boolean)}
          cancellationType="partial"
          targetCleaner={currentCleanerAssignment}
          penaltyImpact={calculatePenaltyImpact()} // Add penalty impact data
        />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  cancelHeaderButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  apartmentName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E7F3FF',
    borderRadius: 12,
    gap: 6,
  },
  directionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Property Details Styles
  roomsList: {
    gap: 12,
    marginBottom: 16,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    gap: 12,
  },
  roomIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  roomSpecs: {
    fontSize: 14,
    color: '#666',
  },
  roomCount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  totalArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    gap: 8,
  },
  totalAreaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  // Timeline Styles
  timeline: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
  },
  startDot: {
    borderColor: '#34C759',
  },
  dateDot: {
    borderColor: COLORS.primary,
  },
  endDot: {
    borderColor: '#FF9500',
  },
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E5EA',
    marginLeft: 11,
    marginBottom: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  // Services Styles
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceText: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
  },
  // Earnings Styles
  earningsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  policyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Action Container
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});





