"use client";

import Link from "next/link";

interface TabLinkProps {
  href: string;
  label: string;
}

export function TabLink({ href, label }: TabLinkProps) {
  return (
    <Link className="w-full" href={href}>
      {label}
    </Link>
  );
}
