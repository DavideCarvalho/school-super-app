"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditSubjectModalV2 } from "~/components/edit-subject-modal-v2";
import { api } from "~/trpc/react";

export function EditSubjectModalListener() {
  const [openEditSubjectModal, setOpenEditSubjectModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("materia");

  useEffect(() => {
    if (hash === "editar-materia" && hashValue) {
      setOpenEditSubjectModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditSubjectModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditSubjectModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditSubjectModalV2
      teacherSlug={hashValue ?? ""}
      open={openEditSubjectModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
