// import { View, Text, TouchableOpacity } from 'react-native';
// import { Avatar } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// const CommunicateItem = ({ cleaner, index, distance, callPhone, openExisitingConversation }) => {
//   const isClaimed = Boolean(cleaner.cleanerId);

//   return (
//     <View key={index} style={styles.container}>
        
//       {/* Main Content */}
//       <View style={styles.content}>
//         {/* Left Section - Avatar and Info */}
//         <View style={styles.leftSection}>
//           <Avatar.Image
//             size={44}
//             source={{ uri: cleaner.avatar }}
//             style={styles.avatar}
//           />
          
//           <View style={styles.textContainer}>
//             <Text style={styles.name}>
//               {isClaimed ? `${cleaner.firstname} ${cleaner.lastname}` : 'Unclaimed'}
//             </Text>
//             <Text style={styles.distance}>
//               {isClaimed ? `${distance} miles away` : 'Location not available'}
//             </Text>
//           </View>
//         </View>

//         {/* Right Section - Action Buttons */}
//         <View style={styles.actions}>
//           <TouchableOpacity 
//             style={[
//               styles.actionButton,
//               !isClaimed && styles.disabledAction
//             ]}
//             onPress={() => isClaimed ? callPhone(cleaner.phone) : null}
//             disabled={!isClaimed}
//           >
//             <View style={styles.iconContainer}>
//               <MaterialCommunityIcons 
//                 name="phone" 
//                 size={20} 
//                 color={isClaimed ? COLORS.primary : COLORS.lightGray} 
//               />
//             </View>
//             <Text style={[
//               styles.actionText,
//               !isClaimed && styles.disabledText
//             ]}>
//               Call
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[
//               styles.actionButton,
//               !isClaimed && styles.disabledAction
//             ]}
//             onPress={() => isClaimed ? openExisitingConversation(cleaner.cleanerId) : null}
//             disabled={!isClaimed}
//           >
//             <View style={styles.iconContainer}>
//               <MaterialCommunityIcons 
//                 name="message-text" 
//                 size={20} 
//                 color={isClaimed ? COLORS.primary : COLORS.lightGray} 
//               />
//             </View>
//             <Text style={[
//               styles.actionText,
//               !isClaimed && styles.disabledText
//             ]}>
//               Message
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Status Badge */}
//       <View style={[
//         styles.statusBadge,
//         isClaimed ? styles.statusActive : styles.statusInactive
//       ]}>
//         <View style={[
//           styles.statusDot,
//           isClaimed ? styles.dotActive : styles.dotInactive
//         ]} />
//         <Text style={styles.statusText}>
//           {isClaimed ? 'Available' : 'Unclaimed'}
//         </Text>
//       </View>
//     </View>
//   );
// };


// const styles = {
//   container: {
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     backgroundColor: '#FFFFFF',
//   },
//   content: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatar: {
//     backgroundColor: COLORS.ultraLightGray,
//     borderRadius: 12,
//   },
//   textContainer: {
//     marginLeft: 16,
//     flex: 1,
//   },
//   name: {
//     fontWeight: '600',
//     fontSize: 17,
//     color: COLORS.dark,
//     marginBottom: 4,
//     letterSpacing: -0.3,
//   },
//   distance: {
//     fontSize: 14,
//     color: COLORS.mediumGray,
//     fontWeight: '400',
//   },
//   actions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   actionButton: {
//     alignItems: 'center',
//     minWidth: 60,
//   },
//   iconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: COLORS.ultraLightPrimary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   actionText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   disabledAction: {
//     opacity: 0.5,
//   },
//   disabledText: {
//     color: COLORS.mediumGray,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     marginTop: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   statusActive: {
//     backgroundColor: 'rgba(76, 217, 100, 0.1)',
//   },
//   statusInactive: {
//     backgroundColor: 'rgba(255, 149, 0, 0.1)',
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//   },
//   dotActive: {
//     backgroundColor: '#4CD964',
//   },
//   dotInactive: {
//     backgroundColor: '#FF9500',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
// };

// // Updated color palette for modern flat design
// // const COLORS = {
// //   primary: '#007AFF',
// //   dark: '#1C1C1E',
// //   mediumGray: '#8A8A8E',
// //   lightGray: '#C6C6C8',
// //   ultraLightGray: '#F2F2F7',
// //   ultraLightPrimary: 'rgba(0, 122, 255, 0.1)',
// // };



// export default CommunicateItem;




// import { View, Text, TouchableOpacity } from 'react-native';
// import { Avatar } from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// const CommunicateItem = ({ 
//     cleaner, 
//     index, 
//     distance, 
//     callPhone, 
//     openExisitingConversation,
//     onCancelCleaner,
//     canCancel = false 
// }) => {
//     const isClaimed = Boolean(cleaner.cleanerId);

//     const getStatusLabel = (status) => {
//       switch (status) {
//         case 'payment_confirmed':
//           return 'Payment Confirmed';
//         case 'completed':
//           return 'Completed';
//         case 'assigned':
//           return 'Assigned';
//         default:
//           return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Assigned';
//       }
//     };

//     return (
//         <View key={index} style={styles.container}>
//             {/* Main Content */}
//             <View style={styles.content}>
//                 {/* Left Section - Avatar and Info */}
//                 <View style={styles.leftSection}>
//                     <Avatar.Image
//                         size={44}
//                         source={{ uri: cleaner.avatar }}
//                         style={styles.avatar}
//                     />
                    
//                     <View style={styles.textContainer}>
//                         <Text style={styles.name}>
//                             {isClaimed ? `${cleaner.firstname}  ${cleaner.lastname.charAt(0).toUpperCase()}.` : 'Unclaimed'}
//                         </Text>
//                         <Text style={styles.distance}>
//                             {isClaimed ? `${distance} miles away` : 'Location not available'}
//                         </Text>
//                         <Text style={styles.status}>
//                           {getStatusLabel(cleaner.status)}
//                         </Text>
//                     </View>
//                 </View>

//                 {/* Right Section - Action Buttons */}
//                 <View style={styles.actions}>
//                     <TouchableOpacity 
//                         style={[
//                             styles.actionButton,
//                             !isClaimed && styles.disabledAction
//                         ]}
//                         onPress={() => isClaimed ? callPhone(cleaner.phone) : null}
//                         disabled={!isClaimed}
//                     >
//                         <View style={styles.iconContainer}>
//                             <MaterialCommunityIcons 
//                                 name="phone" 
//                                 size={20} 
//                                 color={isClaimed ? COLORS.primary : COLORS.lightGray} 
//                             />
//                         </View>
//                         <Text style={[
//                             styles.actionText,
//                             !isClaimed && styles.disabledText
//                         ]}>
//                             Call
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={[
//                             styles.actionButton,
//                             !isClaimed && styles.disabledAction
//                         ]}
//                         onPress={() => isClaimed ? openExisitingConversation(cleaner.cleanerId) : null}
//                         disabled={!isClaimed}
//                     >
//                         <View style={styles.iconContainer}>
//                             <MaterialCommunityIcons 
//                                 name="message-text" 
//                                 size={20} 
//                                 color={isClaimed ? COLORS.primary : COLORS.lightGray} 
//                             />
//                         </View>
//                         <Text style={[
//                             styles.actionText,
//                             !isClaimed && styles.disabledText
//                         ]}>
//                             Message
//                         </Text>
//                     </TouchableOpacity>

//                     {/* Cancel Cleaner Button */}
//                     {canCancel && (
//                         <TouchableOpacity 
//                             style={[styles.actionButton, styles.cancelAction]}
//                             onPress={onCancelCleaner}
//                         >
//                             <View style={[styles.iconContainer, styles.cancelIconContainer]}>
//                                 <MaterialCommunityIcons 
//                                     name="close" 
//                                     size={18} 
//                                     color="#DC3545" 
//                                 />
//                             </View>
//                             <Text style={styles.cancelActionText}>
//                                 Remove
//                             </Text>
//                         </TouchableOpacity>
//                     )}
//                 </View>
//             </View>

//             {/* Status Badge */}
//             <View style={[
//                 styles.statusBadge,
//                 isClaimed ? styles.statusActive : styles.statusInactive
//             ]}>
//                 <View style={[
//                     styles.statusDot,
//                     isClaimed ? styles.dotActive : styles.dotInactive
//                 ]} />
//                 <Text style={styles.statusText}>
//                     {isClaimed ? 'Available' : 'Unclaimed'}
//                 </Text>
//             </View>
//         </View>
//     );
// };

// const styles = {
//     container: {
//         paddingVertical: 16,
//         paddingHorizontal: 0,
//         backgroundColor: '#FFFFFF',
//         borderBottomWidth: 1,
//         borderBottomColor: '#F0F0F0',
//     },
//     content: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     leftSection: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     avatar: {
//         backgroundColor: COLORS.ultraLightGray,
//         borderRadius: 12,
//     },
//     textContainer: {
//         marginLeft: 16,
//         flex: 1,
//     },
//     name: {
//         fontWeight: '600',
//         fontSize: 17,
//         color: COLORS.dark,
//         marginBottom: 4,
//         letterSpacing: -0.3,
//     },
//     distance: {
//         fontSize: 14,
//         color: COLORS.mediumGray,
//         fontWeight: '400',
//         marginBottom: 2,
//     },
//     status: {
//         fontSize: 12,
//         color: COLORS.gray,
//         fontStyle: 'italic',
//     },
//     actions: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     actionButton: {
//         alignItems: 'center',
//         minWidth: 55,
//     },
//     iconContainer: {
//         width: 40,
//         height: 40,
//         borderRadius: 10,
//         backgroundColor: COLORS.ultraLightPrimary,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 4,
//     },
//     actionText: {
//         fontSize: 11,
//         fontWeight: '500',
//         color: COLORS.primary,
//     },
//     cancelAction: {
//         // Specific styles for cancel button
//     },
//     cancelIconContainer: {
//         backgroundColor: 'rgba(220, 53, 69, 0.1)',
//     },
//     cancelActionText: {
//         fontSize: 11,
//         fontWeight: '500',
//         color: '#DC3545',
//     },
//     disabledAction: {
//         opacity: 0.5,
//     },
//     disabledText: {
//         color: COLORS.mediumGray,
//     },
//     statusBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         alignSelf: 'flex-start',
//         marginTop: 12,
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         borderRadius: 8,
//     },
//     statusActive: {
//         backgroundColor: 'rgba(76, 217, 100, 0.1)',
//     },
//     statusInactive: {
//         backgroundColor: 'rgba(255, 149, 0, 0.1)',
//     },
//     statusDot: {
//         width: 6,
//         height: 6,
//         borderRadius: 3,
//         marginRight: 6,
//     },
//     dotActive: {
//         backgroundColor: '#4CD964',
//     },
//     dotInactive: {
//         backgroundColor: '#FF9500',
//     },
//     statusText: {
//         fontSize: 12,
//         fontWeight: '500',
//         color: COLORS.dark,
//     },
// };

// export default CommunicateItem;


import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import COLORS from '../../constants/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CommunicateItem = ({ 
    cleaner, 
    index, 
    distance, 
    callPhone, 
    openExisitingConversation,
    onCancelCleaner,
    canCancel = false 
}) => {
    const isClaimed = Boolean(cleaner.cleanerId);

    // 🔹 Map statuses to label + background + text colors
    const getStatusStyle = (status) => {
        switch (status) {
            case 'payment_confirmed':
                return { label: 'Confirmed', bg: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' };
            case 'completed':
                return { label: 'Completed', bg: 'rgba(39, 174, 96, 0.15)', color: '#27ae60' };
            case 'assigned':
                return { label: 'Assigned', bg: 'rgba(52, 152, 219, 0.15)', color: '#3498db' };
            case 'pending':
                return { label: 'Pending', bg: 'rgba(243, 156, 18, 0.15)', color: '#f39c12' };
            case 'cancelled':
                return { label: 'Cancelled', bg: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' };
            default:
                return { 
                    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Assigned',
                    bg: 'rgba(149, 165, 166, 0.15)', 
                    color: '#7f8c8d'
                };
        }
    };

    const { label, bg, color } = getStatusStyle(cleaner.status);

    return (
        <View key={index} style={styles.container}>
            <View style={styles.content}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    <Avatar.Image
                        size={44}
                        source={{ uri: cleaner.avatar }}
                        style={styles.avatar}
                    />
                    
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>
                            {isClaimed ? `${cleaner.firstname} ${cleaner.lastname.charAt(0).toUpperCase()}.` : 'Unclaimed'}
                        </Text>
                        <Text style={styles.distance}>
                            {isClaimed ? `${distance} miles away` : 'Location not available'}
                        </Text>

                        {/* 🔹 Badge-style Status */}
                        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: color }]} />
                            <Text style={[styles.statusText, { color }]}>{label}</Text>
                        </View>
                    </View>
                </View>

                {/* Right Section - Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[
                            styles.actionButton,
                            !isClaimed && styles.disabledAction
                        ]}
                        onPress={() => isClaimed ? callPhone(cleaner.phone) : null}
                        disabled={!isClaimed}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons 
                                name="phone" 
                                size={20} 
                                color={isClaimed ? COLORS.primary : COLORS.lightGray} 
                            />
                        </View>
                        <Text style={[
                            styles.actionText,
                            !isClaimed && styles.disabledText
                        ]}>
                            Call
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.actionButton,
                            !isClaimed && styles.disabledAction
                        ]}
                        onPress={() => isClaimed ? openExisitingConversation(cleaner.cleanerId) : null}
                        disabled={!isClaimed}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons 
                                name="message-text" 
                                size={20} 
                                color={isClaimed ? COLORS.primary : COLORS.lightGray} 
                            />
                        </View>
                        <Text style={[
                            styles.actionText,
                            !isClaimed && styles.disabledText
                        ]}>
                            Message
                        </Text>
                    </TouchableOpacity>

                    {canCancel && (
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.cancelAction]}
                            onPress={onCancelCleaner}
                        >
                            <View style={[styles.iconContainer, styles.cancelIconContainer]}>
                                <MaterialCommunityIcons 
                                    name="close" 
                                    size={18} 
                                    color="#DC3545" 
                                />
                            </View>
                            <Text style={styles.cancelActionText}>Remove</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Availability Badge */}
            <View style={[
                styles.availabilityBadge,
                isClaimed ? styles.statusActive : styles.statusInactive
            ]}>
                <View style={[
                    styles.availabilityDot,
                    isClaimed ? styles.dotActive : styles.dotInactive
                ]} />
                <Text style={styles.availabilityText}>
                    {isClaimed ? 'Available' : 'Unclaimed'}
                </Text>
            </View>
        </View>
    );
};

const styles = {
    container: {
        paddingVertical: 16,
        paddingHorizontal: 0,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        backgroundColor: COLORS.ultraLightGray,
        borderRadius: 12,
    },
    textContainer: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontWeight: '600',
        fontSize: 17,
        color: COLORS.dark,
        marginBottom: 4,
    },
    distance: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '400',
        marginBottom: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        alignItems: 'center',
        minWidth: 55,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.ultraLightPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionText: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.primary,
    },
    cancelIconContainer: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    cancelActionText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#DC3545',
    },
    disabledAction: {
        opacity: 0.5,
    },
    disabledText: {
        color: COLORS.mediumGray,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusActive: {
        backgroundColor: 'rgba(76, 217, 100, 0.1)',
    },
    statusInactive: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
    },
    availabilityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    dotActive: {
        backgroundColor: '#4CD964',
    },
    dotInactive: {
        backgroundColor: '#FF9500',
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.dark,
    },
};

export default CommunicateItem;