"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { EditStudentModal } from "../containers/edit-student-modal";

export function EditStudentModalListener() {
  const [openEditStudentModal, setOpenEditStudentModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("aluno");

  useEffect(() => {
    if (hash === "editar-aluno" && hashValue) {
      setOpenEditStudentModal(true);
    } else {
      setOpenEditStudentModal(false);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditStudentModal(false);
    await Promise.all([
      utils.student.allBySchoolId.invalidate(),
      utils.student.countAllBySchoolId.invalidate(),
      utils.student.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditStudentModal(false);
    await Promise.all([
      utils.student.allBySchoolId.invalidate(),
      utils.student.countAllBySchoolId.invalidate(),
      utils.student.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditStudentModal
      userSlug={hashValue ?? ""}
      open={openEditStudentModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
