export const calculateOverallRating = (ratings, cleanerId) => {
   
    const cleanerRatings = ratings.filter(rating => rating.cleanerId === cleanerId);
    console.log("Ave rating", ratings)
    if (cleanerRatings.length === 0) {
      return 0;
    }
  
    const totalRating = cleanerRatings.reduce((sum, rating) => sum + rating.averageRating, 0);
    const averageRating = totalRating / cleanerRatings.length;
    
    return averageRating.toFixed(1);  // Returning average rating with two decimal places
  };