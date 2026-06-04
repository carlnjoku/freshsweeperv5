export const hostLinking = {
  prefixes: [
    'com.flavoursoft.freshsweeperv5://',
    'https://www.freshsweeper.com',
  ],
  config: {
    screens: {
      PaymentComplete: 'payment-complete',
      'Make Group Payment': 'group-payment',
      'Apartment Dashboard': 'apartment-dashboard',
      'Add Apartment': 'add-apartment',
      'Create Checklist': 'create-checklist',
      'Schedule Details': 'schedule-details',
      'Schedule Requests': 'schedule_requests',
      'Profile & Pay': 'profile-pay',
      'Profile Info': 'profile-info',
      Notification: 'notification',
      'Task Progress': 'task-progress',
      'Cancellation Details': 'cancellation-details',
      InventoryManagement:'inventory_management',
      // Messages: 'messages',
      ChatConversation: 'host'
      
    },
  },
};

export const cleanerLinking = {
  prefixes: [
    'com.flavoursoft.freshsweeperv5://',
    'https://www.freshsweeper.com',
  ],
  config: {
    screens: {
      AccountVerificationGate: 'onboarding-complete',
      AccountVerificationGateIdVerify: 'iDverification-complete',
      'Attach Task Photos': 'attach-task-photos',
      'Clock-In': 'clock-in',
      'My Payments': 'my-payments',
      'My Schedules': 'my-schedules',
      Messages: 'messages',
      More: 'more',
      PropertyDetails: 'property-details',
      CleanChatConversation: 'cleaner',
    
      
    },
  },
};

export const rootLinking = {
  prefixes: [
    'com.flavoursoft.freshsweeperv5://',
    'freshsweeperv5://',
    'https://www.freshsweeper.com',
  ],
  config: {
    screens: {
      Public: {
        screens: {
          'Sign Up': 'register-cleaner',
          'Invite Gate': 'invite',
          'Login Options': 'oauth2redirect',
          'Change Password': 'change-password',
          'Change Language': 'change-language',
          'ResetPassword': 'reset-password'
        },
      },

      Host: {
        screens: hostLinking.config.screens,
      },

      Cleaner: {
        screens: cleanerLinking.config.screens,
      },
    },
  },
};

