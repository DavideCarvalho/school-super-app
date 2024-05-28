import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { TeachersTableV2 } from "~/components/school-teachers-table-v2";
import { api, createSSRHelper } from "~/trpc/server";

export default async function TeachersPage({
  params,
  searchParams,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const helper = await createSSRHelper();
  await helper.teacher.getSchoolTeachers.prefetch({
    schoolId: school.id,
    page: searchParams?.page ? parseInt(searchParams.page as string) : 1,
    limit: searchParams?.limit ? parseInt(searchParams.limit as string) : 10,
  });
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <TeachersTableV2 schoolId={school.id} />
    </HydrationBoundary>
  );
}
