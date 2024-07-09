"use client";

import { useEffect } from "react";
import { revalidatePath } from "next/cache";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { api } from "~/trpc/react";

export function SubjectSelectClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const classSlug = params["class-slug"];
  const subjectSlug = searchParams.get("materia");
  const { data: clasz } = api.class.findBySlug.useQuery({
    slug: classSlug as string,
  });
  const { data: subjects } =
    api.teacher.getTeacherSubjectsOnClassForCurrentAcademicPeriod.useQuery(
      {
        classId: clasz?.id,
      },
      {
        enabled: clasz != null,
      },
    );

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
