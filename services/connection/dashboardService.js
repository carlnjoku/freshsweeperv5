// services/dashboardService.js
// services/dashboardService.js
// import userService from './connection/userService';
import userService from './userService';
import moment from 'moment';

export const fetchDashboardData = async (currentUserId) => {
    alert(currentUserId)
  try {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    alert("Hey")
    
    // Fetch all data in parallel
    const [
      schedulesRes,
      requestsRes,
      propertiesRes,
      clientSecretRes
    ] = await Promise.all([
      userService.getSchedulesByHostId(currentUserId),
      userService.getHostCleaningRequest(currentUserId, currentTime),
      userService.getApartment(currentUserId),
      userService.getClientSecret()
    ]);

    const schedules = schedulesRes.data;
    const requests = requestsRes.data;
    const properties = propertiesRes.data;
    const clientSecret = clientSecretRes.data.client_secret;

    // Process data
    const pendingCount = requests.length;
    const cleaningRequests = requests.filter(req => req.status === "pending_acceptance");
    const pendingPaymentRequests = requests.filter(req => req.status === "pending_payment");

    const pendingCompletionApprovalSchedules = schedules
      .filter(
        (schedule) =>
          (schedule.status === "completed" || schedule.status === "in_progress") &&
          Array.isArray(schedule.assignedTo) &&
          schedule.assignedTo.some(
            (cleaner) => cleaner.status === "pending_completion_approval"
          )
      )
      .map((schedule) => ({
        ...schedule,
        assignedTo: schedule.assignedTo.filter(
          (cleaner) => cleaner.status === "pending_completion_approval"
        ),
      }));

    const upcomingSchedulesFiltered = schedules
      .filter((schedule) => schedule.status === "pending_payment")
      .sort((a, b) => {
        if (a.cleaning_date === b.cleaning_date) {
          return (a.cleaning_time || '').localeCompare(b.cleaning_time || '');
        }
        return a.cleaning_date.localeCompare(b.cleaning_date);
      });

    return {
      schedules,
      cleaningRequests,
      pendingPayment: pendingPaymentRequests,
      pendingCompletionApproval: pendingCompletionApprovalSchedules,
      upcomingSchedules: upcomingSchedulesFiltered,
      properties,
      clientSecret,
      pendingCount
    };

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw error;
  }
};