import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import { api } from "~/trpc/server";
import { ClassTabs } from "./_components/class-tabs";
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
  const studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod =
    await api.class.getStudentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod(
      {
        classId: clasz.id,
        subjectId: foundSubject.id,
      },
    );
  const studentsWithLessThanMinimumGrade =
    await api.class.getStudentsWithLessThanMinimumGrade({
      classId: clasz.id,
      subjectId: foundSubject.id,
    });
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <SubjectSelectServer classId={clasz.id} subjectId={foundSubject.id} />
        <Carousel>
          <CarouselContent>
            {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length >
            0 ? (
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Presença
                    </CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {
                        studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length
                      }{" "}
                      {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length ===
                      1
                        ? "Aluno"
                        : "Alunos"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length ===
                      1
                        ? "Está com risco de reprovar por faltas"
                        : "Estão com risco de reprovar por faltas"}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ) : null}
            {studentsWithLessThanMinimumGrade.length > 0 ? (
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Notas</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {studentsWithLessThanMinimumGrade.length}{" "}
                      {studentsWithLessThanMinimumGrade.length === 1
                        ? "Aluno"
                        : "Alunos"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {studentsWithLessThanMinimumGrade.length === 1
                        ? "Está com nota menor que o mínimo"
                        : "Estão com nota menor que o mínimo"}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ) : null}
            <CarouselPrevious />
            <CarouselNext />
          </CarouselContent>
        </Carousel>
        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> */}
        {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Próxima Atividade
              </CardTitle>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Para 15/07/2024
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Atividade</div>
              <p className="text-sm text-muted-foreground">
                Dia de entrega da atividade está próximo!
              </p>
            </CardContent>
          </Card> */}
        {/* {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length >
          0 ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Presença</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {
                    studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length
                  }{" "}
                  {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length ===
                  1
                    ? "Aluno"
                    : "Alunos"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Estão com risco de reprovar por faltas.
                </p>
              </CardContent>
            </Card>
          ) : null} */}
        {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Guest Speaker</div>
              <p className="text-sm text-muted-foreground">
                4/20/2023 - 2:00 PM
              </p>
            </CardContent>
          </Card> */}
        {/* </div> */}
        <div className="flex flex-col gap-4">
          <ClassTabs />
          {children}
        </div>
      </div>
    </div>
  );
}
