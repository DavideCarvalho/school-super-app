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
  availability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  ),
});

interface NewTeacherModalV2Props {
  schoolId: string;
  onClickSubmit: () => void;
  onClose: () => void;
  open: boolean;
  onClickCancel: (open: boolean) => void;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function NewTeacherModalV2({
  schoolId,
  open,
  onClickCancel,
  onClose,
}: NewTeacherModalV2Props) {
  const { handleSubmit, getValues, watch, setValue, formState, register } =
    useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        name: "",
        email: "",
        availability: [
          {
            day: "Monday",
            startTime: "07:00",
            endTime: "12:30",
          },
        ],
      },
    });
  const availabilities = watch("availability");

  const { mutateAsync: createTeacher } =
    api.teacher.createTeacher.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando professor...");
    try {
      await createTeacher({
        name: data.name,
        email: data.email,
        schoolId: schoolId,
        availabilities: data.availability,
      });
      toast.success("Professor criado com sucesso!");
      await onClose();
    } catch (e) {
      toast.error("Erro ao criar professor");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClickCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Criar novo professor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Professor</Label>
              <Input
                placeholder="Digite o nome do professor"
                {...register("name")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email do Professor</Label>
              <Input
                placeholder="Digite o email do professor"
                {...register("email")}
              />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Disponibilidade</Label>
                <div className="grid gap-4">
                  {availabilities.map((availability, index) => (
                    <div
                      key={`${availability.day}-${availability.startTime}-${availability.endTime}-${index}`}
                      className={cn(
                        "grid",
                        index > 0
                          ? "gap-4 sm:grid-cols-4"
                          : "gap-3 sm:grid-cols-3",
                      )}
                    >
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Segunda-feira</SelectItem>
                          <SelectItem value="Tuesday">Terça-feira</SelectItem>
                          <SelectItem value="Wednesday">
                            Quarta-feira
                          </SelectItem>
                          <SelectItem value="Thursday">Quinta-feira</SelectItem>
                          <SelectItem value="Friday">Sexta-feira</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Início" type="time" />
                      <Input placeholder="Fim" type="time" />
                      {index > 0 ? (
                        <Button
                          className="flex items-center justify-center"
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            const availabilities = getValues("availability");
                            availabilities.splice(index, 1);
                            setValue("availability", availabilities);
                          }}
                        >
                          <MinusIcon className="h-4 w-4" />
                          <span className="sr-only">
                            Remover disponibilidade
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    className="flex items-center gap-2"
                    variant="outline"
                    onClick={() => {
                      setValue(`availability.${availabilities.length}`, {
                        day:
                          daysOfWeek[availabilities.length] ??
                          (daysOfWeek[0] as string),
                        startTime: "",
                        endTime: "",
                      });
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Adicionar disponibilidade
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div>
              <Button variant="outline" onClick={() => onClickCancel(false)}>
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