import { useEffect, useState } from "react";
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

export interface DropdownItem<Value> {
  label: string;
  value: Value;
  icon?: React.JSX.Element | undefined;
}

interface DropdownProps<Item> {
  search?: string;
  initialSelectedItem?: DropdownItem<Item>;
  searchable?: boolean;
  onChange?: (value: string) => void;
  onSelectItem: (value: DropdownItem<Item> | null) => void;
  dropdownLabel?: string;
  inputPlaceholder?: string;
  dropdownPlaceholder?: string;
  dropdownItems: DropdownItem<Item>[];
  error?: boolean;
  cleanFilter?: boolean;
  disabled?: boolean;
}

export function Dropdown<Item>({
  search,
  initialSelectedItem,
  searchable,
  onChange,
  onSelectItem,
  inputPlaceholder,
  cleanFilter,
  dropdownPlaceholder,
  dropdownItems,
  dropdownLabel,
  error,
  disabled,
}: DropdownProps<Item>) {
  const [open, setOpen] = useState(false);
  const [searchedValues, setSearchedValues] = useState(dropdownItems);
  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  useEffect(() => {
    if (search) {
      const filteredItems = dropdownItems.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
      setSearchedValues(filteredItems);
    } else {
      setSearchedValues(dropdownItems);
    }
  }, [search, dropdownItems]);

  const { x, y, strategy, refs, context } = useFloating({
    open,
    placement: "bottom-end",
    onOpenChange: disabled ? () => void {} : setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      size({
        apply({ availableWidth, availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
            overflow: "auto",
          });
        },
      }),
      flip({
        fallbackStrategy: "initialPlacement",
      }),
      offset(10),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps } = useInteractions([click, dismiss]);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900">
        {dropdownLabel}
      </label>
      <div
        className="mt-2 w-full"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div
          className={`block w-full rounded-lg border ${
            error ? "border-red-400" : "border-grey-300"
          } px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
            disabled ? "bg-gray-200" : "cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start space-x-2">
              <div className="flex-2">
                {selectedItem && (
                  <div className="flex w-full cursor-pointer">
                    <div className="flex flex-col">
                      {selectedItem.icon && selectedItem.icon}
                    </div>
                    {selectedItem.label}
                  </div>
                )}
                {!selectedItem && <span>{dropdownPlaceholder}</span>}
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${open ? "rotate-180 transform" : ""}}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>Icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {open && (
        <FloatingPortal>
          <div
            className="z-10 w-full"
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
          >
            <div className="w-full space-y-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow">
              {searchable && (
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder={inputPlaceholder}
                    value={search}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-2 pl-8 pr-2 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              )}
              <ul className="flex flex-col">
                {cleanFilter && (
                  <div className="flex w-full cursor-pointer hover:bg-gray-100">
                    <button
                      type="button"
                      className="rounded-md p-2"
                      onClick={() => {
                        onSelectItem(null);
                        setSelectedItem(undefined);
                        setOpen(false);
                      }}
                    >
                      Tirar filtro
                    </button>
                  </div>
                )}
                {searchedValues.map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className={`flex w-full cursor-pointer hover:bg-gray-100 ${
                      value === selectedItem?.value && "bg-gray-200"
                    }`}
                    onClick={() => {
                      onSelectItem({
                        label,
                        value,
                        icon,
                      });
                      setSelectedItem({ label, value, icon });
                      setOpen(false);
                    }}
                    onKeyDown={() => {}}
                  >
                    {icon && <div className="flex flex-col">{icon}</div>}
                    <li className="rounded-md p-2">{label}</li>
                  </div>
                ))}
              </ul>
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
