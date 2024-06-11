"use client";

import { useEffect, useState } from "react";
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
});

interface EditWorkerModalV2Props {
  userSlug: string;
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

export function EditWorkerModalV2({
  userSlug,
  open,
  onClickCancel,
  onClickSubmit,
}: EditWorkerModalV2Props) {
  const { handleSubmit, watch, setValue, register, reset } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      email: undefined,
      roleId: undefined,
    },
  });

  const roleId = watch("roleId");

  const { data: user } = api.user.findBySlug.useQuery({
    slug: userSlug,
  });

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("roleId", user.Role.id);
  }, [user, setValue]);

  const { data: roles } = api.role.getAllWorkerRoles.useQuery();

  const { mutateAsync: editWorker } = api.user.editWorker.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!user) return;
    const toastId = toast.loading("Alterando funcionário...");
    try {
      await editWorker({
        userId: user.id,
        name: data.name,
        email: data.email,
        roleId: data.roleId,
      });
      toast.success("Funcionário alterado com sucesso!");
      reset();
      await onClickSubmit();
    } catch (e) {
      toast.error("Erro ao alterar funcionário");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Alterar funcionário</DialogTitle>
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
                      value={roleId}
                      onValueChange={(value) => setValue("roleId", value)}
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

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>icone</title>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>icone</title>
      <path d="M5 12h14" />
    </svg>
  );
}
