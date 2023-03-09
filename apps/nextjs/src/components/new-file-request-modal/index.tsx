import { Modal } from "../modal";

interface NewFileRequestModalProps {
  open: boolean;
  onClickCancel: () => void;
}

export function NewFileRequestModal({
  open,
  onClickCancel,
}: NewFileRequestModalProps) {
  return (
    <Modal open={open} onClose={onClickCancel} title={"Nova solicitação"}>
      <form action="#" method="POST" className="mt-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">Name</label>
            <div className="mt-2">
              <input
                type="text"
                name=""
                id=""
                placeholder="John Doe"
                value=""
                className="-gray-300 block w-full rounded-lg border px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">Email</label>
            <div className="mt-2">
              <input
                type="text"
                name=""
                id=""
                placeholder="email@example.com"
                value=""
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900">User Role</label>
            <div className="mt-2">
              <select className="block w-full rounded-lg border border-gray-300 py-3 pl-4 pr-10 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm">
                <option>Editor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end space-x-4">
          <button
            onClick={() => onClickCancel()}
            type="reset"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold leading-5 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
