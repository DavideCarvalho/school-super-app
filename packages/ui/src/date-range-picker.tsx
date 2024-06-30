"use client";

import type { HTMLAttributes } from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from ".";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateRangePickerProps extends HTMLAttributes<HTMLDivElement> {
  from?: Date;
  to?: Date;
  onSelectDate: (from: Date | undefined, to: Date | undefined) => void;
}

export function DateRangePicker({
  from,
  to,
  onSelectDate,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !from && !to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "LLL dd, y", { locale: ptBR })} -{" "}
                  {format(to, "LLL dd, y", { locale: ptBR })}
                </>
              ) : (
                format(from, "LLL dd, y", { locale: ptBR })
              )
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            required={true}
            defaultMonth={from}
            selected={{ from, to }}
            onSelect={(date: DateRange) => {
              onSelectDate(date.from, date.to);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
