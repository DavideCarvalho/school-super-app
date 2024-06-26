"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { EditSubjectModal } from "../containers/edit-subject-modal";

export function EditSubjectModalListener() {
  const [openEditSubjectModal, setOpenEditSubjectModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("materia");

  useEffect(() => {
    if (hash === "editar-materia" && hashValue) {
      setOpenEditSubjectModal(true);
    } else {
      setOpenEditSubjectModal(false);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditSubjectModal(false);
    await Promise.all([
      utils.subject.allBySchoolId.invalidate(),
      utils.subject.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditSubjectModal(false);
    await Promise.all([
      utils.subject.allBySchoolId.invalidate(),
      utils.subject.countAllBySchoolId.invalidate(),
      utils.subject.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditSubjectModal
      subjectSlug={hashValue ?? ""}
      open={openEditSubjectModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
