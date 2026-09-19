// utils/statusStyles.js
export const statusColor = (status) => {
    const map = {
      draft: '#6c757d',
      open: '#17a2b8',
      assigned: '#ffc107',
      pending_payment: '#fd7e14',
      payment_confirmed: '#28a745',
      upcoming: '#007bff',
      in_progress: '#ffc107',
      pending_review: '#fd7e14',
      approved: '#28a745',
      payment_released: '#20c997',
      completed: '#28a745',
      cancelled: '#dc3545',
      uncompleted: '#dc3545',
      removed: '#6c757d',
      clockin_available: '#28a745',
    };
    return map[status] || '#6c757d';
  };