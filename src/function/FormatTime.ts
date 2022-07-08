import moment from 'moment';

export const formatSeconds = (seconds: number): string => {
  return moment
    .utc(seconds * 1000)
    .format(seconds > 3600 ? 'HH:mm:ss' : 'mm:ss');
};