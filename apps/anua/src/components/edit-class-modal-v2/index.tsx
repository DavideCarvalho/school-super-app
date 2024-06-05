import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string(),
});

interface EditClassModalV2Props {
  classSlug: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function EditClassModalV2({
  classSlug,
  open,
  onClickCancel,
  onClickSubmit,
}: EditClassModalV2Props) {
  const { data: clasz, isLoading: classLoading } =
    api.class.findBySlug.useQuery(
      {
        slug: classSlug,
      },
      {
        enabled: classSlug != null,
      },
    );
  const { handleSubmit, setValue, register, reset } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Carregando...",
    },
  });

  const { mutateAsync: editClass } = api.class.updateById.useMutation();

  useEffect(() => {
    if (!clasz) return;
    setValue("name", clasz.name);
  }, [clasz, setValue]);

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!clasz) return;
    const toastId = toast.loading("Alterando matéria...");
    try {
      await editClass({
        classId: clasz.id,
        name: data.name,
      });
      toast.dismiss(toastId);
      toast.success("Matéria alterado com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao alterar matéria");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Alterando matéria</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da matéria</Label>
              <div className="grid grid-cols-12 gap-2">
                <Input
                  placeholder="Digite o nome da matéria"
                  {...register("name")}
                  readOnly={classLoading}
                  className={cn(classLoading ? "col-span-11" : "col-span-12")}
                />
                <Oval
                  visible={classLoading}
                  height="30"
                  width="30"
                  color="hsl(262.1 83.3% 57.8%)"
                  secondaryColor="hsl(262.1deg 83.3% 57.8% / 90%)"
                  ariaLabel="oval-loading"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClickCancel()}
              >
                Cancelar
              </Button>
            </div>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
