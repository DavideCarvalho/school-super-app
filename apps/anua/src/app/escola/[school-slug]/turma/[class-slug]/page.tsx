import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

export default async function ClassPage({
  params,
}: {
  params: { "class-slug": string; "school-slug": string };
}) {
  const classSlug = params["class-slug"];
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }

  return null;
}
