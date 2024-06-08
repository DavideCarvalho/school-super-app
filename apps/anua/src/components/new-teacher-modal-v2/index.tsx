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
  availability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  ),
});

interface NewTeacherModalV2Props {
  open: boolean;
  onClickSubmit: () => void;
  onClickCancel: () => void;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function NewTeacherModalV2({
  open,
  onClickCancel,
  onClickSubmit,
}: NewTeacherModalV2Props) {
  const [weekDaysLeft, setWeekDaysLeft] = useState<string[]>(
    JSON.parse(JSON.stringify(daysOfWeek)),
  );
  const { handleSubmit, getValues, watch, setValue, register, reset } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      email: undefined,
      availability: [
        {
          day: undefined,
          startTime: undefined,
          endTime: undefined,
        },
      ],
    },
  });
  const availabilities = watch("availability");

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name?.includes("availability")) return;
      const availabilities = getValues("availability");
      let daysOfWeekLeft: string[] = JSON.parse(JSON.stringify(daysOfWeek));
      for (const availability of availabilities) {
        const dayAlreadyInUse = daysOfWeekLeft.includes(availability.day);
        if (!dayAlreadyInUse) continue;
        daysOfWeekLeft = daysOfWeekLeft.filter(
          (day) => day !== (availability.day as keyof typeof daysOfWeek),
        );
      }
      setWeekDaysLeft(daysOfWeekLeft);
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  const { mutateAsync: createTeacher } =
    api.teacher.createTeacher.useMutation();

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Criando professor...");
    try {
      await createTeacher({
        name: data.name,
        email: data.email,
        availabilities: data.availability,
      });
      toast.success("Professor criado com sucesso!");
      reset();
      await onClickSubmit();
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
                      <Select
                        value={availability.day}
                        onValueChange={(e) =>
                          setValue(`availability.${index}.day`, e)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="Monday"
                            className={cn(
                              ![availability.day, ...weekDaysLeft].includes(
                                "Monday",
                              )
                                ? "hidden"
                                : "",
                            )}
                          >
                            Segunda-feira
                          </SelectItem>
                          <SelectItem
                            value="Tuesday"
                            className={cn(
                              ![availability.day, ...weekDaysLeft].includes(
                                "Tuesday",
                              )
                                ? "hidden"
                                : "",
                            )}
                          >
                            Terça-feira
                          </SelectItem>
                          <SelectItem
                            value="Wednesday"
                            className={cn(
                              ![availability.day, ...weekDaysLeft].includes(
                                "Wednesday",
                              )
                                ? "hidden"
                                : "",
                            )}
                          >
                            Quarta-feira
                          </SelectItem>
                          <SelectItem
                            value="Thursday"
                            className={cn(
                              ![availability.day, ...weekDaysLeft].includes(
                                "Thursday",
                              )
                                ? "hidden"
                                : "",
                            )}
                          >
                            Quinta-feira
                          </SelectItem>
                          <SelectItem
                            value="Friday"
                            className={cn(
                              ![availability.day, ...weekDaysLeft].includes(
                                "Friday",
                              )
                                ? "hidden"
                                : "",
                            )}
                          >
                            Sexta-feira
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Início"
                        type="time"
                        {...register(`availability.${index}.startTime`)}
                      />
                      <Input
                        placeholder="Fim"
                        type="time"
                        {...register(`availability.${index}.endTime`)}
                      />
                      {index > 0 ? (
                        <Button
                          type="button"
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
                  {weekDaysLeft.length ? (
                    <Button
                      type="button"
                      className="flex items-center gap-2"
                      variant="outline"
                      onClick={() => {
                        const nextWeekDayLeft = weekDaysLeft[0];
                        if (!nextWeekDayLeft) return;
                        setValue(`availability.${availabilities.length}`, {
                          day: nextWeekDayLeft,
                          startTime: "07:00",
                          endTime: "12:00",
                        });
                      }}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Adicionar disponibilidade
                    </Button>
                  ) : null}
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
