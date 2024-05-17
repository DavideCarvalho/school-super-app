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

import type { Class, File, Subject, Teacher, User } from "@acme/db";

import { api } from "~/trpc/react";
import { Dropdown, type DropdownItem } from "../dropdown";
import { NewFileRequestModal } from "../new-file-request-modal";
import { Pagination } from "../pagination";

interface SchoolFilesTableProps {
  schoolId: string;
}

function getStatus(
  status: TableRowStatusEnum,
): DropdownItem<TableRowStatusEnum> {
  switch (status.toUpperCase()) {
    case TableRowStatusEnum.REVIEW:
      return {
        label: "Revisão",
        value: TableRowStatusEnum.REVIEW,
        icon: (
          <svg
            className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-yellow-500"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <title>Status</title>
            <circle cx="4" cy="4" r="3" />
          </svg>
        ),
      };
    case TableRowStatusEnum.REQUESTED:
      return {
        label: "Solicitado",
        value: TableRowStatusEnum.REQUESTED,
        icon: (
          <svg
            className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-purple-500"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <title>Status</title>
            <circle cx="4" cy="4" r="3" />
          </svg>
        ),
      };
    case TableRowStatusEnum.APPROVED:
      return {
        label: "Aprovado",
        value: TableRowStatusEnum.APPROVED,
        icon: (
          <svg
            className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-sky-500"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <title>Status</title>
            <circle cx="4" cy="4" r="3" />
          </svg>
        ),
      };
    case TableRowStatusEnum.PRINTED:
      return {
        label: "Impresso",
        value: TableRowStatusEnum.PRINTED,
        icon: (
          <svg
            className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-green-500"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <title>Status</title>
            <circle cx="4" cy="4" r="3" />
          </svg>
        ),
      };
    default:
      return { label: "", value: "" };
  }
}

function isValidStatus(status?: string): status is TableRowStatusEnum {
  return (
    status === TableRowStatusEnum.REVIEW ||
    status === TableRowStatusEnum.REQUESTED ||
    status === TableRowStatusEnum.APPROVED ||
    status === TableRowStatusEnum.PRINTED
  );
}

export function SchoolFilesTable({ schoolId }: SchoolFilesTableProps) {
  const router = useRouter();
  const { user } = useUser();

  const [item, setItem] = useState<{
    label: string;
    value: string | undefined;
    icon?: JSX.Element;
  }>({ label: "", value: "", icon: undefined });
  const [open, setOpen] = useState(false);
  const filesQuery = api.file.allBySchoolId.useQuery(
    {
      schoolId,
      status: isValidStatus(router.query.status as string)
        ? (router.query.status as TableRowStatusEnum)
        : undefined,
      limit: router.query.limit ? Number(router.query.limit) : 5,
      page: router.query.page ? Number(router.query.page) : 1,
      orderBy: { dueDate: "asc" },
    },
    { refetchOnMount: false },
  );

  const filesCountQuery = api.file.countAllBySchoolId.useQuery(
    {
      schoolId,
      status: isValidStatus(router.query.status as string)
        ? (router.query.status as TableRowStatusEnum)
        : undefined,
      orderBy: { dueDate: "asc" },
    },
    { refetchOnMount: false },
  );

  const approveFileRequest = api.file.approveRequest.useMutation();
  const reviewFileRequest = api.file.reviewRequest.useMutation();
  const fileReviewedRequest = api.file.reviewed.useMutation();
  const printFileRequest = api.file.printRequest.useMutation();

  async function onCreated() {
    setOpen(false);
    await filesQuery.refetch();
    await filesCountQuery.refetch();
  }

  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <NewFileRequestModal
        onCreated={async () => await onCreated()}
        open={open}
        onClickCancel={() => setOpen(false)}
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">Arquivos</p>
            </div>
            {user?.publicMetadata?.role === "TEACHER" && (
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
                  <title>Adicionar</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Nova solicitação
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row">
          <div className="w-full">
            <div className="mx-auto max-w-xs">
              <Dropdown<TableRowStatusEnum>
                cleanFilter={true}
                search={item.label}
                initialSelectedItem={
                  router.query.status
                    ? getStatus(router.query.status as TableRowStatusEnum)
                    : undefined
                }
                onChange={(v) => setItem((state) => ({ ...state, label: v }))}
                onSelectItem={(selectedItem) => {
                  setItem(() => ({
                    ...selectedItem,
                    value: selectedItem?.value,
                    label: "",
                  }));
                  void router.replace(
                    {
                      query: {
                        ...router.query,
                        status: selectedItem?.value as string,
                      },
                    },
                    undefined,
                    { shallow: true },
                  );
                }}
                dropdownLabel="Status"
                inputPlaceholder="Aprovação"
                dropdownPlaceholder="Selecione um status"
                dropdownItems={[
                  getStatus(TableRowStatusEnum.APPROVED),
                  getStatus(TableRowStatusEnum.REVIEW),
                  getStatus(TableRowStatusEnum.REQUESTED),
                  getStatus(TableRowStatusEnum.PRINTED),
                ]}
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filesQuery.isFetching && (
            <>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </>
          )}

          {!filesQuery.isFetching &&
            filesQuery.data?.map((file) => {
              const fileStatus = file.status as keyof typeof TableRowStatusEnum;
              const status = TableRowStatusEnum[fileStatus] as
                | TableRowStatusEnum
                | undefined;
              if (!status) return null;
              return (
                <TableRow
                  onApprove={async (fileId) => {
                    toast.loading("Aprovando solicitação...");
                    await approveFileRequest.mutateAsync({ id: fileId });
                    toast.dismiss();
                    toast.success("Solicitação aprovada com sucesso!");
                    await filesQuery.refetch();
                    await filesCountQuery.refetch();
                  }}
                  onReview={async (fileId) => {
                    await fileReviewedRequest.mutateAsync({ id: fileId });
                    toast.dismiss();
                    toast.success("Solicitação reenviada com sucesso!");
                    await filesQuery.refetch();
                    await filesCountQuery.refetch();
                  }}
                  setReview={async (fileId) => {
                    toast.loading('Alterando para "Revisar"...');
                    await reviewFileRequest.mutateAsync({ id: fileId });
                    toast.dismiss();
                    toast.success("Solicitação alterada com sucesso!");
                    await filesQuery.refetch();
                    await filesCountQuery.refetch();
                  }}
                  onOpen={() => window.open(file.path, "_blank", "noreferrer")}
                  onPrint={async (fileId) => {
                    window.open(file.path, "_blank", "noreferrer");
                    await printFileRequest.mutateAsync({ id: fileId });
                    await filesQuery.refetch();
                    await filesCountQuery.refetch();
                  }}
                  userRole={
                    user?.publicMetadata?.role as
                      | "TEACHER"
                      | "COORDINATOR"
                      | "SCHOOL_WORKER"
                      | undefined
                  }
                  key={file.id}
                  status={status}
                  file={file}
                  schoolClass={file.Class}
                  teacher={file.Teacher}
                  subject={file.Subject}
                />
              );
            })}
        </div>

        <div>
          <Pagination
            totalCount={filesCountQuery?.data ?? 0}
            currentPage={Number(router.query.page) || 1}
            itemsPerPage={Number(router.query.limit) || 5}
            onChangePage={(page) => {
              void router.replace({
                query: { ...router.query, page },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

enum TableRowStatusEnum {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  PRINTED = "PRINTED",
  REVIEW = "REVIEW",
}

const TableRowStatusDictionary = {
  [TableRowStatusEnum.REVIEW]: {
    dotColor: "text-yellow-400",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-900",
    label: "Revisar",
  },
  [TableRowStatusEnum.REQUESTED]: {
    dotColor: "text-purple-400",
    bgColor: "bg-purple-100",
    textColor: "text-purple-900",
    label: "Solicitado",
  },
  [TableRowStatusEnum.APPROVED]: {
    dotColor: "text-sky-400",
    bgColor: "bg-sky-100",
    textColor: "text-sky-900",
    label: "Aprovado",
  },
  [TableRowStatusEnum.PRINTED]: {
    dotColor: "text-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-900",
    label: "Impresso",
  },
};

interface TableRowProps {
  userRole: "TEACHER" | "COORDINATOR" | "SCHOOL_WORKER" | undefined;
  status: TableRowStatusEnum;
  file: File;
  schoolClass: Class;
  teacher: Teacher & { User: User };
  subject: Subject;
  onApprove: (fileId: string) => void;
  onReview: (fileId: string) => void;
  setReview: (fileId: string) => void;
  onPrint: (fileId: string) => void;
  onOpen: () => void;
}

function TableRow({
  userRole,
  status,
  file,
  schoolClass,
  teacher,
  subject,
  onApprove,
  onReview,
  setReview,
  onPrint,
  onOpen,
}: TableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dotColor, bgColor, textColor, label } =
    TableRowStatusDictionary[status];

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps } = useInteractions([click, dismiss]);

  return (
    <div className="grid grid-cols-6 py-4 lg:grid-cols-6 lg:gap-0">
      <div className="px-4 sm:px-6 lg:py-4">
        <span
          className={`inline-flex items-center rounded-full ${bgColor} px-2.5 py-1 text-xs font-medium ${textColor}`}
        >
          <svg
            className={`-ml-1 mr-1.5 h-2.5 w-2.5 ${dotColor}`}
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <title>Status</title>
            <circle cx="4" cy="4" r="3" />
          </svg>
          {label}
        </span>
      </div>

      {((userRole === "TEACHER" && status === TableRowStatusEnum.REVIEW) ||
        (userRole === "COORDINATOR" &&
          status === TableRowStatusEnum.REQUESTED) ||
        (userRole === "SCHOOL_WORKER" &&
          status === TableRowStatusEnum.APPROVED) ||
        (userRole === "SCHOOL_WORKER" &&
          status === TableRowStatusEnum.PRINTED)) && (
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
              <title>Menu</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>
          {((userRole === "TEACHER" && status === TableRowStatusEnum.REVIEW) ||
            (userRole === "COORDINATOR" &&
              status === TableRowStatusEnum.REQUESTED) ||
            (userRole === "SCHOOL_WORKER" &&
              status === TableRowStatusEnum.APPROVED) ||
            (userRole === "SCHOOL_WORKER" &&
              status === TableRowStatusEnum.PRINTED)) &&
            isOpen && (
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
                    {userRole === "TEACHER" &&
                      status === TableRowStatusEnum.REVIEW && (
                        <>
                          <li>
                            <button
                              onClick={() => {
                                onReview(file.id);
                                setIsOpen(false);
                              }}
                              className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                              type="button"
                            >
                              Reenviar
                            </button>
                          </li>
                        </>
                      )}
                    {userRole === "COORDINATOR" &&
                      status === TableRowStatusEnum.REQUESTED && (
                        <>
                          <li>
                            <button
                              onClick={() => {
                                onOpen();
                                setIsOpen(false);
                              }}
                              className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                              type="submit"
                            >
                              Abrir
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                onApprove(file.id);
                                setIsOpen(false);
                              }}
                              className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                              type="submit"
                            >
                              Aprovar
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setReview(file.id);
                                setIsOpen(false);
                              }}
                              className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                              type="button"
                            >
                              Revisar
                            </button>
                          </li>
                        </>
                      )}
                    {userRole === "SCHOOL_WORKER" &&
                      status === TableRowStatusEnum.APPROVED && (
                        <>
                          <li>
                            <button
                              onClick={() => {
                                onPrint(file.id);
                                setIsOpen(false);
                              }}
                              className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                              type="button"
                            >
                              Imprimir
                            </button>
                          </li>
                        </>
                      )}
                    {userRole === "SCHOOL_WORKER" &&
                      status === TableRowStatusEnum.PRINTED && (
                        <>
                          <li>
                            <button
                              onClick={() => {
                                onPrint(file.id);
                                setIsOpen(false);
                              }}
                              className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                              type="button"
                            >
                              Imprimir
                            </button>
                          </li>
                        </>
                      )}
                  </ul>
                </div>
              </div>
            )}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-sm font-bold text-gray-900">
          Professor {teacher.User.name}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Matéria {subject.name}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-sm font-bold text-gray-900">
          Solicitado em{" "}
          {new Intl.DateTimeFormat("pt-BR").format(file.createdAt)}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Aplicação em {new Intl.DateTimeFormat("pt-BR").format(file.dueDate)}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="mt-1 text-sm font-medium text-gray-500">
          Na turma {schoolClass.name}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="mt-1 text-sm font-medium text-gray-900">
          {file.quantity} {file.quantity === 1 ? "Cópia" : "Cópias"}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-500">
          {file.frontAndBack ? "Frente e verso" : "Apenas frente"}
        </p>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-6 py-4 lg:grid-cols-6 lg:gap-0">
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
            <title>Menu</title>
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

      <div className="px-4 sm:px-6 lg:py-4">
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
