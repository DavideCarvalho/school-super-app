"use client";

import { useSearchParams } from "next/navigation";

import { SchoolCalendarGrid } from "~/components/school-calendar-grid";
import { api } from "~/trpc/react";

export function SchoolCalendarGridClient() {
  const searchParams = useSearchParams();
  const selectedClass = searchParams?.get("classe");
  const { data: foundClass } = api.class.findBySlug.useQuery(
    {
      slug: selectedClass as string,
    },
    {
      enabled: selectedClass != null,
    },
  );
  return <SchoolCalendarGrid classId={foundClass?.id} />;
}
