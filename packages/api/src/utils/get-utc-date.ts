import { UTCDate } from "@date-fns/utc";

export function getUTCDate(date: Date): Date {
  return new UTCDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}
