// Helper to process cleaner data from checklist structure
const processCleanerData = (cleaner) => {
  if (!cleaner) return null;

  const result = {
    id: cleaner.cleanerId || cleaner.id,
    firstname: cleaner.firstname,
    lastname: cleaner.lastname,
    avatar: cleaner.avatar,
    group: cleaner.group,
    status: cleaner.status || 'uncompleted',
    completed_tasks: {},
    in_progress_tasks: {},
    uploaded_photos: {},
    total_photos: 0,
    completed_rooms: 0,
    in_progress_rooms: 0,
    overall_status: 'not_started'
  };

  // Check if cleaner has checklist data
  if (cleaner.checklist && cleaner.checklist.details) {
    const { details } = cleaner.checklist;
    
    // Process each room
    Object.keys(details).forEach(roomName => {
      const roomData = details[roomName];
      const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
      const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
      
      if (!hasPhotos && !hasTasks) return;
      
      // Filter completed tasks (value: true)
      const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
      const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
      
      // Determine room status
      let roomStatus = 'not_started';
      if (completedTasks.length > 0 && pendingTasks.length === 0) {
        roomStatus = 'completed';
      } else if (completedTasks.length > 0 || hasPhotos) {
        roomStatus = 'in_progress';
      }
      
      // Store photos in uploaded_photos
      if (hasPhotos) {
        result.uploaded_photos[roomName] = roomData.photos;
        result.total_photos += roomData.photos.length;
      }
      
      // Store tasks based on status
      if (roomStatus === 'completed') {
        result.completed_tasks[roomName] = {
          photos: roomData.photos || [],
          tasks: completedTasks,
          status: roomStatus
        };
        result.completed_rooms++;
      } else if (roomStatus === 'in_progress') {
        result.in_progress_tasks[roomName] = {
          photos: roomData.photos || [],
          tasks: completedTasks,
          pending_tasks: pendingTasks,
          status: roomStatus
        };
        result.in_progress_rooms++;
      }
    });
    
    // Determine overall status
    const totalRooms = result.completed_rooms + result.in_progress_rooms;
    if (totalRooms === 0) {
      result.overall_status = 'not_started';
    } else if (result.completed_rooms > 0 && result.in_progress_rooms === 0) {
      result.overall_status = 'completed';
    } else {
      result.overall_status = 'in_progress';
    }
  }
  
  return result;
};

// Get all tasks for a cleaner (simple non-recursive version)
const getAllTasksForCleanerSimple = (cleaner) => {
  const allTasks = {};
  
  if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
    return allTasks;
  }
  
  Object.keys(cleaner.checklist.details).forEach(roomName => {
    const roomData = cleaner.checklist.details[roomName];
    const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
    const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
    
    if (!hasPhotos && !hasTasks) return;
    
    const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
    const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
    
    // Determine room status
    let roomStatus = 'not_started';
    if (completedTasks.length > 0 && pendingTasks.length === 0) {
      roomStatus = 'completed';
    } else if (completedTasks.length > 0 || hasPhotos) {
      roomStatus = 'in_progress';
    }
    
    allTasks[roomName] = {
      photos: roomData.photos || [],
      tasks: completedTasks,
      pending_tasks: pendingTasks,
      status: roomStatus,
      total_tasks: roomData.tasks?.length || 0,
      completed_tasks: completedTasks.length
    };
  });
  
  return allTasks;
};

// Get total photos for cleaner
const getTotalPhotosForCleanerSimple = (cleaner) => {
  let total = 0;
  
  if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
    return total;
  }
  
  Object.values(cleaner.checklist.details).forEach(roomData => {
    if (Array.isArray(roomData.photos)) {
      total += roomData.photos.length;
    }
  });
  
  return total;
};

// Process all cleaners
const processAllCleanersSimple = (cleaners) => {
  if (!Array.isArray(cleaners)) return [];
  return cleaners.map(cleaner => processCleanerData(cleaner)).filter(Boolean);
};

export {
  processCleanerData,
  getAllTasksForCleanerSimple as getAllTasksForCleaner,
  getTotalPhotosForCleanerSimple as getTotalPhotosForCleaner,
  processAllCleanersSimple as processAllCleaners
};