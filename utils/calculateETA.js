// Example function to calculate ETA
const calculateETA =(distanceInKm, averageSpeedKph) => {
    // Estimate travel time in hours
    const travelTimeHours = distanceInKm / averageSpeedKph;
    
    // Convert travel time to milliseconds
    const travelTimeMs = travelTimeHours * 60 * 60 * 1000;
    
    // Calculate ETA in milliseconds
    const currentMs = new Date().getTime();
    const etaMs = currentMs + travelTimeMs;
    
    // Convert ETA to Date object
    const eta = new Date(etaMs);
    
    return eta;
}

export default calculateETA



