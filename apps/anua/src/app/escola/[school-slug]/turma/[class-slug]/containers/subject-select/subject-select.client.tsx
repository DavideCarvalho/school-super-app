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

interface SubjectSelectClientProps {
  classId: string;
  subjectId?: string;
}

export function SubjectSelectClient({
  classId,
  subjectId,
}: SubjectSelectClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: subjects } =
    api.teacher.getTeacherSubjectsOnClassForCurrentAcademicPeriod.useQuery({
      classId,
    });

  console.log("subjectId", subjectId);

  if (subjects?.length === 1) return null;

  return (
    <Select
      value={subjectId}
      onValueChange={(value) => {
        if (!subjects) return;
        const subject = subjects.find((s) => s.id === value);
        if (!subject) return;
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("materia", subject.slug);
        router.replace(`${pathname}?${newParams.toString()}`, {
          scroll: false,
        });
        router.refresh();
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Matéria" />
      </SelectTrigger>
      <SelectContent>
        {subjects?.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
