// import { createNavigationContainerRef } from '@react-navigation/native';

// export const navigationRef = createNavigationContainerRef();

// export function navigate(name, params) {
//     if (navigationRef.isReady()) {
//         navigationRef.navigate(name, params);
//     } else {
//         console.log("Navigation is not ready yet. Retrying...");
//         // Retry after a short delay
//         setTimeout(() => navigate(name, params), 500);
//     }

//     console.log("Navigating to:", name);
//     console.log("With params:", params);
// }



import { navigationRef } from '../utils/navigationRef';
import { CommonActions } from '@react-navigation/native';

export function navigate(name, params) {

  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log('Navigation not ready, retrying...');
    setTimeout(() => navigate(name, params), 500);
  }
}

export function resetToPublic() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Public' }],
      })
    );
  }
}