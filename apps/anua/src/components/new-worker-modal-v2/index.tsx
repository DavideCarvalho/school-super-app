"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  roleId: z.string(),
  role: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

interface NewWorkerModalV2Props {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function NewWorkerModalV2({
  open,
  onClickCancel,
  onClickSubmit,
}: NewWorkerModalV2Props) {
  const { handleSubmit, watch, setValue, register, reset } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      email: undefined,
      role: {
        id: undefined,
        name: undefined,
      },
    },
  });

  const role = watch("role");

  const { data: roles } = api.role.getAllWorkerRoles.useQuery();

  const { mutateAsync: createWorker } = api.user.createWorker.useMutation();
  const { mutateAsync: createTeacher } =
    api.teacher.createTeacher.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando funcionário...");
    try {
      if (data.role.name === "TEACHER") {
        await createTeacher({
          name: data.name,
          email: data.email,
          availabilities: [],
        });
      } else {
        await createWorker({
          name: data.name,
          email: data.email,
          roleId: data.role.id,
        });
      }
      toast.success("Funcionário criado com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.error("Erro ao criar funcionário");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Criar novo funcionário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do funcionário</Label>
              <Input
                placeholder="Digite o nome do funcionário"
                {...register("name")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email do funcionário</Label>
              <Input
                placeholder="Digite o email do professor"
                {...register("email")}
              />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Cargos</Label>
                <div className="grid gap-4">
                  <div className={cn("grid")}>
                    <Select
                      value={role.id}
                      onValueChange={(value) => {
                        if (!roles) return;
                        setValue("role", {
                          id: value,
                          name: roles.find((r) => r.id === value)?.label ?? "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClickCancel()}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
