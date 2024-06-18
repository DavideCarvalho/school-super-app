"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { DatePicker } from "@acme/ui/datepicker";
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

import { api } from "~/trpc/react";

const schema = z
  .object({
    arrivalDate: z.date({ required_error: "Data de chegada" }),
  })
  .required();

interface ArrivedPurchaseRequestModalProps {
  purchaseRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function ArrivedPurchaseRequestModal({
  purchaseRequestId,
  open,
  onClickCancel,
  onClickSubmit,
}: ArrivedPurchaseRequestModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      arrivalDate: new Date(),
    },
  });

  const { data: purchaseRequest } = api.purchaseRequest.findById.useQuery(
    {
      id: purchaseRequestId,
    },
    {
      enabled: purchaseRequestId != null,
    },
  );

  const { mutateAsync: arrivedPurchaseRequest } =
    api.purchaseRequest.arrivedPurchaseRequest.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!purchaseRequest) return;
    const toastId = toast.loading("Alterando solicitação de compra...");
    try {
      await arrivedPurchaseRequest({
        id: purchaseRequestId,
        arrivalDate: data.arrivalDate,
      });
      toast.dismiss(toastId);
      toast.success("Solicitação de compra alterada com sucesso!");
      form.reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao alterar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
    }
  }

  const now = dayjs();

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Solicitação comprada!</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="arrivalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Quando chegou?</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={(date) => {
                        if (!date) return;
                        form.setValue("arrivalDate", date);
                      }}
                      calendarProps={{
                        fromDate: new Date(),
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClickCancel()}
              >
                Cancelar
              </Button>
              <Button type="submit">Atualizar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
