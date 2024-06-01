import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import type { Class } from "@acme/db";

import { api } from "~/trpc/react";
import { Modal } from "../modal";

const schema = z
  .object({
    name: z
      .string({ required_error: "Qual nome da turma?" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O nome pode ter um máximo de 255 caracteres"),
  })
  .required();

interface EditClassModalProps {
  schoolId: string;
  open: boolean;
  onEdited: () => void;
  onClickCancel: () => void;
  selectedClass: Class;
}

export function EditClassModal({
  schoolId,
  open,
  onEdited,
  onClickCancel,
  selectedClass,
}: EditClassModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: selectedClass?.name,
    },
  });

  useEffect(() => {
    if (!selectedClass) return;
    setValue("name", selectedClass.name);
  }, [selectedClass, setValue]);

  const editClassMutation = api.class.updateById.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!selectedClass) return;
    toast.loading("Alterando turma...");
    editClassMutation.mutate(
      {
        classId: selectedClass.id,
        name: data.name,
      },
      {
        onSuccess() {
          toast.dismiss();
          toast.success("Turma alterado com sucesso!");
          onEdited();
          reset();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClickCancel}
      title={`Editar ${selectedClass?.name}`}
    >
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
