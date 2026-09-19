// utils/actionAvailability.js
import { OVERALL_STATUS_LABELS, CLEANER_STATUS_LABELS } from './statusMapping';

// Host actions per overall status
export const getHostActions = (overallStatus, scheduleId, cleanerId) => {
  const actions = [];
  
  switch (overallStatus) {
    case 'draft':
      actions.push({ label: 'Publish', action: 'publish' });
      break;
    case 'open':
      actions.push({ label: 'View Applications', action: 'viewApplications' });
      break;
    case 'assigned':
      actions.push({ label: 'Pay Now', action: 'pay' });
      actions.push({ label: 'Reassign Cleaner', action: 'reassign' });
      break;
    case 'pending_payment':
      actions.push({ label: 'Complete Payment', action: 'pay' });
      break;
    case 'payment_confirmed':
      // No host actions (wait for cleaning)
      break;
    case 'upcoming':
      // No host actions (wait for cleaning to start)
      break;
    case 'in_progress':
      actions.push({ label: 'Track Progress', action: 'track' });
      break;
    case 'pending_review':
      actions.push({ label: 'Review Work', action: 'review' });
      break;
    case 'approved':
      // No host actions (wait for payment release)
      break;
    case 'payment_released':
      // No host actions
      break;
    case 'completed':
      // No host actions
      break;
    case 'cancelled':
      // No host actions
      break;
    default:
      break;
  }
  return actions;
};

// Cleaner actions per their own assignment status
export const getCleanerActions = (cleanerStatus, scheduleId, cleanerId) => {
  const actions = [];
  switch (cleanerStatus) {
    case 'clockin_available':
      actions.push({ label: 'Clock In', action: 'clockin' });
      break;
    case 'in_progress':
      actions.push({ label: 'Mark as Complete', action: 'complete' });
      break;
    case 'pending_review':
      // No action (waiting for review)
      break;
    default:
      break;
  }
  return actions;
};