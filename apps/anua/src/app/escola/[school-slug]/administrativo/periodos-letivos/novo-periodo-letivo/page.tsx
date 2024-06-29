"use client";

import type { StepItem } from "@acme/ui/stepper";
import { Button } from "@acme/ui/button";
import { Step, Stepper, useStepper } from "@acme/ui/stepper";

import { SubjectsTableClient } from "../../../materias/containers/school-subjects-table/subjects-table.client";
import { StudentsTableClient } from "../../alunos/containers/students-table/students-table.client";

const steps = [
  { label: "Alunos" },
  { label: "Matérias" },
  { label: "Professores" },
  { label: "Grade" },
] satisfies StepItem[];

export default function NewAcademicPeriodPage() {
  return (
    <>
      <h2 className="text-xl font-semibold">Novo período letivo</h2>
      <div className="flex w-full flex-col gap-4">
        <Stepper initialStep={0} steps={steps} variant="circle-alt">
          {steps.map((stepProps, index) => {
            if (index === 0) {
              return (
                <Step key={stepProps.label} {...stepProps}>
                  <StudentsTableClient />
                </Step>
              );
            }
            if (index === 1) {
              return (
                <Step key={stepProps.label} {...stepProps}>
                  <SubjectsTableClient />
                </Step>
              );
            }
            if (index === 1) {
              return (
                <Step key={stepProps.label} {...stepProps}>
                  <SubjectsTableClient />
                </Step>
              );
            }
            return (
              <Step key={stepProps.label} {...stepProps}>
                <StudentsTableClient />
              </Step>
            );
          })}
          <Footer />
        </Stepper>
      </div>
    </>
  );
}

const Footer = () => {
  const {
    nextStep,
    prevStep,
    resetSteps,
    hasCompletedAllSteps,
    isLastStep,
    isOptionalStep,
    isDisabledStep,
  } = useStepper();
  return (
    <>
      {hasCompletedAllSteps && (
        <div className="my-2 flex h-40 items-center justify-center rounded-md border bg-secondary text-primary">
          <h1 className="text-xl">Woohoo! All steps completed! 🎉</h1>
        </div>
      )}
      <div className="flex w-full justify-end gap-2">
        {hasCompletedAllSteps ? (
          <Button size="sm" onClick={resetSteps}>
            Reset
          </Button>
        ) : (
          <>
            <Button
              disabled={isDisabledStep}
              onClick={prevStep}
              size="sm"
              variant="secondary"
            >
              Prev
            </Button>
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
            </Button>
          </>
        )}
      </div>
    </>
  );
};
