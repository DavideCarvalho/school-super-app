"use client";

import { UsersIcon } from "@heroicons/react/24/outline";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import { api } from "~/trpc/react";

interface SubjectInteligenceCarouselClientProps {
  classId: string;
  subjectId: string;
}

export function SubjectInteligenceCarouselClient({
  classId,
  subjectId,
}: SubjectInteligenceCarouselClientProps) {
  const {
    data: studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod,
  } =
    api.class.getStudentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.useQuery(
      {
        classId,
        subjectId,
      },
    );
  const { data: studentsWithLessThanMinimumGrade } =
    api.class.getStudentsWithLessThanMinimumGrade.useQuery({
      classId,
      subjectId,
    });
  return (
    <Carousel>
      <CarouselContent>
        {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod &&
        studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod?.length >
          0 ? (
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
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
                  {studentsWithPossibilityOfReprovingByAvoidanceForClassOnCurrentAcademicPeriod.length ===
                  1
                    ? "Está com risco de reprovar por faltas"
                    : "Estão com risco de reprovar por faltas"}
                </p>
              </CardContent>
            </Card>
          </CarouselItem>
        ) : null}
        {studentsWithLessThanMinimumGrade &&
        studentsWithLessThanMinimumGrade?.length > 0 ? (
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
  );
}
