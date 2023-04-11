import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { type Role, type User } from "@acme/db";

import { api } from "~/utils/api";
import { Dropdown } from "../dropdown";
import { Modal } from "../modal";

const schema = z
  .object({
    name: z
      .string({ required_error: "Nome do arquivo é obrigatório" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O nome pode ter um máximo de 255 caracteres"),
    email: z
      .string({ required_error: "E-mail é obrigatório" })
      .email("Precisa ser um e-mail válido"),
    roleName: z.union(
      [
        z.literal("DIRECTOR"),
        z.literal("COORDINATOR"),
        z.literal("TEACHER"),
        z.literal("SCHOOL_WORKER"),
      ],
      { required_error: "Cargo é obrigatório" },
    ),
  })
  .required();

interface EditWorkerModalProps {
  schoolId: string;
  open: boolean;
  onEdited: () => void | Promise<void>;
  onClickCancel: () => void;
  selectedWorker: (User & { Role: Role }) | undefined;
}

const tableRowRoleDictionary = {
  SCHOOL_WORKER: "Funcionário(a)",
  TEACHER: "Professor(a)",
  COORDINATOR: "Coordenador(a)",
  DIRECTOR: "Diretor(a)",
};

export function EditWorkerModal({
  schoolId,
  open,
  onEdited,
  onClickCancel,
  selectedWorker,
}: EditWorkerModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: selectedWorker?.name,
      email: selectedWorker?.email,
      roleName: selectedWorker?.Role?.name as
        | "DIRECTOR"
        | "COORDINATOR"
        | "TEACHER"
        | "SCHOOL_WORKER",
    },
  });

  useEffect(() => {
    if (!selectedWorker) return;
    setValue("name", selectedWorker.name);
    setValue("email", selectedWorker.email);
    setValue(
      "roleName",
      selectedWorker.Role.name as
        | "DIRECTOR"
        | "COORDINATOR"
        | "TEACHER"
        | "SCHOOL_WORKER",
    );
  }, [selectedWorker, setValue]);

  const [dropdownSearch, setDropdownSearch] = useState("");

  const editWorkerMutation = api.user.editWorker.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!selectedWorker) return;
    toast.loading("Alterando usuário...");
    editWorkerMutation.mutate(
      {
        userId: selectedWorker.id,
        name: data.name,
        email: data.email,
        schoolId,
        roleName: data.roleName,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Usuário alterado com sucesso!");
          const onEditedReturn = onEdited();
          const isPromise = onEditedReturn instanceof Promise;
          if (isPromise) await onEditedReturn;
          reset();
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClickCancel} title={"Novo funcionário"}>
      <form className="mt-6" onSubmit={void handleSubmit(onSubmit)}>
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

          <div>
            <label className="text-sm font-bold text-gray-900">E-mail</label>
            <div className="mt-2">
              <input
                {...register("email")}
                type="text"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.email ? "border-red-400" : "border-grey-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              E o cargo?
            </label>
            <div className="mt-2">
              <Dropdown<
                "DIRECTOR" | "COORDINATOR" | "TEACHER" | "SCHOOL_WORKER"
              >
                cleanFilter={false}
                search={dropdownSearch}
                searchable={false}
                initialSelectedItem={{
                  label:
                    tableRowRoleDictionary[
                      selectedWorker?.Role.name as
                        | "DIRECTOR"
                        | "COORDINATOR"
                        | "TEACHER"
                        | "SCHOOL_WORKER"
                    ],
                  value: selectedWorker?.Role.name as
                    | "DIRECTOR"
                    | "COORDINATOR"
                    | "TEACHER"
                    | "SCHOOL_WORKER",
                }}
                dropdownItems={[
                  { label: "Diretor(a)", value: "DIRECTOR" },
                  { label: "Coordenador(a)", value: "COORDINATOR" },
                  { label: "Professor(a)", value: "TEACHER" },
                  { label: "Funcionário(a)", value: "SCHOOL_WORKER" },
                ]}
                onSelectItem={(selectedItem) => {
                  if (!selectedItem) {
                    return resetField("roleName");
                  }
                  setValue("roleName", selectedItem.value);
                  setDropdownSearch("");
                }}
                error={errors.roleName != null}
              />
              {errors.roleName && (
                <p className="text-red-600">{errors.roleName.message}</p>
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
