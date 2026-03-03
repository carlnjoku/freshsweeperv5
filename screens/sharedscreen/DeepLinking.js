// import { Linking } from 'react-native';
// import ROUTES from '../../constants/routes';

// console.log('🔗 DEEP LINKING CONFIG LOADED');
// console.log('🔗 ROUTES.reset_password:', ROUTES.reset_password);

// const linking = {
//   prefixes: ['freshsweeper://', 'https://www.freshsweeper.com'], // Both app and web deep links
//   config: {
//     screens: {
//       [ROUTES.reset_password]: {
//         path: 'reset-password/:token', // e.g. freshsweeper://reset-password/abc123
//         parse: {
//           token: (token) => {
//             console.log('🎯 DEEP LINK - Parsing token:', token);
//             console.log('🎯 DEEP LINK - Target screen:', ROUTES.reset_password);
//             return `${token}`;
//           },
//         },
//       },
//       [ROUTES.verify_email]: {
//         path: 'verify-email', // e.g. freshsweeper://verify-email?email=test@example.com&code=6789
//         parse: {
//           email: (email) => decodeURIComponent(email),
//           code: (code) => `${code}`,
//         },
//       },
//       // [ROUTES.account_verification_gate]: {
//       //   path: 'onboarding-complete',
//       //   parse: {
//       //     status: (status) => `${status}`,
//       //   },
//       // },

//       [ROUTES.account_verification_gate]: {
//         path: 'onboarding-complete',
//         parse: {
//           cleanerId: (cleanerId) => `${cleanerId}`, // <- Add this line
//         },
//       },
//       // [ROUTES.account_verification_gate]: {
//       //   path: 'verification-complete',
//       //   parse: {
//       //     cleanerId: (cleanerId) => `${cleanerId}`,
//       //   },
//       // },
//       [ROUTES.payment_complete]: {
//         path: 'payment-complete',
//         parse: {
//           payment_intent: (id) => id,
//           redirect_status: (status) => status,
//         },
//       },

//       [ROUTES.cleaner_schedule_review]: {
//         path: 'schedule-review/:scheduleId',
//         parse: {
//           scheduleId: (scheduleId) => `${scheduleId}`,
//           requestId: (requestId) => `${requestId}`,
//           hostId: (hostId) => `${hostId}`,
//         },
//       },
    
//       [ROUTES.profile]: 'profile',
//       [ROUTES.onboarding]: 'onboarding',
//       [ROUTES.getting_started]: 'getting-started',
//       [ROUTES.dashboard]: 'dashboard',
//       [ROUTES.signin]: 'signin',
//       [ROUTES.signup]: 'signup',

      

//     },
//   },
//   async getInitialURL() {
//     console.log('🔄 getInitialURL called');
//     const url = await Linking.getInitialURL();
//     console.log('📱 getInitialURL result:', url);
//     return url;
//   },
//   subscribe(listener) {
//     console.log('🎯 subscribe called in linking config');
//     const onReceiveURL = ({ url }) => {
//       console.log('📬 URL event in linking config:', url);
//       // Let's see what happens when we pass it to the listener
//       console.log('🎯 Passing URL to listener:', url);
//       listener(url);
//     };
//     const subscription = Linking.addEventListener('url', onReceiveURL);
//     return () => {
//       console.log('🧹 unsubscribe called in linking config');
//       subscription.remove();
//     };
//   },
// };

// export default linking;









// import * as Linking from 'expo-linking';
// import ROUTES from '../../constants/routes';

// console.log('🔗 DEEP LINKING CONFIG LOADED');
// console.log('🔗 ROUTES.reset_password:', ROUTES.reset_password);

// const linking = {
//   prefixes: ['freshsweeper://', 'https://www.freshsweeper.com'], // Both app and web deep links
//   config: {
//     screens: {
//       [ROUTES.reset_password]: {
//         path: 'reset-password/:token', // e.g. freshsweeper://reset-password/abc123
//         parse: {
//           token: (token) => {
//             console.log('🎯 DEEP LINK - Parsing token:', token);
//             console.log('🎯 DEEP LINK - Target screen:', ROUTES.reset_password);
//             return `${token}`;
//           },
//         },
//       },
//       [ROUTES.verify_email]: {
//         path: 'verify-email', // e.g. freshsweeper://verify-email?email=test@example.com&code=6789
//         parse: {
//           email: (email) => decodeURIComponent(email),
//           code: (code) => `${code}`,
//         },
//       },
      
//       // ADD THIS NEW ENTRY for verification-complete
//       [ROUTES.account_verification_gate]: {
//         path: 'verification-complete',
//         parse: {
//           cleanerId: (cleanerId) => `${cleanerId}`,
//         },
//       },
      
//       // Keep the existing onboarding-complete if you still need it
//       // [ROUTES.account_verification_gate]: {
//       //   path: 'onboarding-complete',
//       //   parse: {
//       //     status: (status) => `${status}`,
//       //   },
//       // },

//       [ROUTES.payment_complete]: {
//         path: 'payment-complete',
//         parse: {
//           payment_intent: (id) => id,
//           redirect_status: (status) => status,
//         },
//       },

//       [ROUTES.cleaner_schedule_review]: {
//         path: 'schedule-review/:scheduleId',
//         parse: {
//           scheduleId: (scheduleId) => `${scheduleId}`,
//           requestId: (requestId) => `${requestId}`,
//           hostId: (hostId) => `${hostId}`,
//         },
//       },
    
//       [ROUTES.profile]: 'profile',
//       [ROUTES.onboarding]: 'onboarding',
//       [ROUTES.getting_started]: 'getting-started',
//       [ROUTES.dashboard]: 'dashboard',
//       [ROUTES.signin]: 'signin',
//       [ROUTES.signup]: 'signup',
//     },
//   },
//   async getInitialURL() {
//     console.log('🔄 getInitialURL called');
//     const url = await Linking.getInitialURL();
//     console.log('📱 getInitialURL result:', url);
//     return url;
//   },
//   subscribe(listener) {
//     console.log('🎯 subscribe called in linking config');
//     const onReceiveURL = ({ url }) => {
//       console.log('📬 URL event in linking config:', url);
//       // Log the URL for debugging
//       if (url.includes('verification-complete')) {
//         console.log('✅ Found verification-complete URL:', url);
//       }
//       console.log('🎯 Passing URL to listener:', url);
//       listener(url);
//     };
//     const subscription = Linking.addEventListener('url', onReceiveURL);
//     return () => {
//       console.log('🧹 unsubscribe called in linking config');
//       subscription.remove();
//     };
//   },
// };

// export default linking;









import * as Linking from 'expo-linking';
import ROUTES from '../../constants/routes';
import InviteGate from '../public/IniteGate';

// const linking = {
//   prefixes: [
//     'com.flavoursoft.freshsweeperv5://',
//     'https://www.freshsweeper.com',
//   ],
//   config: {
//     screens: {
//       [ROUTES.reset_password]: 'reset-password/:token',

//       [ROUTES.verify_email]: 'verify-email',

     
//       [ROUTES.account_verification_gate]: 'onboarding-complete',

//       [ROUTES.payment_complete]: 'payment-complete',

//       [ROUTES.cleaner_schedule_review]: 'schedule-review/:scheduleId',

//       [ROUTES.cleaner_schedules]: 'cleaner-schedule',
//       [ROUTES.onboarding]: 'onboarding',
//       [ROUTES.getting_started]: 'getting-started',
//       [ROUTES.dashboard]: 'dashboard',
//       [ROUTES.signin]: 'signin',
//       [ROUTES.signup]: 'signup',
//     },
//   },

//   async getInitialURL() {
//     console.log('🔄 getInitialURL called');
//     const url = await Linking.getInitialURL();
//     console.log('📱 getInitialURL result:', url);
//     return url;
//   },
//   // subscribe(listener) {
//   //   console.log('🎯 subscribe called in linking config');
//   //   const onReceiveURL = ({ url }) => {
//   //     console.log('📬 URL event in linking config:', url);
//   //     // Log the URL for debugging
//   //     if (url.includes('verification-complete')) {
//   //       console.log('✅ Found verification-complete URL:', url);
//   //     }
//   //     console.log('🎯 Passing URL to listener:', url);
//   //     listener(url);
//   //   };
//   //   const subscription = Linking.addEventListener('url', onReceiveURL);
//   //   return () => {
//   //     console.log('🧹 unsubscribe called in linking config');
//   //     subscription.remove();
//   //   };
//   // },
// };

// export default linking;


// const linking = {
//   prefixes: ['com.flavoursoft.freshsweeperv5://', 'https://www.freshsweeper.com'],
//   config: {
//     screens: {
//       AppNav: {
//         screens: {
//           MainHostStack: {
//             screens: {
//               [ROUTES.payment_complete]: 'payment-complete',
//               [ROUTES.host_dashboard]: 'dashboard',
//               // Add any other nested screens here
//             },
//           },
//           AuthStack: {
//             screens: {
//               [ROUTES.signin]: 'signin',
//               [ROUTES.signup]: 'signup',
//               [ROUTES.reset_password]: 'reset-password/:token',
//             },
//           },
//         },
//       },
//     },
//   },
// };




// deeplinks.js

export const hostLinking = {
  prefixes: ['com.flavoursoft.freshsweeperv5://', 'https://www.freshsweeper.com'],
  config: {
    screens: {
      PaymentComplete: 'payment-complete',
      'Make Group Payment': 'group-payment',
      'Apartment Dashboard': 'apartment-dashboard',
      'Add Apartment': 'add-apartment',
      'Create Checklist': 'create-checklist',
      'Schedule Details': 'schedule-details',
      'Schedule Requests': 'schedule-requests',
      'Profile & Pay': 'profile-pay',
      'Profile Info': 'profile-info',
      Notification: 'notification',
      'Task Progress': 'task-progress',
      'Cancellation Details': 'cancellation-details',
      // 'Change Password': 'change-password',
      // 'Change Language': 'change-language',
      // Add more host screens if needed
    },
  },
};

export const cleanerLinking = {
  prefixes: ['com.flavoursoft.freshsweeperv5://', 'freshsweeperv5://', 'https://www.freshsweeper.com'],
  config: {
    screens: {
      // 'Login Options': 'oauth2redirect',
      AccountVerificationGate: 'onboarding-complete',
      AccountVerificationGateIdVerify: 'iDverification-complete',
      'Attach Task Photos': 'attach-task-photos',
      'Clock-In': 'clock-in',
      'My Payments': 'my-payments',
      // Home: 'home',
      'My Schedules': 'my-schedules',
      Messages: 'messages',
      More: 'more',
      PropertyDetails: 'property-details'
      
      // Add more cleaner screens if needed
      // "Sign Up": 'register-cleaner',
      // "Invite Gate": 'login',
      // PropertyDetails: 'property-details', // target after auto-accept i have to create this component
    },
  },
};


export const rootLinking = {
  prefixes: [
    'com.flavoursoft.freshsweeperv5://', 
    'freshsweeperv5://', 
    'https://www.freshsweeper.com'
  ],
  config: {
    screens: {
      Public: {
        screens: {
          // All public screens (including InviteGate)
          "Sign Up": 'register-cleaner',
          "Invite Gate": 'invite',
          'Login Options': 'oauth2redirect',
          'Change Password': 'change-password',
          'Change Language': 'change-language',
        },
      },
      Host: {
        screens: hostLinking.config.screens,   // embed host screens
      },
      Cleaner: {
        screens: cleanerLinking.config.screens, // embed cleaner screens
      },
    },
  },
};

