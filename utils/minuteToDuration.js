export const minutesToDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}hr`;
  } else {
    return `${hours}hr ${remainingMinutes}m`;
  }
};