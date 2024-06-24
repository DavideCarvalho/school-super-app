"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";

export function ToasterPortal() {
  const [isSSR, setSSR] = useState(true);
  useEffect(() => {
    setSSR(typeof window === "undefined");
  }, []);
  if (isSSR) return null;
  return createPortal(<Toaster position="top-center" />, window.document.body);
}
