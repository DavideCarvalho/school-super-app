"use client";

import { useEffect } from "react";
import { revalidatePath } from "next/cache";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { api } from "~/trpc/react";
import { useClass } from "../../hooks/use-class";

export function SubjectSelectClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clasz = useClass();
  const subjectSlug = searchParams.get("materia");
  const { data: subjects } =
    api.teacher.getTeacherSubjectsOnClassForCurrentAcademicPeriod.useQuery({
      classId: clasz.id,
    });

  useEffect(() => {
    if (!subjects || subjects.length === 0 || subjectSlug) return;
    const firstSubject = subjects[0];
    if (!firstSubject) return;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("materia", firstSubject.slug);
    router.replace(`${pathname}?${newParams.toString()}`, {
      scroll: false,
    });
  }, [subjects, subjectSlug, router.replace, pathname, searchParams]);

  return (
    <Select
      value={subjectSlug ?? undefined}
      onValueChange={(value) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("materia", value);
        router.replace(`${pathname}?${newParams.toString()}`, {
          scroll: false,
        });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Matéria" />
      </SelectTrigger>
      <SelectContent>
        {subjects?.map((subject) => (
          <SelectItem key={subject.id} value={subject.slug}>
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
