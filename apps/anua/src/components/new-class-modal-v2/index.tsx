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

import { api } from "~/trpc/react";

const schema = z
  .object({
    name: z.string({ required_error: "Qual o nome da turma?" }),
  })
  .required();

interface NewClassModalV2Props {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewClassModalV2({
  open,
  onClickSubmit,
  onClickCancel,
}: NewClassModalV2Props) {
  const { handleSubmit, register, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
    },
  });

  const { mutateAsync: createSubject } = api.class.create.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando turma...");
    try {
      await createSubject({
        name: data.name,
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
