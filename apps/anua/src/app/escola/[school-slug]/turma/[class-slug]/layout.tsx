import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import { ClassTabs } from "./_components/class-tabs";
import { SubjectInteligenceCarouselServer } from "./containers/subject-inteligence-carousel/subject-inteligence-carousel.server";
import { SubjectSelectServer } from "./containers/subject-select/subject-select.server";

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { "class-slug": string; "school-slug": string };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const classSlug = params["class-slug"];
  const clasz = await api.class.findBySlug({
    slug: classSlug as string,
  });
  if (!clasz) {
    throw new Error("Class not found");
  }
  const subjectSlug = url.searchParams.get("materia") as
    | string
    | null
    | undefined;
  const subjects =
    await api.academicPeriod.getSubjectsOnClassForCurrentAcademicPeriod({
      classId: clasz?.id,
    });
  const foundSubject = !subjectSlug
    ? subjects[0]
    : subjects.find((s) => s.slug === subjectSlug);
  if (!foundSubject) {
    return redirect(`/escola/${params["school-slug"]}`);
  }
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <SubjectSelectServer classId={clasz.id} subjectId={foundSubject.id} />
        <SubjectInteligenceCarouselServer
          classId={clasz.id}
          subjectId={foundSubject.id}
        />
        <div className="flex flex-col gap-4">
          <ClassTabs />
          {children}
        </div>
      </div>
    </div>
  );
}
