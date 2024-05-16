import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { PurchaseRequest } from "@acme/db";

import { api } from "~/trpc/react";
import { Modal } from "../modal";

const schema = z
  .object({
    reason: z.string({ required_error: "Porque está rejeitando?" }),
  })
  .required();

interface RejectPurchaseRequestModalProps {
  open: boolean;
  onRejected: () => void;
  onClickCancel: () => void;
  purchaseRequest: PurchaseRequest;
}

export function RejectPurchaseRequestModal({
  open,
  onRejected,
  onClickCancel,
  purchaseRequest,
}: RejectPurchaseRequestModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const rejectPurchaseRequestMutation =
    api.purchaseRequest.rejectPurchaseRequest.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    toast.loading("Rejeitando solicitação de compra...");
    rejectPurchaseRequestMutation.mutate(
      {
        id: purchaseRequest.id,
        reason: data.reason,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Solicitação de compra rejeitada com sucesso!");
          onRejected();
          reset();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClickCancel}
      title={"Rejeitar solicitação de compra"}
    >
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">
              Porque da rejeição?
            </label>
            <div className="mt-2">
              <textarea
                className="block w-full resize-y rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                rows={4}
                {...register("reason")}
              />
              {errors.reason && <p>{errors.reason?.message}</p>}
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
            Rejeitar
          </button>
        </div>
      </form>
    </Modal>
  );
}
