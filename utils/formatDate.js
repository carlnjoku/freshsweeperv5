// utils/dateFormatter.js
import moment from 'moment';

export const formatDateToYYYYMMDD = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // If it's already a string in YYYY-MM-DD format
    if (typeof dateValue === 'string') {
      // Remove time part if it exists
      if (dateValue.includes('T')) {
        return dateValue.split('T')[0];
      }
      // Check if it's already in YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(dateValue)) {
        return dateValue;
      }
      // Try to parse and format
      return moment(dateValue).format('YYYY-MM-DD');
    }
    // If it's a Date object
    else if (dateValue instanceof Date) {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    // If it's a moment object
    else if (moment.isMoment(dateValue)) {
      return dateValue.format('YYYY-MM-DD');
    }
    // For any other type, try to convert
    else {
      return moment(String(dateValue)).format('YYYY-MM-DD');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return moment().format('YYYY-MM-DD'); // Fallback to today
  }
};



export const formatTimeToHHMMSS = (timeValue) => {
  if (!timeValue) return '';
  if (typeof timeValue === 'string') {
    // If it's an ISO string, extract time part
    if (timeValue.includes('T')) {
      const parts = timeValue.split('T');
      return parts[1]?.split('.')[0] || '';
    }
    // If already HH:MM or HH:MM:SS
    if (timeValue.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      return timeValue;
    }
  }
  // If it's a Date object or timestamp
  const date = new Date(timeValue);
  if (!isNaN(date.getTime())) {
    return date.toTimeString().split(' ')[0];
  }
  return '';
};

export const isISOString = (dateString) => {
  return typeof dateString === 'string' && 
         dateString.includes('T') && 
         dateString.includes('Z');
};

export const extractDateFromISO = (isoString) => {
  if (!isISOString(isoString)) return isoString;
  return isoString.split('T')[0];
};