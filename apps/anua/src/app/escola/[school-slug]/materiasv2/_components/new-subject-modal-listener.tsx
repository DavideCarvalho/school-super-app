"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewSubjectModalV2 } from "~/components/new-subject-modal-v2";
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
    if (hash === "adicionar-materia") {
      setOpenNewTeacherModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewTeacherModal(false);
    await Promise.all([
      utils.subject.allBySchoolId.invalidate(),
      utils.subject.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewTeacherModal(false);
    await Promise.all([
      utils.subject.allBySchoolId.invalidate(),
      utils.subject.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewSubjectModalV2
      schoolId={schoolId}
      open={openNewTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}