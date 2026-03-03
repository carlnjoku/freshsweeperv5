const formatRoomTitle = (title) => {
    if (!title) return title;
    
    // Check if it's in the format "RoomType_number" (e.g., "Bedroom_0", "Bathroom_1")
    const parts = title.split('_');
    if (parts.length === 2) {
      const roomType = parts[0];
      const roomNumber = parseInt(parts[1]) + 1; // Convert 0-based to 1-based
      
      // Capitalize first letter of room type and add # symbol
      const formattedRoomType = roomType.charAt(0).toUpperCase() + roomType.slice(1);
      return `${formattedRoomType} #${roomNumber}`;
    }
    
    // If it's already formatted or doesn't match the pattern, return as is
    return title;
  };

  export default formatRoomTitle