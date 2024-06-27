import { createColumnHelper } from "@tanstack/react-table";
import { isAfter, isBefore, isToday } from "date-fns";

import type { RouterOutputs } from "@acme/api";

import { brazilianDateFormatter } from "~/utils/brazilian-date-formatter";

type Row = RouterOutputs["class"]["getClassAttendance"][0];

export function useAttendancesTableColumns() {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("Student.User.name", {
      id: "name",
      header: "Aluno",
    }),
    columnHelper.accessor("attendedClasses", {
      id: "attendedClasses",
      header: "Presença",
    }),
    columnHelper.accessor((row) => `${row.attendancePercentage}%`, {
      id: "attendancePercentage",
      header: "Percentual de presença",
    }),
  ];
}
