"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import type { Class, TeacherAvailability } from "@acme/db";

import type {
  CalendarGridSchedule,
  CalendarGridScheduledClass,
} from "./components/calendar-grid";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { CalendarGrid } from "./components/calendar-grid";
import { GenerateNewCalendarApproveModal } from "./components/generate-new-calendar-approve-modal";
import { SchoolConfigForm } from "./components/school-config-form";

interface SchoolCalendarGridProps {
  classId: string | undefined;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export type ClassKey = `${DayOfWeek}_${string}-${string}_${string}_${string}`;

interface SplitClassKey {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  teacherId: string;
  subjectId: string;
}

interface SchoolConfigFormValues {
  selectedClass: Class | null;
  selectedClassId: string | undefined | null;
  fixedClasses: string[];
  scheduleConfig: {
    Monday: { start: string; numClasses: number; duration: number };
    Tuesday: { start: string; numClasses: number; duration: number };
    Wednesday: { start: string; numClasses: number; duration: number };
    Thursday: { start: string; numClasses: number; duration: number };
    Friday: { start: string; numClasses: number; duration: number };
  };
}

export function SchoolCalendarGrid({ classId }: SchoolCalendarGridProps) {
  const [newSchedule, setNewSchedule] = useState<boolean>(false);
  const form = useForm<SchoolConfigFormValues>({
    defaultValues: {
      selectedClass: { id: classId },
      selectedClassId: classId,
      fixedClasses: [],
      scheduleConfig: {
        Monday: { start: "07:00", numClasses: 6, duration: 50 },
        Tuesday: { start: "07:00", numClasses: 6, duration: 50 },
        Wednesday: { start: "07:00", numClasses: 6, duration: 50 },
        Thursday: { start: "07:00", numClasses: 6, duration: 50 },
        Friday: { start: "07:00", numClasses: 6, duration: 50 },
      },
    },
  });
  const scheduleConfig = form.watch("scheduleConfig");
  const fixedClasses = form.watch("fixedClasses");
  const selectedClass = form.watch("selectedClass");
  const selectedClassId = form.watch("selectedClassId");
  const [openGenerateNewCalendarModal, setOpenGenerateNewCalendarModal] =
    useState(false);

  useEffect(() => {
    form.setValue("selectedClassId", classId);
  }, [classId, form.setValue]);

  const initializeSchedule = useCallback(() => {
    return {
      Monday: generateBlankSchedule(
        scheduleConfig.Monday.start,
        scheduleConfig.Monday.numClasses,
        scheduleConfig.Monday.duration,
      ),
      Tuesday: generateBlankSchedule(
        scheduleConfig.Tuesday.start,
        scheduleConfig.Tuesday.numClasses,
        scheduleConfig.Tuesday.duration,
      ),
      Wednesday: generateBlankSchedule(
        scheduleConfig.Wednesday.start,
        scheduleConfig.Wednesday.numClasses,
        scheduleConfig.Wednesday.duration,
      ),
      Thursday: generateBlankSchedule(
        scheduleConfig.Thursday.start,
        scheduleConfig.Thursday.numClasses,
        scheduleConfig.Thursday.duration,
      ),
      Friday: generateBlankSchedule(
        scheduleConfig.Friday.start,
        scheduleConfig.Friday.numClasses,
        scheduleConfig.Friday.duration,
      ),
    };
  }, [
    scheduleConfig.Monday.start,
    scheduleConfig.Monday.numClasses,
    scheduleConfig.Monday.duration,
    scheduleConfig.Tuesday.start,
    scheduleConfig.Tuesday.numClasses,
    scheduleConfig.Tuesday.duration,
    scheduleConfig.Wednesday.start,
    scheduleConfig.Wednesday.numClasses,
    scheduleConfig.Wednesday.duration,
    scheduleConfig.Thursday.start,
    scheduleConfig.Thursday.numClasses,
    scheduleConfig.Thursday.duration,
    scheduleConfig.Friday.start,
    scheduleConfig.Friday.numClasses,
    scheduleConfig.Friday.duration,
  ]);

  const { data: generatedSchedule, refetch: refetchGeneratedSchedule } =
    api.school.generateSchoolCalendar.useQuery(
      {
        fixedClasses,
        scheduleConfig,
        classId: selectedClassId ?? "",
      },
      {
        enabled: selectedClassId != null,
      },
    );

  const {
    data: teachersAvailabilities,
    refetch: refetchTeachersAvailabilities,
  } = api.teacher.getTeachersAvailableDays.useQuery(undefined);

  const { data: classSchedule, refetch: refetchClassSchedule } =
    api.school.getClassSchedule.useQuery(
      {
        classId: selectedClassId ?? "",
      },
      {
        enabled: selectedClassId != null,
      },
    );

  const { mutateAsync: saveSchoolCalendarMutation } =
    api.school.saveSchoolCalendar.useMutation();

  const [tableSchedule, setTableSchedule] =
    useState<CalendarGridSchedule>(initializeSchedule());

  useEffect(() => {
    // Esse useEffect só pode rodar quando
    // o usuário não quer novos horários
    if (newSchedule) return;
    if (!classSchedule) {
      setTableSchedule(initializeSchedule());
      return;
    }
    const scheduleKeys = Object.keys(classSchedule);
    const totalAmmountOfClassesWithTeachers = scheduleKeys.reduce(
      (acc, key) =>
        acc +
        classSchedule[key as keyof typeof classSchedule].reduce(
          (acc, clasz) => {
            if (!clasz.Teacher || !clasz.Subject) return acc;
            return acc + 1;
          },
          0,
        ),
      0,
    );
    if (totalAmmountOfClassesWithTeachers === 0) {
      setTableSchedule(initializeSchedule());
      return;
    }
    setTableSchedule(classSchedule);
  }, [classSchedule, initializeSchedule, newSchedule]);

  useEffect(() => {
    // Esse useEffect só pode rodar quando
    // o usuário quer novos horários
    if (!newSchedule) return;
    if (!generatedSchedule) {
      setTableSchedule(initializeSchedule());
      return;
    }
    setTableSchedule(generatedSchedule);
  }, [newSchedule, generatedSchedule, initializeSchedule]);

  function toggleFixedClass(classKey: ClassKey) {
    const fixedClasses = form.getValues("fixedClasses");
    const updated = JSON.parse(JSON.stringify(fixedClasses));
    const index = updated.indexOf(classKey);
    if (index > -1) {
      updated.splice(index, 1);
    } else {
      updated.push(classKey);
    }
    form.setValue("fixedClasses", updated);
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
            subjectId: entry.Subject.id,
            classWeekDay: day,
            startTime: entry.startTime,
            endTime: entry.endTime,
          };
        });
      })
      .filter((classItem) => classItem !== undefined) as unknown as {
      teacherId: string;
      subjectId: string;
      classWeekDay: string;
      startTime: string;
      endTime: string;
    }[];
    const toastId = toast.loading("Salvando horários...");
    try {
      if (!classId) return;
      await saveSchoolCalendarMutation({ classId, scheduleName: "", classes });
      toast.success("Horários salvos com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar horários");
    } finally {
      toast.dismiss(toastId);
      setOpenGenerateNewCalendarModal(false);
      setNewSchedule(false);
      await Promise.all([
        refetchClassSchedule(),
        refetchTeachersAvailabilities(),
        refetchGeneratedSchedule(),
      ]);
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

  function getClassDetails(classKey: ClassKey): SplitClassKey {
    const [day, timeRange, teacherId, subjectId] = classKey.split("_");
    const [startTime, endTime] = timeRange?.split("-") || [];
    return {
      day,
      startTime,
      endTime,
      teacherId,
      subjectId,
    } as unknown as SplitClassKey;
  }

  function findClassIndex(
    schedule: CalendarGridScheduledClass[],
    startTime: string,
    endTime: string,
  ) {
    return schedule.findIndex(
      (entry) => entry.startTime === startTime && entry.endTime === endTime,
    );
  }

  function checkTeacherAvailability(
    availability: TeacherAvailability[],
    day: string,
    startTime: string,
    endTime: string,
  ) {
    return availability.some(
      (slot) =>
        slot.day === day &&
        slot.startTime <= startTime &&
        slot.endTime >= endTime,
    );
  }

  function swapClassTimes(
    classData: CalendarGridScheduledClass,
    newStartTime: string,
    newEndTime: string,
  ) {
    return {
      ...classData,
      startTime: newStartTime,
      endTime: newEndTime,
    };
  }

  function updateFixedClasses(
    activeDataWithSwappedTimes: CalendarGridScheduledClass,
    overDataWithSwappedTimes: CalendarGridScheduledClass,
    activeDetails: SplitClassKey,
    overDetails: SplitClassKey,
  ) {
    if (
      !activeDataWithSwappedTimes.Teacher ||
      !activeDataWithSwappedTimes.Subject
    )
      return;
    if (!overDataWithSwappedTimes.Teacher || !overDataWithSwappedTimes.Subject)
      return;
    const activeDataClassKey = generateClassKey(
      activeDetails.day as keyof typeof tableSchedule,
      activeDetails.startTime as string,
      activeDetails.endTime as string,
      activeDetails.teacherId as string,
      activeDetails.subjectId as string,
    );
    const overDataClassKey = generateClassKey(
      overDetails.day as keyof typeof tableSchedule,
      overDetails.startTime as string,
      overDetails.endTime as string,
      overDetails.teacherId as string,
      overDetails.subjectId as string,
    );

    const currentFixedClasses = JSON.parse(JSON.stringify(fixedClasses));
    const activeDataOnFixedClassesIndex =
      currentFixedClasses.indexOf(activeDataClassKey);
    if (activeDataOnFixedClassesIndex !== -1) {
      currentFixedClasses[activeDataOnFixedClassesIndex] = generateClassKey(
        overDetails.day as keyof typeof tableSchedule,
        activeDataWithSwappedTimes.startTime as string,
        activeDataWithSwappedTimes.endTime as string,
        activeDataWithSwappedTimes.Teacher.id as string,
        activeDataWithSwappedTimes.Subject.id as string,
      );
    }
    const overDataOnFixedClassesIndex =
      currentFixedClasses.indexOf(overDataClassKey);
    if (overDataOnFixedClassesIndex !== -1) {
      currentFixedClasses[overDataOnFixedClassesIndex] = generateClassKey(
        activeDetails.day as keyof typeof tableSchedule,
        overDataWithSwappedTimes.startTime as string,
        overDataWithSwappedTimes.endTime as string,
        overDataWithSwappedTimes.Teacher.id as string,
        overDataWithSwappedTimes.Subject.id as string,
      );
    }

    if (
      activeDataOnFixedClassesIndex !== -1 ||
      overDataOnFixedClassesIndex !== -1
    ) {
      form.setValue("fixedClasses", currentFixedClasses);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || !tableSchedule) return;

    const activeDetails = getClassDetails(active.id as ClassKey);
    if (!activeDetails) return;
    const overDetails = getClassDetails(over.id as ClassKey);

    const activeIndex = findClassIndex(
      tableSchedule[activeDetails.day as keyof typeof tableSchedule],
      activeDetails.startTime as string,
      activeDetails.endTime as string,
    );
    const overIndex = findClassIndex(
      tableSchedule[overDetails.day as keyof typeof tableSchedule],
      overDetails.startTime as string,
      overDetails.endTime as string,
    );
    if (activeIndex === -1 || overIndex === -1) return;

    // we create a new variable without referencing the old one
    // so the old one is not mutated
    const newTableSchedule = JSON.parse(JSON.stringify(tableSchedule));
    const activeData =
      tableSchedule[activeDetails.day as keyof typeof tableSchedule][
        activeIndex
      ];
    const overData =
      tableSchedule[overDetails.day as keyof typeof tableSchedule][overIndex];
    if (!activeData || !overData || !teachersAvailabilities) return;

    const activeTeacherAvailability =
      teachersAvailabilities[activeDetails.teacherId as string] ?? [];
    const overTeacherAvailability =
      teachersAvailabilities[overDetails.teacherId as string] ?? [];

    if (
      activeData.Teacher &&
      !checkTeacherAvailability(
        activeTeacherAvailability,
        overDetails.day as string,
        overDetails.startTime as string,
        overDetails.endTime as string,
      )
    ) {
      return toast.error(
        `Professor ${activeData.Teacher?.User.name} não tem disponibilidade nesse dia e horário`,
      );
    }

    if (
      overData.Teacher &&
      !checkTeacherAvailability(
        overTeacherAvailability,
        activeDetails.day as string,
        activeDetails.startTime as string,
        activeDetails.endTime as string,
      )
    ) {
      return toast.error(
        `Professor ${overData.Teacher?.User.name} não tem disponibilidade nesse dia e horário`,
      );
    }

    const activeDataWithSwappedTimes = swapClassTimes(
      activeData,
      overDetails.startTime as string,
      overDetails.endTime as string,
    );
    const overDataWithSwappedTimes = swapClassTimes(
      overData,
      activeDetails.startTime as string,
      activeDetails.endTime as string,
    );

    updateFixedClasses(
      activeDataWithSwappedTimes,
      overDataWithSwappedTimes,
      activeDetails,
      overDetails,
    );

    newTableSchedule[overDetails.day as keyof typeof newTableSchedule][
      overIndex
    ] = activeDataWithSwappedTimes;
    newTableSchedule[activeDetails.day as keyof typeof newTableSchedule][
      activeIndex
    ] = overDataWithSwappedTimes;

    setTableSchedule(() => newTableSchedule);
  }

  return (
    <FormProvider {...form}>
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

        <div className="flex w-full items-center justify-center">
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr]",
            )}
          >
            <SchoolConfigForm />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={async () => {
              if (!selectedClass) {
                toast.error("Selecione uma turma");
                return;
              }
              if (!newSchedule) {
                setNewSchedule(true);
                return;
              }
              const toastId = toast.loading("Gerando horários...");
              await refetchGeneratedSchedule();
              toast.dismiss(toastId);
            }}
          >
            Gerar horários
          </Button>

          {newSchedule && (
            <Button
              type="button"
              className={cn(
                "bg-red-600 transition-all duration-200 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2",
              )}
              onClick={() => {
                setNewSchedule(false);
                form.setValue("fixedClasses", []);
              }}
            >
              Cancelar
            </Button>
          )}

          {newSchedule && (
            <Button
              type="button"
              onClick={() => handleClickSave(tableSchedule)}
            >
              Salvar novos horários
            </Button>
          )}
        </div>

        <CalendarGrid
          newSchedule={newSchedule}
          schedule={tableSchedule}
          handleDragEnd={handleDragEnd}
          handleClickOnClass={toggleFixedClass}
          fixedClasses={fixedClasses}
        />
      </div>
    </FormProvider>
  );
}

function generateBlankSchedule(
  startTime: string,
  numClasses: number,
  classesDuration: number,
): CalendarGridScheduledClass[] {
  const classes: CalendarGridScheduledClass[] = [];
  let _startTime = new Date(`1970-01-01T${startTime}:00`);
  for (let i = 0; i < numClasses; i++) {
    // calculate the end time of the class
    // the endtime is the start time + the duration of the class
    const endTime = new Date(
      _startTime.getTime() + classesDuration * 60 * 1000,
    );
    classes.push({
      startTime: _startTime.toTimeString().substring(0, 5),
      endTime: endTime.toTimeString().substring(0, 5),
      Teacher: null,
      Subject: null,
    });
    _startTime = endTime;
  }
  return classes;
}
