import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prisma } from "@acme/db";
import { Button } from "@acme/ui/button";

import { CanteenItemsTableV2 } from "~/components/school-canteen-items-table-v2";
import { api, createSSRHelper } from "~/trpc/server";

export default async function SubjectsPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  if (!url.searchParams.has("page")) {
    url.searchParams.set("page", "1");
  }
  if (!url.searchParams.has("limit")) {
    url.searchParams.set("limit", "10");
  }
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const canteen = await prisma.canteen.findFirst({
    where: {
      schoolId: school.id,
    },
  });
  if (!canteen) throw new Error("Canteen not found");
  const helper = await createSSRHelper();
  await Promise.all([
    helper.canteen.allCanteenItems.prefetch({
      canteenId: canteen.id,
      page: Number(url.searchParams.get("page")),
      limit: Number(url.searchParams.get("limit")),
    }),
    helper.canteen.countAllCanteenItems.prefetch({
      canteenId: canteen.id,
    }),
  ]);
  await helper.subject.countAllBySchoolId.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Matérias</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-materia`}
        >
          <Button>Adicionar Item</Button>
        </Link>
      </div>

      {/* <NewSubjectModalListener /> */}
      {/* <EditSubjectModalListener /> */}
      <Suspense>
        <CanteenItemsTableV2 canteenId={canteen.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
