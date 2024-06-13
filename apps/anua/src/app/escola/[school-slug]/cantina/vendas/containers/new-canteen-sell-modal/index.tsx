import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrinter } from "hooks/use-printer";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Combobox } from "@acme/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";

import { api } from "~/trpc/react";

const schema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  payed: z.boolean().default(true),
  printReceipt: z.boolean().default(false),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        quantity: z
          .number({
            required_error: "Qual a quantidade?",
          })
          .min(1),
        price: z
          .number({
            required_error: "Qual o preço?",
          })
          .min(0),
      }),
    )
    .min(1, "Adicione pelo menos um item"),
});

interface NewCanteenSellModalProps {
  canteenId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewCanteenSellModal({
  canteenId,
  open,
  onClickSubmit,
  onClickCancel,
}: NewCanteenSellModalProps) {
  const vendorId = 0x0416;
  const productId = 0x5011;
  const { connected, connectPrinter, printReceipt } = usePrinter(
    vendorId,
    productId,
  );
  const { data: allCanteenItems } = api.canteen.allCanteenItems.useQuery({
    canteenId,
    limit: 999,
    page: 1,
  });

  const { data: studentsWithCanteenLimit } =
    api.student.studentsWithCanteenLimitBySchoolId.useQuery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      printReceipt: false,
      user: {
        id: undefined,
        name: undefined,
      },
      payed: true,
      items: [
        {
          id: undefined,
          name: undefined,
          quantity: 1,
          price: 0,
        },
      ],
    },
  });

  const watchItems = watch("items");
  const watchPayed = watch("payed");
  const watchPrintReceipt = watch("printReceipt");
  const watchUser = watch("user");

  const { mutateAsync: sellItemMutation } = api.canteen.sellItem.useMutation();

  async function handleOnChangePrintReceipt(checked: boolean) {
    if (checked) {
      if (!connected) {
        await connectPrinter();
      }
      if (connected) {
        setValue("printReceipt", true);
      }
    }
    if (!checked) {
      setValue("printReceipt", false);
    }
  }

  useEffect(() => {
    if (connected) {
      setValue("printReceipt", true);
    }
  }, [connected, setValue]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Vendendo...");
    try {
      if (data.printReceipt) {
        const receipt = `
        Nota Fiscal
        ----------------------
        Item        Qtd  Valor
        ----------------------
        ${data.items.map((item) => `${item.name}   ${item.quantity}    ${(item.price * item.quantity) / 100}`).join("\n")}
        ----------------------
        Total                      ${data.items.reduce((acc, item) => acc + item.price * item.quantity, 0) / 100}
        ----------------------
        Obrigado pela compra!
        `;
        printReceipt(receipt).catch(() => {
          toast.error("Erro ao imprimir nota fiscal");
        });
      }
      await sellItemMutation({
        userId: data.user.id,
        payed: data.payed,
        items: data.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price * 100,
        })),
      });
      toast.dismiss(toastId);
      toast.success("Venda criada com sucesso!");
      await onClickSubmit();
      reset();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao criar venda");
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name?.includes("printReceipt")) return;
      const printReceipt = getValues("printReceipt");
      if (!printReceipt) return;
      if (connected) return;
      connectPrinter();
    });
    return () => subscription.unsubscribe();
  }, [watch, connected, connectPrinter, getValues]);

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Nova venda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Switch
                id="print-receipt"
                checked={watchPrintReceipt}
                onCheckedChange={handleOnChangePrintReceipt}
              />
              <Label htmlFor="print-receipt">Nota fiscal</Label>
            </div>
            <div className="grid gap-2">
              <Switch
                id="payed"
                checked={!watchPayed}
                onCheckedChange={(checked) => setValue("payed", !checked)}
              />
              <Label htmlFor="payed">Fiado</Label>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-bold text-gray-900">
                Pra quem?
              </label>
              <div className="mt-2">
                <Combobox
                  placeholder="Pra quem?"
                  noValuePlaceholder="Ninguém foi encontrado"
                  options={
                    studentsWithCanteenLimit
                      ? studentsWithCanteenLimit.map((student) => ({
                          value: student.id,
                          label: student.userName,
                        }))
                      : []
                  }
                  setValue={(option) => {
                    if (!option) return;
                    setValue("user", {
                      id: option.value,
                      name: option.label,
                    });
                  }}
                  value={watchUser.name}
                />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Itens</Label>
                <div className="grid gap-4">
                  {watchItems.map((item, index) => (
                    <div
                      key={item ? `${item.id}-${index}` : index}
                      className={cn(
                        "grid",
                        index > 0
                          ? "gap-3 sm:grid-cols-3"
                          : "gap-2 sm:grid-cols-2",
                      )}
                    >
                      <Combobox
                        placeholder="Escolha um item"
                        noValuePlaceholder="Nenhum item encontrado"
                        options={
                          allCanteenItems
                            ? allCanteenItems?.map((item) => ({
                                value: item.id,
                                label: item.name,
                              }))
                            : []
                        }
                        setValue={(option) => {
                          if (!option) return;
                          setValue(`items.${index}`, {
                            id: option.value,
                            name: option.label,
                            quantity: 1,
                            price:
                              allCanteenItems?.find(
                                (item) => item.id === option.value,
                              )?.price ?? 0,
                          });
                        }}
                        value={getValues(`items.${index}.name`)}
                      />
                      <Input
                        min={1}
                        placeholder="Quantidade"
                        type="number"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                      {index > 0 ? (
                        <Button
                          type="button"
                          className="flex w-full items-center justify-center"
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            const items = getValues("items");
                            items.splice(index, 1);
                            setValue("items", items);
                          }}
                        >
                          <MinusIcon className="h-4 w-4" />
                          <span className="sr-only">Remover item</span>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="button"
                    className="flex items-center gap-2"
                    variant="outline"
                    onClick={() => {
                      setValue(`items.${watchItems.length}`, {
                        // @ts-expect-error
                        id: undefined,
                        // @ts-expect-error
                        name: undefined,
                        quantity: 1,
                        price: 0,
                      });
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Adicionar item
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => onClickCancel()}
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold leading-5 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Criar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>icone</title>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>icone</title>
      <path d="M5 12h14" />
    </svg>
  );
}
