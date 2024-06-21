"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { BoughtPurchaseRequestModal } from "../containers/bought-purchase-request-modal";

export function BoughtPurchaseRequestModalListener() {
  const [openBoughtPurchaseRequestModal, setOpenBoughtPurchaseRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("solicitacao");

  useEffect(() => {
    if (hash === "solicitacao-comprada") {
      setOpenBoughtPurchaseRequestModal(true);
    } else {
      setOpenBoughtPurchaseRequestModal(false);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenBoughtPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenBoughtPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <BoughtPurchaseRequestModal
      purchaseRequestId={hashValue ?? ""}
      open={openBoughtPurchaseRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
