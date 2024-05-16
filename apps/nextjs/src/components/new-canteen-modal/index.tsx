import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/trpc/react";
import { Modal } from "../modal";

const schema = z
  .object({
    responsibleEmail: z.string({
      required_error: "Qual é o email do responsável?",
    }),
    responsibleName: z.string({
      required_error: "Qual é o nome do responsável?",
    }),
  })
  .required();

interface NewCanteenModalProps {
  schoolId: string;
  open: boolean;
  onCreated: () => void;
  onClickCancel: () => void;
}

export function NewCanteenModal({
  schoolId,
  open,
  onCreated,
  onClickCancel,
}: NewCanteenModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createPurchaseRequestMutation } =
    api.canteen.create.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Criando cantina...");
    try {
      await createPurchaseRequestMutation({
        schoolId,
        responsibleEmail: data.responsibleEmail,
        responsibleName: data.responsibleName,
      });
      toast.success("Cantina criada com sucesso!");
    } catch (e) {
      toast.error("Erro ao criar cantina");
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
            <label className="text-sm font-bold text-gray-900">
              Email do responsável da cantina
            </label>
            <div className="mt-2">
              <input
                {...register("responsibleEmail")}
                type="text"
                inputMode="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.responsibleEmail ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.responsibleEmail && (
                <p className="text-red-600">
                  {errors.responsibleEmail.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900">
              Nome do responsável da cantina
            </label>
            <div className="mt-2">
              <input
                {...register("responsibleName")}
                type="text"
                inputMode="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.responsibleName ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.responsibleName && (
                <p className="text-red-600">{errors.responsibleName.message}</p>
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
            Criar
          </button>
        </div>
      </form>
    </Modal>
  );
}
