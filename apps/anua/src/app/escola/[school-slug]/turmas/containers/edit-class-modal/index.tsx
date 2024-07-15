import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string(),
  subjectsWithTeachers: z.array(
    z.object({
      subject: z.object({
        id: z.string(),
        name: z.string(),
      }),
      teacher: z.object({
        id: z.string(),
        name: z.string(),
      }),
      quantity: z.number().min(1),
    }),
  ),
});

interface EditClassModalProps {
  classSlug: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function EditClassModal({
  classSlug,
  open,
  onClickCancel,
  onClickSubmit,
}: EditClassModalProps) {
  const { data: clasz, isLoading: classLoading } =
    api.class.findBySlug.useQuery(
      {
        slug: classSlug,
      },
      {
        enabled: classSlug != null,
      },
    );

  const { data: teachers } = api.teacher.getSchoolTeachers.useQuery({
    page: 1,
    limit: 999,
  });

  const { data: subjects } = api.subject.allBySchoolId.useQuery({
    page: 1,
    limit: 999,
  });

  const { handleSubmit, setValue, register, reset, watch, getValues } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Carregando...",
      subjectsWithTeachers: [],
    },
  });

  const subjectsWithTeachers = watch("subjectsWithTeachers");

  const { mutateAsync: editClass } = api.class.updateById.useMutation();

  useEffect(() => {
    if (!clasz) return;
    setValue("name", clasz.name);
    setValue(
      "subjectsWithTeachers",
      clasz.TeacherHasClass.map(({ Subject, Teacher, subjectQuantity }) => ({
        subject: {
          id: Subject.id,
          name: Subject.name,
        },
        teacher: {
          id: Teacher.id,
          name: Teacher.User.name,
        },
        quantity: subjectQuantity,
      })),
    );
  }, [clasz, setValue]);

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!clasz) return;
    const toastId = toast.loading("Alterando turma...");
    try {
      await editClass({
        classId: clasz.id,
        name: data.name,
        subjectsWithTeachers: data.subjectsWithTeachers.map(
          (subjectWithTeacher) => ({
            subjectId: subjectWithTeacher.subject.id,
            teacherId: subjectWithTeacher.teacher.id,
            quantity: subjectWithTeacher.quantity,
          }),
        ),
      });
      toast.dismiss(toastId);
      toast.success("Turma alterado com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao alterar turma");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Alterando turma</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da turma</Label>
              <div className="grid grid-cols-12 gap-2">
                <Input
                  placeholder="Digite o nome da turma"
                  {...register("name")}
                  readOnly={classLoading}
                  className={cn(classLoading ? "col-span-11" : "col-span-12")}
                />
                <Oval
                  visible={classLoading}
                  height="30"
                  width="30"
                  color="hsl(262.1 83.3% 57.8%)"
                  secondaryColor="hsl(262.1deg 83.3% 57.8% / 90%)"
                  ariaLabel="oval-loading"
                />
              </div>
              {subjectsWithTeachers.map((subjectWithTeacher, index) => (
                <div key={index} className={cn("grid gap-4 sm:grid-cols-4")}>
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
                  <Select
                    value={subjectWithTeacher.subject.id}
                    onValueChange={(e) => {
                      if (!subjects) return;
                      const foundSubject = subjects.find((s) => s.id === e);
                      if (!foundSubject) return;
                      setValue(
                        `subjectsWithTeachers.${index}.subject`,
                        foundSubject,
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Quantidade"
                    type="number"
                    min={1}
                    {...register(`subjectsWithTeachers.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
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
