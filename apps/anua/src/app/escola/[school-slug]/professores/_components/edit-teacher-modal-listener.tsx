"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import useHashParam from "hooks/use-hash-value";

import { EditTeacherModal } from "~/components/edit-teacher-modal";
import { api } from "~/trpc/react";

interface EditTeacherModalListenerProps {
  schoolId: string;
}

export function EditTeacherModalListener({
  schoolId,
}: EditTeacherModalListenerProps) {
  const [openEditTeacherModal, setOpenEditTeacherModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue, setHashValue] = useHashParam("professor");

  useEffect(() => {
    console.log("hashValue", hashValue);
    console.log("hash", hash);
    if (hash === "editar-professor" && hashValue) {
      setOpenEditTeacherModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHashValue("");
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditTeacherModal(false);
    await Promise.all([
      utils.teacher.getSchoolTeachers.invalidate(),
      utils.teacher.countSchoolTeachers.invalidate(),
    ]);
    setHashValue("");
    setHash("");
  }

  return (
    <EditTeacherModal
      schoolId={schoolId}
      teacherSlug={hashValue ?? ""}
      open={openEditTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
