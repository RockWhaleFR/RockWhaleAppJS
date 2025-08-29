// utils/date.js
import dayjs from 'dayjs';

export const todayKey = () => dayjs().format('YYYY-MM-DD');

export const isYesterday = (iso1, iso2) => {
  return dayjs(iso1).add(1, 'day').isSame(dayjs(iso2), 'day');
};

export const isToday = (isoDate) => {
  return dayjs(isoDate).isSame(dayjs(), 'day');
};