interface CheckBoxProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function CheckBox({ selected, onClick, children }: CheckBoxProps) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden rounded-xl border ${
        selected ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white"
      }`}
    >
      {selected && (
        <div className="absolute top-4 right-4" x-show="selected === 1">
          <svg
            className="h-6 w-6 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="px-4 py-5">{children}</div>
    </div>
  );
}
