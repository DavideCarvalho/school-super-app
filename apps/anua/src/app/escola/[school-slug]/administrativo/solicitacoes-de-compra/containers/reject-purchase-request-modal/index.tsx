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
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";

import { api } from "~/trpc/react";

const schema = z
  .object({
    reason: z.string({ required_error: "Qual o motivo?" }),
  })
  .required();

interface RejectPurchaseRequestModalProps {
  purchaseRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function RejectPurchaseRequestModal({
  purchaseRequestId,
  open,
  onClickCancel,
  onClickSubmit,
}: RejectPurchaseRequestModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: rejectPurchaseRequest } =
    api.purchaseRequest.rejectPurchaseRequest.useMutation();

  async function onApprovePurchaseRequest(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Rejeitando solicitação de compra...");
    try {
      await rejectPurchaseRequest({
        id: purchaseRequestId,
        reason: data.reason,
      });
      toast.dismiss(toastId);
      toast.success("Solicitação de compra rejeitada com sucesso!");
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao rejeitar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onApprovePurchaseRequest)}>
          <DialogHeader>
            <DialogTitle>Rejeitar solicitação de compra</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Qual o motivo?</Label>
              <Textarea
                rows={4}
                placeholder="Motivo da rejeição"
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-red-600">{errors.reason?.message}</p>
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
            <Button type="submit">Rejeitar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
