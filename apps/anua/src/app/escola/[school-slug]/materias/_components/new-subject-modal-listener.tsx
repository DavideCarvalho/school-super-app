"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewSubjectModal } from "../containers/new-subject-modal";

export function NewSubjectModalListener() {
  const [openNewTeacherModal, setOpenNewTeacherModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-materia") {
      setOpenNewTeacherModal(true);
    } else {
      setOpenNewTeacherModal(false);
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
    <NewSubjectModal
      open={openNewTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
