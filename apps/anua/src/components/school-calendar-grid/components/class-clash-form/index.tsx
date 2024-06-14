import { useFormContext } from "react-hook-form";

import { Button } from "@acme/ui/button";
import { Combobox } from "@acme/ui/combobox";
import { MultiSelect } from "@acme/ui/multi-select";

import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function ClassClashForm() {
  const { watch, getValues, setValue } = useFormContext();

  const selectedClassId: string = watch("selectedClassId");
  const subjectsExclusions: {
    subjectId: string;
    exclusions: string[];
  }[] = watch("subjectsExclusions");

  const utils = api.useUtils();

  const subjects = utils.subject.getAllSubjectsForClass.getData({
    classId: selectedClassId ?? "",
  });

  return (
    <div className="my-5 flex w-full flex-col items-center justify-center">
      <Label>Confito de aulas</Label>
      <div
        className={cn("my-5 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3")}
      >
        {subjectsExclusions.map(({ subject, exclusions }, index) => (
          <div
            key={subject.id}
            className="flex w-full flex-col items-center justify-center"
          >
            <Combobox
              key={subject.id}
              placeholder="Matéria?"
              noValuePlaceholder="Ninguém foi encontrado"
              options={
                subjects
                  ?.filter(
                    (subject) =>
                      !subjectsExclusions.find(
                        (excludedSubject) =>
                          subject.id === excludedSubject.subjectId,
                      ),
                  )
                  ?.map((subject) => ({
                    value: subject.id,
                    label: subject.name,
                  })) ?? []
              }
              setValue={(option) => {
                if (!option) return;
                setValue(`subjectsExclusions.${index}.subject`, {
                  id: option.value,
                  name: option.label,
                });
              }}
              value={subject.name}
            />
            <MultiSelect
              selected={
                exclusions?.map((subjectId) => ({
                  value: subjectId,
                  label: subjects?.find((s) => s.id === subjectId)?.name ?? "",
                })) ?? []
              }
              options={
                subjects
                  ?.filter((s) => s.id !== subject.id)
                  ?.map((subject) => ({
                    value: subject.id,
                    label: subject.name,
                  })) ?? []
              }
              onChange={(options) => {
                setValue(
                  `subjectsExclusions.${index}.exclusions`,
                  options.map(({ value }) => value),
                );
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          className="flex items-center gap-2"
          variant="outline"
          onClick={() =>
            setValue(`subjectsExclusions.${subjectsExclusions.length}`, {
              subjectId: undefined,
              exclusions: [],
            })
          }
        >
          <PlusIcon className="h-4 w-4" />
          Adicionar conflito
        </Button>
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>icone</title>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
