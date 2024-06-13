import type { DragEndEvent } from "@dnd-kit/core";
import { useMemo } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Subject, Teacher, TeacherAvailability, User } from "@acme/db";

import "~/components/ui/table";

import { useFormContext } from "react-hook-form";

import type { ClassKey, DayOfWeek } from "../..";
import { CheckBox } from "~/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface CalendarGridScheduledClass {
  Teacher:
    | (Teacher & {
        TeacherAvailability: TeacherAvailability[];
        User: User;
      })
    | null;
  Subject: Subject | null;
  startTime: string;
  endTime: string;
}

export interface CalendarGridSchedule {
  Monday: CalendarGridScheduledClass[];
  Tuesday: CalendarGridScheduledClass[];
  Wednesday: CalendarGridScheduledClass[];
  Thursday: CalendarGridScheduledClass[];
  Friday: CalendarGridScheduledClass[];
}

export interface CalendarGridProps {
  newSchedule: boolean;
  schedule: CalendarGridSchedule;
  handleDragEnd: (event: DragEndEvent) => void;
  handleClickOnClass: (classKey: ClassKey) => void;
  fixedClasses: string[];
}

// TODO: Renomear pra "CalendarGridHours" talvez?
// TODO: Bem, o nome tem que ser suficientemente diferente do
// TODO: SchoolCalendarGrid
export function CalendarGrid({
  newSchedule = false,
  schedule,
  handleDragEnd,
  handleClickOnClass,
  fixedClasses,
}: CalendarGridProps) {
  const { watch } = useFormContext();
  const scheduleConfig = watch("scheduleConfig");
  const daysOfWeek = Object.keys(scheduleConfig) as unknown as DayOfWeek[];
  const allTimeSlots = useMemo(
    () =>
      Array.from(
        new Set(
          Object.keys(schedule).flatMap((day) => {
            const daySchedule = schedule[day as keyof typeof schedule];
            if (!Array.isArray(daySchedule)) return [];
            return daySchedule.map(
              (entry) => `${entry?.startTime}-${entry?.endTime}`,
            );
          }),
        ),
      ).sort(),
    [schedule],
  );
  const allClassKeys = useMemo(
    () =>
      Object.keys(schedule).flatMap((day) => {
        const daySchedule = schedule[day as keyof typeof schedule];
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
    [schedule],
  );

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
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            {daysOfWeek.map((day: DayOfWeek) => (
              <TableHead key={day}>{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext items={allClassKeys} strategy={rectSwappingStrategy}>
            {allTimeSlots.map((timeSlot) => {
              const [startTime, endTime] = timeSlot.split("-");
              return (
                <TableRow key={timeSlot} className="hover:bg-gray-100">
                  <TableCell className="border-b border-gray-300 px-4 py-2">{`${startTime} - ${endTime}`}</TableCell>
                  {daysOfWeek.map((day: DayOfWeek) => {
                    const entry = schedule[day as keyof typeof schedule].find(
                      (e) => e.startTime === startTime && e.endTime === endTime,
                    );
                    if (!entry || !entry.Teacher || !entry.Subject) {
                      const blankCellKey = generateBlankCellKey(
                        day as keyof typeof schedule,
                        startTime as string,
                        endTime as string,
                      );
                      return (
                        <BlankCell id={blankCellKey} draggable={newSchedule} />
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
                        toggleFixedClass={handleClickOnClass}
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
  );
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
  return `${day}_${startTime}-${endTime}_-_-_-BLANK${new Date().getTime()}`;
}

interface ScheduledClassProps {
  classKey: ClassKey;
  isSelected: boolean;
  toggleFixedClass: (classKey: ClassKey) => void;
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
  draggable: boolean;
}

function BlankCell({ id, draggable }: BlankCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  if (!draggable) {
    return (
      <TableCell className="border-b border-gray-300 px-4 py-2 text-center">
        -
      </TableCell>
    );
  }
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
