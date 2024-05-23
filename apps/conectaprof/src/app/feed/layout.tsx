import { Suspense } from "react";

import { NavbarMenu } from "./_components/navbar-menu";
import { UserProfileDialog } from "./containers/profile-menu-dialog/profile-menu-dialog.client";

export default function FeedLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-orange-600 py-4 text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
          <h1 className="text-2xl font-bold">ConectaProf</h1>
          <NavbarMenu />
        </div>
      </header>
      <main className="flex-1 bg-gray-100 py-8">
        <>
          <Suspense>
            <UserProfileDialog />
          </Suspense>
          {props.children}
        </>
      </main>
    </div>
  );
}
