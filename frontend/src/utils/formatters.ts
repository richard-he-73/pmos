import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss.SSS';

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format(DATETIME_FORMAT);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format(DATE_FORMAT);
};

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format(TIME_FORMAT);
};

export const formatRelative = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  return dayjs(date).isValid();
};
