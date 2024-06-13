"use client";

import { useEffect, useState } from "react";
import { useHash } from "hooks/use-hash";

import { api } from "~/trpc/react";
import { NewCanteenSellModal } from "../containers/new-canteen-sell-modal";

interface NewCanteenItemModalListenerProps {
  canteenId: string;
}

export function NewCanteenSellModalListener({
  canteenId,
}: NewCanteenItemModalListenerProps) {
  const [openNewCanteenSellModal, setOpenNewCanteenSellModal] = useState(false);
  const [hash, setHash] = useHash();

  useEffect(() => {
    if (hash === "nova-venda-cantina") {
      setOpenNewCanteenSellModal(true);
    }
  }, [hash]);

  const utils = api.useUtils();

  async function handleOnClickSubmit() {
    setOpenNewCanteenSellModal(false);
    await Promise.all([
      utils.canteen.allCanteenSells.invalidate(),
      utils.canteen.countAllCanteenSells.invalidate(),
    ]);
    setHash("");
  }

  async function handleOnClickCancel() {
    setOpenNewCanteenSellModal(false);
    await Promise.all([
      utils.canteen.allCanteenSells.invalidate(),
      utils.canteen.countAllCanteenSells.invalidate(),
    ]);
    setHash("");
  }

  return (
    <NewCanteenSellModal
      canteenId={canteenId}
      open={openNewCanteenSellModal}
      onClickSubmit={handleOnClickSubmit}
      onClickCancel={handleOnClickCancel}
    />
  );
}
