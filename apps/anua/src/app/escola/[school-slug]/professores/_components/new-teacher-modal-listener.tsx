"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHash } from "hooks/use-hash";

import { NewTeacherModalV2 } from "~/components/new-teacher-modal-v2";
import { api } from "~/trpc/react";

interface NewTeacherModalListenerProps {
  schoolId: string;
}

export function NewTeacherModalListener({
  schoolId,
}: NewTeacherModalListenerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openNewTeacherModal, setOpenNewTeacherModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (!searchParams) return;
    if (hash === "adicionar-professor") {
      setOpenNewTeacherModal(true);
    }
  }, [hash, setOpenNewTeacherModal]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClose() {
    setOpenNewTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewTeacherModalV2
      schoolId={schoolId}
      onClickSubmit={handleOnClickSubmit}
      open={openNewTeacherModal}
      onClickCancel={handleOnClose}
      onClose={handleOnClose}
    />
  );
}
