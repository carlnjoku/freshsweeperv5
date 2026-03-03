// utils/earningsCalculator.js

export const calculateEarningsFromChecklist = (assignedTo, currentCleanerId = null) => {
    if (!assignedTo || !Array.isArray(assignedTo)) {
      return {
        totalEarnings: 0,
        cleanerEarnings: 0,
        breakdown: []
      };
    }
  
    // Calculate total earnings from all cleaners
    const totalEarnings = assignedTo.reduce((total, cleaner) => {
      const cleanerPrice = cleaner?.checklist?.price || 0;
      return total + cleanerPrice;
    }, 0);
  
    // Calculate current cleaner's earnings
    let cleanerEarnings = 0;
    if (currentCleanerId) {
      const currentCleaner = assignedTo.find(cleaner => 
        cleaner.cleanerId === currentCleanerId
      );
      cleanerEarnings = currentCleaner?.checklist?.price || 0;
    }
  
    // Get breakdown for display
    const breakdown = assignedTo.map(cleaner => ({
      cleanerId: cleaner.cleanerId,
      name: `${cleaner.firstname} ${cleaner.lastname}`,
      earnings: cleaner?.checklist?.price || 0,
      status: cleaner.status,
      group: cleaner.group,
      rooms: cleaner?.checklist?.rooms || [],
      extras: cleaner?.checklist?.extras || [],
      totalTime: cleaner?.checklist?.totalTime || 0
    }));
  
    return {
      totalEarnings,
      cleanerEarnings,
      breakdown
    };
  };
  
  // Helper function to get earnings breakdown by group
  export const getEarningsByGroup = (assignedTo) => {
    if (!assignedTo) return {};
  
    return assignedTo.reduce((groups, cleaner) => {
      const group = cleaner.group || 'ungrouped';
      if (!groups[group]) {
        groups[group] = {
          totalEarnings: 0,
          cleaners: []
        };
      }
      
      const cleanerEarnings = cleaner?.checklist?.price || 0;
      groups[group].totalEarnings += cleanerEarnings;
      groups[group].cleaners.push({
        cleanerId: cleaner.cleanerId,
        name: `${cleaner.firstname} ${cleaner.lastname}`,
        earnings: cleanerEarnings,
        status: cleaner.status
      });
  
      return groups;
    }, {});
  };
  
  // Calculate completed vs pending earnings
  export const getEarningsByStatus = (assignedTo) => {
    if (!assignedTo) return { completed: 0, pending: 0 };
  
    return assignedTo.reduce((result, cleaner) => {
      const earnings = cleaner?.checklist?.price || 0;
      
      if (cleaner.status === 'completed' || cleaner.status === 'payment_confirmed') {
        result.completed += earnings;
      } else {
        result.pending += earnings;
      }
  
      return result;
    }, { completed: 0, pending: 0 });
  };