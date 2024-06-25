"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import type { Class, TeacherAvailability } from "@acme/db";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@acme/ui/collapsible";

import type {
  CalendarSchedule,
  CalendarScheduledSlot,
} from "./components/calendar-grid";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { hoursToDate } from "~/utils/hours-to-date";
import { Button } from "../ui/button";
import { CalendarGrid } from "./components/calendar-grid";
import { ClassClashForm } from "./components/class-clash-form";
import { GenerateNewCalendarApproveModal } from "./components/generate-new-calendar-approve-modal";
import { SchoolConfigForm } from "./components/school-config-form";
import { SubjectQuantitiesForm } from "./components/subject-quantities-form";

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
  subjectsQuantities: Record<string, number>;
  subjectsExclusions: {
    subject: {
      id: string;
      name: string;
    };
    exclusions: string[];
  }[];
}

export function SchoolCalendarGrid({ classId }: SchoolCalendarGridProps) {
  const [openScheduleRulesModal, setOpenScheduleRulesModal] = useState(false);
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
      subjectsQuantities: {},
      subjectsExclusions: [
        { subject: { id: undefined, name: undefined }, exclusions: [] },
      ],
    },
  });
  const scheduleConfig = form.watch("scheduleConfig");
  const fixedClasses = form.watch("fixedClasses");
  const selectedClass = form.watch("selectedClass");
  const selectedClassId = form.watch("selectedClassId");
  const subjectsQuantities = form.watch("subjectsQuantities");
  const subjectsExclusions = form.watch("subjectsExclusions");
  const [openGenerateNewCalendarModal, setOpenGenerateNewCalendarModal] =
    useState(false);

  useEffect(() => {
    if (form.getValues("selectedClassId") === classId) return;
    form.setValue("selectedClassId", classId);
    form.setValue("subjectsQuantities", {});
    form.setValue("subjectsExclusions", []);
  }, [classId, form.setValue, form.getValues]);

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

  const {
    data: generatedSchedule,
    refetch: refetchGeneratedSchedule,
    isFetching: isFetchingGeneratedSchedule,
  } = api.school.generateSchoolCalendar.useQuery(
    {
      fixedClasses,
      scheduleConfig,
      classId: selectedClassId ?? "",
      generationRules: {
        subjectsQuantities,
        subjectsExclusions: subjectsExclusions.reduce(
          (acc, exclusion) => {
            acc[exclusion.subject.id] = exclusion.exclusions;
            return acc;
          },
          {} as Record<string, string[]>,
        ),
      },
    },
    {
      enabled: selectedClassId != null,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
    },
  );

  useEffect(() => {
    if (!newSchedule) return;
    toast.dismiss();
    if (isFetchingGeneratedSchedule) {
      toast.loading("Gerando horários...");
    }
  }, [isFetchingGeneratedSchedule, newSchedule]);

  const { data: subjects } = api.subject.getAllSubjectsForClass.useQuery(
    {
      classId: selectedClassId ?? "",
    },
    {
      enabled: selectedClassId != null,
    },
  );

  useEffect(() => {
    if (!subjects) return;
    for (const subject of subjects) {
      form.setValue(`subjectsQuantities.${subject.id}`, 0);
    }
  }, [subjects, form.setValue]);

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
    useState<CalendarSchedule>(initializeSchedule());

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
            if (!clasz.TeacherHasClass) return acc;
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
    //TODO: continuar daqui
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    if (!schedule) return;
    if (!selectedClass) return;
    const classes = Object.keys(schedule).flatMap((day) => {
      const daySchedule = schedule[day as keyof typeof schedule];
      if (!Array.isArray(daySchedule)) return [];
      return daySchedule
        .map((entry) => ({
          teacherHasClassId: entry?.TeacherHasClass?.id,
          classWeekDay: days.findIndex((d) => day.toLowerCase() === d),
          startTime: entry.startTime,
          endTime: entry.endTime,
        }))
        .filter(({ classWeekDay }) => classWeekDay > 0);
    });
    const toastId = toast.loading("Salvando horários...");
    try {
      if (!classId) return;
      await saveSchoolCalendarMutation({
        classId,
        scheduleName: "",
        classes,
      });
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
    schedule: CalendarScheduledSlot[],
    startTime: string,
    endTime: string,
  ) {
    return schedule.findIndex(
      (entry) =>
        format(entry.startTime, "HH:mm") === startTime &&
        format(entry.endTime, "HH:mm") === endTime,
    );
  }

  function checkTeacherAvailability(
    availability: TeacherAvailability[],
    day: string,
    startTime: string,
    endTime: string,
  ) {
    return availability.some((slot) => {
      const formattedSlotStartTime = format(slot.startTime, "HH:mm");
      const formattedSlotEndTime = format(slot.endTime, "HH:mm");
      return (
        slot.day === day &&
        formattedSlotStartTime <= startTime &&
        formattedSlotEndTime >= endTime
      );
    });
  }

  function swapClassTimes(
    classData: CalendarScheduledSlot,
    newStartTime: Date,
    newEndTime: Date,
  ) {
    return {
      ...classData,
      startTime: newStartTime,
      endTime: newEndTime,
    };
  }

  function updateFixedClasses(
    activeDataWithSwappedTimes: CalendarScheduledSlot,
    overDataWithSwappedTimes: CalendarScheduledSlot,
    activeDetails: SplitClassKey,
    overDetails: SplitClassKey,
  ) {
    if (!activeDataWithSwappedTimes.TeacherHasClass) return;
    if (!overDataWithSwappedTimes.TeacherHasClass) return;
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
        format(activeDataWithSwappedTimes.startTime, "HH:mm"),
        format(activeDataWithSwappedTimes.endTime, "HH:mm"),
        activeDataWithSwappedTimes.TeacherHasClass.Teacher.id,
        activeDataWithSwappedTimes.TeacherHasClass.Subject.id,
      );
    }
    const overDataOnFixedClassesIndex =
      currentFixedClasses.indexOf(overDataClassKey);
    if (overDataOnFixedClassesIndex !== -1) {
      currentFixedClasses[overDataOnFixedClassesIndex] = generateClassKey(
        activeDetails.day as keyof typeof tableSchedule,
        format(overDataWithSwappedTimes.startTime, "HH:mm"),
        format(overDataWithSwappedTimes.endTime, "HH:mm"),
        overDataWithSwappedTimes.TeacherHasClass.Teacher.id,
        overDataWithSwappedTimes.TeacherHasClass.Subject.id,
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
      activeData.TeacherHasClass &&
      !checkTeacherAvailability(
        activeTeacherAvailability,
        overDetails.day as string,
        overDetails.startTime,
        overDetails.endTime,
      )
    ) {
      return toast.error(
        `Professor ${activeData.TeacherHasClass.Teacher?.User.name} não tem disponibilidade nesse dia e horário`,
      );
    }

    if (
      overData.TeacherHasClass &&
      !checkTeacherAvailability(
        overTeacherAvailability,
        activeDetails.day as string,
        activeDetails.startTime as string,
        activeDetails.endTime as string,
      )
    ) {
      return toast.error(
        `Professor ${overData.TeacherHasClass.Teacher?.User.name} não tem disponibilidade nesse dia e horário`,
      );
    }

    const activeDataWithSwappedTimes = swapClassTimes(
      activeData,
      hoursToDate(overDetails.startTime),
      hoursToDate(overDetails.endTime),
    );
    const overDataWithSwappedTimes = swapClassTimes(
      overData,
      hoursToDate(activeDetails.startTime),
      hoursToDate(activeDetails.endTime),
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
          <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-5")}>
            <SchoolConfigForm />
          </div>
        </div>

        <div>
          <Collapsible>
            <CollapsibleTrigger
              onClick={() => setOpenScheduleRulesModal(!openScheduleRulesModal)}
            >
              <div className="mt-5 flex w-full items-start justify-start text-left font-semibold">
                Ver configuração avançada{" "}
                {openScheduleRulesModal ? (
                  <ArrowDownIcon className="h-6" />
                ) : (
                  <ArrowRightIcon className="h-6" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SubjectQuantitiesForm />
              <ClassClashForm />
            </CollapsibleContent>
          </Collapsible>
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
              // const toastId = toast.loading("Gerando horários...");
              await refetchGeneratedSchedule();
              // toast.dismiss(toastId);
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
): CalendarScheduledSlot[] {
  const classes: CalendarScheduledSlot[] = [];
  let _startTime = hoursToDate(startTime);
  for (let i = 0; i < numClasses; i++) {
    // calculate the end time of the class
    // the endtime is the start time + the duration of the class
    const endTime = new Date(
      _startTime.getTime() + classesDuration * 60 * 1000,
    );
    classes.push({
      startTime: _startTime,
      endTime: endTime,
    });
    _startTime = endTime;
  }
  return classes;
}
