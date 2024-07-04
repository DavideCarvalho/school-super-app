import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { GradesTableServer } from "./containers/grades-table/grades-table.server";

export default async function ClassGradesPage({
  params,
}: {
  params: { "class-slug": string; "school-slug": string };
}) {
  const classSlug = params["class-slug"];
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }
  return (
    <>
      <Link href="notas/adicionar-notas">
        <Button>Adicionar notas</Button>
      </Link>
      <GradesTableServer classId={foundClass.id} />
    </>
  );
}
