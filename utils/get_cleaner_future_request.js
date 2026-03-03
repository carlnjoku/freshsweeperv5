export const get_clean_future_requests = (requests) => {
    // Get current date and time
    const now = new Date();
  
    // Format current date and time into a string for comparison
    const currentDate = now.toISOString().split('T')[0];  // Get the current date in YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0];  // Get the current time in HH:mm:ss format
  
    // Combine current date and time into a single Date object
    const filterDateTime = new Date(`${currentDate}T${currentTime}`);
  
    // Filter requests (schedules) for a cleaner
    const availableRequests = requests.filter(request => {
      const scheduleDateTime = new Date(`${request.cleaning_date}T${request.cleaning_time}`);
      // Check if the schedule time is after the current date/time
      return scheduleDateTime >= filterDateTime;
    });
  
    return availableRequests;
  }