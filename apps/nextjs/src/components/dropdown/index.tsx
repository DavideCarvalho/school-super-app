import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelectItem: (value: { label: string; value: string }) => void;
  dropdownLabel: string;
  inputPlaceholder?: string;
  dropdownPlaceholder?: string;
  dropdownItems: { label: string; value: string; icon?: JSX.Element }[];
}

export function Dropdown({
  value,
  onChange,
  onSelectItem,
  inputPlaceholder,
  dropdownPlaceholder,
  dropdownItems,
  dropdownLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [searchedValues, setSearchedValues] = useState(dropdownItems);
  const [selectedItem, setSelectedItem] = useState<{
    label: string;
    value: string;
    icon?: JSX.Element;
  }>();

  useEffect(() => {
    if (value) {
      const filteredItems = dropdownItems.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase()),
      );
      setSearchedValues(filteredItems);
    } else {
      setSearchedValues(dropdownItems);
    }
  }, [value, dropdownItems, setSearchedValues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as any)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [setOpen]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xs">
        <div
          ref={ref}
          className="relative w-full"
          onBlur={() => setOpen(false)}
        >
          <label className="block w-full text-sm font-bold text-gray-900">
            {dropdownLabel}
          </label>
          <div className="mt-2 w-full">
            <div
              onClick={() => setOpen(!open)}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 py-3 px-4 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start space-x-2">
                  <div className="flex-2">
                    {selectedItem && (
                      <div key={value} className="flex w-full cursor-pointer">
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
            <div className="relative -bottom-2 z-10 w-full">
              <div className="absolute block w-full space-y-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow">
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    name=""
                    id=""
                    placeholder={inputPlaceholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-2 pl-8 pr-2 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <ul className="flex flex-col">
                  <div
                    key={value}
                    className="flex w-full cursor-pointer hover:bg-gray-100"
                  >
                    <li
                      onClick={() => {
                        onSelectItem({ label: "", value: "" });
                        setSelectedItem(undefined);
                      }}
                      className="rounded-md p-2"
                    >
                      Tirar filtro
                    </li>
                  </div>
                  {searchedValues.map(({ label, value, icon }) => (
                    <div
                      key={value}
                      className="flex w-full cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex flex-col">{icon && icon}</div>
                      <li
                        onClick={() => {
                          onSelectItem({ label, value });
                          setSelectedItem({ label, value, icon });
                        }}
                        className="rounded-md p-2"
                      >
                        {label}
                      </li>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
