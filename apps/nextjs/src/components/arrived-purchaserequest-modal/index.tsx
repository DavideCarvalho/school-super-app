import { useEffect } from "react";
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
    arrivalDate: z.date({ required_error: "Data que chegou" }),
  })
  .required();

interface ArrivedPurchaseRequestModalProps {
  open: boolean;
  onArrived: () => void;
  onClickCancel: () => void;
  purchaseRequest: PurchaseRequest;
}

export function ArrivedPurchaseRequestModal({
  open,
  onArrived,
  onClickCancel,
  purchaseRequest,
}: ArrivedPurchaseRequestModalProps) {
  const { handleSubmit, reset, setValue, getValues } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!purchaseRequest) return;
    setValue("arrivalDate", purchaseRequest.estimatedArrivalDate!);
  }, [open]);

  const { mutateAsync: arrivedPurchaseRequest } =
    api.purchaseRequest.arrivedPurchaseRequest.useMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const toastId = toast.loading("Alterando solicitação de compra...");
    try {
      await arrivedPurchaseRequest({
        id: purchaseRequest.id,
        arrivalDate: data.arrivalDate,
      });
      toast.success("Solicitação de compra alterada com sucesso!");
      onArrived();
      reset();
    } catch (e) {
      toast.error("Erro ao alterar solicitação de compra");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const now = dayjs();

  return (
    <Modal open={open} onClose={onClickCancel} title={"Item comprado"}>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Quando chegou?
            </label>
            <div className="mt-2">
              <Calendar
                value={getValues("arrivalDate")}
                minDate={now.subtract(1, "hour").toDate()}
                onChange={(date) => setValue("arrivalDate", date)}
              />
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
        </div>
      </form>
    </Modal>
  );
}
