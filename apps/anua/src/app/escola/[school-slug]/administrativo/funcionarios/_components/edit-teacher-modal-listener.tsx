"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditTeacherModal } from "~/app/escola/[school-slug]/professores/containers/edit-teacher-modal";
import { api } from "~/trpc/react";

export function EditTeacherModalListener() {
  const [openEditTeacherModal, setOpenEditTeacherModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("professor");

  useEffect(() => {
    if (hash === "editar-professor" && hashValue) {
      setOpenEditTeacherModal(true);
    } else {
      setOpenEditTeacherModal(false);
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
