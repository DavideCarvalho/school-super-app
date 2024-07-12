"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PencilIcon } from "@heroicons/react/24/outline";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { api } from "~/trpc/react";

export function ClassesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = searchParams?.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams?.get("limit")
    ? Number(searchParams.get("limit"))
    : 10;

  const rowList = Array(limit).fill(0);
  const [classes] = api.class.allBySchoolId.useSuspenseQuery({
    page,
    limit,
  });

  const [classesCount] = api.class.countAllBySchoolId.useSuspenseQuery();

  const utils = api.useUtils();

  const { mutateAsync: deleteById } = api.class.deleteById.useMutation();

  async function deleteClass(classId: string) {
    const toastId = toast.loading("Removendo classe...");
    try {
      await deleteById({ classId });
      toast.dismiss(toastId);
      toast.success("Classe removida com sucesso!");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao remover classe");
    } finally {
      toast.dismiss(toastId);
      await Promise.all([
        utils.class.allBySchoolId.invalidate(),
        utils.class.countAllBySchoolId.invalidate(),
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
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowList.map((_row, index) => {
            const clasz = classes ? classes[index] : undefined;
            return (
              <TableRow
                key={clasz?.id ?? `${_row}-${index}-${page}`}
                style={{
                  height: "60px",
                }}
              >
                <TableCell>{clasz?.name ?? "-"}</TableCell>
                <TableCell>
                  {clasz ? (
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Link
                              href={`${pathname}?${searchParams?.toString()}#editar-turma?turma=${clasz.slug}`}
                            >
                              <Button size="sm" variant="ghost">
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
        totalCount={classesCount}
      />
    </>
  );
}
