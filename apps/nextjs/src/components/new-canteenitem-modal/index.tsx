import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/utils/api";
import { Modal } from "../modal";

const schema = z
  .object({
    name: z.string({
      required_error: "Qual é o nome do item?",
    }),
    price: z.coerce.number({
      required_error: "Qual é o preço?",
    }),
  })
  .required();

interface NewCanteenItemModalProps {
  canteenId: string;
  open: boolean;
  onCreated: () => void;
  onClickCancel: () => void;
}

export function NewCanteenItemModal({
  canteenId,
  open,
  onCreated,
  onClickCancel,
}: NewCanteenItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: addCanteenItemMutation } =
    api.canteen.addCanteenItem.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Adicionando item da cantina...");
    try {
      await addCanteenItemMutation({
        canteenId,
        name: data.name,
        price: data.price * 100,
      });
      toast.success("Item da cantina adicionado com sucesso!");
    } catch (e) {
      toast.error("Erro ao adicionar item da cantina");
    } finally {
      toast.dismiss(toastId);
      onCreated();
      reset();
    }
  };

  return (
    <Modal open={open} onClose={onClickCancel} title={"Nova cantina"}>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">Nome</label>
            <div className="mt-2">
              <input
                {...register("name")}
                type="text"
                inputMode="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.name ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.name && (
                <p className="text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900">Preço</label>
            <div className="mt-2">
              <input
                {...register("price")}
                type="number"
                inputMode="numeric"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.price ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.price && (
                <p className="text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>
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
            Adicionar
          </button>
        </div>
      </form>
    </Modal>
  );
}
