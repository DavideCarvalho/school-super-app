import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/trpc/react";
import { brazilianRealFormatter } from "~/utils/brazilian-real-formatter";
import Calendar from "../calendar";
import { Modal } from "../modal";

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
  schoolId: string;
  open: boolean;
  onCreated: () => void;
  onClickCancel: () => void;
}

export function NewPurchaseRequestModal({
  schoolId,
  open,
  onCreated,
  onClickCancel,
}: NewPurchaseRequestModalProps) {
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createPurchaseRequestMutation } =
    api.purchaseRequest.create.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Criando solicitação de compra...");
    try {
      await createPurchaseRequestMutation({
        productUrl: data.productUrl,
        productName: data.productName,
        quantity: data.quantity,
        schoolId: schoolId,
        requestingUserId: user?.publicMetadata?.id as string,
        unitValue: data.unitValue,
        value: data.unitValue * data.quantity,
        dueDate: data.dueDate,
        description: data.description,
      });
      toast.success("Solicitação de compra criada com sucesso!");
    } catch (e) {
      toast.error("Erro ao criar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
      onCreated();
      reset();
    }
  };

  const now = dayjs();
  const watchDueDate = watch("dueDate");
  const watchUnitValue = watch("unitValue", 0);
  const watchQuantity = watch("quantity", 0);
  if (!watchDueDate) {
    setValue("dueDate", now.add(2, "day").toDate());
  }

  return (
    <Modal
      open={open}
      onClose={onClickCancel}
      title={"Nova solicitação de compra"}
    >
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">
              Qual é o produto?
            </label>
            <div className="mt-2">
              <input
                {...register("productName")}
                type="text"
                inputMode="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.productName ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.productName && (
                <p className="text-red-600">{errors.productName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">
              Quantos você precisa?
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
                placeholder="2"
              />
              {errors.quantity && (
                <p className="text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">
              Quanto custa cada um?
            </label>
            <div className="mt-2">
              <input
                {...register("unitValue")}
                type="number"
                inputMode="numeric"
                step="any"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.unitValue ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="10.00"
              />
              {errors.unitValue && (
                <p className="text-red-600">{errors.unitValue.message}</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">
              Quanto custa no total?
            </p>
            <div className="mt-2">
              <p>{brazilianRealFormatter(watchUnitValue * watchQuantity)}</p>
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Pra quando?
            </label>
            <div className="mt-2">
              <Calendar
                value={watchDueDate}
                minDate={now.add(1, "day").toDate()}
                onChange={(date) => setValue("dueDate", date)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">
              Link do produto
            </label>
            <div className="mt-2">
              <input
                {...register("productUrl")}
                type="text"
                inputMode="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.productUrl ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Giz de cera"
              />
              {errors.productUrl && (
                <p className="text-red-600">{errors.productUrl.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">
              Alguma observação?
            </label>
            <div className="mt-2">
              <textarea
                className="block w-full resize-y rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                rows={4}
                {...register("description")}
              />
              {errors.description && <p>{errors.description?.message}</p>}
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
