"use client";

import { useState } from "react";
import PrinterIcon from "@heroicons/react/24/outline/PrinterIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import { api } from "~/trpc/react";

export function InteligenceCarouselClient() {
  const [openInteligenceCarousel, setOpenInteligenceCarousel] = useState([
    "item-1",
  ]);
  const { data: printRequestsNotApprovedCloseToDueDate } =
    api.inteligence.getPrintRequestsNotApprovedCloseToDueDate.useQuery();
  const { data: printRequestsToPrintToday } =
    api.inteligence.getPrintRequestsToPrintToday.useQuery();
  const { data: printRequestsOwnerUserNeedToReview } =
    api.inteligence.getPrintRequestsOwnerUserNeedToReview.useQuery();
  const { data: studentsWithPossibilityOfReprovingByAvoidance } =
    api.inteligence.getStudentsWithPossibilityOfReprovingByAvoidanceOnCurrentAcademicPeriod.useQuery(
      {
        page: 1,
        limit: 999,
      },
    );
  const { data: studentsWithLessThanMinimumGrade } =
    api.inteligence.getStudentsWithLessThanMinimumGrade.useQuery();

  const noInconsistenciesFound =
    printRequestsNotApprovedCloseToDueDate?.length === 0 &&
    printRequestsToPrintToday?.length === 0 &&
    printRequestsOwnerUserNeedToReview?.length === 0 &&
    studentsWithPossibilityOfReprovingByAvoidance?.length === 0 &&
    studentsWithLessThanMinimumGrade?.length === 0;

  let inconsistenciesAmmount = 0;
  if (
    printRequestsNotApprovedCloseToDueDate &&
    printRequestsNotApprovedCloseToDueDate?.length > 0
  ) {
    inconsistenciesAmmount += 1;
  }
  if (printRequestsToPrintToday && printRequestsToPrintToday?.length > 0) {
    inconsistenciesAmmount += 1;
  }
  if (
    printRequestsOwnerUserNeedToReview &&
    printRequestsOwnerUserNeedToReview?.length > 0
  ) {
    inconsistenciesAmmount += 1;
  }
  if (
    studentsWithPossibilityOfReprovingByAvoidance &&
    studentsWithPossibilityOfReprovingByAvoidance?.length > 0
  ) {
    inconsistenciesAmmount += 1;
  }
  if (
    studentsWithLessThanMinimumGrade &&
    studentsWithLessThanMinimumGrade?.length > 0
  ) {
    inconsistenciesAmmount += 1;
  }
  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={openInteligenceCarousel}
      onValueChange={setOpenInteligenceCarousel}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-lg">
          {!noInconsistenciesFound && openInteligenceCarousel.length > 0
            ? "Inteligência"
            : `Inteligência (${inconsistenciesAmmount})*`}
        </AccordionTrigger>
        <AccordionContent>
          {noInconsistenciesFound ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Parabéns, não vemos nenhum problema!
              </p>
            </div>
          ) : null}
          {!noInconsistenciesFound ? (
            <div className="flex content-center items-center justify-center">
              <Carousel className="w-[80%] sm:min-h-0 md:min-h-[126px] lg:min-h-[126px]">
                <CarouselContent>
                  {printRequestsNotApprovedCloseToDueDate &&
                  printRequestsNotApprovedCloseToDueDate?.length > 0 ? (
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Impressão
                          </CardTitle>
                          <PrinterIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">
                            {printRequestsNotApprovedCloseToDueDate.length}{" "}
                            {printRequestsNotApprovedCloseToDueDate.length === 1
                              ? "Impressão"
                              : "Impressões"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {printRequestsNotApprovedCloseToDueDate.length === 1
                              ? "Está em risco de não ser impressa a tempo"
                              : "Estão em risco de não ser impressas a tempo"}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ) : null}

                  {printRequestsToPrintToday &&
                  printRequestsToPrintToday?.length > 0 ? (
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Impressão
                          </CardTitle>
                          <PrinterIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">
                            {printRequestsToPrintToday.length}{" "}
                            {printRequestsToPrintToday.length === 1
                              ? "Impressão"
                              : "Impressões"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {printRequestsToPrintToday.length === 1
                              ? "Precisa ser impressa hoje"
                              : "Precisam ser impressas hoje"}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ) : null}

                  {printRequestsOwnerUserNeedToReview &&
                  printRequestsOwnerUserNeedToReview?.length > 0 ? (
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Impressão
                          </CardTitle>
                          <PrinterIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">
                            {printRequestsOwnerUserNeedToReview.length}{" "}
                            {printRequestsOwnerUserNeedToReview.length === 1
                              ? "Impressão"
                              : "Impressões"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {printRequestsOwnerUserNeedToReview.length === 1
                              ? "Precisa ser revisada"
                              : "Precisam ser revisadas"}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ) : null}

                  {studentsWithPossibilityOfReprovingByAvoidance &&
                  studentsWithPossibilityOfReprovingByAvoidance?.length > 0 ? (
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Alunos
                          </CardTitle>
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">
                            {
                              studentsWithPossibilityOfReprovingByAvoidance.length
                            }{" "}
                            {studentsWithPossibilityOfReprovingByAvoidance.length ===
                            1
                              ? "Aluno"
                              : "Alunos"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {studentsWithPossibilityOfReprovingByAvoidance.length ===
                            1
                              ? "Está em risco de reprovar por faltas"
                              : "Estão em risco de reprovar por faltas"}
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
                          <CardTitle className="text-sm font-medium">
                            Alunos
                          </CardTitle>
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
                              ? "Está em risco de reprovar por nota"
                              : "Estão em risco de reprovar por nota"}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ) : null}
                </CarouselContent>
                {inconsistenciesAmmount >= 3 ? (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                ) : null}
              </Carousel>
            </div>
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
