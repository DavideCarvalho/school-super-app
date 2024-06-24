import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper } from "~/trpc/server";

export default async function OcurrencesPage({
  params,
}: {
  params: { "school-slug": string };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  const page = url.searchParams?.has("page")
    ? Number(url.searchParams.get("page"))
    : 1;
  const size = url.searchParams?.has("size")
    ? Number(url.searchParams?.get("size"))
    : 10;
  const helper = await createSSRHelper();
  helper.student.allBySchoolId.prefetch({
    page,
    size,
  });
  helper.student.countAllBySchoolId.prefetch();
  const dehydratedState = dehydrate(helper.queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ocorrências</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-aluno`}
        >
          <Button>Nova ocorrência</Button>
        </Link>
      </div>
      <h1>Em construção</h1>
    </HydrationBoundary>
  );
}
