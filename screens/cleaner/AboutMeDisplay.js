// import React, { useState, useRef, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
// import EmptyPlaceholder from '../../components/shared/EmptyPlaceholder';
// import COLORS from '../../constants/colors';

// export default function AboutMeDisplay({ aboutme, handleOpenAboutMe, mode }) {
//   const [expanded, setExpanded] = useState(false);
//   const [isLongText, setIsLongText] = useState(false);
//   const MAX_LINES = 3; // show roughly two lines
//   const CHAR_LIMIT = 100; // fallback: if text longer than 100 chars, show button

//   const toggleExpanded = () => setExpanded(!expanded);

//   const handleTextLayout = (event) => {
//     const { lines } = event.nativeEvent;
//     if (lines.length > MAX_LINES) {
//       setIsLongText(true);
//     }
//   };

//   // Fallback: if onTextLayout doesn't fire, use character count
//   useEffect(() => {
//     if (aboutme && aboutme.length > CHAR_LIMIT) {
//       setIsLongText(true);
//     }
//   }, [aboutme]);

//   return (
//     <CardNoPrimary style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={styles.iconWrapper}>
//             <MaterialCommunityIcons
//               name="account-outline"
//               size={22}
//               color={COLORS.white}
//             />
//           </View>
//           <Text style={styles.title}>About Me</Text>
//         </View>
//         {mode === 'edit' && (
//           <TouchableOpacity onPress={handleOpenAboutMe} style={styles.editButton}>
//             <CircleIconNoLabel
//               onPress={handleOpenAboutMe}
//               iconName="pencil"
//               buttonSize={36}
//               radiusSise={18}
//               iconSize={20}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.content}>
//         {aboutme ? (
//           <>
//             {expanded ? (
//               <Text style={styles.aboutme}>{aboutme}</Text>
//             ) : (
//               <Text
//                 style={styles.aboutme}
//                 numberOfLines={MAX_LINES}
//                 onTextLayout={handleTextLayout}
//               >
//                 {aboutme}
//               </Text>
//             )}
//             {isLongText && (
//               <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
//                 <Text style={styles.readMoreText}>
//                   {expanded ? 'Show less' : 'Read more'}
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </>
//         ) : (
//           <EmptyPlaceholder
//             icon="account-outline"
//             message="Cleaner has not updated their profile."
//           />
//         )}
//       </View>
//     </CardNoPrimary>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconWrapper: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     letterSpacing: 0.3,
//   },
//   editButton: {
//     padding: 4,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   content: {
//     minHeight: 60,
//     justifyContent: 'center',
//   },
//   aboutme: {
//     fontSize: 15,
//     color: '#5E5E71',
//     lineHeight: 22,
//     paddingVertical: 4,
//     fontWeight: '400',
//   },
//   readMoreButton: {
//     marginTop: 2,
//     alignSelf: 'flex-start',
//   },
//   readMoreText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
// });




import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardNoPrimary from '../../components/shared/CardNoPrimary';
import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
import EmptyPlaceholder from '../../components/shared/EmptyPlaceholder';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe'; // added import

export default function AboutMeDisplay({ aboutme, handleOpenAboutMe, mode }) {
  const [expanded, setExpanded] = useState(false);
  const [isLongText, setIsLongText] = useState(false);
  const MAX_LINES = 3; // show roughly two lines
  const CHAR_LIMIT = 100; // fallback: if text longer than 100 chars, show button

  const toggleExpanded = () => setExpanded(!expanded);

  const handleTextLayout = (event) => {
    const { lines } = event.nativeEvent;
    if (lines.length > MAX_LINES) {
      setIsLongText(true);
    }
  };

  // Fallback: if onTextLayout doesn't fire, use character count
  useEffect(() => {
    if (aboutme && aboutme.length > CHAR_LIMIT) {
      setIsLongText(true);
    }
  }, [aboutme]);

  return (
    <CardNoPrimary style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.title}>{tSafe('about_me', 'About Me')}</Text>
        </View>
        {mode === 'edit' && (
          <TouchableOpacity onPress={handleOpenAboutMe} style={styles.editButton}>
            <CircleIconNoLabel
              onPress={handleOpenAboutMe}
              iconName="pencil"
              buttonSize={36}
              radiusSise={18}
              iconSize={20}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {aboutme ? (
          <>
            {expanded ? (
              <Text style={styles.aboutme}>{aboutme}</Text>
            ) : (
              <Text
                style={styles.aboutme}
                numberOfLines={MAX_LINES}
                onTextLayout={handleTextLayout}
              >
                {aboutme}
              </Text>
            )}
            {isLongText && (
              <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>
                  {expanded ? tSafe('show_less', 'Show less') : tSafe('read_more', 'Read more')}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <EmptyPlaceholder
            icon="account-outline"
            message={tSafe('cleaner_not_updated_profile', 'Cleaner has not updated their profile.')}
          />
        )}
      </View>
    </CardNoPrimary>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    letterSpacing: 0.3,
  },
  editButton: {
    padding: 4,
    backgroundColor: '#F8F9FC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  content: {
    minHeight: 60,
    justifyContent: 'center',
  },
  aboutme: {
    fontSize: 15,
    color: '#5E5E71',
    lineHeight: 22,
    paddingVertical: 4,
    fontWeight: '400',
  },
  readMoreButton: {
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});