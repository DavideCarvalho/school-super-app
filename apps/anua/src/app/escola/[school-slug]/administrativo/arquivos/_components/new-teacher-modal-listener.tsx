"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewTeacherModal } from "~/app/escola/[school-slug]/professores/containers/new-teacher-modal";
import { api } from "~/trpc/react";

export function NewTeacherModalListener() {
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
    <NewTeacherModal
      open={openNewTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}