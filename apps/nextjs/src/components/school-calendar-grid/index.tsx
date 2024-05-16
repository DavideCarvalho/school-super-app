"use client";

import { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";

import type { Class, Subject, Teacher, User } from "@acme/db";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { CheckBox } from "../checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import SelectWithSearch from "../ui/select-with-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { GenerateNewCalendarApproveModal } from "./components/generate-new-calendar-approve-modal";

const daysOfWeek: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const daysOfWeekInPortuguese = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
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
  const [openGenerateNewCalendarModal, setOpenGenerateNewCalendarModal] =
    useState(false);

  const [selectedClass, setSelectedClass] = useState<Class>();

  const classesQuery = api.class.allBySchoolId.useQuery({
    schoolId,
    limit: 999,
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
      classId: selectedClass?.id ?? "",
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      enabled: selectedClass?.id != null,
    },
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
      classId: selectedClass?.id ?? "",
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      enabled: selectedClass?.id != null,
    },
  );

  const { mutateAsync: saveSchoolCalendarMutation } =
    api.school.saveSchoolCalendar.useMutation();

  const [tableSchedule, setTableSchedule] = useState<typeof schedule>(schedule);
  useEffect(() => {
    if (!newSchedule) {
      if (!classSchedule) return;
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
  }, [schedule, classSchedule, newSchedule]);

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

  async function handleClickSave(schedule: typeof tableSchedule) {
    if (!schedule) return;

    if (classSchedule && newSchedule) {
      setOpenGenerateNewCalendarModal(true);
      return;
    }
    await saveSchedule(schedule);
  }

  async function saveSchedule(schedule: NonNullable<typeof tableSchedule>) {
    if (!schedule) return;
    if (!selectedClass) return;
    const classes = Object.keys(schedule)
      .flatMap((day) => {
        const daySchedule = schedule[day as keyof typeof schedule];
        if (!Array.isArray(daySchedule)) return [];
        return daySchedule.map((entry) => {
          if (!entry.Teacher || !entry.Subject) return undefined;
          return {
            teacherId: entry.Teacher.id,
            classId: selectedClass.id,
            subjectId: entry.Subject.id,
            classWeekDay: day,
            classTime: "",
            startTime: entry.startTime,
            endTime: entry.endTime,
          };
        });
      })
      .filter((classItem) => classItem !== undefined);
    const toastId = toast.loading("Salvando horários...");
    try {
      // @ts-expect-error we are already filtering out undefined values
      await saveSchoolCalendarMutation(classes);
      toast.success("Horários salvos com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar horários");
    } finally {
      toast.dismiss(toastId);
      setOpenGenerateNewCalendarModal(false);
      setNewSchedule(false);
      await refetchTeachersAvailabilities();
      await refetchClassSchedule();
      await refetch();
    }
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

  if (isLoading) return <div className="mt-5 text-center">Loading...</div>;
  if (error) {
    return <div className="mt-5 text-center">Error: {error.message}</div>;
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <GenerateNewCalendarApproveModal
        open={openGenerateNewCalendarModal}
        onContinue={async () => {
          if (!tableSchedule) return;
          await saveSchedule(tableSchedule);
          setOpenGenerateNewCalendarModal(false);
        }}
        closeModal={() => setOpenGenerateNewCalendarModal(false)}
      />
      <div className="mb-5 flex w-full items-center justify-center">
        <SelectWithSearch
          label="Turmas"
          options={
            classesQuery?.data?.map((c) => ({
              label: c.name,
              value: c.id,
            })) || []
          }
          selectedOption={
            selectedClass
              ? { label: selectedClass.name, value: selectedClass.id }
              : undefined
          }
          onSelect={(option) => {
            const selectedClass = classesQuery?.data?.find(
              (c) => c.id === option,
            );
            if (!selectedClass) return;
            setSelectedClass(selectedClass);
          }}
        />
      </div>
      <div className="flex w-full items-center justify-center">
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr]",
          )}
        >
          {daysOfWeek.map((day, index) => (
            <div key={day}>
              <Label htmlFor={`${day}-start-time`}>
                {daysOfWeekInPortuguese[index]} - Que horas começa?:
              </Label>
              <Input
                name={`${day}-start-time`}
                type="time"
                value={scheduleConfig[day].start}
                onChange={(e) =>
                  updateScheduleConfig(day, "start", e.target.value)
                }
              />
              <Label htmlFor={`${day}-num-classes`}>
                Quantas aulas no dia?:
              </Label>
              <Input
                name={`${day}-num-classes`}
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
              <Label htmlFor={`${day}-duration`}>
                Quantos minutos por aula?:
              </Label>
              <Input
                name={`${day}-duration`}
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
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={async () => {
            if (!newSchedule) {
              setNewSchedule(true);
              return;
            }
            const toastId = toast.loading("Gerando horários...");
            await refetch();
            toast.dismiss(toastId);
          }}
        >
          Gerar novos horários
        </Button>

        {newSchedule && (
          <Button
            type="button"
            className={cn(
              "bg-red-600 transition-all duration-200 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2",
            )}
            onClick={() => {
              setNewSchedule(false);
            }}
          >
            Cancelar
          </Button>
        )}

        {newSchedule && (
          <Button type="button" onClick={() => handleClickSave(tableSchedule)}>
            Salvar novos horários
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              {daysOfWeek.map((day) => (
                <TableHead key={day}>{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={allClassKeys}
              strategy={rectSwappingStrategy}
            >
              {allTimeSlots.map((timeSlot) => {
                const [startTime, endTime] = timeSlot.split("-");
                return (
                  <TableRow key={timeSlot} className="hover:bg-gray-100">
                    <TableCell className="border-b border-gray-300 px-4 py-2">{`${startTime} - ${endTime}`}</TableCell>
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
                          daySchedule={
                            entry as ScheduledClassProps["daySchedule"]
                          }
                          draggable={newSchedule}
                        />
                      );
                    })}
                  </TableRow>
                );
              })}
            </SortableContext>
          </TableBody>
        </Table>
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
    <TableCell
      className="border-b border-gray-300 px-4 py-2 text-center"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CheckBox selected={false} onClick={() => {}}>
        -
      </CheckBox>
    </TableCell>
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
    <TableCell key={day}>
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
    </TableCell>
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
    <TableCell
      key={day}
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
    </TableCell>
  );
}
