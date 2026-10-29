import React, {
    useEffect,
    useRef,
  } from 'react';
  
  import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
  } from 'react-native';
  
  import {
    MaterialCommunityIcons,
  } from '@expo/vector-icons';
  
  import {
    AppText,
  } from '../../ui';
  
  import {
    useTheme,
  } from '../../theme';
  
  import {
    tSafe,
  } from '../../utils/tSafe';
  
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
  
  /* -------------------------------- component -------------------------------- */
  
  const NewRequestsSummaryCard = ({
    requests = [],
    onPress,
  }) => {
    const {
      theme,
    } = useTheme();
  
    const styles =
      createStyles(theme);
  
    const pulse =
      useRef(
        new Animated.Value(1)
      ).current;
  
    useEffect(() => {
      const loop =
        Animated.loop(
          Animated.sequence([
            Animated.timing(
              pulse,
              {
                toValue: 0.25,
                duration: 750,
                useNativeDriver: true,
              }
            ),
  
            Animated.timing(
              pulse,
              {
                toValue: 1,
                duration: 750,
                useNativeDriver: true,
              }
            ),
          ])
        );
  
      loop.start();
  
      return () => {
        loop.stop();
      };
    }, [pulse]);
  
    const count =
      requests.length;
  
    if (count === 0) {
      return null;
    }
  
    const avatars =
      requests.slice(0, 3);
  
    const overflow =
      count - avatars.length;
  
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.summaryCard}
      >
        {/* ----------------------------- decorative orbs ----------------------------- */}
  
        <View
          style={[
            styles.summaryOrb,
            styles.summaryOrbOne,
          ]}
        />
  
        <View
          style={[
            styles.summaryOrb,
            styles.summaryOrbTwo,
          ]}
        />
  
        {/* -------------------------------- icon + live dot ------------------------------- */}
  
        <View
          style={
            styles.summaryIconWrap
          }
        >
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={26}
            color={
              theme.brand.primary
            }
          />
  
          <Animated.View
            style={[
              styles.liveDot,
              {
                opacity: pulse,
              },
            ]}
          />
        </View>
  
        {/* -------------------------------- count + labels ------------------------------- */}
  
        <View
          style={
            styles.summaryCenter
          }
        >
          <View
            style={
              styles.summaryCountRow
            }
          >
            <AppText
              variant="display"
              style={
                styles.summaryCount
              }
            >
              {count}
            </AppText>
  
            <View
              style={
                styles.newPill
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.newPillText
                }
              >
                NEW
              </AppText>
            </View>
          </View>
  
          <AppText
            variant="bodyMedium"
            style={
              styles.summaryLabel
            }
          >
            {count === 1
              ? tSafe(
                  'new_request',
                  'New request'
                )
              : tSafe(
                  'new_requests_plural',
                  'New requests'
                )}
          </AppText>
  
          <AppText
            variant="caption"
            numberOfLines={1}
            style={
              styles.summaryHint
            }
          >
            {tSafe(
              'tap_to_review',
              'Tap to review and accept'
            )}
          </AppText>
        </View>
  
        {/* -------------------------------- avatars + arrow ------------------------------- */}
  
        <View
          style={
            styles.summaryRight
          }
        >
          <View
            style={
              styles.avatarStack
            }
          >
            {avatars.map(
              (request, idx) => (
                <View
                  key={
                    request._id ||
                    request.id ||
                    idx
                  }
                  style={[
                    styles.avatar,
                    {
                      marginLeft:
                        idx === 0
                          ? 0
                          : -12,
  
                      zIndex:
                        10 - idx,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color={
                      theme.brand.primary
                    }
                  />
                </View>
              )
            )}
  
            {overflow > 0 && (
              <View
                style={[
                  styles.avatar,
                  styles.avatarOverflow,
                  {
                    marginLeft: -12,
                    zIndex: 0,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  style={
                    styles.avatarOverflowText
                  }
                >
                  +{overflow}
                </AppText>
              </View>
            )}
          </View>
  
          <View
            style={
              styles.summaryArrow
            }
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={
                theme.icon.inverse
              }
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  /* ---------------------------------- styles --------------------------------- */
  
  const createStyles = (
    theme
  ) =>
    StyleSheet.create({
      summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
  
        backgroundColor:
          theme.surface.selected,
  
        borderRadius: R.lg,
  
        paddingVertical: 18,
        paddingHorizontal: 18,
  
        borderWidth: 1,
  
        borderColor:
          `${theme.brand.primary}35`,
  
        overflow: 'hidden',
  
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
      },
  
      /* ----------------------------- decorative orbs ----------------------------- */
  
      summaryOrb: {
        position: 'absolute',
  
        borderRadius:
          R.pill,
  
        backgroundColor:
          `${theme.brand.primary}0F`,
      },
  
      summaryOrbOne: {
        width: 150,
        height: 150,
  
        top: -80,
        right: -40,
      },
  
      summaryOrbTwo: {
        width: 90,
        height: 90,
  
        bottom: -50,
        left: -25,
  
        backgroundColor:
          `${theme.brand.primary}0A`,
      },
  
      /* -------------------------------- icon -------------------------------- */
  
      summaryIconWrap: {
        width: 56,
        height: 56,
  
        borderRadius: 18,
  
        backgroundColor:
          theme.surface.elevated,
  
        justifyContent: 'center',
        alignItems: 'center',
  
        marginRight: 16,
  
        borderWidth: 1,
  
        borderColor:
          `${theme.brand.primary}30`,
  
        shadowColor:
          theme.shadow?.color ||
          '#000000',
  
        shadowOffset: {
          width: 0,
          height: 5,
        },
  
        shadowOpacity:
          theme.shadow?.opacity ||
          0.08,
  
        shadowRadius: 12,
  
        elevation: 3,
      },
  
      liveDot: {
        position: 'absolute',
  
        top: 8,
        right: 8,
  
        width: 10,
        height: 10,
  
        borderRadius: 5,
  
        backgroundColor:
          theme.status.error,
  
        borderWidth: 2,
  
        borderColor:
          theme.surface.elevated,
      },
  
      /* -------------------------------- center -------------------------------- */
  
      summaryCenter: {
        flex: 1,
        minWidth: 0,
      },
  
      summaryCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
  
      summaryCount: {
        fontSize: 30,
        lineHeight: 34,
  
        fontWeight: '800',
  
        color:
          theme.text.primary,
  
        letterSpacing: -1,
      },
  
      newPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
  
        borderRadius:
          R.pill,
  
        backgroundColor:
          theme.brand.primary,
      },
  
      newPillText: {
        fontSize: 9,
        lineHeight: 12,
  
        fontWeight: '800',
  
        color:
          theme.text.inverse,
  
        letterSpacing: 0.8,
      },
  
      summaryLabel: {
        fontSize: 14,
        lineHeight: 19,
  
        fontWeight: '600',
  
        color:
          theme.text.primary,
  
        marginTop: 2,
      },
  
      summaryHint: {
        fontSize: 12,
        lineHeight: 17,
  
        color:
          theme.text.secondary,
  
        marginTop: 3,
  
        fontWeight: '500',
      },
  
      /* -------------------------------- right -------------------------------- */
  
      summaryRight: {
        alignItems: 'flex-end',
  
        gap: 10,
  
        marginLeft: 8,
      },
  
      avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
      },
  
      avatar: {
        width: 30,
        height: 30,
  
        borderRadius: 15,
  
        backgroundColor:
          `${theme.brand.primary}18`,
  
        borderWidth: 2,
  
        borderColor:
          theme.surface.selected,
  
        justifyContent: 'center',
        alignItems: 'center',
      },
  
      avatarOverflow: {
        backgroundColor:
          theme.brand.primary,
      },
  
      avatarOverflowText: {
        fontSize: 10,
        lineHeight: 13,
  
        fontWeight: '800',
  
        color:
          theme.text.inverse,
      },
  
      /* -------------------------------- arrow -------------------------------- */
  
      summaryArrow: {
        width: 34,
        height: 34,
  
        borderRadius: 17,
  
        backgroundColor:
          theme.brand.primary,
  
        justifyContent: 'center',
        alignItems: 'center',
  
        shadowColor:
          theme.brand.primary,
  
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 4,
      },
    });
  
  export default NewRequestsSummaryCard;




// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// /* ---------------------------------- tokens --------------------------------- */

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

// /* -------------------------------- component -------------------------------- */

// const NewRequestsSummaryCard = ({ requests = [], onPress }) => {
//   const pulse = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, {
//           toValue: 0.25,
//           duration: 750,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulse, {
//           toValue: 1,
//           duration: 750,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [pulse]);

//   const count = requests.length;
//   if (count === 0) return null;

//   const avatars = requests.slice(0, 3);
//   const overflow = count - avatars.length;

//   return (
//     <TouchableOpacity
//       activeOpacity={0.88}
//       onPress={onPress}
//       style={styles.summaryCard}
//     >
//       {/* decorative orbs */}
//       <View style={[styles.summaryOrb, styles.summaryOrbOne]} />
//       <View style={[styles.summaryOrb, styles.summaryOrbTwo]} />

//       {/* icon + live dot */}
//       <View style={styles.summaryIconWrap}>
//         <MaterialCommunityIcons
//           name="clipboard-text-outline"
//           size={26}
//           color={COLORS.primary}
//         />
//         <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
//       </View>

//       {/* count + labels */}
//       <View style={styles.summaryCenter}>
//         <View style={styles.summaryCountRow}>
//           <Text style={styles.summaryCount}>{count}</Text>
//           <View style={styles.newPill}>
//             <Text style={styles.newPillText}>NEW</Text>
//           </View>
//         </View>
//         <Text style={styles.summaryLabel}>
//           {count === 1
//             ? tSafe('new_request', 'New request')
//             : tSafe('new_requests_plural', 'New requests')}
//         </Text>
//         <Text style={styles.summaryHint} numberOfLines={1}>
//           {tSafe('tap_to_review', 'Tap to review and accept')}
//         </Text>
//       </View>

//       {/* avatars + arrow */}
//       <View style={styles.summaryRight}>
//         <View style={styles.avatarStack}>
//           {avatars.map((r, idx) => (
//             <View
//               key={r._id || r.id || idx}
//               style={[
//                 styles.avatar,
//                 { marginLeft: idx === 0 ? 0 : -12, zIndex: 10 - idx },
//               ]}
//             >
//               <MaterialCommunityIcons
//                 name="account"
//                 size={16}
//                 color={COLORS.primary}
//               />
//             </View>
//           ))}
//           {overflow > 0 && (
//             <View
//               style={[
//                 styles.avatar,
//                 styles.avatarOverflow,
//                 { marginLeft: -12, zIndex: 0 },
//               ]}
//             >
//               <Text style={styles.avatarOverflowText}>+{overflow}</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.summaryArrow}>
//           <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// /* ---------------------------------- styles --------------------------------- */

// const styles = StyleSheet.create({
//   summaryCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F4F8FF',
//     borderRadius: R.lg,
//     paddingVertical: 18,
//     paddingHorizontal: 18,
//     borderWidth: 1,
//     borderColor: COLORS.primary + '22',
//     overflow: 'hidden',
//     ...cardShadow,
//   },
//   summaryOrb: {
//     position: 'absolute',
//     borderRadius: R.pill,
//     backgroundColor: COLORS.primary + '0F',
//   },
//   summaryOrbOne: { width: 150, height: 150, top: -80, right: -40 },
//   summaryOrbTwo: {
//     width: 90,
//     height: 90,
//     bottom: -50,
//     left: -25,
//     backgroundColor: COLORS.primary + '0A',
//   },

//   summaryIconWrap: {
//     width: 56,
//     height: 56,
//     borderRadius: 18,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//     borderWidth: 1,
//     borderColor: COLORS.primary + '1F',
//     ...cardShadow,
//   },
//   liveDot: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#EF4444',
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//   },

//   summaryCenter: { flex: 1 },
//   summaryCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   summaryCount: {
//     fontSize: 30,
//     fontWeight: '800',
//     color: TEXT,
//     letterSpacing: -1,
//   },
//   newPill: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: R.pill,
//     backgroundColor: COLORS.primary,
//   },
//   newPillText: {
//     fontSize: 9,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     letterSpacing: 0.8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: TEXT,
//     marginTop: 2,
//   },
//   summaryHint: {
//     fontSize: 12,
//     color: MUTED,
//     marginTop: 3,
//     fontWeight: '500',
//   },

//   summaryRight: { alignItems: 'flex-end', gap: 10, marginLeft: 8 },
//   avatarStack: { flexDirection: 'row', alignItems: 'center' },
//   avatar: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: COLORS.primary + '14',
//     borderWidth: 2,
//     borderColor: '#F4F8FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarOverflow: { backgroundColor: COLORS.primary },
//   avatarOverflowText: {
//     fontSize: 10,
//     fontWeight: '800',
//     color: '#FFFFFF',
//   },
//   summaryArrow: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.35,
//     shadowRadius: 10,
//     elevation: 4,
//   },
// });

// export default NewRequestsSummaryCard;