"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
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
import { Textarea } from "@acme/ui/textarea";

import Calendar from "~/components/calendar";
import { api } from "~/trpc/react";
import { brazilianRealFormatter } from "~/utils/brazilian-real-formatter";

const schema = z
  .object({
    productName: z.string({ required_error: "Qual nome do produto?" }),
    quantity: z.coerce.number({ required_error: "Qual a quantidade?" }).min(1),
    unitValue: z.coerce
      .number({ required_error: "Quanto custa cada um?" })
      .min(0),
    dueDate: z.date(),
    productUrl: z.string().optional(),
    description: z.string().optional(),
  })
  .required();

interface NewPurchaseRequestModalProps {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewPurchaseRequestModal({
  open,
  onClickCancel,
  onClickSubmit,
}: NewPurchaseRequestModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createPurchaseRequest } =
    api.purchaseRequest.create.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando solicitação de compra...");
    try {
      await createPurchaseRequest({
        quantity: data.quantity,
        productUrl: data.productUrl,
        productName: data.productName,
        unitValue: data.unitValue,
        value: data.unitValue * data.quantity,
        dueDate: data.dueDate,
        description: data.description,
      });
      toast.dismiss(toastId);
      toast.success("Solicitação de compra criada com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
    }
  }

  const now = dayjs();
  const watchDueDate = watch("dueDate");
  const watchUnitValue = watch("unitValue", 0);
  const watchQuantity = watch("quantity", 0);
  if (!watchDueDate) {
    setValue("dueDate", now.add(2, "day").toDate());
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Nova solicitação de compra</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Qual é o produto?*</Label>
              <Input placeholder="Giz de cera" {...register("productName")} />
              {errors.productName && (
                <p className="text-red-600">{errors.productName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantos você precisa?*</Label>
              <Input
                type="number"
                min={1}
                placeholder="2"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-red-600">{errors.quantity.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitValue">Quanto custa cada um?*</Label>
              <Input
                type="number"
                step="any"
                min={1}
                placeholder="10.00"
                {...register("unitValue")}
              />
              {errors.unitValue && (
                <p className="text-red-600">{errors.unitValue.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Quanto custa no total?</Label>
              <p>{brazilianRealFormatter(watchUnitValue * watchQuantity)}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Pra quando?*</Label>
              <Calendar
                value={watchDueDate}
                minDate={now.add(1, "day").toDate()}
                onChange={(date) => setValue("dueDate", date)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productUrl">Link do produto</Label>
              <Input
                placeholder="Link do produto"
                {...register("productUrl")}
              />
              {errors.productUrl && (
                <p className="text-red-600">{errors.productUrl.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Alguma observação?</Label>
              <Textarea
                rows={4}
                placeholder="Observações"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-600">{errors.description?.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClickCancel()}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
