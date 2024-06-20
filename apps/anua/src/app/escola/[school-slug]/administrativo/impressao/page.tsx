import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper } from "~/trpc/server";
import { ApprovePrintRequestModalListener } from "./_components/approve-print-request-modal-listener";
import { NewPrintRequestModalListener } from "./_components/new-print-request-modal-listener";
import { RejectPrintRequestModalListener } from "./_components/reject-print-request-modal-listener";
import { ReviewPrintRequestModalListener } from "./_components/review-print-request-modal-listener";
import { PrintRequestTableV2 } from "./containers/print-request-table";

export default async function FilesPage({
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
  await helper.teacher.getSchoolTeachers.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("limit")),
  });
  await helper.teacher.countSchoolTeachers.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Impressões</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#nova-impressao`}
        >
          <Button>Nova Impressão</Button>
        </Link>
      </div>
      <NewPrintRequestModalListener />
      <ApprovePrintRequestModalListener />
      <RejectPrintRequestModalListener />
      <ReviewPrintRequestModalListener />
      <Suspense>
        <PrintRequestTableV2 />
      </Suspense>
    </HydrationBoundary>
  );
}
