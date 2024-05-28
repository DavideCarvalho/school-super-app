import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { TeachersTableV2 } from "~/components/school-teachers-table-v2";
import { api, createSSRHelper } from "~/trpc/server";

export default async function TeachersPage({
  params,
}: {
  params: { "school-slug": string };
}) {
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const helper = await createSSRHelper();
  await helper.teacher.getSchoolTeachers.prefetch({
    schoolId: school.id,
    page: 1,
    limit: 5,
  });
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <TeachersTableV2 schoolId={school.id} />
    </HydrationBoundary>
  );
}
