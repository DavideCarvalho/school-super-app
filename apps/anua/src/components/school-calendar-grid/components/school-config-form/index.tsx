import { useFormContext } from "react-hook-form";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const daysOfWeekInPortuguese = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
];

export function SchoolConfigForm() {
  const { setValue, watch } = useFormContext();
  const scheduleConfig = watch("scheduleConfig");
  const daysOfWeek = Object.keys(scheduleConfig);

  return (
    <>
      {daysOfWeek.map((day, index) => (
        <div key={day}>
          <Label htmlFor={`${day}-start-time`}>
            {daysOfWeekInPortuguese[index]} - Que horas começa?:
          </Label>
          <Input
            name={`${day}-start-time`}
            type="time"
            value={scheduleConfig[day].start}
            onChange={(e) =>
              setValue(`scheduleConfig.${day}.start`, e.target.value)
            }
          />
          <Label htmlFor={`${day}-num-classes`}>Quantas aulas no dia?</Label>
          <Input
            name={`${day}-num-classes`}
            type="number"
            value={scheduleConfig[day].numClasses}
            onChange={(e) =>
              setValue(
                `scheduleConfig.${day}.numClasses`,
                e.target.valueAsNumber,
              )
            }
          />
          <Label htmlFor={`${day}-duration`}>Quantos minutos por aula?</Label>
          <Input
            name={`${day}-duration`}
            type="number"
            value={scheduleConfig[day].duration}
            onChange={(e) =>
              setValue(`scheduleConfig.${day}.duration`, e.target.valueAsNumber)
            }
          />
        </div>
      ))}
    </>
  );
}
