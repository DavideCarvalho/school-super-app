"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { DatePicker } from "@acme/ui/datepicker";
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
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string({ required_error: "Qual o nome da atividade?" }),
  dueDate: z.date({ required_error: "Quando é a data de entrega?" }),
  grade: z.number({ required_error: "Qual a nota?" }).min(0),
  subjectId: z.string({ required_error: "Qual matéria?" }),
  description: z.string().optional(),
});

interface NewAssignmentModalProps {
  classId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewAssignmentModal({
  classId,
  open,
  onClickCancel,
  onClickSubmit,
}: NewAssignmentModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      dueDate: new Date(),
      grade: 0,
      description: undefined,
      subjectId: undefined,
    },
  });

  const { mutateAsync: createAssignment } =
    api.class.createAssignment.useMutation();

  const { data: teacherSubjectsOnClass } =
    api.teacher.getTeacherSubjectsOnClass.useQuery({
      classId,
    });

  useEffect(() => {
    if (!teacherSubjectsOnClass) return;
    if (teacherSubjectsOnClass.length === 1) {
      const onlySubject = teacherSubjectsOnClass[0];
      if (!onlySubject) return;
      form.setValue("subjectId", onlySubject.id);
    }
  }, [teacherSubjectsOnClass, form.setValue]);

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando atividade...");
    try {
      await createAssignment({
        name: data.name,
        dueDate: data.dueDate,
        grade: data.grade,
        subjectId: data.subjectId,
        description: data.description,
        classId,
      });
      toast.dismiss(toastId);
      toast.success("Atividade criada com sucesso!");
      form.reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar atividade");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Criar nova atividade</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nome da atividade*</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pra qual matéria?*</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("subjectId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="matéria" />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherSubjectsOnClass?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quanto vale?*</FormLabel>
                    <FormControl>
                      <Input
                        {...form.register("grade", { valueAsNumber: true })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quando é a entrega?*</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onChange={(date) => {
                          if (!date) return;
                          form.setValue("dueDate", date);
                        }}
                        calendarProps={{
                          fromDate: new Date(),
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Precisa descrever a atividade? Faça aqui!
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="A atividade é sobre..."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
