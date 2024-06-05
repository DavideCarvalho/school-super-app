"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { NewCanteenModalV2 } from "~/components/new-canteen-modal-v2";
import { api } from "~/trpc/react";

export function NewCanteenModalListener() {
  const [openNewCanteenModal, setOpenNewCanteenModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "adicionar-cantina") {
      setOpenNewCanteenModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewCanteenModal(false);
    await Promise.all([
      utils.canteen.allBySchoolId.invalidate(),
      utils.canteen.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewCanteenModal(false);
    await Promise.all([
      utils.canteen.allBySchoolId.invalidate(),
      utils.canteen.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewCanteenModalV2
      open={openNewCanteenModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
