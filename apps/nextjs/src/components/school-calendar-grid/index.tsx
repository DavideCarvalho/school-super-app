"use client";

import { use, useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  arraySwap,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Subject, Teacher, User } from "@acme/db";

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

type ClassKey = `${DayOfWeek}_${string}-${string}_${string}_${string}`;

// Função de componente
export function SchoolCalendarGrid({ schoolId }: SchoolCalendarGridProps) {
  const [fixedClasses, setFixedClasses] = useState<string[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<
    Record<DayOfWeek, { start: string; end: string }>
  >({
    Monday: { start: "07:00", end: "12:30" },
    Tuesday: { start: "07:00", end: "12:30" },
    Wednesday: { start: "07:00", end: "12:30" },
    Thursday: { start: "07:00", end: "12:30" },
    Friday: { start: "07:00", end: "12:30" },
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

  const [tableSchedule, setTableSchedule] = useState<typeof schedule>(schedule);
  useEffect(() => {
    setTableSchedule(schedule);
  }, [schedule]);

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

  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [allClassKeys, setAllClassKeys] = useState<string[]>([]);

  useEffect(() => {
    setAllTimeSlots(
      schedule
        ? Array.from(
            new Set(
              Object.keys(schedule).flatMap((day) => {
                const daySchedule = schedule[day as keyof typeof schedule];
                if (!Array.isArray(daySchedule)) return [];
                return daySchedule.map(
                  (entry) => `${entry?.startTime}-${entry?.endTime}`,
                );
              }),
            ),
          ).sort()
        : [],
    );
  }, [schedule]);

  useEffect(() => {
    setAllClassKeys(
      tableSchedule
        ? Object.keys(tableSchedule).flatMap((day) => {
            const daySchedule =
              tableSchedule[day as keyof typeof tableSchedule];
            if (!Array.isArray(daySchedule)) return [];
            return daySchedule.map((entry) =>
              generateClassKey(
                day as keyof typeof schedule,
                entry.startTime,
                entry.endTime,
                entry.Teacher.id,
                entry.Subject.id,
              ),
            );
          })
        : [],
    );
  }, [tableSchedule]);

  // const allTimeSlots = schedule
  //   ? Array.from(
  //       new Set(
  //         Object.keys(schedule).flatMap((day) => {
  //           const daySchedule = schedule[day as keyof typeof schedule];
  //           if (!Array.isArray(daySchedule)) return [];
  //           return daySchedule.map(
  //             (entry) => `${entry?.startTime}-${entry?.endTime}`,
  //           );
  //         }),
  //       ),
  //     ).sort()
  //   : [];

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
  ): ClassKey {
    return `${day}_${startTime}-${endTime}_${teacherId}_${subjectId}`;
  }

  function handleDragEnd(event) {
    console.log("handleDragEnd", event);
    const { active, over } = event;
    if (!active || !over) return;
    if (!tableSchedule) return;

    const activeId: ClassKey = active.id;
    const [activeDay, activeStartandEndTime, activeTeacherId, activeSubjectId] =
      activeId.split("_");
    const [activeStartTime, activeEndTime] =
      activeStartandEndTime?.split("-") || [];
    const foundActiveIndex = tableSchedule[
      activeDay as keyof typeof tableSchedule
    ].findIndex(
      (e) =>
        e.startTime === activeStartTime &&
        e.endTime === activeEndTime &&
        e.Teacher.id === activeTeacherId &&
        e.Subject.id === activeSubjectId,
    );
    if (foundActiveIndex === -1) return;
    const overId: ClassKey = over.id;
    const [overDay, overStartandEndTime, overTeacherId, overSubjectId] =
      overId.split("_");
    const [overStartTime, overEndTime] = overStartandEndTime?.split("-") || [];
    const foundOverIndex = tableSchedule[
      overDay as keyof typeof tableSchedule
    ].findIndex(
      (e) =>
        e.startTime === overStartTime &&
        e.endTime === overEndTime &&
        e.Teacher.id === overTeacherId &&
        e.Subject.id === overSubjectId,
    );
    if (foundOverIndex === -1) return;
    const newTableSchedule = JSON.parse(JSON.stringify(tableSchedule));
    const activeData =
      tableSchedule[activeDay as keyof typeof tableSchedule][foundActiveIndex];
    const overData =
      tableSchedule[overDay as keyof typeof tableSchedule][foundOverIndex];
    if (!activeData || !overData) return;
    newTableSchedule[overDay as keyof typeof newTableSchedule][foundOverIndex] =
      {
        ...JSON.parse(
          JSON.stringify(
            tableSchedule[activeDay as keyof typeof tableSchedule][
              foundActiveIndex
            ],
          ),
        ),
        startTime: overData.startTime,
        endTime: overData.endTime,
      };
    newTableSchedule[activeDay as keyof typeof newTableSchedule][
      foundActiveIndex
    ] = {
      ...JSON.parse(
        JSON.stringify(
          tableSchedule[overDay as keyof typeof tableSchedule][foundOverIndex],
        ),
      ),
      startTime: activeData.startTime,
      endTime: activeData.endTime,
    };
    setTableSchedule((items) => {
      if (!items) return items;
      return newTableSchedule;
    });
    setAllClassKeys(
      Object.keys(newTableSchedule).flatMap((day) => {
        const daySchedule =
          newTableSchedule[day as keyof typeof newTableSchedule];
        if (!Array.isArray(daySchedule)) return [];
        return daySchedule.map((entry) =>
          generateClassKey(
            day as keyof typeof schedule,
            entry.startTime,
            entry.endTime,
            entry.Teacher.id,
            entry.Subject.id,
          ),
        );
      }),
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading) return <div className="mt-5 text-center">Loading...</div>;
  if (error) {
    return <div className="mt-5 text-center">Error: {error.message}</div>;
  }

  if (!schedule || Object.keys(schedule).length === 0)
    return <div className="mt-5 text-center">Loading...</div>;

  if (!tableSchedule || Object.keys(tableSchedule).length === 0)
    return <div className="mt-5 text-center">Loading...</div>;

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
            <SortableContext
              items={allClassKeys}
              strategy={rectSwappingStrategy}
            >
              {allTimeSlots.map((timeSlot) => {
                const [startTime, endTime] = timeSlot.split("-");
                return (
                  <tr key={timeSlot} className="hover:bg-gray-100">
                    <td className="border-b border-gray-300 px-4 py-2">{`${startTime} - ${endTime}`}</td>
                    {daysOfWeek.map((day) => {
                      const entry = tableSchedule[
                        day as keyof typeof tableSchedule
                      ].find(
                        (e) =>
                          e.startTime === startTime && e.endTime === endTime,
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
                        <ScheduledClass
                          key={classKey}
                          day={day}
                          classKey={classKey}
                          isSelected={fixedClasses.includes(classKey)}
                          toggleFixedClass={toggleFixedClass}
                          daySchedule={entry}
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}

interface ScheduledClassProps {
  classKey: string;
  isSelected: boolean;
  toggleFixedClass: (classKey: string) => void;
  day: DayOfWeek;
  daySchedule: {
    startTime: string;
    endTime: string;
    Teacher: Teacher & { User: User };
    Subject: Subject;
  };
}

function ScheduledClass({
  day,
  classKey,
  isSelected,
  toggleFixedClass,
  daySchedule,
}: ScheduledClassProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: classKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <td
      key={day}
      className="border-b border-gray-300 px-4 py-2 text-center"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <label>
        <CheckBox
          selected={isSelected}
          onClick={() => toggleFixedClass(classKey)}
        >
          <div className="flex flex-col items-start">
            <p>
              <span className="font-bold text-indigo-600">Professor:</span>{" "}
              {daySchedule.Teacher.User.name}
            </p>
            <div>
              <span className="font-bold text-indigo-600">Matéria:</span>{" "}
              {daySchedule.Subject.name}
            </div>
          </div>
        </CheckBox>
      </label>
    </td>
  );
}
