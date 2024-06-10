import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { api } from "~/trpc/react";
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

interface NewWorkerRequestModalProps {
  schoolId: string;
  open: boolean;
  onCreated: () => void | Promise<void>;
  onClickCancel: () => void;
}

export function NewWorkerRequestModal({
  schoolId,
  open,
  onCreated,
  onClickCancel,
}: NewWorkerRequestModalProps) {
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
      name: "",
      email: "",
      roleName: "ADMINISTRATIVE",
    },
  });

  const [dropdownSearch, setDropdownSearch] = useState("");

  const createWorkerMutation = api.user.createWorker.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    toast.loading("Criando usuário...");
    createWorkerMutation.mutate(
      {
        name: data.name,
        email: data.email,
        roleName: data.roleName,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Usuário criado com sucesso!");
          const onCreatedReturn = onCreated();
          const isPromise = onCreatedReturn instanceof Promise;
          if (isPromise) await onCreatedReturn;
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
                  label: "Funcionário",
                  value: "SCHOOL_WORKER",
                }}
                dropdownItems={[
                  { label: "Diretor", value: "DIRECTOR" },
                  { label: "Coordenador", value: "COORDINATOR" },
                  { label: "Professor", value: "TEACHER" },
                  { label: "Funcionário", value: "SCHOOL_WORKER" },
                ]}
                onSelectItem={(selectedItem) => {
                  if (!selectedItem) return resetField("roleName");
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
            Solicitar
          </button>
        </div>
      </form>
    </Modal>
  );
}
