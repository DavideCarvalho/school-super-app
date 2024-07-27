import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { api } from "~/trpc/react";

const schema = z.object({
  date: z.date(),
  attendances: z.array(
    z.object({
      student: z.object({
        id: z.string(),
        name: z.string(),
      }),
      attendance: z.boolean(),
    }),
  ),
});

interface NewAttendanceModalProps {
  classId: string;
  subjectId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewAttendanceModal({
  classId,
  subjectId,
  open,
  onClickCancel,
  onClickSubmit,
}: NewAttendanceModalProps) {
  const form = useForm({
    schema,
    defaultValues: {
      date: new Date(),
      attendances: [],
    },
  });

  const { data: students } =
    api.class.getStudentsForClassOnCurrentAcademicPeriod.useQuery(
      {
        classId,
      },
      {
        enabled: classId != null,
      },
    );

  const { data: dates } =
    api.academicPeriod.getTeacherHasClassDatesOverAcademicPeriod.useQuery(
      {
        classId,
        subjectId,
      },
      {
        enabled: classId != null && subjectId != null,
      },
    );

  useEffect(() => {
    if (!students) return;
    form.setValue(
      "attendances",
      students.map((student) => ({
        student: {
          id: student.id,
          name: student.User.name,
        },
        attendance: true,
      })),
    );
  }, [students, form.setValue]);

  const studentsAttendances = form.watch("attendances");

  async function onSubmit(data: z.infer<typeof schema>) {}

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Presença</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dia de aula</FormLabel>
                  <FormControl>
                    <Select
                      value={format(field.value, "dd/MM/yyyy HH:mm")}
                      onValueChange={(value) => {
                        const [date, time] = value.split(" ") as [
                          string,
                          string,
                        ];
                        const [hour, minute] = time.split(":") as [
                          string,
                          string,
                        ];
                        const [day, month, year] = date.split("/") as [
                          string,
                          string,
                          string,
                        ];
                        form.setValue(
                          "date",
                          new Date(
                            Number(year),
                            Number(month) - 1,
                            Number(day),
                            Number(hour),
                            Number(minute),
                          ),
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Data" />
                      </SelectTrigger>
                      <SelectContent>
                        {dates?.map((date) => (
                          <SelectItem
                            key={date.getTime()}
                            value={format(date, "dd/MM/yyyy HH:mm")}
                          >
                            {format(date, "dd/MM/yyyy HH:mm")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <table className="w-full table-auto">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-center">Presente</th>
                </tr>
              </thead>
              <tbody>
                {studentsAttendances?.map((attendance, index) => (
                  <tr className="border-b" key={attendance.student.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <span>{attendance.student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        {...form.register(`attendances.${index}.attendance`)}
                        checked={form.getValues(
                          `attendances.${index}.attendance`,
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <DialogFooter>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClickCancel()}
                >
                  Cancelar
                </Button>
              </div>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
