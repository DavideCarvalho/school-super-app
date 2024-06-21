"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { EditCanteenItemModal } from "../containers/edit-canteen-item-modal";

interface EditCanteenItemModalListenerProps {
  canteenId: string;
}

export function EditCanteenItemModalListener({
  canteenId,
}: EditCanteenItemModalListenerProps) {
  const [openEditCanteenItemModal, setOpenEditCanteenItemModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("item");

  useEffect(() => {
    if (hash === "editar-item-cantina" && hashValue) {
      setOpenEditCanteenItemModal(true);
    } else {
      setOpenEditCanteenItemModal(false);
    }
  }, [hash, hashValue]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenEditCanteenItemModal(false);
    await Promise.all([
      utils.canteen.allCanteenItems.invalidate(),
      utils.canteen.countAllCanteenItems.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenEditCanteenItemModal(false);
    await Promise.all([
      utils.canteen.allCanteenItems.invalidate(),
      utils.canteen.countAllCanteenItems.invalidate(),
      utils.canteen.findCanteenItemById.invalidate(),
    ]);
    setHash("");
  }

  return (
    <EditCanteenItemModal
      canteenId={canteenId}
      canteenItemId={hashValue ?? ""}
      open={openEditCanteenItemModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
