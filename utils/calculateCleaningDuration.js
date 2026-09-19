import moment from 'moment';

export const calculateDuration = (start, end) => {
    const startMoment = moment(start, 'h:mm:ss A');
    const endMoment = moment(end, 'h:mm:ss A');
    const duration = moment.duration(endMoment.diff(startMoment));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };