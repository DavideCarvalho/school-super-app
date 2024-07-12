import { Suspense } from "react";

import { api, HydrateClient } from "~/trpc/server";
import { ClassesSelect } from "./_components/classes-select";
import { SchoolCalendarGridClient } from "./containers/school-calendar-grid/school-calendar-grid.client";

export default async function SchoolCalendarPage({
  searchParams,
}: {
  params: { "school-slug": string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const selectedClassSlug = searchParams.classe as string | null;
  if (selectedClassSlug) {
    const foundClass = await api.class.findBySlug({ slug: selectedClassSlug });
    if (foundClass) {
      await api.school.generateSchoolCalendar.prefetch({
        fixedClasses: [],
        scheduleConfig: {
          Monday: { start: "07:00", numClasses: 6, duration: 50 },
          Tuesday: { start: "07:00", numClasses: 6, duration: 50 },
          Wednesday: { start: "07:00", numClasses: 6, duration: 50 },
          Thursday: { start: "07:00", numClasses: 6, duration: 50 },
          Friday: { start: "07:00", numClasses: 6, duration: 50 },
        },
        classId: foundClass.id,
        generationRules: {
          subjectsExclusions: {},
        },
      });
      await api.school.getClassSchedule.prefetch({
        classId: foundClass.id,
      });
    }
  }
  await Promise.all([
    api.teacher.getTeachersAvailableDays.prefetch(),
    api.class.allBySchoolId.prefetch({
      page: 999,
    }),
  ]);
  await api.class.countAllBySchoolId.prefetch();
  return (
    <HydrateClient>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendário escolar</h2>
      </div>
      <div className="mb-5 flex w-full items-center justify-center">
        <ClassesSelect />
      </div>
      <Suspense>
        <SchoolCalendarGridClient />
      </Suspense>
    </HydrateClient>
  );
}
