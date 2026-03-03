import { useCallback, useEffect, useMemo, useState } from 'react';
import userService from '../services/connection/userService';

export function useChecklistDetails({ scheduleId, currentUserId }) {
  const [detailsByGroup, setDetailsByGroup] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUpdatedImageUrls(scheduleId);
      const res = response.data.data;

      const cleaner = res.assignedTo.find(c => c.cleanerId === currentUserId);
      const checklist = cleaner?.checklist || {};

      const grouped = {};

      Object.entries(checklist).forEach(([groupKey, group]) => {
        if (!group?.details) return;

        grouped[groupKey] = {
          meta: {
            totalTime: group.totalTime,
            price: group.price,
          },
          rooms: {},
        };

        Object.entries(group.details).forEach(([roomKey, room]) => {
          grouped[groupKey].rooms[roomKey] = {
            ...room,
            photosRequired: roomKey !== 'Extra',
          };
        });
      });

      setDetailsByGroup(grouped);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, currentUserId]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const toggleTask = useCallback((groupKey, roomKey, taskName) => {
    setDetailsByGroup(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        rooms: {
          ...prev[groupKey].rooms,
          [roomKey]: {
            ...prev[groupKey].rooms[roomKey],
            tasks: prev[groupKey].rooms[roomKey].tasks.map(t =>
              t.name === taskName ? { ...t, value: !t.value } : t
            ),
          },
        },
      },
    }));
  }, []);

  const completion = useMemo(() => {
    let total = 0;
    let done = 0;

    Object.values(detailsByGroup).forEach(group => {
      Object.values(group.rooms).forEach(room => {
        room.tasks?.forEach(task => {
          total++;
          if (task.value) done++;
        });
      });
    });

    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [detailsByGroup]);

  return {
    isLoading,
    detailsByGroup,
    toggleTask,
    completion,
    refetch: fetchChecklist,
  };
}