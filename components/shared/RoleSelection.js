// // components/shared/RoleSelection.js - UPDATED (No Continue Button)
// import { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// const RoleSelection = ({ onRoleSelect, selectedRole }) => {
//   // Log when component renders
//   console.log('RoleSelection - Selected role:', selectedRole);

//   const handleRolePress = (role) => {
//     console.log('RoleSelection - Role pressed:', role);
//     // Immediately call onRoleSelect when a role is clicked
//     if (onRoleSelect) {
//       onRoleSelect(role);
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
//     transform: [{ scale: 1.02 }],
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
// });

// export default RoleSelection;



// components/shared/RoleSelection.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../theme';


const RoleSelection = ({
  onRoleSelect,
  selectedRole,
}) => {
  const { theme } = useTheme();

  const handleRolePress = (role) => {
    console.log(
      'RoleSelection - Role pressed:',
      role
    );

    if (onRoleSelect) {
      onRoleSelect(role);
    }
  };

  const isHostSelected =
    selectedRole === 'host';

  const isCleanerSelected =
    selectedRole === 'cleaner';

  return (
    <View style={styles.container}>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: theme.text.primary,
          },
        ]}
      >
        Choose Your Role
      </Text>


      {/* ------------------------------------------------------------------ */}
      {/* HOST                                                               */}
      {/* ------------------------------------------------------------------ */}

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor:
              theme.card.background,

            borderColor:
              theme.card.border,
          },

          isHostSelected && {
            backgroundColor:
              theme.surface.selected,

            borderColor:
              theme.brand.primary,

            shadowColor:
              theme.brand.primary,
          },
        ]}
        onPress={() =>
          handleRolePress('host')
        }
        activeOpacity={0.8}
      >

        {/* Selected Badge */}
        {isHostSelected && (
          <View
            style={[
              styles.checkBadge,
              {
                backgroundColor:
                  theme.brand.primary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check"
              size={15}
              color={theme.text.inverse}
            />
          </View>
        )}


        <View style={styles.itemContent}>

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  isHostSelected
                    ? theme.brand.primaryLight
                    : theme.background.sunken,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="home-account"
              size={34}
              color={
                isHostSelected
                  ? theme.brand.primary
                  : theme.icon.muted
              }
            />
          </View>


          {/* Text */}
          <View style={styles.textContainer}>

            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              I need cleaners
            </Text>

            <Text
              style={[
                styles.cardDescription,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              Keep your rental spotless with
              trusted professionals.
            </Text>

          </View>

        </View>

      </TouchableOpacity>


      {/* ------------------------------------------------------------------ */}
      {/* CLEANER                                                            */}
      {/* ------------------------------------------------------------------ */}

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor:
              theme.card.background,

            borderColor:
              theme.card.border,
          },

          isCleanerSelected && {
            backgroundColor:
              theme.surface.selected,

            borderColor:
              theme.brand.primary,

            shadowColor:
              theme.brand.primary,
          },
        ]}
        onPress={() =>
          handleRolePress('cleaner')
        }
        activeOpacity={0.8}
      >

        {/* Selected Badge */}
        {isCleanerSelected && (
          <View
            style={[
              styles.checkBadge,
              {
                backgroundColor:
                  theme.brand.primary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check"
              size={15}
              color={theme.text.inverse}
            />
          </View>
        )}


        <View style={styles.itemContent}>

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  isCleanerSelected
                    ? theme.brand.primaryLight
                    : theme.background.sunken,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="broom"
              size={34}
              color={
                isCleanerSelected
                  ? theme.brand.primary
                  : theme.icon.muted
              }
            />
          </View>


          {/* Text */}
          <View style={styles.textContainer}>

            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              I am a cleaner
            </Text>

            <Text
              style={[
                styles.cardDescription,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              Earn money cleaning homes and
              apartments in your area.
            </Text>

          </View>

        </View>

      </TouchableOpacity>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    alignSelf: 'center',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    minHeight: 112,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    position: 'relative',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },

  textContainer: {
    flex: 1,
    paddingRight: 4,
  },

  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    marginBottom: 5,
  },

  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },

  checkBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});


export default RoleSelection;