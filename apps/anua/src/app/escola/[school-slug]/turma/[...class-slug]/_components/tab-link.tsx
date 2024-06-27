"use client";

import Link from "next/link";

interface TabLinkProps {
  href: string;
  children: React.ReactNode;
}

export function TabLink({ href, children }: TabLinkProps) {
  return (
    <Link className="w-full" href={href}>
      {children}
    </Link>
  );
}
