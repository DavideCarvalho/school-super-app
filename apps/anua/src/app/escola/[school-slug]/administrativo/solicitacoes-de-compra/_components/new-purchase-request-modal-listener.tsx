"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewPurchaseRequestModal } from "../containers/new-purchase-request-modal";

export function NewPurchaseRequestModalListener() {
  const [openNewPurchaseRequestModal, setOpenNewPurchaseRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "criar-solicitacao") {
      setOpenNewPurchaseRequestModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewPurchaseRequestModal
      open={openNewPurchaseRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
