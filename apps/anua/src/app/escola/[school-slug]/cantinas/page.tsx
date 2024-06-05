import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { CanteensTableV2 } from "~/components/school-canteens-table-v2";
import { api, createSSRHelper } from "~/trpc/server";
import { EditCanteenModalListener } from "./_components/edit-canteen-modal-listener";
import { NewCanteenModalListener } from "./_components/new-canteen-modal-listener";

export default async function CanteensPage({
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
  const helper = await createSSRHelper();
  await helper.canteen.allBySchoolId.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("limit")),
  });
  await helper.canteen.countAllBySchoolId.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cantinas</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-cantina`}
        >
          <Button>Adicionar Cantina</Button>
        </Link>
      </div>

      <NewCanteenModalListener />
      <EditCanteenModalListener />
      <Suspense>
        <CanteensTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}
