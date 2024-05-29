"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewTeacherModalV2 } from "~/components/new-teacher-modal-v2";
import { api } from "~/trpc/react";

interface NewTeacherModalListenerProps {
  schoolId: string;
}

export function NewTeacherModalListener({
  schoolId,
}: NewTeacherModalListenerProps) {
  const [openNewTeacherModal, setOpenNewTeacherModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-professor") {
      setOpenNewTeacherModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
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
      open={openNewTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
