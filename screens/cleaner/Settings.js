import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import {
  List,
  Switch,
  Divider,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme';

const Settings = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  console.log('SETTINGS THEME DEBUG:', {
    isDark,
    background: theme.background?.default,
    surface: theme.surface?.default,
    elevated: theme.surface?.elevated,
    text: theme.text?.primary,
});

  const { logout } = useContext(AuthContext);

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = React.useState(true);

  const styles = createStyles(theme);

  const handleLogout = () => {
    Alert.alert(
      tSafe('logout_title', 'Logout'),
      tSafe(
        'logout_message',
        'Are you sure you want to log out?'
      ),
      [
        {
          text: tSafe('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: tSafe('logout', 'Logout'),
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      {/* Update Profile */}
      <List.Item
        title={tSafe(
          'update_profile',
          'Update Profile'
        )}
        description={tSafe(
          'edit_personal_details',
          'Edit your personal details'
        )}
        titleStyle={styles.listTitle}
        descriptionStyle={
          styles.listDescription
        }
        left={(props) => (
          <List.Icon
            {...props}
            icon="account-edit"
            color={theme.icon.default}
          />
        )}
        onPress={() =>
          navigation.navigate(
            ROUTES.host_profile
          )
        }
        style={styles.listItem}
      />

      <Divider style={styles.divider} />

      {/* Notification Preferences */}
      <List.Item
        title={tSafe(
          'notification_preferences',
          'Notification Preferences'
        )}
        description={tSafe(
          'enable_disable_notifications',
          'Enable or disable notifications'
        )}
        titleStyle={styles.listTitle}
        descriptionStyle={
          styles.listDescription
        }
        left={(props) => (
          <List.Icon
            {...props}
            icon="bell-outline"
            color={theme.icon.default}
          />
        )}
        right={() => (
          <Switch
            value={notificationsEnabled}
            onValueChange={() =>
              setNotificationsEnabled(
                !notificationsEnabled
              )
            }
            thumbColor={
              notificationsEnabled
                ? theme.brand.primary
                : theme.text.disabled
            }
            trackColor={{
              false: theme.border.default,
              true: theme.brand.primaryLight,
            }}
            ios_backgroundColor={
              theme.border.default
            }
          />
        )}
        style={styles.listItem}
      />

      <Divider style={styles.divider} />

      {/* Change Language */}
      <List.Item
        title={tSafe(
          'change_language',
          'Change Language'
        )}
        description={tSafe(
          'switch_to_favorite_language',
          'Switch to your favorite language'
        )}
        titleStyle={styles.listTitle}
        descriptionStyle={
          styles.listDescription
        }
        left={(props) => (
          <List.Icon
            {...props}
            icon="translate"
            color={theme.icon.default}
          />
        )}
        onPress={() =>
          navigation.navigate(
            ROUTES.cleaner_change_language
          )
        }
        style={styles.listItem}
      />

      <Divider style={styles.divider} />

      {/* Change Password */}
      <List.Item
        title={tSafe(
          'change_password',
          'Change Password'
        )}
        description={tSafe(
          'update_account_password',
          'Update your account password'
        )}
        titleStyle={styles.listTitle}
        descriptionStyle={
          styles.listDescription
        }
        left={(props) => (
          <List.Icon
            {...props}
            icon="lock-outline"
            color={theme.icon.default}
          />
        )}
        onPress={() =>
          navigation.navigate(
            ROUTES.cleaner_change_password
          )
        }
        style={styles.listItem}
      />

      <Divider style={styles.divider} />

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={theme.status.error}
        textColor={theme.text.inverse}
        contentStyle={
          styles.logoutButtonContent
        }
      >
        {tSafe('logout', 'Logout')}
      </Button>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    listItem: {
      backgroundColor:
        theme.surface.default,
      paddingVertical: 8,
    },

    listTitle: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '500',
    },

    listDescription: {
      color: theme.text.secondary,
      marginTop: 2,
    },

    divider: {
      backgroundColor: theme.divider,
    },

    logoutButton: {
      margin: 16,
      marginTop: 24,
      borderRadius: 12,
    },

    logoutButtonContent: {
      minHeight: 48,
    },
  });

export default Settings;