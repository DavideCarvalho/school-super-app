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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Textarea } from "@acme/ui/textarea";

import { api } from "~/trpc/react";

const schema = z
  .object({
    reason: z.string({ required_error: "Motivo é obrigatório" }),
  })
  .required();

interface RejectPrintRequestModalProps {
  printRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function RejectPrintRequestModal({
  printRequestId,
  open,
  onClickSubmit,
  onClickCancel,
}: RejectPrintRequestModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: undefined,
    },
  });

  const { mutateAsync: rejectRequest } =
    api.printRequest.rejectRequest.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Rejeitando solicitação...");
    try {
      await rejectRequest({
        id: printRequestId,
        reason: data.reason,
      });
      form.reset();
      await onClickSubmit();
      toast.dismiss(toastId);
      toast.success("Solicitação rejeitada com sucesso!");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao rejeitar solicitação");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form className="mt-6" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nova solicitação de impressão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Motivo da rejeição</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Motivo da rejeição"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
