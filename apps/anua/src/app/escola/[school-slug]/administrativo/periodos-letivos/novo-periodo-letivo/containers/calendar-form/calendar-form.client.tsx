"use client";

import type { DayDateProps } from "react-day-picker";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import { DateRangePicker } from "@acme/ui/date-range-picker";
import { Form } from "@acme/ui/form";
import { Label } from "@acme/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

import { api } from "~/trpc/react";

const generateDateRange = (start: Date | undefined, end: Date | undefined) => {
  if (!start || !end) return [];
  const dates = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const schema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  holidays: z.array(z.date()),
  weekendDayWithClasses: z.array(z.date()),
});

export function CalendarFormClient() {
  const params = useParams();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: undefined,
      to: undefined,
      holidays: [],
      weekendDayWithClasses: [],
    },
  });

  const { mutateAsync: createPeriod } =
    api.academicPeriod.createPeriod.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando período letivo...");
    try {
      if (!data.from || !data.to) return;
      await createPeriod({
        from: data.from,
        to: data.to,
        holidays: data.holidays,
        weekendDayWithClasses: data.weekendDayWithClasses,
      });
      toast.dismiss(toastId);
      toast.success("Período letivo criado com sucesso!");
      form.reset();
      redirect(
        `/escola/${params["school-slug"]}/administrativo/periodos-letivos`,
      );
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar período letivo");
    } finally {
      toast.dismiss(toastId);
    }
  }

  const fromDate = form.watch("from");
  const toDate = form.watch("to");
  const holidays = form.watch("holidays");
  const weekendDayWithClasses = form.watch("weekendDayWithClasses");

  const allDates = [
    ...generateDateRange(fromDate, toDate),
    ...holidays,
    ...weekendDayWithClasses,
  ];

  const daysWithClasses =
    [...generateDateRange(fromDate, toDate), ...weekendDayWithClasses].length -
    holidays.length;

  const isHoliday = (date: Date) =>
    holidays.some(
      (holiday) =>
        holiday.getDate() === date.getDate() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getFullYear() === date.getFullYear(),
    );

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>De quando até quando?</Label>
            <DateRangePicker
              from={fromDate}
              to={toDate}
              onSelectDate={(from, to) => {
                form.setValue("from", from);
                form.setValue("to", to);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday-days">Dias de Feriado</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <div className="mr-2 h-4 w-4 opacity-50" />
                  {holidays.length > 0
                    ? `${holidays.length} dias selecionados`
                    : "Selecione os dias"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={holidays}
                  onSelect={(dates) => form.setValue("holidays", dates)}
                  disabled={{ dayOfWeek: [0, 6] }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday-days">Fim de semana letivos</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <div className="mr-2 h-4 w-4 opacity-50" />
                  {weekendDayWithClasses.length > 0
                    ? `${weekendDayWithClasses.length} dias selecionados`
                    : "Selecione os dias"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={weekendDayWithClasses}
                  onSelect={(dates) =>
                    form.setValue("weekendDayWithClasses", dates)
                  }
                  disabled={{ dayOfWeek: [1, 2, 3, 4, 5] }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <h1>Você tem {daysWithClasses} dias com aulas</h1>
          <Calendar
            mode="multiple"
            selected={allDates}
            onSelect={() => {}}
            onDayClick={() => {}}
            components={{
              Day: (props: DayDateProps) => {
                const isHolidayDay = isHoliday(props.day.date);
                return (
                  <div
                    {...props.rootProps}
                    style={{
                      backgroundColor: isHolidayDay ? "orange" : undefined,
                    }}
                    onClick={() => {}}
                  >
                    {props.day.date.getDate()}
                  </div>
                );
              },
            }}
          />
          <Button type="submit">Salvar</Button>
        </form>
      </Form>
    </div>
  );
}
