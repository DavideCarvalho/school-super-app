import { useFormContext } from "react-hook-form";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function SubjectQuantitiesForm() {
  const { watch, register } = useFormContext();

  const selectedClassId: string = watch("selectedClassId");

  const utils = api.useUtils();

  const subjects = utils.subject.getAllSubjectsForClass.getData({
    classId: selectedClassId ?? "",
  });

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Label>Quantidade de aulas por matéria</Label>
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-5")}>
        {subjects?.map((subject) => (
          <div key={subject.id}>
            <Label htmlFor={`${subject.id}-quantity`}>
              Quantas aulas de {subject.name}?
            </Label>
            <Input
              type="number"
              min="0"
              {...register(`subjectsQuantities.${subject.id}`, {
                valueAsNumber: true,
              })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
