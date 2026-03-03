
export const calculateCleaningTimeByTasks = (tasks, taskTimes) => {
    // Ensure taskTimes is an object and tasks is an array
    if (!taskTimes || typeof taskTimes !== 'object') {
      throw new Error('taskTimes must be a valid object');
    }
  
    if (!Array.isArray(tasks)) {
      throw new Error('tasks must be a valid array');
    }
  
    // Calculate total task time based on tasks required
    const totalTaskTime = tasks.reduce((total, task) => {
      return total + (taskTimes[task] || 0); // Add time for each task, default to 0 if task not found
    }, 0);
  
    // Adjust total task time based on cleaner's efficiency
    const cleanerEfficiencyFactor = 0.8; // Example: 80% efficiency
    const cleaningTime = totalTaskTime / cleanerEfficiencyFactor;
  
    // Add buffer time for unexpected delays
    const bufferTime = 5; // 15 minutes buffer
    const totalCleaningTime = cleaningTime + bufferTime;
  
    return totalCleaningTime;
  };