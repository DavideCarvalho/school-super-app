import React from "react";
import Flatpickr from "react-flatpickr";

import "flatpickr/dist/themes/light.css";
import { Portuguese } from "flatpickr/dist/l10n/pt";

interface CalendarProps {
  value: Date | undefined;
  minDate: Date;
  onChange: (date: Date) => void;
}

export default function Calendar({ value, minDate, onChange }: CalendarProps) {
  return (
    <Flatpickr
      className="focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 text-sm font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none"
      options={{
        minDate,
        dateFormat: "d/m/Y",
        enableTime: false,
        locale: Portuguese,
        prevArrow:
          '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
        nextArrow:
          '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
      }}
      data-enable-time
      value={value}
      onChange={([date]) => onChange(date as Date)}
    />
  );
}
