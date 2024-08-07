import {
  addDays,
  eachWeekOfInterval,
  getDay,
  isSameDay,
  subDays,
} from "date-fns";

import { prisma } from "@acme/db";

import * as academicPeriodRepository from "../repository/academicPeriod.repository";

export async function getCurrentOrLastActiveAcademicPeriod(schoolId: string) {
  let academicPeriod =
    await academicPeriodRepository.getCurrentAcademicPeriod(schoolId);
  if (!academicPeriod) {
    academicPeriod =
      await academicPeriodRepository.getLastActiveAcademicPeriod(schoolId);
  }
  return academicPeriod;
}

export async function getTeacherHasClassAmmountOfClassesOverAcademicPeriod(
  teacherHasClassId: string,
  academicPeriodId: string,
) {
  const academicPeriod =
    await academicPeriodRepository.findById(academicPeriodId);

  if (!academicPeriod) {
    throw new Error("AcademicPeriod not found");
  }

  const teacherHasClassCalendarSlots = await prisma.calendarSlot.findMany({
    where: {
      Calendar: {
        academicPeriodId,
        isActive: true,
      },
      teacherHasClassId,
    },
  });

  const holidays = academicPeriod.Holidays.map(
    (holiday) => new Date(holiday.date),
  );
  let totalClasses = 0;

  // Loop through each week to calculate the number of classes, excluding holidays
  for (const weekStart of eachWeekOfInterval({
    start: academicPeriod.startDate,
    end: academicPeriod.endDate,
  })) {
    for (const slot of teacherHasClassCalendarSlots) {
      const slotDate = new Date(weekStart);
      slotDate.setHours(
        slot.startTime.getHours(),
        slot.startTime.getMinutes(),
        slot.startTime.getSeconds(),
        slot.startTime.getMilliseconds(),
      );

      // Check if the slotDate is a holiday
      const isHoliday = holidays.some((holiday) =>
        isSameDay(holiday, slotDate),
      );

      if (!isHoliday) {
        totalClasses++;
      }
    }
  }

  return totalClasses + academicPeriod.WeekendClasses.length;
}

export async function getTeacherHasClassDatesOverAcademicPeriod(
  teacherHasClassId: string,
  academicPeriodId: string,
) {
  const academicPeriod =
    await academicPeriodRepository.findById(academicPeriodId);

  if (!academicPeriod) {
    throw new Error("AcademicPeriod not found");
  }

  const teacherHasClassCalendarSlots = await prisma.calendarSlot.findMany({
    where: {
      Calendar: {
        academicPeriodId,
        isActive: true,
      },
      teacherHasClassId,
    },
  });

  const holidays = academicPeriod.Holidays.map(
    (holiday) => new Date(holiday.date),
  );
  const classDates: Date[] = [];

  // Loop through each week to calculate the number of classes, excluding holidays
  for (const weekStart of eachWeekOfInterval({
    start: academicPeriod.startDate,
    end: academicPeriod.endDate,
  })) {
    for (const slot of teacherHasClassCalendarSlots) {
      const slotDate = new Date(weekStart);
      slotDate.setHours(
        slot.startTime.getHours(),
        slot.startTime.getMinutes(),
        slot.startTime.getSeconds(),
        slot.startTime.getMilliseconds(),
      );

      // Check if the slotDate is a holiday
      const isHoliday = holidays.some((holiday) =>
        isSameDay(holiday, slotDate),
      );

      if (!isHoliday) {
        classDates.push(slotDate);
      }
    }
  }

  return classDates;
}

// Função para contar o número de aulas perto de feriados
export async function countHolidayClasses(
  academicPeriodId: string,
  studentId: string,
) {
  const holidays = await prisma.academicPeriodHoliday.findMany({
    where: {
      academicPeriodId,
      date: {
        gte: new Date(),
      },
    },
  });

  let holidayClasses = 0;

  for (const holiday of holidays) {
    const holidayDate = new Date(holiday.date);
    const dayOfWeek = getDay(holidayDate); // 0 = domingo, 1 = segunda, ..., 2 = terça, 4 = quinta, 5 = sexta

    const datesToCheck = [holidayDate];

    if (dayOfWeek === 1) {
      // Se o feriado for na segunda-feira
      datesToCheck.push(holidayDate);
    } else if (dayOfWeek === 2) {
      // Se o feriado for na terça-feira
      datesToCheck.push(subDays(holidayDate, 1), holidayDate);
    } else if (dayOfWeek === 4) {
      // Se o feriado for na quinta-feira
      datesToCheck.push(addDays(holidayDate, 1));
    } else if (dayOfWeek === 5) {
      // Se o feriado for na sexta-feira
      datesToCheck.push(holidayDate);
    }

    const classesAroundHoliday = await prisma.calendarSlot.findMany({
      where: {
        Calendar: {
          academicPeriodId,
          isActive: true,
        },
        TeacherHasClass: {
          Class: {
            Student: {
              some: { id: studentId },
            },
          },
        },
      },
      include: {
        Attendance: true,
        Calendar: {
          include: {
            AcademicPeriod: true,
          },
        },
      },
    });

    for (const slot of classesAroundHoliday) {
      for (const date of datesToCheck) {
        const slotDate = new Date(slot.Calendar.AcademicPeriod.startDate);
        slotDate.setDate(slotDate.getDate() + slot.classWeekDay);
        slotDate.setHours(
          slot.startTime.getHours(),
          slot.startTime.getMinutes(),
          slot.startTime.getSeconds(),
          slot.startTime.getMilliseconds(),
        );

        if (isSameDay(slotDate, date)) {
          holidayClasses++;
        }
      }
    }
  }

  return holidayClasses;
}
