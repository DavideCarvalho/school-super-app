import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import type { Subject } from "@acme/db";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

export function ScheduleRulesForm() {
  const { setValue, watch } = useFormContext();

  const selectedClassId: string = watch("selectedClassId");
  const subjectQuantities = watch("subjectsQuantities");
  const subjectExclusions = watch("subjectsExclusions");

  const { data: subjects } = api.subject.getAllSubjectsForClass.useQuery({
    classId: selectedClassId,
  });

  const handleQuantityChange = (subjectId: string, quantity: number) => {
    setValue(`subjectQuantities.${subjectId}`, quantity);
  };

  const handleExclusionChange = (subjectId: string, exclusions: string[]) => {
    setValue(`subjectExclusions.${subjectId}`, exclusions);
  };

  return (
    <>
      <h3>Configuração de Regras</h3>
      <div>
        {subjects?.map((subject) => (
          <div key={subject.id}>
            <Label htmlFor={`${subject.id}-quantity`}>
              {subject.name} - Quantas vezes na semana?:
            </Label>
            <Input
              name={`${subject.id}-quantity`}
              type="number"
              min="0"
              value={subjectQuantities[subject.id] || 0}
              onChange={(e) =>
                handleQuantityChange(subject.id, e.target.valueAsNumber)
              }
            />
            <Label htmlFor={`${subject.id}-exclusions`}>
              Matérias que não podem estar no mesmo dia:
            </Label>
            <select
              multiple
              value={subjectExclusions[subject.id] || []}
              onChange={(e) =>
                handleExclusionChange(
                  subject.id,
                  Array.from(
                    e.target.selectedOptions,
                    (option) => option.value,
                  ),
                )
              }
            >
              {subjects
                ?.filter((sub) => sub.id !== subject.id)
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>
    </>
  );
}
