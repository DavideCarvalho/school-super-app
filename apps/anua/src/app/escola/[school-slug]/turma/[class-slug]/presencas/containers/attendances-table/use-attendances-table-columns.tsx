import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

import type { RouterOutputs } from "@acme/api";

type Row =
  RouterOutputs["attendance"]["getClassAttendancesDoneForCurrentAcademicPeriod"][0];

export function useStudentsAttendancesTableColumns() {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor((row) => format(row.date, "dd/MM/yyyy HH:mm"), {
      id: "attendedClasses",
      header: "Aula",
    }),
    columnHelper.accessor("CalendarSlot.TeacherHasClass.Subject.name", {
      header: "Matéria",
    }),
    columnHelper.accessor("CalendarSlot.TeacherHasClass.Teacher.User.name", {
      header: "Professor",
    }),
    columnHelper.accessor("id", {
      id: "attendanceNumber",
      header: "Presentes",
      cell: ({ row }) => {
        return (
          <p>
            {
              row.original.StudentHasAttendance.filter(
                (attendance) => attendance.present,
              ).length
            }{" "}
            / {row.original.StudentHasAttendance.length}
          </p>
        );
      },
    }),
  ];
}
