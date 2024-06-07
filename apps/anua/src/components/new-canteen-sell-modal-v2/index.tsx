import { zodResolver } from "@hookform/resolvers/zod";
import { SearchSelect, SearchSelectItem, Switch } from "@tremor/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/trpc/react";
import { Modal } from "../modal";

const schema = z.object({
  userId: z.string({
    required_error: "Quem é a pessoa que está comprando?",
  }),
  products: z
    .array(
      z.object({
        canteenItemId: z.string({
          required_error: "Qual item está sendo vendido?",
        }),
        quantity: z
          .number({
            required_error: "Qual a quantidade?",
          })
          .min(1),
        payed: z.boolean().default(true),
      }),
    )
    .min(1, "Adicione pelo menos um item"),
});

interface NewCanteenSellModalV2Props {
  canteenId: string;
  open: boolean;
  onCreated: () => void;
  onClickCancel: () => void;
}

export function NewCanteenSellModalV2({
  canteenId,
  open,
  onCreated,
  onClickCancel,
}: NewCanteenSellModalV2Props) {
  const allCanteenItemsQuery = api.canteen.allCanteenItems.useQuery({
    canteenId,
    limit: 999,
    page: 1,
  });

  const studentsWithCanteenLimitBySchoolIdQuery =
    api.student.studentsWithCanteenLimitBySchoolId.useQuery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: undefined,
      products: [
        {
          canteenItemId: undefined,
          quantity: 1,
          payed: true,
        },
      ],
    },
  });

  const watchProducts = watch("products");
  const watchUserId = watch("userId");

  const { mutateAsync: sellItemMutation } = api.canteen.sellItem.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Vendendo...");
    try {
      await sellItemMutation({
        canteenId,
        itemId: data.canteenItemId,
        quantity: data.quantity,
        studentId: data.studentId,
        payed: data.payed,
      });
      toast.success("Venda criada com sucesso!");
    } catch (e) {
      toast.error("Erro ao criar venda");
    } finally {
      toast.dismiss(toastId);
      onCreated();
      reset();
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClickCancel();
      }}
      title={"Nova venda"}
    >
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">
              Pra qual pessoa?
            </label>
            <div className="mt-2">
              <SearchSelect
                id="distance"
                name="distance"
                className="mt-2"
                value={watchUserId}
                onValueChange={(value) => setValue("userId", value)}
              >
                {studentsWithCanteenLimitBySchoolIdQuery.data?.map(
                  (student) => (
                    <SearchSelectItem key={student.id} value={student.id}>
                      {student.userName}
                    </SearchSelectItem>
                  ),
                )}
              </SearchSelect>
            </div>
          </div>
          {/* <div>
            <label className="text-sm font-bold text-gray-900">Item</label>
            <div className="mt-2">
              <SearchSelect
                id="distance"
                name="distance"
                className="mt-2"
                value={watchProductId}
                onValueChange={(value) => setValue("canteenItemId", value)}
              >
                {allCanteenItemsQuery.data?.map((item) => (
                  <SearchSelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SearchSelectItem>
                ))}
              </SearchSelect>
            </div>
          </div> */}
          {/* <div>
            <label className="text-sm font-bold text-gray-900">
              Quantidade
            </label>
            <div className="mt-2">
              <input
                {...register("quantity")}
                type="number"
                inputMode="numeric"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.quantity ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.quantity && (
                <p className="text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div> */}
          {/* <div>
            <label className="text-sm font-bold text-gray-900">Pago?</label>
            <div className="mt-2">
              <Switch
                checked={watchPayed}
                onChange={() => {
                  setValue("payed", !watchPayed);
                }}
              />
              {errors.quantity && (
                <p className="text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>
        </div> */}
        </div>

        <div className="mt-5 flex items-center justify-end space-x-4">
          <button
            onClick={() => onClickCancel()}
            type="reset"
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
        </div>
      </form>
    </Modal>
  );
}
