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

import {
  type Class,
  type Subject,
  type Teacher,
  type TeacherHasClass,
  type User,
} from "@acme/db";

import { api } from "~/utils/api";
import { dayjsClient } from "~/utils/dayjs.client";
import { Dropdown } from "~/components/dropdown";
import { Pagination } from "../pagination";

type TeacherHasClassWithTeacherSubjectAndClass = TeacherHasClass & {
  Teacher: Teacher & { User: User };
  Subject: Subject;
  Class: Class;
};

interface SchoolTeacherHasClassTableProps {
  schoolId: string;
}

export function SchoolTeacherHasClassTable({
  schoolId,
}: SchoolTeacherHasClassTableProps) {
  const router = useRouter();
  const { user } = useUser();

  const [_selectedTeacherHasClass, setSelectedTeacherHasClass] =
    useState<TeacherHasClass>();

  const [_open, setOpen] = useState(false);
  const [_openEditModal, setOpenEditModal] = useState(false);

  const teacherHasClassesQuery = api.teacherHasClass.allBySchoolId.useQuery({
    schoolId,
    limit: router.query.limit ? Number(router.query.limit) : 5,
    page: router.query.page ? Number(router.query.page) : 1,
    teacherSlug: router.query.teacher as string | undefined,
    subjectSlug: router.query.subject as string | undefined,
    classSlug: router.query.class as string | undefined,
    classWeekDay: router.query.weekday as string | undefined,
  });

  const teacherHasClassesCountQuery =
    api.teacherHasClass.countAllBySchoolId.useQuery({
      schoolId,
      teacherSlug: router.query.teacher as string | undefined,
      subjectSlug: router.query.subject as string | undefined,
      classSlug: router.query.class as string | undefined,
      classWeekDay: router.query.weekday as string | undefined,
    });

  const subjectsQuery = api.subject.allBySchoolId.useQuery({
    schoolId,
    limit: 999,
  });

  const classesQuery = api.class.allBySchoolId.useQuery({
    schoolId,
    limit: 999,
  });

  const teachersQuery = api.user.allBySchoolId.useQuery({
    schoolId,
    limit: 999,
    role: "TEACHER",
  });

  const deleteTeacherHasClassMutation =
    api.teacherHasClass.deleteById.useMutation();

  const selectedTeacher =
    router.query.teacher != null && teachersQuery.isSuccess
      ? teachersQuery.data.find(
          (teacher) => teacher.slug === router.query.teacher,
        )
      : undefined;

  const selectedSubject =
    router.query.subject && subjectsQuery.isSuccess
      ? subjectsQuery.data.find(
          (subject) => subject.slug === router.query.subject,
        )
      : undefined;

  const selectedClass =
    router.query.class && classesQuery.isSuccess
      ? classesQuery.data.find((class_) => class_.slug === router.query.class)
      : undefined;

  /*  async function onCreated() {
    setOpen(false);
    await teacherHasClassesQuery.refetch();
    await teacherHasClassesCountQuery.refetch();
  }*/

  async function deleteClass(teacherHasClass: TeacherHasClass) {
    toast.loading("Removendo aula...");
    await deleteTeacherHasClassMutation.mutateAsync({
      subjectId: teacherHasClass.subjectId,
      teacherId: teacherHasClass.teacherId,
      classId: teacherHasClass.classId,
      schoolId,
    });
    toast.dismiss();
    toast.success("Aula removida com sucesso!");
    await teacherHasClassesQuery.refetch();
    await teacherHasClassesCountQuery.refetch();
  }

  function onSelectClassToEdit(teacherHasClass: TeacherHasClass) {
    setOpenEditModal(true);
    setSelectedTeacherHasClass(teacherHasClass);
  }

  /*  async function onEdited() {
    setOpenEditModal(false);
    setSelectedTeacherHasClass(undefined);
    await teacherHasClassesQuery.refetch();
    await teacherHasClassesCountQuery.refetch();
  }*/

  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      {/*      <NewClassModal
        schoolId={schoolId}
        onCreated={async () => await onCreated()}
        open={open}
        onClickCancel={() => setOpen(false)}
      />
      <EditClassModal
        schoolId={schoolId}
        open={openEditModal}
        selectedClass={selectedTeacherHasClass as TeacherHasClass}
        onClickCancel={() => {
          setOpenEditModal(false);
          setSelectedTeacherHasClass(undefined);
        }}
        onEdited={() => onEdited()}
      />*/}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">Aulas</p>
            </div>
            {(user?.publicMetadata?.role === "SCHOOL_WORKER" ||
              user?.publicMetadata?.role === "COORDINATOR") && (
              <button
                type="button"
                onClick={() => {
                  setOpen(true);
                }}
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
                Nova aula
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <Dropdown<string>
            cleanFilter={true}
            initialSelectedItem={
              selectedTeacher != null
                ? {
                    label: selectedTeacher.name,
                    value: selectedTeacher.slug,
                  }
                : undefined
            }
            onChange={(v) => console.log(v)}
            onSelectItem={(selectedItem) => {
              const { teacher: _teacher, ...rest } = router.query;
              void router.replace(
                {
                  query: {
                    ...rest,
                    ...(selectedItem?.value && {
                      teacher: selectedItem.value,
                    }),
                  },
                },
                undefined,
                { shallow: true },
              );
            }}
            dropdownLabel="Professor"
            inputPlaceholder="Nome do professor"
            dropdownPlaceholder="Selecione um professor"
            dropdownItems={
              teachersQuery?.data?.map((t) => ({
                label: t.name,
                value: t.slug,
              })) || []
            }
          />
          <Dropdown<string>
            cleanFilter={true}
            initialSelectedItem={
              selectedClass && {
                label: selectedClass.name,
                value: selectedClass.slug,
              }
            }
            onChange={(v) => console.log(v)}
            onSelectItem={(selectedItem) => {
              const { class: _class, ...rest } = router.query;
              void router.replace(
                {
                  query: {
                    ...rest,
                    ...(selectedItem?.value && {
                      class: selectedItem.value,
                    }),
                  },
                },
                undefined,
                { shallow: true },
              );
            }}
            dropdownLabel="Turma"
            inputPlaceholder="Nome da turma"
            dropdownPlaceholder="Selecione uma turma"
            dropdownItems={
              classesQuery?.data?.map((c) => ({
                label: c.name,
                value: c.slug,
              })) || []
            }
          />
          <Dropdown<string>
            cleanFilter={true}
            initialSelectedItem={
              selectedSubject && {
                label: selectedSubject.name,
                value: selectedSubject.slug,
              }
            }
            onChange={(v) => console.log(v)}
            onSelectItem={(selectedItem) => {
              const { subject: _subject, ...rest } = router.query;
              void router.replace(
                {
                  query: {
                    ...rest,
                    ...(selectedItem?.value && {
                      subject: selectedItem.value,
                    }),
                  },
                },
                undefined,
                { shallow: true },
              );
            }}
            dropdownLabel="Matéria"
            inputPlaceholder="Nome da matéria"
            dropdownPlaceholder="Selecione uma matéria"
            dropdownItems={
              subjectsQuery?.data?.map((s) => ({
                label: s.name,
                value: s.slug,
              })) || []
            }
          />
          <Dropdown<string>
            cleanFilter={true}
            initialSelectedItem={
              router.query.weekday != null
                ? {
                    label: dayjsClient()
                      .isoWeekday(Number(router.query.weekday))
                      .format("dddd"),
                    value: router.query.weekday as string,
                  }
                : undefined
            }
            onChange={(v) => console.log(v)}
            onSelectItem={(selectedItem) => {
              const { weekday: _weekday, ...rest } = router.query;
              void router.replace(
                {
                  query: {
                    ...rest,
                    ...(selectedItem?.value && { weekday: selectedItem.value }),
                  },
                },
                undefined,
                { shallow: true },
              );
            }}
            dropdownLabel="Dia da semana"
            inputPlaceholder="Segunda"
            dropdownPlaceholder="Selecione um dia"
            dropdownItems={[
              { label: "Segunda", value: "1" },
              { label: "Terça", value: "2" },
              { label: "Quarta", value: "3" },
              { label: "Quinta", value: "4" },
              { label: "Sexta", value: "5" },
            ]}
          />
        </div>

        <div className="divide-y divide-gray-200">
          {teacherHasClassesQuery.isLoading && <TableRowSkeleton />}
          {teacherHasClassesQuery.data?.map((teacherHasClass) => {
            return (
              <TableRow
                key={`${teacherHasClass.classId}-${teacherHasClass.subjectId}-${teacherHasClass.teacherId}`}
                teacherHasClass={teacherHasClass}
                onDelete={deleteClass}
                onEdit={(teacherHasClass) =>
                  onSelectClassToEdit(teacherHasClass)
                }
              />
            );
          })}
        </div>

        <div>
          <Pagination
            totalCount={teacherHasClassesCountQuery?.data || 0}
            currentPage={router.query.page ? Number(router.query.page) : 1}
            itemsPerPage={router.query.limit ? Number(router.query.limit) : 5}
            onChangePage={(page) => {
              void router.replace(
                {
                  query: { ...router.query, page },
                },
                undefined,
                { shallow: true },
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface TableRowProps {
  teacherHasClass: TeacherHasClassWithTeacherSubjectAndClass;
  onDelete: (
    teacherHasClass: TeacherHasClassWithTeacherSubjectAndClass,
  ) => void;
  onEdit: (schoolClass: TeacherHasClassWithTeacherSubjectAndClass) => void;
}

function TableRow({ teacherHasClass, onDelete, onEdit }: TableRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps } = useInteractions([click, dismiss]);

  return (
    <div className="grid grid-cols-5 py-4 lg:grid-cols-5 lg:gap-0">
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
                  onClick={() => onDelete(teacherHasClass)}
                >
                  Excluir
                </li>
                <li
                  className="w-full cursor-pointer rounded-md p-2 hover:bg-gray-100"
                  onClick={() => onEdit(teacherHasClass)}
                >
                  Editar
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Professor</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {teacherHasClass.Teacher.User.name}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Turma</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {teacherHasClass.Class.name}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Matéria</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {teacherHasClass.Subject.name}
        </p>
      </div>
      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Dia e hora</p>
        <p className="mt-1 text-lg font-medium text-gray-500">
          {dayjsClient()
            .isoWeekday(Number(teacherHasClass.classWeekDay))
            .format("dddd")}{" "}
          às {teacherHasClass.classTime}
        </p>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-5 py-4 lg:grid-cols-5 lg:gap-0">
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
        <p className="text-lg font-bold text-gray-900">Professor</p>
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Turma</p>
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Matéria</p>
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:py-4">
        <p className="text-lg font-bold text-gray-900">Dia e hora</p>
        <div className="mt-1 animate-pulse text-lg font-medium text-gray-500">
          <div className="h-5 w-24 rounded-md bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
