import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import Calendar from "../calendar";
import { CheckBox } from "../checkbox";
import { Modal } from "../modal";
import { FrontAndBack } from "../svgs/front-and-back";

const schema = z
  .object({
    fileUrl: z.string(),
    quantity: z.number().positive(),
    frontAndBack: z.boolean(),
    dueDate: z.date(),
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
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fileUrl: "",
      quantity: 1,
      frontAndBack: true,
    },
  });
  const onSubmit = (data: z.infer<typeof schema>) => console.log(data);

  const watchFrontAndBack = watch("frontAndBack");

  return (
    <Modal open={open} onClose={onClickCancel} title={"Nova solicitação"}>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900">
              URL do arquivo
            </label>
            <div className="mt-2">
              <input
                {...register("fileUrl")}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="https://docs.google.com/..."
                className="-gray-300 block w-full rounded-lg border px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              />
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
                pattern="[0-9]*"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-500 caret-indigo-600 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              />
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
              <Calendar />
            </div>
          </div>

          <div>
            <label
              htmlFor="frontAndBack"
              className="text-sm font-bold text-gray-900"
            >
              Frente e verso
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
