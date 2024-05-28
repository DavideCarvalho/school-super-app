"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@acme/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@acme/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import { api } from "~/trpc/react";
import { NewTeacherModalV2 } from "../new-teacher-modal-v2";

const daysOfWeekToPortuguese = {
  Monday: "Segunda-feira",
  Tuesday: "Terça-feira",
  Wednesday: "Quarta-feira",
  Thursday: "Quinta-feira",
  Friday: "Sexta-feira",
};

interface TeachersTableV2Props {
  schoolId: string;
}

export function TeachersTableV2({ schoolId }: TeachersTableV2Props) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams?.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams?.get("limit")
    ? Number(searchParams.get("limit"))
    : 5;
  const teachersQuery = api.teacher.getSchoolTeachers.useQuery({
    schoolId,
    page,
    limit,
  });

  const { mutateAsync: deleteUser } = api.teacher.deleteById.useMutation();

  async function deleteTeacher(teacherId: string) {
    const toastId = toast.loading("Removendo professor...");
    try {
      await deleteUser({ userId: teacherId });
      toast.success("Professor removido com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover professor");
    } finally {
      toast.dismiss(toastId);
      await teachersQuery.refetch();
    }
  }

  async function handleOnClose() {
    setOpen(false);
    await teachersQuery.refetch();
    // await teachersCountQuery.refetch();
  }

  async function onCreated() {
    setOpen(false);
    await teachersQuery.refetch();
    // await teachersCountQuery.refetch();
  }

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.has("page") && searchParams.has("limit")) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", searchParams.get("page") || "1");
    newSearchParams.set("limit", searchParams.get("limit") || "5");
    router.push(`?${newSearchParams.toString()}`);
  }, [searchParams, router.push]);

  return (
    <>
      <NewTeacherModalV2
        schoolId={schoolId}
        onClickSubmit={onCreated}
        open={open}
        onClickCancel={handleOnClose}
        onClose={handleOnClose}
      />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lista de Professores</h2>
        <Button onClick={() => setOpen(true)}>Adicionar Professor</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Professor</TableHead>
            <TableHead>Matérias</TableHead>
            <TableHead>Turmas</TableHead>
            <TableHead>Disponibilidade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachersQuery.data?.map((teacher) => {
            return (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.User.name}</TableCell>
                <TableCell>
                  {teacher.TeacherHasSubject.map(
                    ({ Subject }) => Subject.name,
                  ).join(", ")}
                </TableCell>
                <TableCell>
                  {teacher.TeacherHasClasses.map(
                    ({ Class }) => Class.name,
                  ).join(", ")}
                </TableCell>
                <TableCell>
                  {teacher.TeacherAvailability.map(
                    (availability) =>
                      `${daysOfWeekToPortuguese[availability.day as keyof typeof daysOfWeekToPortuguese]} - ${availability.startTime} - ${availability.endTime}`,
                  ).join(", ")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <UserIcon className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      className="text-red-600 hover:text-red-800"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTeacher(teacher.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Remover</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}

function Trash2Icon(props: React.SVGProps<SVGSVGElement>) {
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
      <title>Remover</title>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <title>Editar</title>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
