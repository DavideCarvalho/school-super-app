import { useState } from "react";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

import { type Class, type File, type School, type SchoolYear } from "@acme/db";

import { api } from "~/utils/api";
import { Dropdown } from "../dropdown";

interface SchoolFilesTableProps {
  schoolId: string;
  files?: (File & {
    Class: Class & {
      SchoolYear: SchoolYear & {
        School: School;
      };
    };
  })[];
}

export function SchoolFilesTable({ schoolId, files }: SchoolFilesTableProps) {
  const [item, setItem] = useState({ label: "", value: "" });
  const filesQuery = api.file.allBySchoolId.useQuery(
    { schoolId },
    { initialData: files },
  );
  console.log(filesQuery);
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">Arquivos</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="w-full">
                <Dropdown
                  value={item.label}
                  onChange={(v) => setItem((state) => ({ ...state, label: v }))}
                  onSelectItem={(selectedItem) =>
                    setItem(() => ({
                      ...selectedItem,
                      value: selectedItem.value,
                      label: "",
                    }))
                  }
                  dropdownLabel="Status"
                  inputPlaceholder="Aprovação"
                  dropdownPlaceholder="Selecione um status"
                  dropdownItems={[
                    {
                      label: "Aprovado",
                      value: TableRowStatusEnum.APPROVED,
                      icon: (
                        <svg
                          className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-green-500"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      ),
                    },
                    {
                      label: "Revisão",
                      value: TableRowStatusEnum.REVIEW,
                      icon: (
                        <svg
                          className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-red-500"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      ),
                    },
                    {
                      label: "Solicitado",
                      value: TableRowStatusEnum.REQUESTED,
                      icon: (
                        <svg
                          className="-ml-1 mr-1.5 h-2.5 w-2.5 flex-auto grid-cols-2 text-center text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filesQuery.data?.map((file) => {
                const fileStatus =
                  file.status as keyof typeof TableRowStatusEnum;
                const status = TableRowStatusEnum[fileStatus] as
                  | TableRowStatusEnum
                  | undefined;
                if (!status) return null;
                return <TableRow key={file.id} status={status} file={file} />;
              })}
              {/* <TableRow
                status={TableRowStatusEnum.APPROVED}
                file={{ name: "", url: "" }}
              /> */}
              {/* <div className="grid grid-cols-3 gap-y-4 py-4 lg:grid-cols-6 lg:gap-0">
                <div className="col-span-2 px-4 sm:px-6 lg:col-span-1 lg:py-4">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-900">
                    <svg
                      className="-ml-1 mr-1.5 h-2.5 w-2.5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Impresso
                  </span>
                </div>

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

                <div className="px-4 sm:px-6 lg:col-span-2 lg:py-4">
                  <p className="text-sm font-bold text-gray-900">
                    Mastercard **** 6442
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Card payment
                  </p>
                </div>

                <div className="px-4 sm:px-6 lg:py-4">
                  <p className="text-sm font-bold text-gray-900">$99.00</p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Jan 17, 2022
                  </p>
                </div>

                <div className="px-4 sm:px-6 lg:py-4">
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Facebook
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-4 py-4 lg:grid-cols-6 lg:gap-0">
                <div className="col-span-2 px-4 sm:px-6 lg:col-span-1 lg:py-4">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-900">
                    <svg
                      className="-ml-1 mr-1.5 h-2.5 w-2.5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Pendente
                  </span>
                </div>

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

                <div className="px-4 sm:px-6 lg:col-span-2 lg:py-4">
                  <p className="text-sm font-bold text-gray-900">
                    Account ****882
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Bank payment
                  </p>
                </div>

                <div className="px-4 sm:px-6 lg:py-4">
                  <p className="text-sm font-bold text-gray-900">$249.94</p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Jan 17, 2022
                  </p>
                </div>

                <div className="px-4 sm:px-6 lg:py-4">
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Netflix
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-4 py-4 lg:grid-cols-6 lg:gap-0">
                <div className="col-span-2 px-4 sm:px-6 lg:col-span-1 lg:py-4">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-900">
                    <svg
                      className="-ml-1 mr-1.5 h-2.5 w-2.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Negado
                  </span>
                </div>

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

                <div className="px-4 sm:px-6 lg:col-span-2 lg:py-4">
                  <p className="text-sm font-bold text-gray-900">
                    Amex card **** 5666
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Card payment
                  </p>
                </div>

                <div className="px-4 sm:px-6 lg:py-4">
                  <p className="text-sm font-bold text-gray-900">$199.24</p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Jan 17, 2022
                  </p>
                </div>

                <div className="px-4 sm:px-6 lg:py-4">
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Amazon Prime
                  </p>
                </div>
              </div> */}
            </div>
          </div>
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
  [TableRowStatusEnum.REVIEW]: {
    dotColor: "text-yellow-400",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-900",
    label: "Revisar",
  },
};

interface TableRowProps {
  status: TableRowStatusEnum;
  file: any;
}

function TableRow({ status, file }: TableRowProps) {
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
    <div className="grid grid-cols-3 gap-y-4 py-4 lg:grid-cols-6 lg:gap-0">
      <div className="col-span-2 px-4 sm:px-6 lg:col-span-1 lg:py-4">
        <span
          className={`inline-flex items-center rounded-full ${bgColor} px-2.5 py-1 text-xs font-medium ${textColor}`}
        >
          <svg
            className={`-ml-1 mr-1.5 h-2.5 w-2.5 ${dotColor}`}
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="3" />
          </svg>
          {label}
        </span>
      </div>

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
                <li className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100">
                  Aprovar
                </li>
                <li className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100">
                  Rejeitar
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:col-span-2 lg:py-4">
        <p className="text-sm font-bold text-gray-900">Claudia Santos</p>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Lingua Portuguesa
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-sm font-bold text-gray-900">20/02/2023</p>
        <p className="mt-1 text-sm font-medium text-gray-500">01/10/2023</p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="mt-1 text-sm font-medium text-gray-500">6 ano</p>
        <p className="mt-1 text-sm font-medium text-gray-500">Turma B</p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="mt-1 text-sm font-medium text-gray-500">20 Cópias</p>
        <p className="mt-1 text-sm font-medium text-gray-500">Frente e verso</p>
      </div>
    </div>
  );
}
