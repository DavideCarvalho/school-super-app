import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { TeacherHasClass } from "@acme/db";

import { Dropdown } from "~/components/dropdown";
import { api } from "~/trpc/react";
import { Modal } from "../modal";

const schema = z
  .object({
    classId: z.string({ required_error: "Qual turma?" }),
    teacherId: z.string({ required_error: "Qual professor?" }),
    subjectId: z.string({ required_error: "Qual matéria?" }),
    weekday: z.string({ required_error: "Qual dia da semana?" }),
    hour: z.string({ required_error: "Qual hora?" }),
    minutes: z.string({ required_error: "Qual minuto?" }),
  })
  .required();

interface EditTeacherHasClassModalProps {
  schoolId: string;
  teacherHasClass: TeacherHasClass;
  open: boolean;
  onEdited: () => void;
  onClickCancel: () => void;
}

const weekdaysDictionary: Record<string, string> = {
  "0": "Domingo",
  "1": "Segunda-feira",
  "2": "Terça-feira",
  "3": "Quarta-feira",
  "4": "Quinta-feira",
  "5": "Sexta-feira",
  "6": "Sábado",
};

export function EditTeacherHasClassModal({
  schoolId,
  open,
  onEdited,
  onClickCancel,
  teacherHasClass,
}: EditTeacherHasClassModalProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      teacherId: teacherHasClass?.teacherId,
      subjectId: teacherHasClass?.subjectId,
      classId: teacherHasClass?.classId,
      weekday: teacherHasClass?.classWeekDay,
      hour: teacherHasClass?.classTime.split(":")[0],
      minutes: teacherHasClass?.classTime.split(":")[1],
    },
  });

  useEffect(() => {
    if (!teacherHasClass) {
      reset();
      return;
    }
    setValue("teacherId", teacherHasClass.teacherId);
    setValue("subjectId", teacherHasClass.subjectId);
    setValue("classId", teacherHasClass.classId);
    setValue("weekday", teacherHasClass.classWeekDay);
    setValue("hour", teacherHasClass.classTime.split(":")[0]!);
    setValue("minutes", teacherHasClass.classTime.split(":")[1]!);
  }, [teacherHasClass, setValue, reset]);

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

  const editTeacherHasClassMutation = api.teacherHasClass.update.useMutation();

  const [teachersDropdownSearch, setTeachersDropdownSearch] = useState("");
  const [subjectsDropdownSearch, setSubjectsDropdownSearch] = useState("");
  const [classesDropdownSearch, setClassesDropdownSearch] = useState("");

  const hoursArray = [...Array(24).keys()];
  const minutesArray = [...Array(60).keys()];

  const selectedTeacher = teachersQuery?.data?.find(
    (teacher) => teacher.id === teacherHasClass?.teacherId,
  );

  const selectedSubject = subjectsQuery.data?.find(
    (subject) => subject.id === teacherHasClass?.subjectId,
  );

  const selectedClass = classesQuery.data?.find(
    (classItem) => classItem.id === teacherHasClass?.classId,
  );

  const onSubmit = async (data: z.infer<typeof schema>) => {
    toast.loading("Alterando aula...");
    await editTeacherHasClassMutation.mutateAsync({
      schoolId: schoolId,
      teacherId: data.teacherId,
      classId: data.classId,
      subjectId: data.subjectId,
      classWeekDay: data.weekday,
      classTime: `${data.hour}:${data.minutes}`,
    });
    toast.dismiss();
    toast.success("Aula alterada com sucesso!");
    onEdited();
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClickCancel();
      }}
      title={"Editando aula"}
    >
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
                disabled={true}
                initialSelectedItem={
                  selectedTeacher
                    ? {
                        value: selectedTeacher.id,
                        label: selectedTeacher.name,
                      }
                    : undefined
                }
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
                  if (selectedItem == null)
                    return setError("teacherId", { type: "required" });
                  clearErrors("teacherId");
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
                disabled={true}
                initialSelectedItem={
                  selectedSubject
                    ? {
                        value: selectedSubject.id,
                        label: selectedSubject.name,
                      }
                    : undefined
                }
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
                  if (selectedItem == null)
                    return setError("subjectId", { type: "required" });
                  clearErrors("subjectId");
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
                disabled={true}
                initialSelectedItem={
                  selectedClass
                    ? {
                        value: selectedClass.id,
                        label: selectedClass.name,
                      }
                    : undefined
                }
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
                  if (selectedItem == null)
                    return setError("classId", { type: "required" });
                  clearErrors("classId");
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
                initialSelectedItem={{
                  label: teacherHasClass?.classWeekDay
                    ? weekdaysDictionary[teacherHasClass.classWeekDay]!
                    : "",
                  value: teacherHasClass?.classWeekDay,
                }}
                dropdownItems={Object.keys(weekdaysDictionary).map(
                  (weekdayKey) => ({
                    value: weekdayKey,
                    label: weekdaysDictionary[weekdayKey]!,
                  }),
                )}
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null)
                    return setError("weekday", { type: "required" });
                  clearErrors("weekday");
                  setValue("weekday", selectedItem.value);
                }}
                error={errors.weekday != null}
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
              <Dropdown<string>
                initialSelectedItem={hoursArray
                  .map((hour) => ({
                    value: `${
                      hour < 10 ? `0${hour.toString()}` : hour.toString()
                    }`,
                    label: `${
                      hour < 10 ? `0${hour.toString()}` : hour.toString()
                    }`,
                  }))
                  .find(
                    (_hour) =>
                      _hour.value === teacherHasClass?.classTime.split(":")[0],
                  )}
                dropdownItems={hoursArray.map((hour) => ({
                  value: `${
                    hour < 10 ? `0${hour.toString()}` : hour.toString()
                  }`,
                  label: `${
                    hour < 10 ? `0${hour.toString()}` : hour.toString()
                  }`,
                }))}
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null)
                    return setError("hour", { type: "required" });
                  clearErrors("hour");
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
              <Dropdown<string>
                initialSelectedItem={minutesArray
                  .map((minute) => ({
                    value: `${
                      minute < 10 ? `0${minute.toString()}` : minute.toString()
                    }`,
                    label: `${
                      minute < 10 ? `0${minute.toString()}` : minute.toString()
                    }`,
                  }))
                  .find(
                    (minute) =>
                      minute.value === teacherHasClass?.classTime.split(":")[1],
                  )}
                dropdownItems={minutesArray.map((minute) => ({
                  value: `${
                    minute < 10 ? `0${minute.toString()}` : minute.toString()
                  }`,
                  label: `${
                    minute < 10 ? `0${minute.toString()}` : minute.toString()
                  }`,
                }))}
                onSelectItem={(selectedItem) => {
                  if (selectedItem == null)
                    return setError("minutes", { type: "required" });
                  clearErrors("minutes");
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
            Editar
          </button>
        </div>
      </form>
    </Modal>
  );
}
