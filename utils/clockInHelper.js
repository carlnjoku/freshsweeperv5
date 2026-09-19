import { tSafe } from "./tSafe";

// Helper function to check if current time is within 15 minutes of cleaning start
export const isWithin15MinutesBefore = (cleaningDate, cleaningTime) => {
    try {
      // Combine date and time to create cleaning start datetime
      const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}`);
      const now = new Date();
      
      
      // Calculate time difference in milliseconds
      const timeDiff = cleaningStart.getTime() - now.getTime();
      const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
      
      // Return true if current time is within 15 minutes before cleaning start
      // and cleaning hasn't started yet
      return timeDiff <= fifteenMinutes && timeDiff > 0;
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return false;
    }
  };
  
  
  
  // Enhanced helper function with more options – now with translations
// export const getClockInStatus = (cleaningDate, cleaningTime) => {
//     try {
//       const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}`);
//       const now = new Date();
//       const timeDiff = cleaningStart.getTime() - now.getTime();
//       const fifteenMinutes = 15 * 60 * 1000;
//       const oneHour = 60 * 60 * 1000;
  
//       if (timeDiff <= 0) {
//         return { 
//           canClockIn: false, 
//           status: 'past', 
//           message: tSafe('clock_in_past', 'Cleaning time has passed') 
//         };
//       } else if (timeDiff <= fifteenMinutes) {
//         return { 
//           canClockIn: true, 
//           status: 'within_15_min', 
//           message: tSafe('clock_in_available', 'Clock in available') 
//         };
//       } else if (timeDiff <= oneHour) {
//         const minutesLeft = Math.ceil(timeDiff / (60 * 1000));
//         return { 
//           canClockIn: false, 
//           status: 'within_1_hour', 
//           message: tSafe(
//             'clock_in_available_in_',
//             'Clock in available in {{minutes}} minutes',
          
//             { minutes: minutesLeft - 15 }
          
//           )
//           // message: tSafe('clock_in_available_in_', 'Clock in available in  minutes', { minutes: minutesLeft - 15 }) 
//         };
//       } else {
//         return { 
//           canClockIn: false, 
//           status: 'future', 
//           message: tSafe('clock_in_not_yet_available', 'Clock in not yet available') 
//         };
//       }
//     } catch (error) {
//       console.error('Error calculating clock in status:', error);
//       return { 
//         canClockIn: false, 
//         status: 'error', 
//         message: tSafe('time_calculation_error', 'Time calculation error') 
//       };
//     }
//   };


// export const getClockInStatus = (cleaningDate, cleaningTime) => {
//   try {
//     // Parse as UTC
//     const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}Z`);
//     console.log("Cleaning starts", cleaningStart)
//     const now = new Date();
//     const timeDiff = cleaningStart.getTime() - now.getTime();
//     const fifteenMinutes = 15 * 60 * 1000;
//     const oneHour = 60 * 60 * 1000;

//     console.log(timeDiff)

//     if (timeDiff <= 0) {
//       return { canClockIn: false, status: 'past', message: tSafe('clock_in_past', 'Cleaning time has passed') };
//     } else if (timeDiff <= fifteenMinutes) {
//       return { canClockIn: true, status: 'within_15_min', message: tSafe('clock_in_available', 'Clock in available') };
//     } else if (timeDiff <= oneHour) {
//       const minutesLeft = Math.ceil(timeDiff / (60 * 1000));

//       console.log(canClockIn)
//       return {
//         canClockIn: false,
//         status: 'within_1_hour',
//         message: tSafe('clock_in_available_in_', 'Clock in available in {{minutes}} minutes', { minutes: minutesLeft - 15 })
//       };
//     } else {
//       return { canClockIn: false, status: 'future', message: tSafe('clock_in_not_yet_available', 'Clock in not yet available') };
//     }
//   } catch (error) {
//     console.error('Error calculating clock in status:', error);
//     return { canClockIn: false, status: 'error', message: tSafe('time_calculation_error', 'Time calculation error') };
//   }
// };
  

// export const getClockInStatus = (cleaningDate, cleaningTime) => {
//   try {
//     // Parse as UTC
//     const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}Z`);
//     console.log("Cleaning starts", cleaningStart);
//     const now = new Date();
//     const timeDiff = cleaningStart.getTime() - now.getTime();
//     const fifteenMinutes = 15 * 60 * 1000;
//     const oneHour = 60 * 60 * 1000;

//     console.log(timeDiff);

//     if (timeDiff <= 0) {
//       return { 
//         canClockIn: false, 
//         status: 'past', 
//         message: tSafe('clock_in_past', 'Cleaning time has passed') 
//       };
//     } else if (timeDiff <= fifteenMinutes) {
//       return { 
//         canClockIn: true, 
//         status: 'within_15_min', 
//         message: tSafe('clock_in_available', 'Clock in available') 
//       };
//     } else if (timeDiff <= oneHour) {
//       const minutesLeft = Math.ceil(timeDiff / (60 * 1000));
//       // Remove the problematic console.log
//       const template = tSafe('clock_in_available_in_', 'Clock in available in {minutes} minutes');
//       const message = template.replace('{minutes}', minutesLeft - 15);
//       return {
//         canClockIn: false,
//         status: 'within_1_hour',
//         message,
//       };
//     } else {
//       return { 
//         canClockIn: false, 
//         status: 'future', 
//         message: tSafe('clock_in_not_yet_available', 'Clock in not yet available') 
//       };
//     }
//   } catch (error) {
//     console.error('Error calculating clock in status:', error);
//     return { 
//       canClockIn: false, 
//       status: 'error', 
//       message: tSafe('time_calculation_error', 'Time calculation error') 
//     };
//   }
// };


export const getClockInStatus = (cleaningDate, cleaningTime) => {
  try {
    // Parse as LOCAL time (no 'Z')
    const cleaningStart = new Date(`${cleaningDate}T${cleaningTime}`);
    console.log("Cleaning starts (local):", cleaningStart);
    const now = new Date();
    const timeDiff = cleaningStart.getTime() - now.getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    console.log("Time difference (ms):", timeDiff);

    if (timeDiff <= 0) {
      return { 
        canClockIn: false, 
        status: 'past', 
        message: tSafe('clock_in_past', 'Cleaning time has passed') 
      };
    } else if (timeDiff <= fifteenMinutes) {
      return { 
        canClockIn: true, 
        status: 'within_15_min', 
        message: tSafe('clock_in_available', 'Clock in available') 
      };
    } else if (timeDiff <= oneHour) {
      const minutesLeft = Math.ceil(timeDiff / (60 * 1000));
      const template = tSafe('clock_in_available_in_', 'Clock in available in {minutes} minutes');
      const message = template.replace('{minutes}', minutesLeft - 15);
      return {
        canClockIn: false,
        status: 'within_1_hour',
        message,
      };
    } else {
      return { 
        canClockIn: false, 
        status: 'future', 
        message: tSafe('clock_in_not_yet_available', 'Clock in not yet available') 
      };
    }
  } catch (error) {
    console.error('Error calculating clock in status:', error);
    return { 
      canClockIn: false, 
      status: 'error', 
      message: tSafe('time_calculation_error', 'Time calculation error') 
    };
  }
};