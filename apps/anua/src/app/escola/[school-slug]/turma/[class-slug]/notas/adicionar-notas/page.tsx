import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import { AssignmentsGradesClient } from "./containers/assignments-grades/assignments-grades.client";

export default async function AddGradesPage({
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
    <div>
      <AssignmentsGradesClient classId={foundClass.id} />
    </div>
  );
}
