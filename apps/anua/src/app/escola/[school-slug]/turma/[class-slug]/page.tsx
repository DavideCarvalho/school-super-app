import { api } from "~/trpc/server";

export default async function ClassPage({
  params,
}: {
  params: { "class-slug": string; "school-slug": string };
}) {
  const classSlug = params["class-slug"];
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    throw new Error("Class not found");
  }

  return null;
}
