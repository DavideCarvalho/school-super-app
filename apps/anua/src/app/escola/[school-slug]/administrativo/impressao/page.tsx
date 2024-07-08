import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { api, HydrateClient } from "~/trpc/server";
import { CheckPrintRequestModalListener } from "./_components/check-print-request-modal-listener";
import { NewPrintRequestModalListener } from "./_components/new-print-request-modal-listener";
import { RejectPrintRequestModalListener } from "./_components/reject-print-request-modal-listener";
import { ReviewPrintRequestModalListener } from "./_components/review-print-request-modal-listener";
import { PrintRequestTableV2 } from "./containers/print-request-table";

export default async function FilesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const size = searchParams.size ? Number(url.searchParams.size) : 10;
  await Promise.all([
    api.printRequest.allBySchoolId.prefetch({
      page,
      limit: size,
    }),
    api.printRequest.countAllBySchoolId.prefetch({
      statuses: undefined,
    }),
  ]);
  return (
    <HydrateClient>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Impressões</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#nova-impressao`}
        >
          <Button>Nova Impressão</Button>
        </Link>
      </div>
      <NewPrintRequestModalListener />
      <CheckPrintRequestModalListener />
      <RejectPrintRequestModalListener />
      <ReviewPrintRequestModalListener />
      <Suspense>
        <PrintRequestTableV2 />
      </Suspense>
    </HydrateClient>
  );
}
