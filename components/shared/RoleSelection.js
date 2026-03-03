// import { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// const RoleSelection = ({ onContinue }) => {
//   const [selectedRole, setSelectedRole] = useState(null);

//   const handleContinue = () => {
//     if (selectedRole && onContinue) {
//       onContinue(selectedRole);
//     }
//   };

//   return (
//     <View>
//       {/* Host Card */}
//       <Text style={styles.title}>Choose Your Role</Text>
//       <TouchableOpacity 
//         style={[
//           styles.card,
//           selectedRole === 'host' && styles.selectedCard
//         ]} 
//         onPress={() => setSelectedRole('host')}
//       >
//         {selectedRole === 'host' && (
//           <View style={styles.checkBadge}>
//             <MaterialCommunityIcons name="check" size={16} color="white" />
//           </View>
//         )}
        
//         <View style={styles.itemContent}>
//           <View style={{ marginRight: 10 }}>
//             <MaterialCommunityIcons name="home-account" size={40} color={COLORS.gray} />
//           </View>
//           <View style={{ flexShrink: 1 }}>
//             <Text style={styles.cardTitle}>I need cleaners</Text>
//             <Text>Keep your rental spotless with trusted professionals.</Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Cleaner Card */}
//       <TouchableOpacity 
//         style={[
//           styles.card,
//           selectedRole === 'cleaner' && styles.selectedCard
//         ]} 
//         onPress={() => setSelectedRole('cleaner')}
//       >
//         {selectedRole === 'cleaner' && (
//           <View style={styles.checkBadge}>
//             <MaterialCommunityIcons name="check" size={16} color="white" />
//           </View>
//         )}
        
//         <View style={styles.itemContent}>
//           <View style={{ marginRight: 10 }}>
//             <MaterialCommunityIcons name="broom" size={40} color={COLORS.gray} />
//           </View>
//           <View style={{ flexShrink: 1 }}>
//             <Text style={styles.cardTitle}>I am a cleaner</Text>
//             <Text>Earn money cleaning homes and apartments in your area</Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Continue Button */}
//       {selectedRole && (
//         <TouchableOpacity 
//           style={styles.continueButton}
//           onPress={handleContinue}
//         >
//           <Text style={styles.continueButtonText}>Continue</Text>
//         </TouchableOpacity>
//       )}

      
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
    
//   },
//   card: {
//     backgroundColor: COLORS.light,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     position: 'relative', // Needed for absolute positioning of check badge
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.white,
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   checkBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     backgroundColor: COLORS.primary,
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   continueButton: {
//     backgroundColor: COLORS.primary,
//     padding: 11,
//     alignItems: 'center',
//     marginTop: 40,
//     borderRadius:50,
  
//   },
//   continueButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
    
//   },
//   title:{
//     fontSize:22,
//     alignSelf:'center',
//     fontWeight:'600',
//     marginBottom:20
//   }
// });

// export default RoleSelection;




// // components/shared/RoleSelection.js - UPDATED
// import { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// const RoleSelection = ({ onContinue,  selectedR }) => {
//   const [selectedRole, setSelectedRole] = useState(selectedR);

//   // Sync with parent if initialRole changes
//   // useEffect(() => {
//   //   if (initialRole !== selectedRole) {
//   //     setSelectedRole(initialRole);
//   //   }
//   // }, [initialRole]);

//   const handleContinue = () => {
//     if (selectedRole && onContinue) {
//       onContinue(selectedRole);
//     }
//   };

//   return (
//     <View>
//       <Text style={styles.title}>Choose Your Role</Text>
      
//       {/* Host Card */}
//       <TouchableOpacity 
//         style={[
//           styles.card,
//           selectedRole === 'host' && styles.selectedCard
//         ]} 
//         onPress={() => setSelectedRole('host')}
//         activeOpacity={0.7}
//       >
//         {selectedRole === 'host' && (
//           <View style={styles.checkBadge}>
//             <MaterialCommunityIcons name="check" size={16} color="white" />
//           </View>
//         )}
        
//         <View style={styles.itemContent}>
//           <View style={{ marginRight: 10 }}>
//             <MaterialCommunityIcons 
//               name="home-account" 
//               size={40} 
//               color={selectedRole === 'host' ? COLORS.primary : COLORS.gray} 
//             />
//           </View>
//           <View style={{ flexShrink: 1 }}>
//             <Text style={[
//               styles.cardTitle,
//               selectedRole === 'host' && styles.selectedText
//             ]}>
//               I need cleaners
//             </Text>
//             <Text style={selectedRole === 'host' && styles.selectedText}>
//               Keep your rental spotless with trusted professionals.
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Cleaner Card */}
//       <TouchableOpacity 
//         style={[
//           styles.card,
//           selectedRole === 'cleaner' && styles.selectedCard
//         ]} 
//         onPress={() => setSelectedRole('cleaner')}
//         activeOpacity={0.7}
//       >
//         {selectedRole === 'cleaner' && (
//           <View style={styles.checkBadge}>
//             <MaterialCommunityIcons name="check" size={16} color="white" />
//           </View>
//         )}
        
//         <View style={styles.itemContent}>
//           <View style={{ marginRight: 10 }}>
//             <MaterialCommunityIcons 
//               name="broom" 
//               size={40} 
//               color={selectedRole === 'cleaner' ? COLORS.primary : COLORS.gray} 
//             />
//           </View>
//           <View style={{ flexShrink: 1 }}>
//             <Text style={[
//               styles.cardTitle,
//               selectedRole === 'cleaner' && styles.selectedText
//             ]}>
//               I am a cleaner
//             </Text>
//             <Text style={selectedRole === 'cleaner' && styles.selectedText}>
//               Earn money cleaning homes and apartments in your area
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Continue Button - Only shows when a role is selected */}
//       {selectedRole && (
//         <TouchableOpacity 
//           style={styles.continueButton}
//           onPress={handleContinue}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.continueButtonText}>Continue as {selectedRole === 'host' ? 'Host' : 'Cleaner'}</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 22,
//     alignSelf: 'center',
//     fontWeight: '600',
//     marginBottom: 20,
//     color: COLORS.dark,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: COLORS.lightGray,
//     position: 'relative',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primaryLight,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   selectedText: {
//     color: COLORS.dark,
//   },
//   checkBadge: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   continueButton: {
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 30,
//     borderRadius: 50,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   continueButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default RoleSelection;




// components/shared/RoleSelection.js - CORRECTED VERSION
// import { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// const RoleSelection = ({ onContinue }) => {
//   const [selectedRole, setSelectedRole] = useState(null);

//   const handleContinue = () => {
//     console.log('RoleSelection - Continue button clicked');
//     console.log('RoleSelection - selectedRole:', selectedRole);
    
//     if (selectedRole && onContinue) {
//       console.log('RoleSelection - Calling onContinue with:', selectedRole);
//       onContinue(selectedRole);
//     } else {
//       console.log('RoleSelection - Cannot continue:', {
//         selectedRole,
//         hasOnContinue: !!onContinue
//       });
//     }
//   };

//   // Log when role changes
//   const handleRolePress = (role) => {
//     console.log('RoleSelection - Role pressed:', role);
//     setSelectedRole(role);
//   };

//   return (
//     <View>
//       <Text style={styles.title}>Choose Your Role</Text>
      
//       {/* Host Card */}
//       <TouchableOpacity 
//         style={[
//           styles.card,
//           selectedRole === 'host' && styles.selectedCard
//         ]} 
//         onPress={() => handleRolePress('host')}
//         activeOpacity={0.7}
//       >
//         {selectedRole === 'host' && (
//           <View style={styles.checkBadge}>
//             <MaterialCommunityIcons name="check" size={16} color="white" />
//           </View>
//         )}
        
//         <View style={styles.itemContent}>
//           <View style={{ marginRight: 10 }}>
//             <MaterialCommunityIcons 
//               name="home-account" 
//               size={40} 
//               color={selectedRole === 'host' ? COLORS.primary : COLORS.gray} 
//             />
//           </View>
//           <View style={{ flexShrink: 1 }}>
//             <Text style={[
//               styles.cardTitle,
//               selectedRole === 'host' && styles.selectedText
//             ]}>
//               I need cleaners
//             </Text>
//             <Text style={selectedRole === 'host' && styles.selectedText}>
//               Keep your rental spotless with trusted professionals.
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Cleaner Card */}
//       <TouchableOpacity 
//         style={[
//           styles.card,
//           selectedRole === 'cleaner' && styles.selectedCard
//         ]} 
//         onPress={() => handleRolePress('cleaner')}
//         activeOpacity={0.7}
//       >
//         {selectedRole === 'cleaner' && (
//           <View style={styles.checkBadge}>
//             <MaterialCommunityIcons name="check" size={16} color="white" />
//           </View>
//         )}
        
//         <View style={styles.itemContent}>
//           <View style={{ marginRight: 10 }}>
//             <MaterialCommunityIcons 
//               name="broom" 
//               size={40} 
//               color={selectedRole === 'cleaner' ? COLORS.primary : COLORS.gray} 
//             />
//           </View>
//           <View style={{ flexShrink: 1 }}>
//             <Text style={[
//               styles.cardTitle,
//               selectedRole === 'cleaner' && styles.selectedText
//             ]}>
//               I am a cleaner
//             </Text>
//             <Text style={selectedRole === 'cleaner' && styles.selectedText}>
//               Earn money cleaning homes and apartments in your area
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Continue Button */}
//       {selectedRole && (
//         <TouchableOpacity 
//           style={styles.continueButton}
//           onPress={handleContinue}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.continueButtonText}>
//             Continue as {selectedRole === 'host' ? 'Host' : 'Cleaner'}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 22,
//     alignSelf: 'center',
//     fontWeight: '600',
//     marginBottom: 20,
//     color: COLORS.dark,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: COLORS.lightGray,
//     position: 'relative',
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primaryLight,
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   selectedText: {
//     color: COLORS.dark,
//   },
//   checkBadge: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   continueButton: {
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 30,
//     borderRadius: 50,
//   },
//   continueButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default RoleSelection;




// components/shared/RoleSelection.js - UPDATED (No Continue Button)
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const RoleSelection = ({ onRoleSelect, selectedRole }) => {
  // Log when component renders
  console.log('RoleSelection - Selected role:', selectedRole);

  const handleRolePress = (role) => {
    console.log('RoleSelection - Role pressed:', role);
    // Immediately call onRoleSelect when a role is clicked
    if (onRoleSelect) {
      onRoleSelect(role);
    }
  };

  return (
    <View>
      <Text style={styles.title}>Choose Your Role</Text>
      
      {/* Host Card */}
      <TouchableOpacity 
        style={[
          styles.card,
          selectedRole === 'host' && styles.selectedCard
        ]} 
        onPress={() => handleRolePress('host')}
        activeOpacity={0.7}
      >
        {selectedRole === 'host' && (
          <View style={styles.checkBadge}>
            <MaterialCommunityIcons name="check" size={16} color="white" />
          </View>
        )}
        
        <View style={styles.itemContent}>
          <View style={{ marginRight: 10 }}>
            <MaterialCommunityIcons 
              name="home-account" 
              size={40} 
              color={selectedRole === 'host' ? COLORS.primary : COLORS.gray} 
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[
              styles.cardTitle,
              selectedRole === 'host' && styles.selectedText
            ]}>
              I need cleaners
            </Text>
            <Text style={selectedRole === 'host' && styles.selectedText}>
              Keep your rental spotless with trusted professionals.
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Cleaner Card */}
      <TouchableOpacity 
        style={[
          styles.card,
          selectedRole === 'cleaner' && styles.selectedCard
        ]} 
        onPress={() => handleRolePress('cleaner')}
        activeOpacity={0.7}
      >
        {selectedRole === 'cleaner' && (
          <View style={styles.checkBadge}>
            <MaterialCommunityIcons name="check" size={16} color="white" />
          </View>
        )}
        
        <View style={styles.itemContent}>
          <View style={{ marginRight: 10 }}>
            <MaterialCommunityIcons 
              name="broom" 
              size={40} 
              color={selectedRole === 'cleaner' ? COLORS.primary : COLORS.gray} 
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[
              styles.cardTitle,
              selectedRole === 'cleaner' && styles.selectedText
            ]}>
              I am a cleaner
            </Text>
            <Text style={selectedRole === 'cleaner' && styles.selectedText}>
              Earn money cleaning homes and apartments in your area
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    alignSelf: 'center',
    fontWeight: '600',
    marginBottom: 20,
    color: COLORS.dark,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    position: 'relative',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    transform: [{ scale: 1.02 }],
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  selectedText: {
    color: COLORS.dark,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default RoleSelection;