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

import { type SchoolYear } from "@acme/db";

import { api } from "~/utils/api";
import { Pagination } from "../pagination";
import { NewSchoolYearRequestModal } from "~/components/new-schoolyear-request-modal";

interface SchoolSchoolYearsTableProps {
  schoolId: string;
  schoolYears: SchoolYear[];
  schoolYearsCount: number;
  page: number;
  limit: number;
}

export function SchoolSchoolYearsTable({
  schoolId,
  schoolYears,
  schoolYearsCount,
  page,
  limit,
}: SchoolSchoolYearsTableProps) {
  const router = useRouter();
  const { user } = useUser();

  const [open, setOpen] = useState(false);
  // const [openEditModal, setOpenEditModal] = useState(false);

  const schoolYearsQuery = api.schoolYear.allBySchoolId.useQuery(
    { schoolId, limit, page },
    { initialData: schoolYears, keepPreviousData: true },
  );

  const schoolYearsCountQuery = api.schoolYear.countAllBySchoolId.useQuery(
    { schoolId },
    { initialData: schoolYearsCount, keepPreviousData: true },
  );

  const deleteTeacherMutation = api.teacher.deleteById.useMutation();

  async function onCreated() {
    setOpen(false);
    await schoolYearsQuery.refetch();
    await schoolYearsCountQuery.refetch();
  }

  function deleteWorker(workerId: string) {
    toast.loading("Removendo professor...");
    deleteTeacherMutation.mutate(
      { userId: workerId },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Professor removido com sucesso!");
          await schoolYearsQuery.refetch();
          await schoolYearsCountQuery.refetch();
        },
      },
    );
  }

  // function onSelectWorkerToEdit(worker: SchoolYear) {
  //   setOpenEditModal(true);
  //   setSelectedWorker(worker);
  // }
  //
  // async function onEdited() {
  //   setOpenEditModal(false);
  //   setSelectedWorker(undefined);
  //   await schoolYearsQuery.refetch();
  //   await schoolYearsCountQuery.refetch();
  // }

  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <NewSchoolYearRequestModal
        schoolId={schoolId}
        onCreated={async () => await onCreated()}
        open={open}
        onClickCancel={() => setOpen(false)}
      />
      {/*<EditWorkerRequestModal*/}
      {/*  schoolId={schoolId}*/}
      {/*  open={openEditModal}*/}
      {/*  selectedWorker={selectedWorker as SchoolYear}*/}
      {/*  onClickCancel={() => {*/}
      {/*    setOpenEditModal(false);*/}
      {/*    setSelectedWorker(undefined);*/}
      {/*  }}*/}
      {/*  onEdited={() => onEdited()}*/}
      {/*/>*/}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">Anos</p>
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
                Novo ano
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {schoolYearsQuery.data?.map((worker) => {
            return (
              <TableRow
                key={worker.id}
                schoolYear={worker}
                onDelete={deleteWorker}
                onEdit={() => console.log('edit')}
              />
            );
          })}
        </div>

        <div>
          <Pagination
            totalCount={schoolYearsCountQuery.data}
            currentPage={page}
            itemsPerPage={limit}
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

interface TableRowProps {
  schoolYear: SchoolYear;
  onDelete: (schoolYearId: string) => void;
  onEdit: (schoolYear: SchoolYear) => void;
}

function TableRow({ schoolYear, onDelete, onEdit }: TableRowProps) {
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
                  onClick={() => onDelete(schoolYear.id)}
                >
                  Excluir
                </li>
                <li
                  className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                  onClick={() => onEdit(schoolYear)}
                >
                  Editar
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-sm font-bold text-gray-900">{schoolYear.name}</p>
      </div>
    </div>
  );
}
