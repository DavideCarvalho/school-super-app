import { Suspense } from "react";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { AcademicPeriodTableClient } from "./containers/academic-period-table.client";

export default async function AcademicPeriodsPage({
  params,
}: {
  params: { "school-slug": string };
}) {
  const schoolSlug = params["school-slug"];
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Solicitações de compra</h2>
        <Link
          href={`/escola/${schoolSlug}/administrativo/periodos-letivos/novo-periodo-letivo`}
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
