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

  const { mutateAsync: createSubject } =
    api.subject.createSubject.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando matéria...");
    try {
      await createSubject({
        name: data.name,
      });
      toast.dismiss(toastId);
      toast.success("Matéria criado com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar matéria");
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
