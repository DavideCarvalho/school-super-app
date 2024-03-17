import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

import { type PurchaseRequest } from "@acme/db";

import { api } from "~/utils/api";
import { BoughtPurchaseRequestModal } from "../bought-purchaserequest-modal";
import { EditRequestedPurchaseRequestModal } from "../edit-requested-purchaserequest-modal";
import { NewPurchaseRequestModal } from "../new-purchaserequest-modal";
import { Pagination } from "../pagination";
import { RejectPurchaseRequestModal } from "../reject-purchaserequest-modal";

interface SchoolPurchaseRequestsTableProps {
  schoolId: string;
}

export function SchoolPurchaseRequestsTable({
  schoolId,
}: SchoolPurchaseRequestsTableProps) {
  const router = useRouter();
  const { user } = useUser();

  const [selectedPurchaseRequest, setSelectedPurchaseRequest] =
    useState<PurchaseRequest>();

  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openRejectPurchaseRequestModal, setOpenRejectPurchaseRequestModal] =
    useState(false);
  const [openBoughtPurchaseRequestModal, setOpenBoughtPurchaseRequestModal] =
    useState(false);

  const purchaseRequestsQuery = api.purchaseRequest.allBySchoolId.useQuery(
    {
      schoolId,
      limit: router.query.limit ? Number(router.query.limit) : 5,
      page: router.query.page ? Number(router.query.page) : 1,
    },
    { refetchOnMount: false },
  );

  const purchaseRequestsCountQuery =
    api.purchaseRequest.countAllBySchoolId.useQuery(
      { schoolId },
      { refetchOnMount: false },
    );

  const deleteSchoolClassMutation = api.class.deleteById.useMutation();

  async function onCreated() {
    setOpen(false);
    await purchaseRequestsQuery.refetch();
    await purchaseRequestsCountQuery.refetch();
  }

  function deletePurchaseRequest(purchaseRequestId: string) {
    toast.loading("Removendo solicitação de compra...");
    deleteSchoolClassMutation.mutate(
      { classId: purchaseRequestId, schoolId },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Solicitação de compra removida com sucesso!");
          await purchaseRequestsQuery.refetch();
          await purchaseRequestsCountQuery.refetch();
        },
      },
    );
  }

  function onSelectPurchaseRequestToEdit(purchaseRequest: PurchaseRequest) {
    setOpenEditModal(true);
    setSelectedPurchaseRequest(purchaseRequest);
  }

  async function onEdited() {
    setOpenEditModal(false);
    setSelectedPurchaseRequest(undefined);
    await purchaseRequestsQuery.refetch();
    await purchaseRequestsCountQuery.refetch();
  }

  async function onRejected() {
    setOpenRejectPurchaseRequestModal(false);
    setSelectedPurchaseRequest(undefined);
    await purchaseRequestsQuery.refetch();
    await purchaseRequestsCountQuery.refetch();
  }

  async function onReject(purchaseRequest: PurchaseRequest) {
    setSelectedPurchaseRequest(purchaseRequest);
    setOpenRejectPurchaseRequestModal(true);
  }

  async function onCreatedBought() {
    setSelectedPurchaseRequest(undefined);
    setOpenBoughtPurchaseRequestModal(false);
    await purchaseRequestsQuery.refetch();
    await purchaseRequestsCountQuery.refetch();
  }

  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <NewPurchaseRequestModal
        schoolId={schoolId}
        onCreated={async () => await onCreated()}
        open={open}
        onClickCancel={() => setOpen(false)}
      />
      <EditRequestedPurchaseRequestModal
        open={openEditModal}
        selectedPurchaseRequest={selectedPurchaseRequest as PurchaseRequest}
        onClickCancel={() => {
          setOpenEditModal(false);
          setSelectedPurchaseRequest(undefined);
        }}
        onEdited={() => onEdited()}
      />
      <RejectPurchaseRequestModal
        open={openRejectPurchaseRequestModal}
        purchaseRequest={selectedPurchaseRequest as PurchaseRequest}
        onClickCancel={() => {
          setOpenRejectPurchaseRequestModal(false);
          setSelectedPurchaseRequest(undefined);
        }}
        onRejected={() => onRejected()}
      />
      <BoughtPurchaseRequestModal
        schoolId={schoolId}
        open={openBoughtPurchaseRequestModal}
        purchaseRequest={selectedPurchaseRequest as PurchaseRequest}
        onClickCancel={() => {
          setOpenRejectPurchaseRequestModal(false);
          setSelectedPurchaseRequest(undefined);
        }}
        onCreated={onCreatedBought}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                Solicitações de compra
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              <svg
                className="mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Criar solicitação
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {purchaseRequestsQuery.isFetching && (
            <>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </>
          )}
          {!purchaseRequestsQuery.isFetching &&
            purchaseRequestsQuery.data?.map((purchaseRequest) => {
              return (
                <TableRow
                  key={purchaseRequest.id}
                  purchaseRequest={purchaseRequest}
                  onDelete={({ id }) => deletePurchaseRequest(id)}
                  onEdit={onSelectPurchaseRequestToEdit}
                  onReject={onReject}
                  onApprove={() => {}}
                  onBought={() => {}}
                  onArrived={() => {}}
                />
              );
            })}
        </div>

        <div>
          <Pagination
            totalCount={purchaseRequestsCountQuery?.data || 0}
            currentPage={Number(router.query.page) || 1}
            itemsPerPage={Number(router.query.limit) || 5}
            onChangePage={(page) => {
              void router.replace(
                {
                  query: { ...router.query, page },
                },
                undefined,
                { shallow: true },
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface TableRowProps {
  purchaseRequest: PurchaseRequest;
  onDelete: (purchaseRequest: PurchaseRequest) => void;
  onApprove: (purchaseRequest: PurchaseRequest) => void;
  onBought: (purchaseRequest: PurchaseRequest) => void;
  onArrived: (purchaseRequest: PurchaseRequest) => void;
  onEdit: (purchaseRequest: PurchaseRequest) => void;
  onReject: (purchaseRequest: PurchaseRequest) => void;
}

const statusDictionary: Record<string, string> = {
  REQUESTED: "Solicitado",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  BOUGHT: "Comprado",
  ARRIVED: "Chegou",
};

function TableRow({
  purchaseRequest,
  onDelete,
  onEdit,
  onApprove,
  onReject,
}: TableRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps } = useInteractions([click, dismiss]);

  return (
    <div className="grid grid-cols-3 py-4 lg:grid-cols-3 lg:gap-0">
      <div className="px-4 text-right sm:px-6 lg:order-last lg:py-4">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 transition-all duration-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          ref={refs.setReference}
          {...getReferenceProps()}
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ? y + 10 : 0,
              left: x ?? 0,
            }}
          >
            <div className="w-full space-y-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow">
              <ul className="flex flex-col">
                {purchaseRequest.status === "REQUESTED" && (
                  <li
                    className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                    onClick={() => onApprove(purchaseRequest)}
                  >
                    Aprovar
                  </li>
                )}
                {purchaseRequest.status === "REQUESTED" && (
                  <li
                    className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                    onClick={() => onDelete(purchaseRequest)}
                  >
                    Excluir
                  </li>
                )}
                {(purchaseRequest.status === "REQUESTED" ||
                  purchaseRequest.status === "REJECTED") && (
                  <li
                    className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                    onClick={() => onEdit(purchaseRequest)}
                  >
                    Editar
                  </li>
                )}
                {purchaseRequest.status === "REQUESTED" && (
                  <li
                    className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                    onClick={() => onReject(purchaseRequest)}
                  >
                    Rejeitar
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Produto</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {purchaseRequest.productName}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Status</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {statusDictionary[purchaseRequest.status]}
        </p>
      </div>

      {purchaseRequest.estimatedDueDate && (
        <div className="px-4 sm:px-6 lg:py-4">
          <p className="text-lg font-bold text-gray-900">
            Estimativa de chegada
          </p>
          <p className="mt-1 text-lg font-medium text-gray-500">
            {dayjs(purchaseRequest.estimatedDueDate).format("DD/MM/YYYY")}
          </p>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Pra qual dia?</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {dayjs(purchaseRequest.dueDate).format("DD/MM/YYYY")}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Quantidade</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {purchaseRequest.quantity}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Valor unitário</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {purchaseRequest.value.toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-2 py-4 lg:grid-cols-2 lg:gap-0">
      <div className="px-4 text-right sm:px-6 lg:order-last lg:py-4">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 transition-all duration-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
