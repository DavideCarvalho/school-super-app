"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewCanteenItemModalV2 } from "~/components/new-canteenitem-modal-v2";
import { api } from "~/trpc/react";

interface NewCanteenItemModalListenerProps {
  canteenId: string;
}

export function NewCanteenSellModalListener({
  canteenId,
}: NewCanteenItemModalListenerProps) {
  const [openNewTeacherModal, setOpenNewTeacherModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "nova-venda-cantina") {
      setOpenNewTeacherModal(true);
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
    <NewCanteenItemModalV2
      canteenId={canteenId}
      open={openNewTeacherModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
