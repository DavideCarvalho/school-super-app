import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { AcademicPeriodTableClient } from "./containers/academic-period-table.client";

export default async function AcademicPeriodsPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Solicitações de compra</h2>
        <Link
          href={`/escola/${params["school-slug"]}/administrativo/periodos-letivos/novo-periodo-letivo`}
        >
          <Button>Criar período letivo</Button>
        </Link>
      </div>
      <Suspense>
        <AcademicPeriodTableClient />
      </Suspense>
    </>
  );
}
