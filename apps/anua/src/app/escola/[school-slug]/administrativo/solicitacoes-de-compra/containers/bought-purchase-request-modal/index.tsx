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
import { Input } from "@acme/ui/input";

import { api } from "~/trpc/react";

const schema = z
  .object({
    finalQuantity: z.coerce
      .number({ required_error: "Quantos foram comprados?" })
      .positive("Quantidade deve ser maior que zero"),
    finalUnitValue: z.coerce
      .number({ required_error: "Qual o valor unitário?" })
      .positive("Valor unitário deve ser maior que 0"),
    estimatedArrivalDate: z.date({ required_error: "Previsão de chegada" }),
    purchaseDate: z.date({ required_error: "Data da compra" }),
    receiptFile: z.any({ required_error: "Coloque a nota fiscal" }),
  })
  .required();

interface BoughtPurchaseRequestModalProps {
  purchaseRequestId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function BoughtPurchaseRequestModal({
  purchaseRequestId,
  open,
  onClickCancel,
  onClickSubmit,
}: BoughtPurchaseRequestModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      finalQuantity: 0,
      finalUnitValue: 0,
      estimatedArrivalDate: new Date(),
      purchaseDate: new Date(),
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

  const { mutateAsync: boughtPurchaseRequest } =
    api.purchaseRequest.boughtPurchaseRequest.useMutation();

  const { mutateAsync: createBoughtPurchaseRequestFileSignedUrl } =
    api.purchaseRequest.createBoughtPurchaseRequestFileSignedUrl.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!purchaseRequest) return;
    const toastId = toast.loading("Criando solicitação de compra...");
    try {
      const receiptFile = data.receiptFile as File;
      const { signedUrl } = await createBoughtPurchaseRequestFileSignedUrl({
        purchaseRequestId: purchaseRequest.id,
        fileName: receiptFile.name,
      });
      await fetch(signedUrl, {
        method: "PUT",
        body: receiptFile,
      });
      await boughtPurchaseRequest({
        estimatedArrivalDate: data.estimatedArrivalDate,
        finalQuantity: data.finalQuantity,
        finalUnitValue: data.finalUnitValue,
        finalValue: data.finalQuantity * data.finalUnitValue,
        receiptFileName: receiptFile.name,
        id: purchaseRequest.id,
      });
      toast.dismiss(toastId);
      toast.success("Solicitação de compra criada com sucesso!");
      form.reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
    }
  }

  const now = dayjs();
  const watchPurchaseDate = form.watch("purchaseDate", now.toDate());

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
              name="finalQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="finalUnitValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor unitário</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Quando foi comprado?</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={(date) => {
                        if (!date) return;
                        form.setValue("purchaseDate", date);
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
            <FormField
              control={form.control}
              name="estimatedArrivalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Quando é a previsão de chegada?</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={(date) => {
                        if (!date) return;
                        form.setValue("estimatedArrivalDate", date);
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
            <FormField
              control={form.control}
              name="receiptFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Selecione a nota fiscal</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      placeholder="Picture"
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(event) => onChange(event.target.files?.[0])}
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
