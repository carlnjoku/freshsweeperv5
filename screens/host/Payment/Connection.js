// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// export default function ConnectAirbnbCalendar() {
//   const handleConnect = () => {
//     // Replace with your actual Airbnb OAuth URL
//     Linking.openURL('https://www.airbnb.com/oauth/connect');
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <View style={styles.header}>
//           <MaterialIcons name="sync" size={32} color={COLORS.primary} />
//           <Text style={styles.title}>Sync Your Airbnb Calendar</Text>
//           <Text style={styles.subtitle}>
//             Automatically update your property's availability and avoid double bookings
//           </Text>
//         </View>

//         <View style={styles.airbnbBrand}>
//           {/* <Image 
//             source={require('../../assets/airbnb-logo.png')} 
//             style={styles.logo} 
//           /> */}
//           <Text style={styles.brandText}>Airbnb</Text>
//         </View>

//         <TouchableOpacity 
//           style={styles.connectButton}
//           onPress={handleConnect}
//         >
//           <Text style={styles.buttonText}>Connect Airbnb Calendar</Text>
//           <MaterialIcons name="arrow-forward" size={20} color="white" />
//         </TouchableOpacity>

//         <Text style={styles.note}>
//           We'll ask you to sign in to your Airbnb account and grant access to your calendar
//         </Text>

//         <View style={styles.divider} />

//         <View style={styles.benefitsContainer}>
//           <Text style={styles.sectionTitle}>Why Connect Your Calendar?</Text>
          
//           <View style={styles.benefitItem}>
//             <MaterialIcons name="autorenew" size={20} color={COLORS.primary} />
//             <Text style={styles.benefitText}>
//               <Text style={styles.benefitHighlight}>Automatic sync</Text> - Your availability updates in real-time
//             </Text>
//           </View>
          
//           <View style={styles.benefitItem}>
//             <MaterialIcons name="block" size={20} color={COLORS.primary} />
//             <Text style={styles.benefitText}>
//               <Text style={styles.benefitHighlight}>Prevent double bookings</Text> - Airbnb reservations block dates automatically
//             </Text>
//           </View>
          
//           <View style={styles.benefitItem}>
//             <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
//             <Text style={styles.benefitText}>
//               <Text style={styles.benefitHighlight}>Save time</Text> - No more manual calendar updates
//             </Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.stepsContainer}>
//         <Text style={styles.stepsTitle}>How It Works:</Text>
        
//         <View style={styles.step}>
//           <View style={styles.stepNumber}>
//             <Text style={styles.stepText}>1</Text>
//           </View>
//           <Text style={styles.stepDescription}>Click "Connect Airbnb Calendar"</Text>
//         </View>
        
//         <View style={styles.step}>
//           <View style={styles.stepNumber}>
//             <Text style={styles.stepText}>2</Text>
//           </View>
//           <Text style={styles.stepDescription}>Log in to your Airbnb account</Text>
//         </View>
        
//         <View style={styles.step}>
//           <View style={styles.stepNumber}>
//             <Text style={styles.stepText}>3</Text>
//           </View>
//           <Text style={styles.stepDescription}>Grant calendar access permissions</Text>
//         </View>
        
//         <View style={styles.step}>
//           <View style={styles.stepNumber}>
//             <Text style={styles.stepText}>4</Text>
//           </View>
//           <Text style={styles.stepDescription}>Your calendars will sync automatically</Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fe',
//     padding: 20,
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     padding: 24,
//     shadowColor: '#3d5afe',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.1,
//     shadowRadius: 16,
//     elevation: 5,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 15,
//     color: COLORS.gray,
//     textAlign: 'center',
//     marginTop: 8,
//     lineHeight: 22,
//   },
//   airbnbBrand: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//   },
//   logo: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//   },
//   brandText: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FF5A5F',
//     marginLeft: 12,
//   },
//   connectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FF5A5F',
//     paddingVertical: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   note: {
//     fontSize: 13,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#f0f0f0',
//     marginVertical: 24,
//   },
//   benefitsContainer: {
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   benefitItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   benefitText: {
//     fontSize: 15,
//     color: COLORS.dark,
//     marginLeft: 12,
//     flex: 1,
//     lineHeight: 22,
//   },
//   benefitHighlight: {
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   stepsContainer: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     padding: 24,
//     marginTop: 20,
//     shadowColor: '#3d5afe',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.1,
//     shadowRadius: 16,
//     elevation: 5,
//   },
//   stepsTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   step: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   stepNumber: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#eef6ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stepText: {
//     color: COLORS.primary,
//     fontWeight: '700',
//   },
//   stepDescription: {
//     fontSize: 15,
//     color: COLORS.dark,
//     marginLeft: 16,
//     flex: 1,
//   },
// });
  








import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

// Mock platform data - in a real app, this would come from your data source
const bookingPlatforms = [
  {
    id: 'airbnb',
    name: 'Airbnb',
    color: '#FF5A5F',
    description: 'Sync your Airbnb calendar to automatically update availability',
    // icon: require('../../assets/airbnb-logo.png'),
    connected: true,
  },
  {
    id: 'booking',
    name: 'Booking.com',
    color: '#003580',
    description: 'Connect your Booking.com account to manage reservations',
    // icon: require('../../assets/booking-logo.png'),
    connected: false,
  },
  {
    id: 'vrbo',
    name: 'Vrbo',
    color: '#00A699',
    description: 'Link your Vrbo property to sync bookings and availability',
    // icon: require('../../assets/vrbo-logo.png'),
    connected: true,
  },
];

const Connection = ({ navigation }) => {
  const navigateToPlatform = (platformId) => {
    // In a real app, this would navigate to the specific platform connection screen
    navigation.navigate('ConnectCalendarDetail', { platformId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Your Calendars</Text>
        <Text style={styles.subtitle}>
          Sync with booking platforms to automatically update your availability
        </Text>
      </View>

      <ScrollView style={styles.platformsContainer}>
        {bookingPlatforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[styles.platformCard, { borderLeftColor: platform.color }]}
            onPress={() => navigateToPlatform(platform.id)}
          >
            <View style={styles.platformHeader}>
              <View style={styles.platformInfo}>
                {/* <Image source={platform.icon} style={styles.platformLogo} /> */}
                <Text style={styles.platformName}>{platform.name}</Text>
              </View>
              
              <View style={styles.statusContainer}>
                {platform.connected ? (
                  <View style={styles.connectedBadge}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                ) : (
                  <View style={styles.notConnectedBadge}>
                    <Text style={styles.notConnectedText}>Not Connected</Text>
                  </View>
                )}
                <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
              </View>
            </View>
            
            <Text style={styles.platformDescription}>{platform.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Why Connect Calendars?</Text>
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitCard}>
            <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>Auto-Sync</Text>
            <Text style={styles.benefitText}>Availability updates in real-time</Text>
          </View>
          <View style={styles.benefitCard}>
            <MaterialIcons name="block" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>No Overbooking</Text>
            <Text style={styles.benefitText}>Prevent double bookings</Text>
          </View>
          <View style={styles.benefitCard}>
            <MaterialIcons name="schedule" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>Save Time</Text>
            <Text style={styles.benefitText}>No manual calendar updates</Text>
          </View>
          <View style={styles.benefitCard}>
            <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.benefitTitle}>Maximize Revenue</Text>
            <Text style={styles.benefitText}>Optimize your booking rates</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
    padding: 16,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 24,
  },
  platformsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  platformCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  platformDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7e9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
    marginLeft: 4,
  },
  notConnectedBadge: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  notConnectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  footer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Connection;