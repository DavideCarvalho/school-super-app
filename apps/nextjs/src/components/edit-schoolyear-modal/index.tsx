import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { SchoolYear } from "@acme/db";

import { api } from "~/utils/api";
import { Modal } from "../modal";

const schema = z
  .object({
    name: z
      .string({ required_error: "Nome do arquivo é obrigatório" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O nome pode ter um máximo de 255 caracteres")
  })
  .required();

interface EditSchoolYearModalProps {
  schoolId: string;
  open: boolean;
  onEdited: () => void | Promise<void>;
  onClickCancel: () => void;
  selectedSchoolYear: SchoolYear;
}

export function EditSchoolYearModal({
                                      schoolId,
                                      open,
                                      onEdited,
                                      onClickCancel,
                                      selectedSchoolYear
                                    }: EditSchoolYearModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: selectedSchoolYear?.name
    }
  });

  useEffect(() => {
    if (!selectedSchoolYear) return;
    setValue("name", selectedSchoolYear.name);
  }, [selectedSchoolYear, setValue]);

  const editSchoolYearMutation = api.schoolYear.updateById.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!selectedSchoolYear) return;
    toast.loading("Alterando ano...");
    editSchoolYearMutation.mutate(
      {
        schoolId,
        schoolYearId: selectedSchoolYear.id,
        name: data.name
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Ano alterado com sucesso!");
          const onEditedReturn = onEdited();
          const isPromise = onEditedReturn instanceof Promise;
          if (isPromise) await onEditedReturn;
          reset();
        }
      }
    );
  };

  return (
    <Modal open={open} onClose={onClickCancel} title={`Editar ${selectedSchoolYear?.name}`}>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">Nome</label>
            <div className="mt-2">
              <input
                {...register("name")}
                type="text"
                inputMode="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.name ? "border-red-400" : "border-grey-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-600">{errors.name.message}</p>
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
            Alterar
          </button>
        </div>
      </form>
    </Modal>
  );
}
