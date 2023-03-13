import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import Calendar from "../calendar";
import { CheckBox } from "../checkbox";
import { Dropdown } from "../dropdown";
import { Modal } from "../modal";

const schema = z
  .object({
    name: z
      .string({ required_error: "Nome do arquivo é obrigatório" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O nome pode ter um máximo de 255 caracteres"),
    fileUrl: z
      .string({ required_error: "link para o arquivo" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(100, "O nome pode ter um máximo de 255 caracteres")
      .url("Precisa ser um link"),
    quantity: z.coerce
      .number({
        required_error: "Quantidade é obrigatória",
        invalid_type_error: "Apenas números são aceitos",
      })
      .min(1, "Quantidade mínima é 1"),
    classId: z.string({ required_error: "Selecione uma turma" }),
    frontAndBack: z.boolean().default(true),
    dueDate: z.date().default(new Date()),
  })
  .required();

interface NewFileRequestModalProps {
  open: boolean;
  onClickCancel: () => void;
}

export function NewFileRequestModal({
  open,
  onClickCancel,
}: NewFileRequestModalProps) {
  const { user } = useUser();
  //minDate precisa ser declarado antes do dueDate
  //porque senão, o dueDate será uma data + hora antes
  // do minDate, ai o flatpickr não deixa o valor inicial
  const now = dayjs();
  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fileUrl: "",
      quantity: 1,
      frontAndBack: true,
      dueDate: now.toDate(),
    },
  });

  const { mutate } = api.file.createRequest.useMutation();

  const teacherClasses = api.teacher.getClassesById.useQuery({
    id: user?.publicMetadata?.id as string,
  });

  teacherClasses.data?.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const onSubmit = (data: z.infer<typeof schema>) => console.log(data);

  const watchFrontAndBack = watch("frontAndBack", true);
  const watchDueDate = watch("dueDate", new Date());

  return (
    <Modal open={open} onClose={onClickCancel} title={"Nova solicitação"}>
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

          <div>
            <label className="text-sm font-bold text-gray-900">
              URL do arquivo
            </label>
            <div className="mt-2">
              <input
                {...register("fileUrl")}
                type="text"
                placeholder="https://docs.google.com/..."
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.fileUrl ? "border-red-400" : "border-grey-300"
                }`}
              />
              {errors.fileUrl && (
                <p className="text-red-600">{errors.fileUrl.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Quantidade
            </label>
            <div className="mt-2">
              <input
                {...register("quantity")}
                type="text"
                inputMode="numeric"
                className={`block w-full rounded-lg border  px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-indigo-600 sm:text-sm ${
                  errors.quantity ? "border-red-400" : "border-grey-300"
                }`}
              />
              {errors.quantity && (
                <p className="text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Data de aplicação
            </label>
            <div className="mt-2">
              <Calendar
                value={watchDueDate}
                minDate={now.subtract(1, "hour").toDate()}
                onChange={(date) => setValue("dueDate", date)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-gray-900"
            >
              Pra qual turma?
            </label>
            <div className="mt-2">
              <Dropdown<string>
                searchable={false}
                dropdownItems={
                  teacherClasses.data?.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  })) || []
                }
                onChange={() => {}}
                onSelectItem={(selectedItem) => {
                  if (!selectedItem) return resetField("classId");
                  setValue("classId", selectedItem.value);
                }}
                error={errors.classId != null}
              />
              {errors.classId && (
                <p className="text-red-600">{errors.classId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="frontAndBack"
              className="text-sm font-bold text-gray-900"
            >
              Imprimir
            </label>
            <div className="mt-2">
              <CheckBox
                selected={watchFrontAndBack === true}
                onClick={() => setValue("frontAndBack", true)}
              >
                <div className="flex items-start">
                  <div className="ml-4">
                    <p className="text-sm font-bold text-gray-900">
                      Frente e verso
                    </p>
                  </div>
                </div>
              </CheckBox>
              <div className="p-1" />
              <CheckBox
                selected={watchFrontAndBack === false}
                onClick={() => setValue("frontAndBack", false)}
              >
                <div className="flex items-start">
                  <div className="ml-4">
                    <p className="text-sm font-bold text-gray-900">
                      Apenas frente
                    </p>
                  </div>
                </div>
              </CheckBox>
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
