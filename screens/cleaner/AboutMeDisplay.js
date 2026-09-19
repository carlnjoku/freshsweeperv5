import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tSafe } from '../../utils/tSafe';
// Keep your existing COLORS import if your project already has one.
// Example:
// import { COLORS } from '../../constants/colors';
import COLORS from '../../constants/colors';

const MAX_CHARS = 80;

const AboutMeDisplay = ({
  mode = 'edit',
  aboutme = '',
  isHost = false,
  onEdit,
}) => {
  const [expanded, setExpanded] = useState(false);

  /*
   * Host profiles and display mode are ALWAYS read-only.
   * This prevents the edit icon from appearing even if another
   * prop accidentally enables editing.
   */
  const isReadOnly = mode === 'display' || isHost;

  const normalizedAboutMe =
    typeof aboutme === 'string'
      ? aboutme.trim()
      : '';

  const hasAboutMe = normalizedAboutMe.length > 0;

  const isLongContent =
    normalizedAboutMe.length > MAX_CHARS;

  const displayedText =
    !expanded && isLongContent
      ? `${normalizedAboutMe
          .slice(0, MAX_CHARS)
          .trim()}…`
      : normalizedAboutMe;

  return (
    <View style={styles.aboutCard}>

      {/* =========================
          HEADER
      ========================= */}
      <View style={styles.aboutHeader}>
        <View style={styles.aboutTitleRow}>
          <View style={styles.aboutIconContainer}>
            <MaterialCommunityIcons
              name="account-heart-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.aboutTitleContent}>
            <Text style={styles.aboutTitle}>
              About Me
            </Text>

            <Text style={styles.aboutSubtitle}>
              A little about this cleaner
            </Text>
          </View>
        </View>

        {/* 
          EDIT BUTTON
          Will NEVER render when:
          - mode === "display"
          - isHost === true
        */}
        {!isReadOnly && onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color={COLORS.primary}
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* =========================
          CONTENT
      ========================= */}
      <View style={styles.aboutContent}>
        {hasAboutMe ? (
          <>
            <Text style={styles.aboutText}>
              {displayedText}
            </Text>

            {/* 
              Only show Read More / Read Less
              when the content is actually long.
            */}
            {isLongContent && (
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() =>
                  setExpanded(previous => !previous)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>
                  {expanded ? 'Read less' : 'Read more'}
                </Text>

                <MaterialCommunityIcons
                  name={
                    expanded
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={18}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* =========================
             EMPTY STATE
          ========================= */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons
                name="account-heart-outline"
                size={34}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {tSafe(
                'no_about_me_title',
                'No About Me Yet'
              )}
            </Text>

            <Text style={styles.emptySubtitle}>
              {tSafe(
                'no_about_me_desc',
                'This cleaner has not added a personal description yet.'
              )}
            </Text>

            {/* Only show this in cleaner edit mode */}
            {mode === 'edit' &&
              !isHost &&
              typeof onEdit === 'function' && (
                <TouchableOpacity
                  style={styles.emptyEditButton}
                  onPress={onEdit}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={17}
                    color={COLORS.primary}
                  />

                  <Text style={styles.emptyEditButtonText}>
                    {tSafe('add_about_me', 'Add About Me')}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },

  /* =========================
     HEADER
  ========================= */

  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
    paddingTop: 8,
    paddingBottom: 14,
  },

  aboutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  aboutIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  aboutTitleContent: {
    flex: 1,
  },

  aboutTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },

  aboutSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },

  /* =========================
     EDIT BUTTON
  ========================= */

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '10',
  },

  editButtonText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* =========================
     CONTENT
  ========================= */

  aboutContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  aboutText: {
    fontSize: 14,
    lineHeight: 23,
    color: COLORS.gray,
  },

  /* =========================
     READ MORE / LESS
  ========================= */

  readMoreButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },

  readMoreText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.primary,
    marginRight: 2,
  },

  /* =========================
     EMPTY STATE
  ========================= */

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  
  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },
  
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  
  emptyEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '10',
  },
  
  emptyEditButtonText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default AboutMeDisplay;

// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const AboutMeDisplay = ({ aboutme, handleOpenAboutMe }) => {
//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={[styles.iconContainer, { backgroundColor: '#F0F0F5' }]}>
//             <MaterialCommunityIcons name="account-details-outline" size={20} color="#6B7280" />
//           </View>
//           <Text style={styles.title}>{tSafe('about_me', 'About Me')}</Text>
//         </View>
//         <TouchableOpacity onPress={handleOpenAboutMe} style={styles.editButton}>
//           <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.divider} />

//       {aboutme ? (
//         <Text style={styles.aboutText}>{aboutme}</Text>
//       ) : (
//         <View style={styles.emptyState}>
//           <MaterialCommunityIcons name="note-text-outline" size={28} color="#D1D5DB" />
//           <Text style={styles.emptyText}>{tSafe('no_about_me', 'No about me info added yet')}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   editButton: {
//     padding: 6,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   aboutText: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: COLORS.gray,
//     paddingHorizontal: 4,
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   emptyText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
// });

// export default AboutMeDisplay;