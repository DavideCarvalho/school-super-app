"use client";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";

interface DownloadTeacherClassesGridClientProps {
  classId?: string;
}

export function DownloadTeacherClassesGridClient({
  classId,
}: DownloadTeacherClassesGridClientProps) {
  const { mutateAsync: downloadTeacherClassesGrid } =
    api.school.getXlsxWithAllTeachersClasses.useMutation();

  async function handleClickDownload() {
    try {
      const response = await downloadTeacherClassesGrid({
        classId: undefined,
      });
      if (!response) return;
      const anchor = document.createElement("a");
      anchor.href = `data:image/png;base64,${response}`;
      anchor.download = "grade.xlsx";
      anchor.click();
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <Button onClick={handleClickDownload} variant={"secondary"}>
      Baixar grade dos professores
    </Button>
  );
}
