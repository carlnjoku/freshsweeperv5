import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import {
  AntDesign,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import ROUTES from '../../constants/routes';
import CircleIconNoLabel from '../shared/CirecleIconNoLabel';
import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';
import { AppText, AppCard } from '../../ui';

const { width } = Dimensions.get('window');

const PropertyCardList = ({
  properties = [],
  handleHostPress,
  currentUserId,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const hasProperties =
    properties &&
    properties.length > 0;

  return (
    <View style={styles.container}>
      <AppCard
        padding="medium"
        radius="large"
        bordered
        elevated
        style={styles.card}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <View style={styles.headerRow}>
          <AppText
            variant="title"
            style={styles.title}
          >
            {tSafe(
              'my_properties',
              'My Properties'
            )}
          </AppText>

          <CircleIconNoLabel
            iconName="plus"
            buttonSize={30}
            radiusSise={15}
            iconSize={16}
            onPress={handleHostPress}
          />
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Divider                                                          */}
        {/* ---------------------------------------------------------------- */}

        <View style={styles.line} />

        {/* ---------------------------------------------------------------- */}
        {/* Content                                                          */}
        {/* ---------------------------------------------------------------- */}

        <View style={styles.content}>
          {hasProperties ? (
            <>
              {properties
                .slice(0, 2)
                .map((property) => (
                  <TouchableOpacity
                    key={property._id}
                    onPress={() =>
                      navigation.navigate(
                        ROUTES.host_apt_dashboard,
                        {
                          propertyId:
                            property._id,
                          hostId:
                            currentUserId,
                          property,
                        }
                      )
                    }
                    style={
                      styles.propertyItem
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={
                        styles.leftSection
                      }
                    >
                      <AntDesign
                        name="home"
                        size={20}
                        color={
                          theme.icon.muted
                        }
                        style={
                          styles.homeIcon
                        }
                      />

                      <View
                        style={
                          styles.propertyTextContainer
                        }
                      >
                        <AppText
                          variant="bodyMedium"
                          numberOfLines={1}
                          style={
                            styles.propertyName
                          }
                        >
                          {property.apt_name}
                        </AppText>

                        <AppText
                          variant="caption"
                          numberOfLines={1}
                          style={
                            styles.propertyAddress
                          }
                        >
                          {property.address}
                        </AppText>
                      </View>
                    </View>

                    <AntDesign
                      name="right"
                      size={16}
                      color={
                        theme.icon.muted
                      }
                    />
                  </TouchableOpacity>
                ))}

              {/* ---------------------------------------------------------- */}
              {/* View All                                                    */}
              {/* ---------------------------------------------------------- */}

              {properties.length > 2 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      ROUTES.host_my_apartment
                    )
                  }
                  style={
                    styles.viewAllContainer
                  }
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="label"
                    color={
                      theme.brand.primary
                    }
                    style={
                      styles.viewAllText
                    }
                  >
                    {tSafe(
                      'view_all',
                      'View All'
                    )}
                  </AppText>
                </TouchableOpacity>
              )}
            </>
          ) : (
            /* -------------------------------------------------------------- */
            /* Empty State                                                    */
            /* -------------------------------------------------------------- */

            <View
              style={
                styles.emptyStateContainer
              }
            >
              {/* ---------------------------------------------------------- */}
              {/* Empty State Icon                                            */}
              {/* ---------------------------------------------------------- */}

              <View
                style={
                  styles.emptyIconContainer
                }
              >
                <AntDesign
                  name="home"
                  size={40}
                  color={
                    theme.text.disabled
                  }
                />
              </View>

              {/* ---------------------------------------------------------- */}
              {/* Empty State Title                                           */}
              {/* ---------------------------------------------------------- */}

              <AppText
                variant="title"
                style={
                  styles.emptyTitle
                }
              >
                {tSafe(
                  'no_properties_yet',
                  'No Properties Yet'
                )}
              </AppText>

              {/* ---------------------------------------------------------- */}
              {/* Empty State Description                                     */}
              {/* ---------------------------------------------------------- */}

              <AppText
                variant="body"
                style={
                  styles.emptyDescription
                }
              >
                {tSafe(
                  'add_first_property_description',
                  'Add your first property to start managing cleaning schedules'
                )}
              </AppText>

              {/* ---------------------------------------------------------- */}
              {/* Add Property Button                                         */}
              {/* ---------------------------------------------------------- */}

              <TouchableOpacity
                style={
                  styles.addButton
                }
                onPress={
                  handleHostPress
                }
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color={
                    theme.button
                      .primaryText
                  }
                  style={
                    styles.addButtonIcon
                  }
                />

                <AppText
                  variant="label"
                  color={
                    theme.button
                      .primaryText
                  }
                  style={
                    styles.addButtonText
                  }
                >
                  {tSafe(
                    'add_first_property',
                    'Add First Property'
                  )}
                </AppText>
              </TouchableOpacity>

              {/* ---------------------------------------------------------- */}
              {/* Learn More - Optional                                       */}
              {/* ---------------------------------------------------------- */}

              {/*
              <TouchableOpacity
                style={styles.learnMoreContainer}
                onPress={() =>
                  navigation.navigate(
                    ROUTES.host_help || 'Help'
                  )
                }
                activeOpacity={0.7}
              >
                <AppText
                  variant="label"
                  color={theme.brand.primary}
                  style={styles.learnMoreText}
                >
                  Learn how to add and manage properties
                </AppText>

                <AntDesign
                  name="right"
                  size={14}
                  color={theme.brand.primary}
                />
              </TouchableOpacity>
              */}
            </View>
          )}
        </View>
      </AppCard>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  STYLES                                    */
/* -------------------------------------------------------------------------- */

const createStyles = (theme) =>
  StyleSheet.create({
    /* ---------------------------------------------------------------------- */
    /* Container / Card                                                       */
    /* ---------------------------------------------------------------------- */

    container: {
      width: '100%',
      marginHorizontal: 0,
    },

    card: {
      width: '100%',
    },

    /* ---------------------------------------------------------------------- */
    /* Header                                                                 */
    /* ---------------------------------------------------------------------- */

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    title: {
      fontSize: 18,
      fontWeight: '700',
    },

    line: {
      borderBottomWidth: 1,
      borderColor:
        theme.divider,
      marginVertical: 10,
    },

    /* ---------------------------------------------------------------------- */
    /* Content                                                                */
    /* ---------------------------------------------------------------------- */

    content: {
      gap: 12,
    },

    /* ---------------------------------------------------------------------- */
    /* Property Item                                                          */
    /* ---------------------------------------------------------------------- */

    propertyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      paddingVertical: 8,

      borderRadius: 10,
    },

    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    homeIcon: {
      marginRight: 10,
    },

    propertyTextContainer: {
      flex: 1,
      paddingRight: 10,
    },

    propertyName: {
      fontWeight: '600',
    },

    propertyAddress: {
      marginTop: 2,
    },

    /* ---------------------------------------------------------------------- */
    /* View All                                                               */
    /* ---------------------------------------------------------------------- */

    viewAllContainer: {
      alignItems: 'flex-end',
      marginTop: 10,
    },

    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
    },

    /* ---------------------------------------------------------------------- */
    /* Empty State                                                            */
    /* ---------------------------------------------------------------------- */

    emptyStateContainer: {
      paddingVertical: 20,

      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyIconContainer: {
      width: 80,
      height: 80,

      borderRadius: 40,

      backgroundColor:
        theme.background.sunken,

      justifyContent: 'center',
      alignItems: 'center',

      marginBottom: 16,

      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',

      marginBottom: 8,

      textAlign: 'center',
    },

    emptyDescription: {
      fontSize: 14,

      color:
        theme.text.secondary,

      textAlign: 'center',

      marginBottom: 24,

      lineHeight: 20,

      paddingHorizontal: 20,
    },

    /* ---------------------------------------------------------------------- */
    /* Add Property Button                                                    */
    /* ---------------------------------------------------------------------- */

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.button
          .primaryBackground,

      paddingVertical: 12,
      paddingHorizontal: 24,

      borderRadius: 8,

      marginBottom: 16,

      minWidth: width * 0.6,

      shadowColor:
        theme.button
          .primaryBackground,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.18,
      shadowRadius: 8,

      elevation: 3,
    },

    addButtonIcon: {
      marginRight: 8,
    },

    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },

    /* ---------------------------------------------------------------------- */
    /* Learn More                                                             */
    /* ---------------------------------------------------------------------- */

    learnMoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },

    learnMoreText: {
      fontSize: 14,
      marginRight: 4,
    },
  });

export default PropertyCardList;