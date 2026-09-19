// utils/statusMapping.js
import { tSafe } from './tSafe'; // your i18n helper

export const OVERALL_STATUS_LABELS = {
  draft: tSafe('status_draft', 'Draft'),
  open: tSafe('status_open', 'Open for Applications'),
  assigned: tSafe('status_assigned', 'Cleaner Assigned – Awaiting Payment'),
  pending_payment: tSafe('status_pending_payment', 'Payment Required'),
  payment_confirmed: tSafe('status_payment_confirmed', 'Payment Confirmed – Scheduled'),
  upcoming: tSafe('status_upcoming', 'Upcoming'),
  in_progress: tSafe('status_in_progress', 'Cleaning in Progress'),
  pending_review: tSafe('status_pending_review', 'Review Required'),
  approved: tSafe('status_approved', 'Work Approved'),
  payment_released: tSafe('status_payment_released', 'Payment Released'),
  completed: tSafe('status_completed', 'Completed'),
  cancelled: tSafe('status_cancelled', 'Cancelled'),
};

export const CLEANER_STATUS_LABELS = {
  open: tSafe('cleaner_status_open', 'Available'),
  applied: tSafe('cleaner_status_applied', 'Applied'),
  assigned: tSafe('cleaner_status_assigned', 'Assigned (Awaiting Payment)'),
  pending_payment: tSafe('cleaner_status_pending_payment', 'Payment Pending'),
  payment_confirmed: tSafe('cleaner_status_payment_confirmed', 'Confirmed'),
  upcoming: tSafe('cleaner_status_upcoming', 'Upcoming'),
  clockin_available: tSafe('cleaner_status_clockin_available', 'Clock‑in Available'),
  in_progress: tSafe('cleaner_status_in_progress', 'In Progress'),
  pending_review: tSafe('cleaner_status_pending_review', 'Awaiting Review'),
  approved: tSafe('cleaner_status_approved', 'Payment Approved'),
  payment_released: tSafe('cleaner_status_payment_released', 'Payment Released'),
  completed: tSafe('cleaner_status_completed', 'Completed'),
  uncompleted: tSafe('cleaner_status_uncompleted', 'Uncompleted'),
  cancelled: tSafe('cleaner_status_cancelled', 'Cancelled'),
  removed: tSafe('cleaner_status_removed', 'Removed'),
};

export const getOverallStatusLabel = (status) => OVERALL_STATUS_LABELS[status] || status;
export const getCleanerStatusLabel = (status) => CLEANER_STATUS_LABELS[status] || status;