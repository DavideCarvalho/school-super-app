import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { PurchaseRequest } from "@acme/db";

import { api } from "~/utils/api";
import { Modal } from "../modal";
import Calendar from "../calendar";
import dayjs from "dayjs";
import { useEffect } from "react";

const schema = z
  .object({
    productName: z.string({ required_error: "Qual nome do produto?" }),
    quantity: z.coerce.number({ required_error: "Qual a quantidade?" }).min(1),
    value: z.coerce.number({ required_error: "Quanto custa?" }).min(0),
    dueDate: z.date(),
    productUrl: z.string().optional(),
    description: z.string().optional(),
  })
  .required();

interface EditRequestedPurchaseRequestModalProps {
  open: boolean;
  onEdited: () => void;
  onClickCancel: () => void;
  selectedPurchaseRequest: PurchaseRequest;
}

export function EditRequestedPurchaseRequestModal({
  open,
  onEdited,
  onClickCancel,
  selectedPurchaseRequest,
}: EditRequestedPurchaseRequestModalProps) {
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

  useEffect(() => {
    if (!selectedPurchaseRequest) {
      reset();
      return;
    }
    setValue("productName", selectedPurchaseRequest.productName);
    setValue("quantity", selectedPurchaseRequest.quantity);
    setValue("value", selectedPurchaseRequest.value);
    setValue("dueDate", selectedPurchaseRequest.dueDate);
    if (selectedPurchaseRequest?.productUrl) setValue("productUrl", selectedPurchaseRequest.productUrl);
    if (selectedPurchaseRequest?.description) setValue("description",  selectedPurchaseRequest.description);
  }, [selectedPurchaseRequest]);

  const editRequestedPurchaseMutation = api.purchaseRequest.editRequestedPurchaseRequest.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!selectedPurchaseRequest) return;
    toast.loading("Alterando solicitação de compra...");
    editRequestedPurchaseMutation.mutate(
      {
        id: selectedPurchaseRequest.id,
        productUrl: data.productUrl,
        productName: data.productName,
        quantity: data.quantity,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
      },
      {
        onSuccess() {
          toast.dismiss();
          toast.success("Solicitação de compra alterada com sucesso!");
          onEdited();
          reset();
        },
      },
    );
  };

  const now = dayjs();
  const watchDueDate = watch("dueDate", new Date());

  return (
    <Modal
      open={open}
      onClose={onClickCancel}
      title={`Editar solicitação de compra`}
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
              Quanto custa?
            </label>
            <div className="mt-2">
              <input
                {...register("value")}
                type="number"
                inputMode="numeric"
                step="any"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.value ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="10.00"
              />
              {errors.value && (
                <p className="text-red-600">{errors.value.message}</p>
              )}
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
                minDate={now.subtract(1, "hour").toDate()}
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
            Alterar
          </button>
        </div>
      </form>
    </Modal>
  );
}
