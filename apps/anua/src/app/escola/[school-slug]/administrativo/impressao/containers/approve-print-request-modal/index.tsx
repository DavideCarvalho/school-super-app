import Link from "next/link";
import { format } from "date-fns";
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

interface ApprovePrintRequestModalProps {
  printRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function ApprovePrintRequestModal({
  printRequestId,
  open,
  onClickSubmit,
  onClickCancel,
}: ApprovePrintRequestModalProps) {
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

          <div className="flex flex-col">
            <Label>Link do arquivo</Label>
            <Link
              href={printRequest?.path ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="link" className="-m-4">
                {printRequest?.path}
              </Button>
            </Link>
          </div>

          <div>
            <Label>Pra quando?</Label>
            <p>
              {printRequest?.dueDate
                ? format(printRequest.dueDate, "dd/MM/yyyy")
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
