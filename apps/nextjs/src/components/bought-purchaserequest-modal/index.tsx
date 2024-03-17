import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { PurchaseRequest } from "@acme/db";

import { api } from "~/utils/api";
import Calendar from "../calendar";
import { Modal } from "../modal";

const schema = z
  .object({
    finalQuantity: z
      .number({ required_error: "Quantos foram comprados?" })
      .min(1),
    finalUnitValue: z
      .number({ required_error: "Qual o valor unitário?" })
      .min(0),
    finalValue: z
      .number({ required_error: "Qual o valor total que foi comprado?" })
      .min(0),
    estimatedArrivalDate: z.date({ required_error: "Previsão de chegada" }),
    purchaseDate: z.date({ required_error: "Data da compra" }),
    receiptFile: z.any({ required_error: "Coloque a nota fiscal" }),
  })
  .required();

interface BoughtPurchaseRequestModalProps {
  schoolId: string;
  open: boolean;
  onCreated: () => void;
  onClickCancel: () => void;
  purchaseRequest: PurchaseRequest;
}

export function BoughtPurchaseRequestModal({
  schoolId,
  open,
  onCreated,
  onClickCancel,
  purchaseRequest,
}: BoughtPurchaseRequestModalProps) {
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

  const { mutateAsync: createBoughtPurchaseRequestFileSignedUrl } =
    api.purchaseRequest.createBoughtPurchaseRequestFileSignedUrl.useMutation();
  const { mutateAsync: boughtPurchaseRequest } =
    api.purchaseRequest.boughtPurchaseRequest.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Alterando solicitação de compra...");
    try {
      const receiptFile = data.receiptFile as File;
      const { signedUrl } = await createBoughtPurchaseRequestFileSignedUrl({
        schoolId,
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
        finalValue: data.finalValue,
        receiptFileName: receiptFile.name,
        id: purchaseRequest.id,
        schoolId,
      });
      toast.loading("Solicitação de compra alterada com sucesso!");
      onCreated();
      reset();
    } catch (e) {
      toast.error("Erro ao alterar solicitação de compra");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const now = dayjs();
  const watchDueDate = watch("estimatedArrivalDate", new Date());
  const watchPurchaseDate = watch("purchaseDate", new Date());

  return (
    <Modal open={open} onClose={onClickCancel} title={"Item comprado"}>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">
              Quantos foi comprado?
            </label>
            <div className="mt-2">
              <input
                {...register("finalQuantity")}
                type="number"
                inputMode="numeric"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.finalQuantity ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="2"
              />
              {errors.finalQuantity && (
                <p className="text-red-600">{errors.finalQuantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">
              Quanto custou cada um?
            </label>
            <div className="mt-2">
              <input
                {...register("finalUnitValue")}
                type="number"
                inputMode="numeric"
                step="any"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.finalUnitValue ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="10.00"
              />
              {errors.finalUnitValue && (
                <p className="text-red-600">{errors.finalUnitValue.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">
              Quanto custou no total?
            </label>
            <div className="mt-2">
              <input
                {...register("finalValue")}
                type="number"
                inputMode="numeric"
                step="any"
                min={1}
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.finalValue ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="10.00"
              />
              {errors.finalValue && (
                <p className="text-red-600">{errors.finalValue.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Quando foi comprado?
            </label>
            <div className="mt-2">
              <Calendar
                value={watchPurchaseDate}
                minDate={now.subtract(1, "hour").toDate()}
                onChange={(date) => setValue("purchaseDate", date)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Quando que é a previsão de chegada?
            </label>
            <div className="mt-2">
              <Calendar
                value={watchDueDate}
                minDate={now.subtract(1, "hour").toDate()}
                onChange={(date) => setValue("estimatedArrivalDate", date)}
              />
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
            Atualizar
          </button>
        </div>
      </form>
    </Modal>
  );
}
