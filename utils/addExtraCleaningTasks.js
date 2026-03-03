// export const addExtraCleaningTasks = (checklist, extraTasks) => {
//   console.log(checklist)
//     // Ensure checklist and extraTasks are valid
//     if (!checklist || typeof checklist !== "object") {
//       throw new Error("Invalid checklist structure.");
//     }
  
//     if (!Array.isArray(extraTasks)) {
//       throw new Error("Extra tasks should be an array.");
//     }
  
//     // Extract all existing task IDs from the checklist to determine the next ID
//     const allTaskIds = Object.values(checklist)
//       .flatMap((section) => section.tasks)
//       .map((task) => parseInt(task.id.replace("task_", "")));
  
//     const nextTaskId = Math.max(...allTaskIds, 0) + 1;
  
//     // Map extra tasks to the required format with sequential IDs
//     const formattedExtraTasks = extraTasks.map((task, index) => ({
//       label: task.label,
//       value: false, // Default value is false
//       name: task.label.toLowerCase().replace(/\s+/g, "_"),
//       id: `task_${nextTaskId + index}`,
//     }));
  
//     // Add or update the "Extra Cleaning" section
//     if (checklist["Extra Cleaning"]) {
//       // Update existing section
//       checklist["Extra Cleaning"].tasks = formattedExtraTasks;
//     } else {
//       // Add a new section
//       checklist["Extra Cleaning"] = {
//         photos: [],
//         tasks: formattedExtraTasks,
//       };
//     }
  
//     return checklist;
//   };
  
//   // Example usage
//   const extraTasks = [
//     { label: "Window Washing" },
//     { label: "Carpet Cleaning" },
//     { label: "Upholstery Cleaning" },
//     { label: "Tile & Grout Cleaning" },
//   ];
  
// //   const updatedChecklist = addExtraCleaningTasks(checklist, extraTasks);
// //   console.log("Updated Checklist:", updatedChecklist);




// Updated addExtraCleaningTasks to handle structured details
export const addExtraCleaningTasks = (checklistData, extras) => {
  // If checklistData is already a structured object (from formData.details)
  if (checklistData && typeof checklistData === 'object' && !Array.isArray(checklistData)) {
    // Clone the structured details
    const updatedDetails = JSON.parse(JSON.stringify(checklistData));
    
    // Add extras to each group
    if (extras && extras.length > 0) {
      Object.keys(updatedDetails).forEach(groupKey => {
        const group = updatedDetails[groupKey];
        
        // Create or get the Extra section in this group
        if (!group.details["Extra"]) {
          group.details["Extra"] = {
            photos: [],
            tasks: []
          };
        }
        
        // Add extras to the Extra section
        extras.forEach(extra => {
          group.details["Extra"].tasks.push({
            label: extra.label,
            value: true,
            name: extra.name || `extra_${extra.id}`,
            id: `extra_${extra.id}`,
            time: extra.time || 0,
            price: extra.price || 0
          });
        });
      });
    }
    
    return updatedDetails;
  }
  
  // Fallback to original logic for array format
  // ... (your original implementation for array format)
  
  return checklistData;
};