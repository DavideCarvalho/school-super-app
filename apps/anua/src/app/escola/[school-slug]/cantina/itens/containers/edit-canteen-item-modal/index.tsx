"use client";

import { useEffect } from "react";
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
    name: z.string({
      required_error: "Qual é o nome do item?",
    }),
    price: z.coerce.number({
      required_error: "Qual é o preço?",
    }),
  })
  .required();

interface EditCanteenItemModalProps {
  canteenId: string;
  canteenItemId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function EditCanteenItemModal({
  canteenId,
  canteenItemId,
  open,
  onClickSubmit,
  onClickCancel,
}: EditCanteenItemModalProps) {
  const { data: canteenItem } = api.canteen.findCanteenItemById.useQuery(
    {
      itemId: canteenItemId,
      canteenId,
    },
    {
      enabled: canteenItemId != null && canteenId != null,
    },
  );

  const { register, handleSubmit, reset, setValue } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Carregando...",
      price: 0,
    },
  });

  const { mutateAsync: editCanteenItem } =
    api.canteen.editCanteenItem.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Adicionando item da cantina...");
    try {
      await editCanteenItem({
        canteenItemId,
        name: data.name,
        price: data.price * 100,
      });
      toast.dismiss(toastId);
      toast.success("Item da cantina criada com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao adicionar item da cantina");
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    if (!canteenItem) return;
    setValue("name", canteenItem.name);
    setValue("price", canteenItem.price / 100);
  }, [canteenItem, setValue]);

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Adicionar item da cantina</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do item*</Label>
              <Input
                placeholder="Digite o nome do item"
                {...register("name")}
              />
            </div>
          </div>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Preço do item*</Label>
              <Input
                type="number"
                placeholder="Digite o preço do item"
                {...register("price")}
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
