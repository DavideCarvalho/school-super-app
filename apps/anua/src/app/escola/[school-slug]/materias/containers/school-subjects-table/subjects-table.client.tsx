"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@acme/ui/button";
import { PaginationV2 } from "@acme/ui/pagination-v2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import { api } from "~/trpc/react";

export function SubjectsTableClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = searchParams?.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams?.get("limit")
    ? Number(searchParams.get("limit"))
    : 10;

  const rowList = Array(limit).fill(0);
  const [subjects] = api.subject.allBySchoolId.useSuspenseQuery({
    page,
    limit,
  });

  const [subjectsCount] = api.subject.countAllBySchoolId.useSuspenseQuery();

  const utils = api.useUtils();

  const { mutateAsync: deleteById } = api.subject.deleteById.useMutation();

  async function deleteSubject(subjectId: string) {
    const toastId = toast.loading("Removendo matéria...");
    try {
      await deleteById({ subjectId });
      toast.success("Matéria removido com sucesso!");
    } catch (e) {
      toast.error("Erro ao remover matéria");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.subject.allBySchoolId.invalidate(),
        utils.subject.countAllBySchoolId.invalidate(),
      ]);
    }
  }

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.has("page") && searchParams.has("limit")) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", searchParams.get("page") || "1");
    newSearchParams.set("limit", searchParams.get("limit") || "10");
    router.push(`?${newSearchParams.toString()}`);
  }, [searchParams, router.push]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Matéria</TableHead>
            <TableHead>Professores</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowList.map((_row, index) => {
            const subject = subjects ? subjects[index] : undefined;
            return (
              <TableRow
                key={subject?.id ?? `${_row}-${index}-${page}`}
                style={{
                  height: "60px",
                }}
              >
                <TableCell>{subject?.name ?? "-"}</TableCell>
                <TableCell>
                  {subject?.TeacherHasClass?.map(
                    ({ Teacher }) => Teacher.User.name,
                  )?.join(", ") ?? "-"}
                </TableCell>
                <TableCell>
                  {subject ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`${pathname}?${searchParams?.toString()}#editar-materia?materia=${subject.slug}`}
                      >
                        <Button size="sm" variant="ghost">
                          <UserIcon className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Button
                        className="text-red-600 hover:text-red-800"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSubject(subject.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <PaginationV2
        currentPage={page}
        itemsPerPage={limit}
        totalCount={subjectsCount}
      />
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
