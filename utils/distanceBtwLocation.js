
  export const haversineDistance = (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
  
    const R = 6371; // Radius of the Earth in km
  
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  
    const distanceInKm = R * c; // Distance in km
    const distanceInMiles = distanceInKm * 0.621371; // Convert km to miles
  
    return distanceInMiles;
};