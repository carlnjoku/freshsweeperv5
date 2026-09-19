import { useState, useEffect } from 'react';
import userService from '../services/connection/userService';

const useUserPenaltyData = (userId) => {
  const [penaltyData, setPenaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userService.getUser(userId);
        const data = response.data;
        setPenaltyData({
          reliabilityImpact: data.effective_penalty_impacts?.reliability || 0,
          ratingImpact: data.effective_penalty_impacts?.rating || 0,
          performance: data.calculated_performance,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { penaltyData, loading };
};