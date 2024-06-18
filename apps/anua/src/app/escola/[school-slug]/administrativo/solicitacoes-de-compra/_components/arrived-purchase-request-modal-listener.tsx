"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";
import { useHashQueryValue } from "hooks/use-hash-value";

import { api } from "~/trpc/react";
import { ArrivedPurchaseRequestModal } from "../containers/arrived-purchase-request-modal";

export function ArrivedPurchaseRequestModalListener() {
  const [openArrivedPurchaseRequestModal, setOpenArrivedPurchaseRequestModal] =
    useState(false);
  const [hash, setHash] = useHash();
  const [hashValue] = useHashQueryValue("solicitacao");

  useEffect(() => {
    if (hash === "solicitacao-chegou") {
      setOpenArrivedPurchaseRequestModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenArrivedPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenArrivedPurchaseRequestModal(false);
    await Promise.all([
      utils.purchaseRequest.allBySchoolId.invalidate(),
      utils.purchaseRequest.countAllBySchoolId.invalidate(),
    ]);
    setHash("");
  }

  return (
    <ArrivedPurchaseRequestModal
      purchaseRequestId={hashValue ?? ""}
      open={openArrivedPurchaseRequestModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
