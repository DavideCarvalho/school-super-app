"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
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
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string({ required_error: "Nome é obrigatório" }),
  email: z
    .string({ required_error: "Email é obrigatório" })
    .email("Precisa ser um email válido"),
  classId: z.string({ required_error: "Turma é obrigatória" }),
  responsibles: z
    .array(
      z.object({
        name: z.string({ required_error: "Nome é obrigatório" }),
        email: z
          .string({ required_error: "Email é obrigatório" })
          .email("Precisa ser um email válido"),
      }),
    )
    .min(1),
});

interface NewStudentModalProps {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewStudentModal({
  open,
  onClickCancel,
  onClickSubmit,
}: NewStudentModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      email: undefined,
      classId: undefined,
      responsibles: [
        {
          name: undefined,
          email: undefined,
        },
      ],
    },
  });

  const { mutateAsync: createStudent, reset: resetCreateStudent } =
    api.student.createStudent.useMutation();

  const { data: classes } = api.class.allBySchoolId.useQuery({
    page: 1,
    limit: 999,
  });

  const responsibles = form.watch("responsibles");

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando aluno...");
    try {
      await createStudent({
        name: data.name,
        email: data.email,
        classId: data.classId,
        responsibles: data.responsibles,
      });
      toast.success("Aluno criado com sucesso!");
      form.reset();
      resetCreateStudent();
      await onClickSubmit();
    } catch (e) {
      toast.error("Erro ao criar aluno");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset();
        resetCreateStudent();
        onClickCancel();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Criar novo aluno</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nome do aluno</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Email do aluno</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Turma</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("classId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label>Responsáveis</Label>
                <div>
                  {responsibles.map((responsible, index) => (
                    <div
                      key={index}
                      className={cn(
                        "grid",
                        index > 0
                          ? "gap-3 sm:grid-cols-3"
                          : "gap-2 sm:grid-cols-2",
                      )}
                    >
                      <FormField
                        control={form.control}
                        name={`responsibles.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input
                                {...form.register(`responsibles.${index}.name`)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`responsibles.${index}.email`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...form.register(
                                  `responsibles.${index}.email`,
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        {index > 0 ? (
                          <Button
                            type="button"
                            className="mt-6 flex w-full items-center justify-center"
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              const availabilities =
                                form.getValues("responsibles");
                              availabilities.splice(index, 1);
                              form.setValue("responsibles", availabilities);
                            }}
                          >
                            <MinusIcon className="h-4 w-4" />
                            <span className="sr-only">Remover responsável</span>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="button"
                className="flex items-center gap-2"
                variant="outline"
                onClick={() => {
                  form.setValue(`responsibles.${responsibles.length}`, {
                    //@ts-expect-error
                    name: undefined,
                    //@ts-expect-error
                    email: undefined,
                  });
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Adicionar responsável
              </Button>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClickCancel()}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
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
    </svg>
  );
}
