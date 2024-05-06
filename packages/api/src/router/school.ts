import { z } from "zod";

import type {
  Subject,
  Teacher,
  TeacherAvailability,
  TeacherHasSubject,
  User,
} from "@acme/db";
import { prisma } from "@acme/db";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const schoolRouter = createTRPCRouter({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.school.findFirst({ where: { slug: input.slug } });
    }),
  generateSchoolCalendar: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        fixedClasses: z.array(z.string()),
        scheduleConfig: z.object({
          Monday: z.object({ start: z.string(), end: z.string() }),
          Tuesday: z.object({ start: z.string(), end: z.string() }),
          Wednesday: z.object({ start: z.string(), end: z.string() }),
          Thursday: z.object({ start: z.string(), end: z.string() }),
          Friday: z.object({ start: z.string(), end: z.string() }),
        }),
      }),
    )
    .query(async ({ input }) => {
      const schedule = generateSchoolSchedule(
        input.schoolId,
        input.fixedClasses,
        input.scheduleConfig,
      );
      return schedule;
    }),
});

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

// Definição dos tipos
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleEntry {
  Teacher: Teacher & {
    TeacherAvailability: TeacherAvailability[];
    TeacherHasSubject: TeacherHasSubject[];
    User: User;
  };
  Subject: Subject;
  startTime: string;
  endTime: string;
}

type Schedule = {
  [key in DayOfWeek]: ScheduleEntry[];
};

interface SubjectWithRemainingLessons extends Subject {
  remainingLessons: number;
}

async function generateSchoolSchedule(
  schoolId: string,
  fixedClasses: string[],
  scheduleConfig: Record<DayOfWeek, { start: string; end: string }>,
): Promise<Schedule> {
  const teachers = await prisma.teacher.findMany({
    where: {
      User: {
        schoolId,
      },
    },
    include: {
      TeacherAvailability: true,
      TeacherHasSubject: true,
      User: true,
    },
  });

  const subjects = await prisma.subject.findMany({
    where: {
      schoolId,
    },
  });

  const subjectsWithLessons: SubjectWithRemainingLessons[] = subjects.map(
    (sub) => ({
      ...sub,
      remainingLessons: sub.quantityNeededScheduled,
    }),
  );

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const schedule = initializeSchedule();

  // Respeitar as aulas fixas
  for (const classKey of fixedClasses) {
    const [day, timeSlot, teacherId, subjectId] = classKey.split("_") as [
      DayOfWeek,
      string,
      string,
      string,
    ];
    const [startTime, endTime] = timeSlot.split("-") as [string, string];
    const teacher = teachers.find((t) => t.id === teacherId);
    const subject = subjectsWithLessons.find((s) => s.id === subjectId);

    if (teacher && subject) {
      schedule[day as DayOfWeek].push({
        Teacher: teacher,
        Subject: subject,
        startTime,
        endTime,
      });

      subject.remainingLessons--;
    }
  }

  // Continuar a geração do calendário respeitando a configuração do horário
  for (const day of daysOfWeek) {
    const dayConfig = scheduleConfig[day as DayOfWeek];
    if (!dayConfig) continue; // Ignorar dias sem configuração

    const timeSlots = generateTimeSlots(dayConfig.start, dayConfig.end);

    for (const timeSlot of timeSlots) {
      for (const teacher of teachers) {
        const existingClass = schedule[day as DayOfWeek].find(
          (entry) =>
            entry.Teacher.id === teacher.id &&
            entry.startTime === timeSlot.startTime &&
            entry.endTime === timeSlot.endTime,
        );

        if (existingClass) continue;

        const subject = findRandomSubjectForTeacher(
          teacher,
          subjectsWithLessons,
          day as DayOfWeek,
          timeSlot,
          schedule,
        );

        if (subject) {
          schedule[day as DayOfWeek].push({
            Teacher: teacher,
            Subject: subject,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          });

          subject.remainingLessons--;
        }
      }
    }
  }

  return schedule;
}

function generateTimeSlots(startTime: string, endTime: string): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  let start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  while (start < end) {
    const next = new Date(start.getTime() + 50 * 60 * 1000); // 50 minutos para cada aula
    if (next > end) break;
    timeSlots.push({
      startTime: start.toTimeString().substring(0, 5),
      endTime: next.toTimeString().substring(0, 5),
    });
    start = next; // Começa o próximo horário imediatamente após o término do anterior
  }
  return timeSlots;
}

function initializeSchedule(): Schedule {
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };
}

function findRandomSubjectForTeacher(
  teacher: Teacher & {
    TeacherAvailability: TeacherAvailability[];
    TeacherHasSubject: TeacherHasSubject[];
  },
  subjects: SubjectWithRemainingLessons[],
  day: DayOfWeek,
  timeSlot: TimeSlot,
  schedule: Schedule,
): SubjectWithRemainingLessons | null | undefined {
  // Verificar se o professor está disponível no dia e horário
  const availabilityForDay = teacher.TeacherAvailability.some(
    (avail) =>
      avail.day === day &&
      avail.startTime <= timeSlot.startTime &&
      avail.endTime >= timeSlot.endTime,
  );

  if (!availabilityForDay) return null;

  // Obter a programação do professor para o dia atual
  const teacherSchedule =
    schedule[day]?.filter((entry) => entry.Teacher.id === teacher.id) || [];

  // Obter a última matéria agendada no dia
  const lastSubject = teacherSchedule.length
    ? teacherSchedule[teacherSchedule.length - 1]?.Subject
    : null;

  // Filtrar as matérias restantes do professor
  const eligibleSubjects = subjects.filter(
    (sub) =>
      teacher.TeacherHasSubject.some((ths) => ths.subjectId === sub.id) &&
      sub.remainingLessons > 0,
  );

  // Priorizar a mesma matéria se houver espaço
  if (lastSubject) {
    const sameSubject = eligibleSubjects.find(
      (sub) => sub.id === lastSubject.id,
    );
    if (sameSubject) return sameSubject;
  }

  // Escolher aleatoriamente a partir das matérias restantes
  return eligibleSubjects.length > 0
    ? eligibleSubjects[Math.floor(Math.random() * eligibleSubjects.length)]
    : null;
}
function getPreviousDay(day: DayOfWeek): DayOfWeek | null | undefined {
  const daysOfWeek: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];
  const dayIndex = daysOfWeek.indexOf(day);
  return dayIndex > 0 ? daysOfWeek[dayIndex - 1] : null;
}
