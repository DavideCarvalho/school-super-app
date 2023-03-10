import React, { useState } from "react";
import Flatpickr from "react-flatpickr";

import "flatpickr/dist/themes/light.css";
import { Portuguese } from "flatpickr/dist/l10n/pt";

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  return (
    <Flatpickr
      className="focus:shadow-soft-primary-outline dark:bg-gray-950 leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 text-sm font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none dark:text-white/80 dark:placeholder:text-white/80"
      options={{
        minDate: "today",
        enableTime: false,
        locale: Portuguese,
        prevArrow:
          '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
        nextArrow:
          '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
      }}
      data-enable-time
      value={date}
      onChange={([date]) => {
        setDate({ date });
      }}
    />
  );
}
