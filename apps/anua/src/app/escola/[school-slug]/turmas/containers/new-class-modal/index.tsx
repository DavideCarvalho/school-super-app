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
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { MultiSelect } from "@acme/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { api } from "~/trpc/react";

const schema = z
  .object({
    name: z.string({ required_error: "Qual o nome da turma?" }),
    subjectsWithTeachers: z.array(
      z.object({
        subject: z.object({
          id: z.string(),
          name: z.string(),
        }),
        subjects: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
          }),
        ),
        teacher: z.object({
          id: z.string(),
          name: z.string(),
        }),
      }),
    ),
  })
  .required();

interface NewClassModalProps {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewClassModal({
  open,
  onClickSubmit,
  onClickCancel,
}: NewClassModalProps) {
  const { handleSubmit, register, reset, watch, getValues, setValue } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      subjectsWithTeachers: [],
    },
  });

  const subjectsWithTeachers = watch("subjectsWithTeachers");

  const { data: teachers } = api.teacher.getSchoolTeachers.useQuery({
    page: 1,
    limit: 999,
  });

  const { data: subjects } = api.subject.allBySchoolId.useQuery({
    page: 1,
    limit: 999,
  });

  const { mutateAsync: createSubject } = api.class.create.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando turma...");
    try {
      await createSubject({
        name: data.name,
        subjectsWithTeachers: data.subjectsWithTeachers.map(
          (subjectWithTeacher) => ({
            subjectIds: subjectWithTeacher.subjects.map((s) => s.id),
            teacherId: subjectWithTeacher.teacher.id,
            quantity: 0,
          }),
        ),
      });
      toast.dismiss(toastId);
      toast.success("Turma criada com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar turma");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Criar nova turma</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da turma*</Label>
              <Input
                placeholder="Digite o nome da turma"
                {...register("name")}
              />
            </div>
            {subjectsWithTeachers.map((subjectWithTeacher, index) => (
              <div
                key={`${subjectWithTeacher.subject.id}-${subjectWithTeacher.teacher.id}-${index}`}
                className={cn("grid gap-4 sm:grid-cols-4")}
              >
                <Select
                  value={subjectWithTeacher.teacher.id}
                  onValueChange={(e) => {
                    if (!teachers) return;
                    const foundTeacher = teachers.find((s) => s.id === e);
                    if (!foundTeacher) return;
                    setValue(`subjectsWithTeachers.${index}.teacher`, {
                      id: foundTeacher.id,
                      name: foundTeacher.User.name,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.User.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MultiSelect
                  selected={
                    subjectWithTeacher?.subjects?.map((subject) => {
                      return {
                        label: subject.name,
                        value: subject.id,
                      };
                    }) ?? []
                  }
                  options={
                    subjects?.map((subject) => ({
                      value: subject.id,
                      label: subject.name,
                    })) ?? []
                  }
                  onChange={(options) => {
                    setValue(
                      `subjectsWithTeachers.${index}.subjects`,
                      options.map((option) => ({
                        id: option.value,
                        name: option.label,
                      })),
                    );
                  }}
                />
                <Button
                  type="button"
                  className="flex w-full items-center justify-center"
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    const subjectsWithTeachers = getValues(
                      "subjectsWithTeachers",
                    );
                    subjectsWithTeachers.splice(index, 1);
                    setValue("subjectsWithTeachers", subjectsWithTeachers);
                  }}
                >
                  <MinusIcon className="h-4 w-4" />
                  <span className="sr-only">Remover matéria</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              className="flex items-center gap-2"
              variant="outline"
              onClick={() => {
                setValue(
                  `subjectsWithTeachers.${subjectsWithTeachers.length}`,
                  {
                    teacher: {
                      // @ts-expect-error
                      id: undefined,
                      // @ts-expect-error
                      name: undefined,
                    },
                    subject: {
                      // @ts-expect-error
                      id: undefined,
                      // @ts-expect-error
                      name: undefined,
                    },
                    quantity: 1,
                  },
                );
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar matéria
            </Button>
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
      <title>Adicionar matéria</title>
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
      <title>Remover matéria</title>
      <path d="M5 12h14" />
    </svg>
  );
}
