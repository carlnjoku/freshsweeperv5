import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        console.log("Navigation is not ready yet. Retrying...");
        // Retry after a short delay
        setTimeout(() => navigate(name, params), 500);
    }

    console.log("Navigating to:", name);
    console.log("With params:", params);
}
