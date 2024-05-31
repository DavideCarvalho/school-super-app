"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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

import { api } from "~/trpc/react";

const schema = z
  .object({
    name: z.string({ required_error: "Qual o nome da matéria?" }),
    teacherId: z.string().optional(),
  })
  .required();

interface NewSubjectModalV2Props {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewSubjectModalV2({
  open,
  onClickCancel,
  onClickSubmit,
}: NewSubjectModalV2Props) {
  const { handleSubmit, getValues, setValue, register, reset } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      teacherId: undefined,
    },
  });

  const { mutateAsync: createTeacher } =
    api.teacher.createTeacher.useMutation();

  const { data: teachers } = api.teacher.getSchoolTeachers.useQuery({
    limit: 999,
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando professor...");
    try {
      // await createTeacher({
      //   name: data.name,
      //   teacherId: data.teacherId,
      // });
      toast.success("Professor criado com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.error("Erro ao criar professor");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Criar nova matéria</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Matéria*</Label>
              <Input
                placeholder="Digite o nome do matéria"
                {...register("name")}
              />
            </div>
            <div className="grid gap-2">
              <Label>Já tem um professor pra essa matéria?</Label>
              <div className="grid gap-4">
                <Select value={getValues("teacherId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id}
                        onClick={() => setValue("teacherId", teacher.id)}
                      >
                        {teacher.User.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div>
              <Button variant="outline" onClick={() => onClickCancel()}>
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
