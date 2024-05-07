"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import { CheckBox } from "../checkbox";

const daysOfWeek: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

interface SchoolCalendarGridProps {
  schoolId: string;
}

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

// Função de componente
export function SchoolCalendarGrid({ schoolId }: SchoolCalendarGridProps) {
  const [fixedClasses, setFixedClasses] = useState<string[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<
    Record<DayOfWeek, { start: string; end: string }>
  >({
    Monday: { start: "07:00", end: "11:00" },
    Tuesday: { start: "08:00", end: "12:50" },
    Wednesday: { start: "07:00", end: "11:00" },
    Thursday: { start: "08:00", end: "12:50" },
    Friday: { start: "07:00", end: "11:00" },
  });

  const {
    data: schedule,
    isLoading,
    error,
    refetch,
  } = api.school.generateSchoolCalendar.useQuery(
    {
      schoolId,
      fixedClasses,
      scheduleConfig,
    },
    { refetchOnWindowFocus: false },
  );

  const updateStartTime = (day: DayOfWeek, startTime: string) => {
    setScheduleConfig((prev) => ({
      ...prev,
      [day]: {
        start: startTime,
        end: prev[day].end || "11:00", // Valor padrão se undefined
      },
    }));
  };

  const updateEndTime = (day: DayOfWeek, endTime: string) => {
    setScheduleConfig((prev) => ({
      ...prev,
      [day]: {
        start: prev[day].start || "07:00", // Valor padrão se undefined
        end: endTime,
      },
    }));
  };

  if (isLoading) return <div className="mt-5 text-center">Loading...</div>;
  if (error) {
    return <div className="mt-5 text-center">Error: {error.message}</div>;
  }

  if (!schedule || Object.keys(schedule).length === 0)
    return <div className="mt-5 text-center">Loading...</div>;

  const allTimeSlots = Array.from(
    new Set(
      Object.keys(schedule).flatMap((day) => {
        const daySchedule = schedule[day as keyof typeof schedule];
        if (!Array.isArray(daySchedule)) return [];
        return daySchedule.map(
          (entry) => `${entry?.startTime}-${entry?.endTime}`,
        );
      }),
    ),
  ).sort();

  const toggleFixedClass = (classKey: string) => {
    setFixedClasses((prev) => {
      const updated = [...prev];
      const index = updated.indexOf(classKey);
      if (index > -1) {
        updated.splice(index, 1);
      } else {
        updated.push(classKey);
      }
      return updated;
    });
  };

  function generateClassKey(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    teacherId: string,
    subjectId: string,
  ) {
    return `${day}_${startTime}-${endTime}_${teacherId}_${subjectId}`;
  }

  return (
    <div className="mt-5 overflow-x-auto">
      {daysOfWeek.map((day) => (
        <div key={day}>
          <label>{day} - Início:</label>
          <input
            type="time"
            value={scheduleConfig[day]?.start}
            onChange={(e) => updateStartTime(day, e.target.value)}
          />
          <label> Término:</label>
          <input
            type="time"
            value={scheduleConfig[day]?.end}
            onChange={(e) => updateEndTime(day, e.target.value)}
          />
        </div>
      ))}

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        onClick={() => refetch()}
      >
        <svg
          className="mr-1 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <title>Atualizar</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0zm7 0 a1 1 0 11-2 0 1 1 0z"
          />
        </svg>
        Atualizar
      </button>

      <table className="min-w-full border border-gray-300 bg-white">
        <thead className="bg-gray-800">
          <tr>
            <th className="border-b border-gray-300 px-4 py-2 text-white">
              Time
            </th>
            {daysOfWeek.map((day) => (
              <th
                key={day}
                className="border-b border-gray-300 px-4 py-2 text-white"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allTimeSlots.map((timeSlot) => {
            const [startTime, endTime] = timeSlot.split("-");
            return (
              <tr key={timeSlot} className="hover:bg-gray-100">
                <td className="border-b border-gray-300 px-4 py-2">{`${startTime} - ${endTime}`}</td>
                {daysOfWeek.map((day) => {
                  const entry = schedule[day as keyof typeof schedule].find(
                    (e) => e.startTime === startTime && e.endTime === endTime,
                  );
                  if (!entry) {
                    return (
                      <td
                        key={day}
                        className="border-b border-gray-300 px-4 py-2 text-center"
                      >
                        -
                      </td>
                    );
                  }
                  const classKey = generateClassKey(
                    day,
                    startTime as string,
                    endTime as string,
                    entry.Teacher.id,
                    entry.Subject.id,
                  );
                  return (
                    <td
                      key={day}
                      className="border-b border-gray-300 px-4 py-2 text-center"
                    >
                      <label>
                        <CheckBox
                          selected={fixedClasses.includes(classKey)}
                          onClick={() => toggleFixedClass(classKey)}
                        >
                          <div className="flex flex-col items-start">
                            <p>
                              <span className="font-bold text-indigo-600">
                                Professor:
                              </span>{" "}
                              {entry.Teacher.User.name}
                            </p>
                            <div>
                              <span className="font-bold text-indigo-600">
                                Matéria:
                              </span>{" "}
                              {entry.Subject.name}
                            </div>
                          </div>
                        </CheckBox>
                      </label>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
