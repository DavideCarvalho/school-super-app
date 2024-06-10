"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditTeacherModal } from "~/components/edit-teacher-modal";
import { api } from "~/trpc/react";

export function EditWorkerModalListener() {
  const [openEditTeacherModal, setOpenEditTeacherModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("funcionario");

  useEffect(() => {
    if (hash === "editar-funcionario" && hashValue) {
      setOpenEditTeacherModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
      utils.teacher.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
      utils.teacher.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditTeacherModal
      teacherSlug={hashValue ?? ""}
      open={openEditTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
