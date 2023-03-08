import { useState } from "react";
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

import { Dropdown } from "../dropdown";

export function Table() {
  const [item, setItem] = useState({ label: "", value: "" });
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
                      label: "Negado",
                      value: TableRowStatusEnum.DENIED,
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
                      label: "Pendente",
                      value: TableRowStatusEnum.PENDING,
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
              <TableRow
                status={TableRowStatusEnum.APPROVED}
                file={{ name: "", url: "" }}
              />
              <div className="grid grid-cols-3 gap-y-4 py-4 lg:grid-cols-6 lg:gap-0">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

enum TableRowStatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}

const TableRowStatusDictionary = {
  [TableRowStatusEnum.PENDING]: {
    dotColor: "text-yellow-400",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-900",
    label: "Pendente",
  },
  [TableRowStatusEnum.APPROVED]: {
    dotColor: "text-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-900",
    label: "Aprovado",
  },
  [TableRowStatusEnum.DENIED]: {
    dotColor: "text-red-500",
    bgColor: "bg-red-100",
    textColor: "text-red-900",
    label: "Negado",
  },
};

interface TableRowProps {
  status: TableRowStatusEnum;
  file: {
    name: string;
    url: string;
  };
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
        <p className="text-sm font-bold text-gray-900">Visa card **** 4831</p>
        <p className="mt-1 text-sm font-medium text-gray-500">Card payment</p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-sm font-bold text-gray-900">$182.94</p>
        <p className="mt-1 text-sm font-medium text-gray-500">Jan 17, 2022</p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="mt-1 text-sm font-medium text-gray-500">Amazon</p>
      </div>
    </div>
  );
}
