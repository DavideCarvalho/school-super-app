"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const schema = z
  .object({
    responsibleEmail: z.string({
      required_error: "Qual é o email do responsável?",
    }),
    responsibleName: z.string({
      required_error: "Qual é o nome do responsável?",
    }),
  })
  .required();

interface NewCanteenModalProps {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewCanteenModalV2({
  open,
  onClickSubmit,
  onClickCancel,
}: NewCanteenModalProps) {
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createPurchaseRequestMutation } =
    api.canteen.create.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Criando cantina...");
    try {
      await createPurchaseRequestMutation({
        responsibleEmail: data.responsibleEmail,
        responsibleName: data.responsibleName,
      });
      toast.dismiss(toastId);
      toast.success("Cantina criada com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar cantina");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Criar nova cantina</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do responsável*</Label>
              <Input
                placeholder="Digite o nome do responsável"
                {...register("responsibleName")}
              />
            </div>
          </div>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email do responsável*</Label>
              <Input
                placeholder="Digite o email do responsável"
                {...register("responsibleEmail")}
              />
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
            <Button type="submit">Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
