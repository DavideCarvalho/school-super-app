import { addDays, getDay, subDays } from "date-fns";

import { prisma } from "@acme/db";

// Função para verificar se o aluno costuma faltar perto de feriados
export async function checkIfStudentSkipsAroundHolidays(
  studentId: string,
  academicPeriodId: string,
  today: Date,
) {
  const holidays = await prisma.academicPeriodHoliday.findMany({
    where: {
      academicPeriodId,
      date: {
        lte: today,
      },
    },
  });

  let holidayAbsences = 0;

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

    const absencesAroundHoliday = await prisma.studentHasAttendance.count({
      where: {
        studentId,
        present: false,
        Attendance: {
          date: {
            in: datesToCheck,
          },
          CalendarSlot: {
            Calendar: {
              academicPeriodId,
            },
          },
        },
      },
    });

    if (absencesAroundHoliday > 0) {
      holidayAbsences++;
    }
  }

  return holidayAbsences >= holidays.length / 2;
}
