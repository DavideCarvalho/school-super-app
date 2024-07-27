import { eachWeekOfInterval, isSameDay } from "date-fns";

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
