// Calculate total cleaning time based on rooms and their counts
export const calculateRoomCleaningTime = (rooms) => {

    const roomTimes = {
        bedroom: {
          Small: 10,
          Medium: 15,
          Large: 25,
        },
        bathroom: {
          Small: 15,
          Medium: 25,
          Large: 35,
        },
        livingroom: {
          Small: 20,
          Medium: 30,
          Large: 40,
        },
        kitchen:{
            Small:20,
            Medium:30,
            Large:40
          }
      };

    

   // Function to dynamically add a room
    const addRoom = (rooms, type, number, size, size_range) => {
        const newRoom = { type, number, size, size_range }; // Create the new room object
        return [...rooms, newRoom]; // Return a new array with the added room
    };
  
    // Dynamically add the kitchen
    const updatedRooms = addRoom(rooms, "Kitchen", 1, 150, "Small");

    return updatedRooms.reduce((total, room) => {
        const { type, size_range, number } = room;
        const roomTypeLowerCase = type.toLowerCase(); // Convert type to lowercase
        const roomTime = roomTimes[roomTypeLowerCase]?.[size_range] || 0; // Case-insensitive lookup
        console.log("peeeeeeeeeeeep")
        console.log(total + (roomTime * number))
        return total + (roomTime * number); // Multiply room time by room count
      }, 0);
  };