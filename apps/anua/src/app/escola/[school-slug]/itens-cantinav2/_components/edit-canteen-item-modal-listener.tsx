"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { EditSubjectModalV2 } from "~/components/edit-subject-modal-v2";
import { api } from "~/trpc/react";

export function EditCanteenItemModalListener() {
  const [openEditCanteenItemModal, setOpenEditCanteenItemModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("item");

  useEffect(() => {
    if (hash === "editar-item-cantina" && hashValue) {
      setOpenEditCanteenItemModal(true);
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
    <EditSubjectModalV2
      subjectSlug={hashValue ?? ""}
      open={openEditCanteenItemModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
