"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditSubjectModalV2 } from "~/components/edit-subject-modal-v2";
import { api } from "~/trpc/react";

export function EditCanteenModalListener() {
  const [openEditCanteenModal, setOpenEditCanteenModal] = useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("cantina");

  useEffect(() => {
    if (hash === "editar-cantina" && hashValue) {
      setOpenEditCanteenModal(true);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditCanteenModal(false);
    await Promise.all([
      utils.canteen.allBySchoolId.invalidate(),
      utils.canteen.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditCanteenModal(false);
    await Promise.all([
      utils.canteen.allBySchoolId.invalidate(),
      utils.canteen.countAllBySchoolId.invalidate(),
      utils.subject.findBySlug.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditSubjectModalV2
      subjectSlug={hashValue ?? ""}
      open={openEditCanteenModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
