"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { DateRangePicker } from "@acme/ui/date-range-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Label } from "@acme/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

const generateDateRange = (start, end) => {
  const dates = [];
  let currentDate = new Date(start);
  const endDate = new Date(end);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
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
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: undefined,
      to: undefined,
      holidays: [],
      weekendDayWithClasses: [],
    },
  });

  const fromDate = form.watch("from");
  const toDate = form.watch("to");
  const holidays = form.watch("holidays");
  const weekendDayWithClasses = form.watch("weekendDayWithClasses");

  const allDates = [
    ...generateDateRange(fromDate, toDate),
    ...holidays,
    ...weekendDayWithClasses,
  ];

  return (
    <div className="w-full">
      <Form {...form}>
        <form>
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
                  selected={holidays}
                  onSelect={(dates) => form.setValue("holidays", dates)}
                  disabled={{ dayOfWeek: [1, 2, 3, 4, 5] }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>
                Visualize o período escolar com os dias de feriado e final de
                semana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="multiple" selected={allDates} />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
