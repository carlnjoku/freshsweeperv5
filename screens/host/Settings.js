// import React from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import { List, Switch, Divider, Button } from 'react-native-paper';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import COLORS from '../../constants/colors';

// const Settings = () => {
//   const navigation = useNavigation()
//   const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

//   const handleLogout = () => {
//     Alert.alert('Logout', 'Are you sure you want to log out?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Logout', onPress: () => console.log('Logged out') },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Update Profile */}
//       <List.Item
//         title="Update Profile"
//         description="Edit your personal details"
//         left={(props) => <List.Icon {...props} icon="account-edit" />}
//         onPress={() => navigation.navigate(ROUTES.host_profile)}
//       />
//       <Divider />

//       {/* Notification Preferences */}
//       <List.Item
//         title="Notification Preferences"
//         description="Enable or disable notifications"
//         left={(props) => <List.Icon {...props} icon="bell-outline" />}
//         right={() => (
//           // <Switch
//           //   value={notificationsEnabled}
//           //   onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
//           // />

//           <Switch
//             value={notificationsEnabled}
//             onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
//             thumbColor={notificationsEnabled ? COLORS.primary : "#f4f3f4"} // Color of the switch knob
//             trackColor={{ false: "#767577", true: COLORS.primary_light }} // Color of the track
//             ios_backgroundColor="#3e3e3e" // Background color for iOS
//           />
          
//         )}
//       />
//       <Divider />

//       {/* Change Password */}
//       <List.Item
//         title="Change Language"
//         description="Switch to you favorite language"
//         left={(props) => <List.Icon {...props} icon="translate" />}
//         onPress={() => navigation.navigate(ROUTES.host_change_language)}
//       />
//       <Divider />
//       <List.Item
//         title="Change Password"
//         description="Update your account password"
//         left={(props) => <List.Icon {...props} icon="lock-outline" />}
//         onPress={() => navigation.navigate(ROUTES.host_change_password)}
//       />
//       <Divider />

//       {/* Logout */}
     
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   logoutButton: {
//     margin: 16,
//     backgroundColor: COLORS.primary,
//   },
// });

// export default Settings;


import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { List, Switch, Divider, Button } from 'react-native-paper';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const Settings = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      tSafe('logout_title', 'Logout'),
      tSafe('logout_message', 'Are you sure you want to log out?'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        { text: tSafe('logout', 'Logout'), onPress: () => console.log('Logged out') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Update Profile */}
      <List.Item
        title={tSafe('update_profile', 'Update Profile')}
        description={tSafe('edit_personal_details', 'Edit your personal details')}
        left={(props) => <List.Icon {...props} icon="account-edit" />}
        onPress={() => navigation.navigate(ROUTES.host_profile)}
      />
      <Divider />

      {/* Notification Preferences */}
      <List.Item
        title={tSafe('notification_preferences', 'Notification Preferences')}
        description={tSafe('enable_disable_notifications', 'Enable or disable notifications')}
        left={(props) => <List.Icon {...props} icon="bell-outline" />}
        right={() => (
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            thumbColor={notificationsEnabled ? COLORS.primary : "#f4f3f4"}
            trackColor={{ false: "#767577", true: COLORS.primary_light }}
            ios_backgroundColor="#3e3e3e"
          />
        )}
      />
      <Divider />

      {/* Change Language */}
      <List.Item
        title={tSafe('change_language', 'Change Language')}
        description={tSafe('switch_to_favorite_language', 'Switch to your favorite language')}
        left={(props) => <List.Icon {...props} icon="translate" />}
        onPress={() => navigation.navigate(ROUTES.host_change_language)}
      />
      <Divider />

      {/* Change Password */}
      <List.Item
        title={tSafe('change_password', 'Change Password')}
        description={tSafe('update_account_password', 'Update your account password')}
        left={(props) => <List.Icon {...props} icon="lock-outline" />}
        onPress={() => navigation.navigate(ROUTES.host_change_password)}
      />
      <Divider />

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={COLORS.error}
        textColor="#fff"
      >
        {tSafe('logout', 'Logout')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
  },
});

export default Settings;