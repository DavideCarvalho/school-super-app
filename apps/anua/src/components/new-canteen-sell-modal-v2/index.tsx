import { zodResolver } from "@hookform/resolvers/zod";
import { SearchSelect, SearchSelectItem } from "@tremor/react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { api } from "~/trpc/react";
import { Label } from "../ui/label";

const schema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  payed: z.boolean().default(true),
  items: z
    .array(
      z.object({
        item: z.object({
          id: z.string(),
          name: z.string(),
        }),
        quantity: z
          .number({
            required_error: "Qual a quantidade?",
          })
          .min(1),
      }),
    )
    .min(1, "Adicione pelo menos um item"),
});

interface NewCanteenSellModalV2Props {
  canteenId: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewCanteenSellModalV2({
  canteenId,
  open,
  onClickCancel,
}: NewCanteenSellModalV2Props) {
  const { data: allCanteenItems } = api.canteen.allCanteenItems.useQuery({
    canteenId,
    limit: 999,
    page: 1,
  });

  const { data: schoolWorkers } = api.user.allBySchoolId.useQuery({
    page: 1,
    limit: 999,
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
      user: {
        id: undefined,
        name: undefined,
      },
      payed: true,
      items: [
        {
          item: {
            id: undefined,
            name: undefined,
          },
          quantity: 1,
        },
      ],
    },
  });

  const watchItems = watch("items");
  const watchUser = watch("user");

  const { mutateAsync: sellItemMutation } = api.canteen.sellItem.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // const toastId = toast.loading("Vendendo...");
    // try {
    //   await sellItemMutation({
    //     canteenId,
    //     itemId: data.canteenItemId,
    //     quantity: data.quantity,
    //     studentId: data.studentId,
    //     payed: data.payed,
    //   });
    //   toast.dismiss(toastId);
    //   toast.success("Venda criada com sucesso!");
    //   await onClickSubmit();
    //   reset();
    // } catch (e) {
    //   toast.dismiss(toastId);
    //   toast.error("Erro ao criar venda");
    // } finally {
    //   toast.dismiss(toastId);
    // }
  };

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Nova venda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
                  value={getValues("user.name")}
                />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Itens</Label>
                <div className="grid gap-4">
                  {watchItems.map((item, index) => (
                    <div
                      key={item.item ? `${item.item.id}-${index}` : index}
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
                          setValue(`items.${index}.item`, {
                            id: option.value,
                            name: option.label,
                          });
                        }}
                        value={getValues(`items.${index}.item.name`)}
                      />
                      <Input
                        placeholder="Início"
                        type="number"
                        {...register(`items.${index}.quantity`)}
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
                        item: {
                          // @ts-expect-error
                          id: undefined,
                          // @ts-expect-error
                          name: undefined,
                        },
                        quantity: 1,
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
