import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { InteligenceCarouselClient } from "./inteligence-carousel.client";

export async function InteligenceCarouselServer() {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <InteligenceCarouselDataLoader />
      </Suspense>
    </ErrorBoundary>
  );
}

async function InteligenceCarouselDataLoader() {
  await Promise.all([
    api.inteligence.getPrintRequestsNotApprovedCloseToDueDate.prefetch(),
    api.inteligence.getPrintRequestsToPrintToday.prefetch(),
    api.inteligence.getPrintRequestsOwnerUserNeedToReview.prefetch(),
  ]);
  return (
    <HydrateClient>
      <InteligenceCarouselClient />
    </HydrateClient>
  );
}
