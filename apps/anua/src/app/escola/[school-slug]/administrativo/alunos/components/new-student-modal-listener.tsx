"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewStudentModal } from "../containers/new-student-modal";

export function NewStudentModalListener() {
  const [openNewStudentModal, setOpenNewStudentModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-aluno") {
      setOpenNewStudentModal(true);
    } else {
      setOpenNewStudentModal(false);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewStudentModal(false);
    await Promise.all([
      utils.student.allBySchoolId.invalidate(),
      utils.student.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewStudentModal(false);
    await Promise.all([
      utils.student.allBySchoolId.invalidate(),
      utils.student.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewStudentModal
      open={openNewStudentModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
