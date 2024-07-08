import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prisma } from "@acme/db";
import { Button } from "@acme/ui/button";

import { api, createSSRHelper, HydrateClient } from "~/trpc/server";
import { EditCanteenItemModalListener } from "./_components/edit-canteen-item-modal-listener";
import { NewCanteenItemModalListener } from "./_components/new-canteen-item-modal-listener";
import { CanteenItemsTable } from "./containers/school-canteen-items-table";

export default async function CanteenItemsPage({
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
  const canteen = await prisma.canteen.findFirst({
    where: {
      schoolId: school.id,
    },
  });
  if (!canteen) throw new Error("Canteen not found");
  await Promise.all([
    api.canteen.allCanteenItems.prefetch({
      canteenId: canteen.id,
      page: Number(url.searchParams.get("page")),
      limit: Number(url.searchParams.get("limit")),
    }),
    api.canteen.countAllCanteenItems.prefetch({
      canteenId: canteen.id,
    }),
  ]);
  return (
    <HydrateClient>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Itens da cantina</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-item-cantina`}
        >
          <Button>Adicionar Item</Button>
        </Link>
      </div>

      <NewCanteenItemModalListener canteenId={canteen.id} />
      <EditCanteenItemModalListener canteenId={canteen.id} />
      <Suspense>
        <CanteenItemsTable canteenId={canteen.id} />
      </Suspense>
    </HydrateClient>
  );
}
