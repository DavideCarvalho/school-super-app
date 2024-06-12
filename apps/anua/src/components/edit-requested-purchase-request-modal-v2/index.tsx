"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { PurchaseRequest } from "@acme/db";
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

import { api } from "~/trpc/react";
import Calendar from "../calendar";

const schema = z
  .object({
    productName: z.string({ required_error: "Qual nome do produto?" }),
    quantity: z.coerce.number({ required_error: "Qual a quantidade?" }).min(1),
    value: z.coerce.number({ required_error: "Quanto custa?" }).min(0),
    dueDate: z.date(),
    productUrl: z.string().optional(),
    description: z.string().optional(),
  })
  .required();

interface EditRequestedPurchaseRequestModalV2Props {
  purchaseRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function EditRequestedPurchaseRequestModalV2({
  purchaseRequestId,
  open,
  onClickSubmit,
  onClickCancel,
}: EditRequestedPurchaseRequestModalV2Props) {
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

  const { data: purchaseRequest } = api.purchaseRequest.findById.useQuery(
    {
      id: purchaseRequestId,
    },
    {
      enabled: purchaseRequestId != null,
    },
  );

  useEffect(() => {
    if (!purchaseRequest) return;
    setValue("productName", purchaseRequest.productName);
    setValue("quantity", purchaseRequest.quantity);
    setValue("value", purchaseRequest.value);
    setValue("dueDate", purchaseRequest.dueDate);
    if (purchaseRequest?.productUrl)
      setValue("productUrl", purchaseRequest.productUrl);
    if (purchaseRequest?.description)
      setValue("description", purchaseRequest.description);
  }, [purchaseRequest, setValue]);

  const { mutateAsync: editRequestedPurchaseMutation } =
    api.purchaseRequest.editRequestedPurchaseRequest.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (!purchaseRequest) return;
    const toastId = toast.loading("Alterando solicitação de compra...");
    try {
      await editRequestedPurchaseMutation({
        id: purchaseRequest.id,
        productUrl: data.productUrl,
        productName: data.productName,
        quantity: data.quantity,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
      });
      toast.dismiss(toastId);
      toast.success("Solicitação de compra alterada com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao alterar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const now = dayjs();
  const watchDueDate = watch("dueDate", new Date());

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar solicitação de compra</DialogTitle>
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
              <Label htmlFor="value">Quanto custa?*</Label>
              <Input
                type="number"
                step="any"
                min={1}
                placeholder="10.00"
                {...register("value")}
              />
              {errors.value && (
                <p className="text-red-600">{errors.value.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Pra quando?*</Label>
              <Calendar
                value={watchDueDate}
                minDate={now.subtract(1, "hour").toDate()}
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
            <Button type="submit">Alterar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
