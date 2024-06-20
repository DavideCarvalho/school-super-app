import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";

import { CheckBox } from "~/components/checkbox";
import { api } from "~/trpc/react";

const schema = z
  .object({
    name: z
      .string({ required_error: "Nome do arquivo é obrigatório" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O nome pode ter um máximo de 255 caracteres"),
    fileUrl: z
      .string({ required_error: "link para o arquivo" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O link pode ter um máximo de 255 caracteres")
      .url("Precisa ser um link"),
    quantity: z.coerce
      .number({
        required_error: "Quantidade é obrigatória",
        invalid_type_error: "Apenas números são aceitos",
      })
      .min(1, "Quantidade mínima é 1"),
    frontAndBack: z.boolean().default(true),
    dueDate: z.date().default(new Date()),
  })
  .required();

interface NewPrintRequestModalProps {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewPrintRequestModal({
  open,
  onClickSubmit,
  onClickCancel,
}: NewPrintRequestModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fileUrl: undefined,
      quantity: 1,
      frontAndBack: true,
      dueDate: new Date(),
    },
  });

  const { mutateAsync: createRequest } =
    api.printRequest.createRequest.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando solicitação...");
    try {
      await createRequest({
        name: data.name,
        dueDate: data.dueDate,
        frontAndBack: data.frontAndBack,
        fileUrl: data.fileUrl,
        quantity: data.quantity,
      });
      form.reset();
      await onClickSubmit();
      toast.success("Solicitação criada com sucesso!");
    } catch (e) {
      toast.error("Erro ao criar solicitação");
    } finally {
      toast.dismiss(toastId);
    }
  }

  const watchFrontAndBack = form.watch("frontAndBack");

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
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nome do arquivo</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Link do arquivo</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      Pegue o link do arquivo de compartilhamento no Google
                      Drive ou OneDrive e coloque aqui
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quantidade?</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
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

              <div>
                <label
                  htmlFor="frontAndBack"
                  className="text-sm font-bold text-gray-900"
                >
                  Imprimir
                </label>
                <div className="mt-2">
                  <CheckBox
                    selected={watchFrontAndBack === true}
                    onClick={() => form.setValue("frontAndBack", true)}
                  >
                    <div className="flex items-start">
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">
                          Frente e verso
                        </p>
                      </div>
                    </div>
                  </CheckBox>
                  <div className="p-1" />
                  <CheckBox
                    selected={watchFrontAndBack === false}
                    onClick={() => form.setValue("frontAndBack", false)}
                  >
                    <div className="flex items-start">
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">
                          Apenas frente
                        </p>
                      </div>
                    </div>
                  </CheckBox>
                </div>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
