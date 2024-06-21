"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewCanteenItemModal } from "../containers/new-canteen-item-modal";

interface NewCanteenItemModalListenerProps {
  canteenId: string;
}

export function NewCanteenItemModalListener({
  canteenId,
}: NewCanteenItemModalListenerProps) {
  const [openNewTeacherModal, setOpenNewTeacherModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-item-cantina") {
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
    <NewCanteenItemModal
      canteenId={canteenId}
      open={openNewTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
