import dayjs from "dayjs";
import toast from "react-hot-toast";

import type { PurchaseRequest } from "@acme/db";

import { api } from "~/utils/api";
import { brazilianRealFormatter } from "~/utils/brazilian-real-formatter";
import { Modal } from "../modal";

interface ApprovePurchaseRequestModalProps {
  open: boolean;
  onApproved: () => void;
  onClickCancel: () => void;
  purchaseRequest: PurchaseRequest;
}

export function ApprovePurchaseRequestModal({
  open,
  onApproved,
  onClickCancel,
  purchaseRequest,
}: ApprovePurchaseRequestModalProps) {
  const { mutateAsync: approvePurchaseRequestMutation } =
    api.purchaseRequest.approvePurchaseRequest.useMutation();

  async function onApprove() {
    const toastId = toast.loading("Aprovando solicitação de compra...");
    try {
      await approvePurchaseRequestMutation({
        id: purchaseRequest.id,
      });
      toast.success("Solicitação de compra aprovada com sucesso!");
    } catch (e) {
      toast.error("Erro ao criar solicitação de compra.");
    } finally {
      toast.dismiss(toastId);
      onApproved();
    }
  }

  if (!purchaseRequest) return null;

  return (
    <Modal open={open} onClose={onClickCancel} title={"Solicitação de compra"}>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Produto</p>
          <div className="mt-2">
            <p>{purchaseRequest.productName}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">Quantos?</p>
          <div className="mt-2">
            <p>{purchaseRequest.quantity}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">
            Quanto custa cada um?
          </p>
          <div className="mt-2">
            <p>{brazilianRealFormatter(purchaseRequest.unitValue)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">
            Quanto custa no total?
          </p>
          <div className="mt-2">
            <p>
              {brazilianRealFormatter(
                purchaseRequest.unitValue * purchaseRequest.quantity,
              )}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="quantity" className="text-sm font-bold text-gray-900">
            Pra quando?
          </label>
          <div className="mt-2">
            <p>{dayjs(purchaseRequest.dueDate).format("DD/MM/YYYY")}</p>
          </div>
        </div>

        {purchaseRequest.productUrl && (
          <div>
            <p className="text-sm font-bold text-gray-900">Link do produto</p>
            <div className="mt-2">
              <a
                href={purchaseRequest.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600"
              >
                Clique aqui para ver
              </a>
            </div>
          </div>
        )}

        {purchaseRequest.description && (
          <div>
            <p className="text-sm font-bold text-gray-900">
              Alguma observação?
            </p>
            <div className="mt-2">
              <p>{purchaseRequest.description}</p>
            </div>
          </div>
        )}
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
          onClick={onApprove}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        >
          Approvar
        </button>
      </div>
    </Modal>
  );
}
