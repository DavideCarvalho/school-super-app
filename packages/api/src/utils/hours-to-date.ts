import { setHours, setMinutes } from "date-fns";

export function hoursToDate(hours: string): Date {
  const [hour, minutes] = hours.split(":") as [string, string];
  return new Date(
    Date.UTC(
      setMinutes(setHours(new Date(), Number(hour)), Number(minutes)).getTime(),
    ),
  );
}
