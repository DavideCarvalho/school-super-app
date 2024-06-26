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

interface EditSubjectModalProps {
  subjectSlug: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function EditSubjectModal({
  subjectSlug,
  open,
  onClickCancel,
  onClickSubmit,
}: EditSubjectModalProps) {
  const { data: subject, isLoading: subjectLoading } =
    api.subject.findBySlug.useQuery(
      {
        slug: subjectSlug,
      },
      {
        enabled: subjectSlug != null,
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

  const { mutateAsync: editSubject } = api.subject.updateById.useMutation();

  useEffect(() => {
    if (!subject) return;
    setValue("name", subject.name);
  }, [subject, setValue]);

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!subject) return;
    const toastId = toast.loading("Alterando matéria...");
    try {
      await editSubject({
        subjectId: subject.id,
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
                  readOnly={subjectLoading}
                  className={cn(subjectLoading ? "col-span-11" : "col-span-12")}
                />
                <Oval
                  visible={subjectLoading}
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
