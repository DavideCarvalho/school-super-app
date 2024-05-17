import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { toast } from "react-hot-toast";

import type { Role, User } from "@acme/db";

import { api } from "~/trpc/react";
import { Dropdown } from "../dropdown";
import { EditWorkerModal } from "../edit-worker-modal";
import { NewWorkerRequestModal } from "../new-worker-request-modal";
import { Pagination } from "../pagination";

interface SchoolWorkersTableProps {
  schoolId: string;
}

function getRole(roleName: string) {
  switch (roleName) {
    case "TEACHER":
      return "Professor(a)";
    case "SCHOOL_WORKER":
      return "Funcionário(a)";
    case "COORDINATOR":
      return "Coordenador(a)";
    case "DIRECTOR":
      return "Diretor(a)";
    default:
      return "Funcionário";
  }
}

export function SchoolWorkersTable({ schoolId }: SchoolWorkersTableProps) {
  const router = useRouter();
  const { user } = useUser();

  const [item, setItem] = useState<{
    label: string;
    value: string | undefined;
    icon?: JSX.Element;
  }>({ label: "", value: "", icon: undefined });
  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<
    (User & { Role: Role }) | undefined
  >(undefined);
  const workersQuery = api.user.allBySchoolId.useQuery(
    {
      schoolId,
      limit: router.query.limit ? Number(router.query.limit) : 5,
      page: router.query.page ? Number(router.query.page) : 1,
      role: isValidRole(router.query.role as string)
        ? (router.query.role as
            | "TEACHER"
            | "SCHOOL_WORKER"
            | "COORDINATOR"
            | "DIRECTOR")
        : undefined,
    },
    { refetchOnMount: false },
  );

  function isValidRole(role?: string) {
    return (
      role === "TEACHER" ||
      role === "SCHOOL_WORKER" ||
      role === "COORDINATOR" ||
      role === "DIRECTOR"
    );
  }

  const workersCountQuery = api.user.countAllBySchoolId.useQuery(
    {
      schoolId,
      role: isValidRole(router.query.role as string)
        ? (router.query.role as
            | "TEACHER"
            | "SCHOOL_WORKER"
            | "COORDINATOR"
            | "DIRECTOR")
        : undefined,
    },
    { refetchOnMount: false },
  );

  const deleteWorkerMutation = api.user.deleteById.useMutation();

  async function onCreated() {
    setOpen(false);
    await workersQuery.refetch();
    await workersCountQuery.refetch();
  }

  function deleteWorker(workerId: string) {
    toast.loading("Removendo usuário...");
    deleteWorkerMutation.mutate(
      { userId: workerId, schoolId },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Usuário removido com sucesso!");
          await workersQuery.refetch();
          await workersCountQuery.refetch();
        },
      },
    );
  }

  function onSelectWorkerToEdit(worker: User & { Role: Role }) {
    setOpenEditModal(true);
    setSelectedWorker(worker);
  }

  async function onEdited() {
    setOpenEditModal(false);
    setSelectedWorker(undefined);
    await workersQuery.refetch();
    await workersCountQuery.refetch();
  }

  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <NewWorkerRequestModal
        schoolId={schoolId}
        onCreated={async () => await onCreated()}
        open={open}
        onClickCancel={() => setOpen(false)}
      />
      <EditWorkerModal
        schoolId={schoolId}
        open={openEditModal}
        selectedWorker={selectedWorker as User & { Role: Role }}
        onClickCancel={() => {
          setOpenEditModal(false);
          setSelectedWorker(undefined);
        }}
        onEdited={() => onEdited()}
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">Funcionários</p>
            </div>
            {user?.publicMetadata?.role === "SCHOOL_WORKER" && (
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
                Novo funcionário
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row">
          <div className="w-full">
            <div className="mx-auto max-w-xs">
              <Dropdown<string>
                cleanFilter={true}
                search={item.label}
                initialSelectedItem={
                  router.query.role
                    ? {
                        label: getRole(router.query.role as string),
                        value: router.query.role as string,
                      }
                    : undefined
                }
                onChange={(v) => setItem((state) => ({ ...state, label: v }))}
                onSelectItem={(selectedItem) => {
                  const { role: _role, ...rest } = router.query;
                  setItem(() => ({
                    ...selectedItem,
                    value: selectedItem?.value,
                    label: "",
                  }));
                  void router.replace(
                    {
                      query: {
                        ...rest,
                        ...(selectedItem?.value && {
                          role: selectedItem.value,
                        }),
                      },
                    },
                    undefined,
                    { shallow: true },
                  );
                }}
                dropdownLabel="Cargos"
                inputPlaceholder="Professor(a)"
                dropdownPlaceholder="Selecione um cargo"
                dropdownItems={[
                  { label: getRole("TEACHER"), value: "TEACHER" },
                  { label: getRole("SCHOOL_WORKER"), value: "SCHOOL_WORKER" },
                  { label: getRole("COORDINATOR"), value: "COORDINATOR" },
                  { label: getRole("DIRECTOR"), value: "DIRECTOR" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {workersQuery.isFetching && (
            <>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </>
          )}
          {!workersQuery.isFetching &&
            workersQuery.data?.map((worker) => {
              return (
                <TableRow
                  key={worker.id}
                  worker={worker}
                  onDelete={deleteWorker}
                  onEdit={onSelectWorkerToEdit}
                />
              );
            })}
        </div>

        <div>
          <Pagination
            totalCount={workersCountQuery?.data || 0}
            currentPage={router.query.page ? Number(router.query.page) : 1}
            itemsPerPage={router.query.limit ? Number(router.query.limit) : 5}
            onChangePage={(page) => {
              void router.replace(
                {
                  query: { ...router.query, page },
                },
                undefined,
                { scroll: false },
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface TableRowProps {
  worker: User & { Role: Role };
  onDelete: (workerId: string) => void;
  onEdit: (worker: User & { Role: Role }) => void;
}

const tableRowRoleDictionary = {
  SCHOOL_WORKER: "Funcionário(a)",
  TEACHER: "Professor(a)",
  COORDINATOR: "Coordenador(a)",
  DIRECTOR: "Diretor(a)",
};

function TableRow({ worker, onDelete, onEdit }: TableRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps } = useInteractions([click, dismiss]);

  return (
    <div className="grid grid-cols-2 py-4 lg:grid-cols-2 lg:gap-0">
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
                <li
                  className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                  onClick={() => onDelete(worker.id)}
                >
                  Excluir
                </li>
                <li
                  className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                  onClick={() => onEdit(worker)}
                >
                  Editar
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-sm font-bold text-gray-900">{worker.name}</p>
        <p className="mt-1 text-sm font-medium text-gray-500">
          {
            tableRowRoleDictionary[
              worker.Role.name as keyof typeof tableRowRoleDictionary
            ]
          }
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
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
