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
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";

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
  const form = useForm<z.infer<typeof schema>>({
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
  const watchDueDate = form.watch("dueDate");
  const watchUnitValue = form.watch("unitValue", 0);
  const watchQuantity = form.watch("quantity", 0);
  if (!watchDueDate) {
    form.setValue("dueDate", now.add(2, "day").toDate());
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nova solicitação de compra</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pra quando?</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Giz de cera"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quantidade*</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        type="number"
                        min={1}
                        placeholder="2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitValue"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quanto custa cada um?*</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        type="number"
                        min={1}
                        placeholder="2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <Label>Quanto custa no total?</Label>
                <p>{brazilianRealFormatter(watchUnitValue * watchQuantity)}</p>
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pra quando?</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onChange={(date) => {
                          if (!date) return;
                          form.setValue("dueDate", date);
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
                name="productUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pra quando?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Link do produto"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pra quando?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações"
                        value={field.value}
                        onChange={field.onChange}
                        rows={4}
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
              <Button type="submit">Criar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
