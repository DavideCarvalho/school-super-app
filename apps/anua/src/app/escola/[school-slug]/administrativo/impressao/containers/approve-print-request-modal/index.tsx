import { format } from "date-fns";
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

import { api } from "~/trpc/react";

interface NewPrintRequestModalProps {
  printRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewPrintRequestModal({
  printRequestId,
  open,
  onClickSubmit,
  onClickCancel,
}: NewPrintRequestModalProps) {
  const { mutateAsync: approveRequest } =
    api.printRequest.approveRequest.useMutation();

  const { data: printRequest } = api.printRequest.findById.useQuery(
    {
      id: printRequestId,
    },
    {
      enabled: printRequestId != null,
    },
  );

  async function handleOnClickSubmit() {
    const toastId = toast.loading("Aprovando solicitação de impressão...");
    try {
      await approveRequest({
        id: printRequestId,
      });
      await onClickSubmit();
      toast.dismiss(toastId);
      toast.success("Solicitação de impressão aprovada com sucesso!");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao aprovar solicitação de impressão");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Solicitação de impressão</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <Label>Nome do arquivo</Label>
            <p>{printRequest?.name}</p>
          </div>

          <div>
            <Label>Link do arquivo</Label>
            <p>{printRequest?.path}</p>
          </div>

          <div>
            <Label>Pra quando?</Label>
            <p>
              {printRequest?.dueDate
                ? format(printRequest.dueDate, "DD/MM/YYYY")
                : "Não informado"}
            </p>
          </div>

          <div>
            <Label>Quantidade</Label>
            <p>{printRequest?.quantity}</p>
          </div>

          <div>
            <Label>Imprimir</Label>
            <p>
              {printRequest?.frontAndBack ? "Frente e verso" : "Apenas frente"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClickCancel}>
            Fechar
          </Button>
          <Button type="button" onClick={handleOnClickSubmit}>
            Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
