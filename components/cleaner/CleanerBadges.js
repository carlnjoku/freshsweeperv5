import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { BADGE_CONFIG } from '../../utils/cleanerBadges';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const CleanerBadges = ({ badges = [] }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const visibleBadges = badges
    .slice(0, 3)
    .filter((badge) => BADGE_CONFIG[badge]);

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleBadges.map((badge) => {
        const config = BADGE_CONFIG[badge];

        return (
          <View
            key={badge}
            style={[
              styles.badge,
              {
                borderColor: `${config.color}35`,
                backgroundColor: `${config.color}12`,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${config.color}18`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={config.icon}
                size={14}
                color={config.color}
              />
            </View>

            <AppText
              variant="caption"
              style={[
                styles.text,
                {
                  color: config.color,
                },
              ]}
              numberOfLines={1}
            >
              {config.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 7,
      marginTop: 8,
    },

    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 28,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 14,
      borderWidth: 1,
    },

    iconContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 5,
    },

    text: {
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 15,
      maxWidth: 120,
    },
  });

export default CleanerBadges;