import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ value, onChange, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xs">
          <div
            ref={ref}
            className="relative"
            onBlur={() => {
              console.log("blur");
              setOpen(false);
            }}
          >
            <label className="block text-sm font-bold text-gray-900">
              Country
            </label>
            <div className="mt-2">
              <div
                onClick={() => setOpen(!open)}
                className="block w-full cursor-pointer rounded-lg border border-gray-300 py-3 px-4 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-start space-x-2">
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
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <span>Select a country</span>
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
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="bordr block w-full rounded-lg border-gray-300 py-2 pl-8 pr-2 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                    />
                  </div>
                  <ul className="flex flex-col">
                    <li className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100">
                      🇺🇸 United States of America
                    </li>
                    <li className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100">
                      🇳🇱 Netherlands
                    </li>
                    <li className="w-full cursor-pointer rounded-md bg-gray-100 p-2 hover:bg-gray-100">
                      🇳🇿 New Zealand
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
