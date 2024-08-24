import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { api, HydrateClient } from "~/trpc/server";
import { SubjectInteligenceCarouselClient } from "./subject-inteligence-carousel.client";

interface SubjectInteligenceCarouselServerProps {
  classId: string;
  subjectId: string;
}

export async function SubjectInteligenceCarouselServer(
  props: SubjectInteligenceCarouselServerProps,
) {
  return (
    <ErrorBoundary fallback={<p>⚠️Opa, algo deu errado</p>}>
      <Suspense>
        <SubjectInteligenceCarouselDataLoader {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function SubjectInteligenceCarouselDataLoader(
  props: SubjectInteligenceCarouselServerProps,
) {
  await Promise.all([
    api.class.getStudentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.prefetch(
      {
        classId: props.classId,
        subjectId: props.subjectId,
      },
    ),
    api.class.getStudentsWithLessThanMinimumGrade.prefetch({
      classId: props.classId,
      subjectId: props.subjectId,
    }),
  ]);
  return (
    <HydrateClient>
      <SubjectInteligenceCarouselClient
        classId={props.classId}
        subjectId={props.subjectId}
      />
    </HydrateClient>
  );
}
