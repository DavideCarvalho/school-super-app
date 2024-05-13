"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSwappingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export function SchoolCalendarGrid({ schoolId }: SchoolCalendarGridProps) {
  const [newSchedule, setNewSchedule] = useState<boolean>(false);
  const [fixedClasses, setFixedClasses] = useState<string[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState({
    Monday: { start: "07:00", numClasses: 6, duration: 50 },
    Tuesday: { start: "07:00", numClasses: 6, duration: 50 },
    Wednesday: { start: "07:00", numClasses: 6, duration: 50 },
    Thursday: { start: "07:00", numClasses: 6, duration: 50 },
    Friday: { start: "07:00", numClasses: 6, duration: 50 },
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
      classId: "cltymawy6000fo3f2z968tm1b",
    },
    { refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const {
    data: teachersAvailabilities,
    isLoading: isLoadingTeachersAvailabilities,
    error: errorTeachersAvailabilities,
    refetch: refetchTeachersAvailabilities,
  } = api.teacher.getTeachersAvailableDays.useQuery(
    {
      schoolId,
    },
    { refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const {
    data: classSchedule,
    isLoading: isLoadingClassSchedule,
    error: errorClassSchedule,
    refetch: refetchClassSchedule,
  } = api.school.getClassSchedule.useQuery(
    {
      classId: "cltymawy6000fo3f2z968tm1b",
    },
    { refetchOnWindowFocus: false, refetchOnMount: true },
  );

  const { mutateAsync: saveSchoolCalendarMutation } =
    api.school.saveSchoolCalendar.useMutation();

  const [tableSchedule, setTableSchedule] = useState<typeof schedule>(schedule);
  useEffect(() => {
    if (classSchedule) {
      const scheduleKeys = Object.keys(classSchedule);
      const dailyScheduleLength = scheduleKeys.reduce(
        (acc, key) =>
          acc + classSchedule[key as keyof typeof classSchedule].length,
        0,
      );
      if (dailyScheduleLength > 0) {
        setTableSchedule(classSchedule);
      } else {
        setTableSchedule(schedule);
      }
    } else {
      setTableSchedule(schedule);
    }
  }, [schedule, classSchedule]);

  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [allClassKeys, setAllClassKeys] = useState<string[]>([]);

  useEffect(() => {
    setAllTimeSlots(
      tableSchedule
        ? Array.from(
            new Set(
              Object.keys(tableSchedule).flatMap((day) => {
                const daySchedule =
                  tableSchedule[day as keyof typeof tableSchedule];
                if (!Array.isArray(daySchedule)) return [];
                return daySchedule.map(
                  (entry) => `${entry?.startTime}-${entry?.endTime}`,
                );
              }),
            ),
          ).sort()
        : [],
    );
  }, [tableSchedule]);

  useEffect(() => {
    setAllClassKeys(
      tableSchedule
        ? Object.keys(tableSchedule).flatMap((day) => {
            const daySchedule =
              tableSchedule[day as keyof typeof tableSchedule];
            if (!Array.isArray(daySchedule)) return [];
            return daySchedule.map((entry) => {
              if (!entry.Teacher || !entry.Subject)
                return generateBlankCellKey(
                  day as keyof typeof schedule,
                  entry.startTime,
                  entry.endTime,
                );
              return generateClassKey(
                day as keyof typeof schedule,
                entry.startTime,
                entry.endTime,
                entry.Teacher.id,
                entry.Subject.id,
              );
            });
          })
        : [],
    );
  }, [tableSchedule]);

  function toggleFixedClass(classKey: string) {
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
  }

  async function saveSchedule(schedule: typeof tableSchedule) {
    if (!schedule) return;
    const classes = Object.keys(schedule)
      .flatMap((day) => {
        const daySchedule = schedule[day as keyof typeof schedule];
        if (!Array.isArray(daySchedule)) return [];
        return daySchedule.map((entry) => {
          if (!entry.Teacher || !entry.Subject) return undefined;
          return {
            teacherId: entry.Teacher.id,
            classId: "cltymawy6000fo3f2z968tm1b",
            subjectId: entry.Subject.id,
            classWeekDay: day,
            classTime: "",
            startTime: entry.startTime,
            endTime: entry.endTime,
          };
        });
      })
      .filter((classItem) => classItem !== undefined);
    // @ts-expect-error we are already filtering out undefined values
    await saveSchoolCalendarMutation(classes);
    await refetchTeachersAvailabilities();
  }

  function generateClassKey(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    teacherId: string,
    subjectId: string,
  ): ClassKey {
    return `${day}_${startTime}-${endTime}_${teacherId}_${subjectId}`;
  }

  function generateBlankCellKey(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
  ): ClassKey {
    return `${day}_${startTime}-${endTime}_-_-_-BLANK`;
  }

  useEffect(() => {
    setScheduleConfig((prev) => ({ ...prev }));
  }, []);

  const updateScheduleConfig = (
    day: DayOfWeek,
    field: "start" | "numClasses" | "duration",
    value: string | number,
  ) => {
    setScheduleConfig((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    if (!tableSchedule) return;

    const activeId = active.id as ClassKey;
    const [activeDay, activeStartandEndTime, activeTeacherId, activeSubjectId] =
      activeId.split("_");
    const [activeStartTime, activeEndTime] =
      activeStartandEndTime?.split("-") || [];
    const foundActiveIndex = tableSchedule[
      activeDay as keyof typeof tableSchedule
    ].findIndex(
      (e) => e.startTime === activeStartTime && e.endTime === activeEndTime,
    );
    if (foundActiveIndex === -1) return;
    const overId = over.id as ClassKey;
    const [overDay, overStartandEndTime, overTeacherId, overSubjectId] =
      overId.split("_");
    const [overStartTime, overEndTime] = overStartandEndTime?.split("-") || [];
    const foundOverIndex = tableSchedule[
      overDay as keyof typeof tableSchedule
    ].findIndex(
      (e) => e.startTime === overStartTime && e.endTime === overEndTime,
    );
    if (foundOverIndex === -1) return;
    const newTableSchedule = JSON.parse(JSON.stringify(tableSchedule));
    const activeData =
      tableSchedule[activeDay as keyof typeof tableSchedule][foundActiveIndex];
    const overData =
      tableSchedule[overDay as keyof typeof tableSchedule][foundOverIndex];
    if (!activeData || !overData) return;

    if (!teachersAvailabilities) return;

    const activeTeacherAvailability =
      teachersAvailabilities[activeTeacherId as string] ?? [];
    const overTeacherAvailability =
      teachersAvailabilities[overTeacherId as string] ?? [];

    if (activeData.Teacher && !activeTeacherAvailability?.length) {
      return toast.error(
        `Professor ${activeData.Teacher?.User.name} não tem mais horários disponíveis`,
      );
    }

    if (overData.Teacher && !overTeacherAvailability?.length) {
      return toast.error(
        `Professor ${overData.Teacher?.User.name} não tem mais horários disponíveis`,
      );
    }

    let doesActiveTeacherHasAvailabilityOnOverDayAndTime = false;
    for (const teacherAvailability of activeTeacherAvailability) {
      if (teacherAvailability.day !== overDay) continue;
      if (
        teacherAvailability.startTime <= (overStartTime as string) &&
        teacherAvailability.endTime >= (overEndTime as string)
      ) {
        doesActiveTeacherHasAvailabilityOnOverDayAndTime = true;
      }
    }

    if (
      activeData.Teacher &&
      !doesActiveTeacherHasAvailabilityOnOverDayAndTime
    ) {
      return toast.error(
        `Professor ${activeData.Teacher?.User.name} não tem disponibilidade nesse dia e horário`,
      );
    }

    let doesOverTeacherHasAvailabilityOnActiveDayAndTime = false;
    for (const teacherAvailability of overTeacherAvailability) {
      if (teacherAvailability.day !== activeDay) continue;
      if (
        teacherAvailability.startTime <= (activeStartTime as string) &&
        teacherAvailability.endTime >= (activeEndTime as string)
      ) {
        doesOverTeacherHasAvailabilityOnActiveDayAndTime = true;
      }
    }

    if (overData.Teacher && !doesOverTeacherHasAvailabilityOnActiveDayAndTime) {
      return toast.error(
        `Professor ${overData.Teacher?.User.name} não tem disponibilidade nesse dia e horário`,
      );
    }

    const activeDataWithSwapedTimes = {
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
    const overDataWithSwapedTimes = {
      ...JSON.parse(
        JSON.stringify(
          tableSchedule[overDay as keyof typeof tableSchedule][foundOverIndex],
        ),
      ),
      startTime: activeData.startTime,
      endTime: activeData.endTime,
    };
    const activeDataClassKey = generateClassKey(
      activeDay as keyof typeof tableSchedule,
      activeStartTime as string,
      activeEndTime as string,
      activeTeacherId as string,
      activeSubjectId as string,
    );
    const overDataClassKey = generateClassKey(
      overDay as keyof typeof tableSchedule,
      overStartTime as string,
      overEndTime as string,
      overTeacherId as string,
      overSubjectId as string,
    );
    const currentFixedClasses = JSON.parse(JSON.stringify(fixedClasses));
    const activeDataOnFixedClassesIndex =
      currentFixedClasses.indexOf(activeDataClassKey);
    if (activeDataOnFixedClassesIndex !== -1) {
      currentFixedClasses[activeDataOnFixedClassesIndex] = generateClassKey(
        overDay as keyof typeof tableSchedule,
        activeDataWithSwapedTimes.startTime as string,
        activeDataWithSwapedTimes.endTime as string,
        activeDataWithSwapedTimes.Teacher.id as string,
        activeDataWithSwapedTimes.Subject.id as string,
      );
    }
    const overDataOnFixedClassesIndex = fixedClasses.indexOf(overDataClassKey);
    if (overDataOnFixedClassesIndex !== -1) {
      currentFixedClasses[overDataOnFixedClassesIndex] = generateClassKey(
        activeDay as keyof typeof tableSchedule,
        overDataWithSwapedTimes.startTime as string,
        overDataWithSwapedTimes.endTime as string,
        overDataWithSwapedTimes.Teacher.id as string,
        overDataWithSwapedTimes.Subject.id as string,
      );
    }
    newTableSchedule[overDay as keyof typeof newTableSchedule][foundOverIndex] =
      activeDataWithSwapedTimes;
    newTableSchedule[activeDay as keyof typeof newTableSchedule][
      foundActiveIndex
    ] = overDataWithSwapedTimes;
    setTableSchedule((items) => {
      if (!items) return items;
      return newTableSchedule;
    });
    setAllClassKeys(
      Object.keys(newTableSchedule).flatMap((day) => {
        const daySchedule =
          newTableSchedule[day as keyof typeof newTableSchedule];
        if (!Array.isArray(daySchedule)) return [];
        return daySchedule.map((entry) => {
          if (!entry.Teacher || !entry.Subject)
            return generateBlankCellKey(
              day as keyof typeof schedule,
              entry.startTime,
              entry.endTime,
            );
          return generateClassKey(
            day as keyof typeof schedule,
            entry.startTime,
            entry.endTime,
            entry.Teacher.id,
            entry.Subject.id,
          );
        });
      }),
    );
    if (
      activeDataOnFixedClassesIndex !== -1 ||
      overDataOnFixedClassesIndex !== -1
    ) {
      setFixedClasses((items) => {
        if (!items) return items;
        return currentFixedClasses;
      });
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!schedule && isLoading)
    return <div className="mt-5 text-center">Loading...</div>;
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
          <label>{day} - Start Time:</label>
          <input
            type="time"
            value={scheduleConfig[day].start}
            onChange={(e) => updateScheduleConfig(day, "start", e.target.value)}
          />
          <label>Number of Classes:</label>
          <input
            type="number"
            value={scheduleConfig[day].numClasses}
            onChange={(e) =>
              updateScheduleConfig(
                day,
                "numClasses",
                Number.parseInt(e.target.value),
              )
            }
          />
          <label>Duration per Class (minutes):</label>
          <input
            type="number"
            value={scheduleConfig[day].duration}
            onChange={(e) =>
              updateScheduleConfig(
                day,
                "duration",
                Number.parseInt(e.target.value),
              )
            }
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

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        onClick={() => saveSchedule(tableSchedule)}
      >
        <svg
          className="mr-1 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <title>Salvar</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0zm7 0 a1 1 0 11-2 0 1 1 0z"
          />
        </svg>
        Salvar
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
                      if (!entry || !entry.Teacher || !entry.Subject) {
                        const blankCellKey = generateBlankCellKey(
                          day as keyof typeof tableSchedule,
                          startTime as string,
                          endTime as string,
                        );
                        return <BlankCell id={blankCellKey} />;
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
                          // @ts-expect-error teacher and object are populated
                          daySchedule={entry}
                          draggable={newSchedule}
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
  draggable: boolean;
}

interface BlankCellProps {
  id: string;
}

function BlankCell({ id }: BlankCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <td
      className="border-b border-gray-300 px-4 py-2 text-center"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CheckBox selected={false} onClick={() => {}}>
        -
      </CheckBox>
    </td>
  );
}

function ScheduledClass(props: ScheduledClassProps) {
  const { draggable, ...restOfTheProps } = props;
  if (draggable) return <DraggableSchedule {...restOfTheProps} />;
  return <NonDraggableSchedule {...restOfTheProps} />;
}

function NonDraggableSchedule({
  day,
  daySchedule,
}: Omit<ScheduledClassProps, "draggable">) {
  return (
    <td key={day} className="border-b border-gray-300 px-4 py-2 text-center">
      <label>
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
      </label>
    </td>
  );
}

function DraggableSchedule({
  day,
  classKey,
  isSelected,
  toggleFixedClass,
  daySchedule,
}: Omit<ScheduledClassProps, "draggable">) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: classKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <td
      key={day}
      className={`border-gray-300"px-4 border-b py-2 text-center`}
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
