import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/utils/api";
import { Dropdown } from "~/components/dropdown";
import { Modal } from "../modal";

const schema = z
  .object({
    classId: z.string({ required_error: "Qual classe?" }),
    teacherId: z.string({ required_error: "Qual professor?" }),
    subjectId: z.string({ required_error: "Qual matéria?" }),
    weekday: z.string({ required_error: "Qual dia da semana?" }),
    time: z.string({ required_error: "Qual horário?" }),
    hour: z.string({ required_error: "Qual hora?" }),
    minutes: z.string({ required_error: "Qual minuto?" }),
  })
  .required();

interface NewTeacherHasClassModalProps {
  schoolId: string;
  open: boolean;
  onCreated: () => void;
  onClickCancel: () => void;
}

export function NewTeacherHasClassModal({
  schoolId,
  open,
  onCreated,
  onClickCancel,
}: NewTeacherHasClassModalProps) {
  const {
    handleSubmit,
    resetField,
    reset,
    setValue,
    formState: { errors },
    setError,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const subjectsQuery = api.subject.allBySchoolId.useQuery(
    {
      schoolId,
      limit: 999,
    },
    { keepPreviousData: true },
  );

  const classesQuery = api.class.allBySchoolId.useQuery(
    {
      schoolId,
      limit: 999,
    },
    { keepPreviousData: true },
  );

  const teachersQuery = api.user.allBySchoolId.useQuery(
    {
      schoolId,
      limit: 999,
      role: "TEACHER",
    },
    { keepPreviousData: true },
  );

  const createTeacherHasClassMutation =
    api.teacherHasClass.createBySchoolId.useMutation();

  const [teachersDropdownSearch, setTeachersDropdownSearch] = useState("");
  const [subjectsDropdownSearch, setSubjectsDropdownSearch] = useState("");
  const [classesDropdownSearch, setClassesDropdownSearch] = useState("");

  const hours = [...Array(24).keys()];
  const minutes = [...Array(60).keys()];

  const onSubmit = async (data: z.infer<typeof schema>) => {
    toast.loading("Criando aula...");
    await createTeacherHasClassMutation.mutateAsync({
      schoolId: schoolId,
      teacherId: data.teacherId,
      classId: data.classId,
      subjectId: data.subjectId,
      classWeekDay: data.weekday,
      classTime: data.time,
    });
    toast.dismiss();
    toast.success("Aula criada com sucesso!");
    onCreated();
    reset();
  };

  return (
    <Modal open={open} onClose={onClickCancel} title={"Nova aula"}>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Quem é o professor?
            </label>
            <div className="mt-2">
              <Dropdown<string>
                cleanFilter={false}
                onChange={setTeachersDropdownSearch}
                search={teachersDropdownSearch}
                searchable={true}
                dropdownItems={
                  teachersQuery?.data?.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  })) || []
                }
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null) {
                    resetField("teacherId");
                    setError("teacherId", { type: "required" });
                    return;
                  }
                  setValue("teacherId", selectedItem.value);
                  setTeachersDropdownSearch("");
                }}
                error={errors.teacherId != null}
              />
              {errors.teacherId && (
                <p className="text-red-600">{errors.teacherId.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Qual a matéria?
            </label>
            <div className="mt-2">
              <Dropdown<string>
                cleanFilter={false}
                onChange={setSubjectsDropdownSearch}
                search={subjectsDropdownSearch}
                searchable={true}
                dropdownItems={
                  subjectsQuery?.data?.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  })) || []
                }
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null) {
                    resetField("subjectId");
                    setError("subjectId", { type: "required" });
                    return;
                  }
                  setValue("subjectId", selectedItem.value);
                  setSubjectsDropdownSearch("");
                }}
                error={errors.subjectId != null}
              />
              {errors.subjectId && (
                <p className="text-red-600">{errors.subjectId.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Qual a turma?
            </label>
            <div className="mt-2">
              <Dropdown<string>
                cleanFilter={false}
                onChange={setClassesDropdownSearch}
                search={classesDropdownSearch}
                searchable={true}
                dropdownItems={
                  classesQuery?.data?.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  })) || []
                }
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null) {
                    resetField("classId");
                    setError("classId", { type: "required" });
                    return;
                  }
                  setValue("classId", selectedItem.value);
                  setClassesDropdownSearch("");
                }}
                error={errors.classId != null}
              />
              {errors.classId && (
                <p className="text-red-600">{errors.classId.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Qual o dia?
            </label>
            <div className="mt-2">
              <Dropdown<string>
                dropdownItems={[
                  { value: "0", label: "Domingo" },
                  { value: "1", label: "Segunda-feira" },
                  { value: "2", label: "Terça-feira" },
                  { value: "3", label: "Quarta-feira" },
                  { value: "4", label: "Quinta-feira" },
                  { value: "5", label: "Sexta-feira" },
                  { value: "6", label: "Sábado" },
                ]}
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null) {
                    resetField("weekday");
                    setError("weekday", { type: "required" });
                    return;
                  }
                  setValue("weekday", selectedItem.value);
                }}
                error={errors.classId != null}
              />
              {errors.weekday && (
                <p className="text-red-600">{errors.weekday.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Horas?
            </label>
            <div className="mt-2">
              <Dropdown<number>
                dropdownItems={hours.map((hour) => ({
                  value: hour,
                  label: hour.toString(),
                }))}
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null) {
                    resetField("hour");
                    setError("hour", { type: "required" });
                    return;
                  }
                  setValue("hour", selectedItem.value.toString());
                }}
                error={errors.hour != null}
              />
              {errors.hour && (
                <p className="text-red-600">{errors.hour.message}</p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              E minutos?
            </label>
            <div className="mt-2">
              <Dropdown<number>
                dropdownItems={minutes.map((minute) => ({
                  value: minute,
                  label: minute.toString(),
                }))}
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null) {
                    resetField("minutes");
                    setError("minutes", { type: "required" });
                    return;
                  }
                  setValue("minutes", selectedItem.value.toString());
                }}
                error={errors.minutes != null}
              />
              {errors.minutes && (
                <p className="text-red-600">{errors.minutes.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end space-x-4">
          <button
            onClick={() => onClickCancel()}
            type="reset"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold leading-5 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Criar
          </button>
        </div>
      </form>
    </Modal>
  );
}
