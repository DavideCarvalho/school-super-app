import { Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { SchoolCalendarGrid } from "~/components/school-calendar-grid";
import { api, createSSRHelper } from "~/trpc/server";
import { ClassesSelect } from "./_components/classes-select";
import { SchoolCalendarGridClient } from "./containers/school-calendar-grid/school-calendar-grid.client";

export default async function SchoolCalendarPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const helper = await createSSRHelper();
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const selectedClassSlug = url.searchParams.get("classe") as string | null;
  if (selectedClassSlug) {
    const foundClass = await api.class.findBySlug({ slug: selectedClassSlug });
    if (foundClass) {
      await helper.school.generateSchoolCalendar.prefetch({
        fixedClasses: [],
        scheduleConfig: {
          Monday: { start: "07:00", numClasses: 6, duration: 50 },
          Tuesday: { start: "07:00", numClasses: 6, duration: 50 },
          Wednesday: { start: "07:00", numClasses: 6, duration: 50 },
          Thursday: { start: "07:00", numClasses: 6, duration: 50 },
          Friday: { start: "07:00", numClasses: 6, duration: 50 },
        },
        classId: foundClass.id,
      });
      await helper.school.getClassSchedule.prefetch({
        classId: foundClass.id,
      });
    }
  }
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  await Promise.all([
    helper.teacher.getTeachersAvailableDays.prefetch(),
    helper.class.allBySchoolId.prefetch({
      page: 999,
    }),
  ]);
  await helper.class.countAllBySchoolId.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendário escolar</h2>
      </div>
      <div className="mb-5 flex w-full items-center justify-center">
        <ClassesSelect />
      </div>
      <Suspense>
        <SchoolCalendarGridClient />
      </Suspense>
    </HydrationBoundary>
  );
}
