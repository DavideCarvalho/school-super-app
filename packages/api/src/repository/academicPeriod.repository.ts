import { endOfDay, startOfDay } from "date-fns";

import { prisma } from "@acme/db";

// current academic period means
// the academic period that is being used
// and being used means we're between the start and end date
// e.g: we have a period from 1/1/2023 to 1/2/2023
//      and we're on 1/1/2023
//      then the current academic period is the one from 1/1/2023 to 1/2/2023
export function getCurrentAcademicPeriod() {
  const currentDate = new Date();
  return prisma.academicPeriod.findFirst({
    where: {
      startDate: {
        lte: startOfDay(currentDate),
      },
      endDate: {
        gte: endOfDay(currentDate),
      },
    },
    orderBy: {
      startDate: "desc",
    },
    include: {
      Holidays: true,
      WeekendClasses: true,
    },
  });
}

// latest academic period means
// the the last one created
export function getLatestAcademicPeriod() {
  return prisma.academicPeriod.findFirst({
    orderBy: {
      startDate: "desc",
    },
    include: {
      Holidays: true,
      WeekendClasses: true,
    },
  });
}

// last active academic period means
// is the last one being used
// and it will only be used when we're between the start and end date
export function getLastActiveAcademicPeriod() {
  const currentDate = new Date();
  return prisma.academicPeriod.findFirst({
    where: {
      endDate: {
        lt: endOfDay(currentDate),
      },
    },
    orderBy: {
      startDate: "desc",
    },
    include: {
      Holidays: true,
      WeekendClasses: true,
    },
  });
}

export function findById(academicPeriodId: string) {
  return prisma.academicPeriod.findUnique({
    where: {
      id: academicPeriodId,
    },
    include: {
      Holidays: true,
      WeekendClasses: true,
    },
  });
}
