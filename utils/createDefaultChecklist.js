import userService from "../services/connection/userService";

// Helper function to create default checklist
export const createDefaultChecklist = async (property) => {
    const roomDetails = property.roomDetails || [];
    
    // Generate tasks based on room types
    const roomTasks = {};
    roomDetails.forEach(room => {
      roomTasks[room.type] = generateTasksForRoomType(room.type);
    });
  
    // Create checklist structure
    const checklistData = {
      propertyId: property._id,
      hostId: property.userId,
      checklistName: `Standard Cleaning - ${property.apt_name}`,
      checklist: {
        group_1: {
          totalTime: calculateCleaningTime(roomDetails),
          rooms: roomDetails.map(room => `${room.type}_0`),
          price: calculateBasePrice(roomDetails),
          extras: [],
          details: generateRoomDetails(roomDetails)
        }
      },
      totalFee: calculateBasePrice(roomDetails),
      is_default: true
    };
    
    console.log("Triiiiiiem", roomDetails)
    return await userService.saveChecklist(checklistData);
  };
  
  // Helper functions
  export const generateTasksForRoomType = (roomType) => {
    const tasks = {
      Bedroom: [
        { label: "Change linens", id: "task_01" },
        { label: "Make the bed", id: "task_02" },
        { label: "Dust surfaces", id: "task_03" },
        { label: "Vacuum carpet", id: "task_04" }
      ],
      Bathroom: [
        { label: "Clean toilet", id: "task_07" },
        { label: "Wipe mirrors", id: "task_08" },
        { label: "Sanitize sink", id: "task_09" },
        { label: "Empty trash", id: "task_10" }
      ],
      Livingroom: [
        { label: "Vacuum", id: "task_13" },
        { label: "Dust furniture", id: "task_16" },
        { label: "Organize & tidy up", id: "task_18" }
      ],
      Kitchen: [
        { label: "Wipe countertops", id: "task_20" },
        { label: "Empty trash", id: "task_22" },
        { label: "Scrub the sink", id: "task_24" },
        { label: "Sweep & Mop floor", id: "task_25" }
      ]
    };
    
    return tasks[roomType] || [];
  };


  const calculateCleaningTime = (rooms) => {
    // Base time estimates per room type
    const timeEstimates = {
      Bedroom: 30,    // minutes
      Bathroom: 25,
      Livingroom: 20,
      Kitchen: 35
    };
    
    return rooms.reduce((total, room) => {
      return total + (timeEstimates[room.type] || 0) * room.number;
    }, 0);
  };
  
  const calculateBasePrice = (rooms) => {
    // Base price per room type
    const pricePerRoom = {
      Bedroom: 25,
      Bathroom: 20,
      Livingroom: 15,
      Kitchen: 30
    };
    
    return rooms.reduce((total, room) => {
      return total + (pricePerRoom[room.type] || 0) * room.number;
    }, 0);
  };
  
  const generateRoomDetails = (rooms) => {
    const details = {};
    
    rooms.forEach(room => {
      details[room.type] = {
        photos: [],
        tasks: generateTasksForRoomType(room.type),
        notes: {
          [`${room.type}_0`]: { text: "" }
        }
      };
    });
    
    return details;
  };
























