"use client";

import toast from "react-hot-toast";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Label } from "@acme/ui/label";

import { api } from "~/trpc/react";
import { brazilianDateFormatter } from "~/utils/brazilian-date-formatter";
import { brazilianRealFormatter } from "~/utils/brazilian-real-formatter";

interface ApprovePurchaseRequestModalProps {
  purchaseRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function ApprovePurchaseRequestModal({
  purchaseRequestId,
  open,
  onClickCancel,
  onClickSubmit,
}: ApprovePurchaseRequestModalProps) {
  const { mutateAsync: approvePurchaseRequest } =
    api.purchaseRequest.approvePurchaseRequest.useMutation();

  const { data: purchaseRequest } = api.purchaseRequest.findById.useQuery(
    {
      id: purchaseRequestId,
    },
    {
      enabled: purchaseRequestId != null,
    },
  );

  async function onApprovePurchaseRequest() {
    const toastId = toast.loading("Aprovando solicitação de compra...");
    try {
      await approvePurchaseRequest({
        id: purchaseRequestId,
      });
      toast.dismiss(toastId);
      toast.success("Solicitação de compra aprovada com sucesso!");
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao aprovar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Aprovar solicitação de compra</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="productName">Qual é o produto?*</Label>
            <p>{purchaseRequest?.productName}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantos você precisa?*</Label>
            <p>{purchaseRequest?.quantity ?? 0}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unitValue">Quanto custa cada um?*</Label>
            <p>{brazilianRealFormatter(purchaseRequest?.unitValue ?? 0)}</p>
          </div>
          <div className="grid gap-2">
            <Label>Quanto custa no total?</Label>
            <p>
              {brazilianRealFormatter(
                (purchaseRequest?.unitValue ?? 0) *
                  (purchaseRequest?.quantity ?? 0),
              )}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Pra quando?*</Label>
            <p>
              {brazilianDateFormatter(purchaseRequest?.dueDate ?? new Date())}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productUrl">Link do produto</Label>
            <p>{purchaseRequest?.productUrl ?? ""}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Alguma observação?</Label>
            <p>{purchaseRequest?.description ?? ""}</p>
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
          <Button type="button" onClick={onApprovePurchaseRequest}>
            Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
