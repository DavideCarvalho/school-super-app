import * as React from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type ShellElement = React.ElementRef<"div">;
type RootProps = React.ComponentPropsWithoutRef<"div">;

interface ShellProps extends RootProps {
  navItems: string[];
  markup?: string;
  activeView?: string;
  setActiveView?: (view: string) => void;
}

export const Shell = React.forwardRef<ShellElement, Readonly<ShellProps>>(
  (
    { title, navItems, children, markup, activeView, setActiveView },
    forwardedRef,
  ) => {
    return (
      <div ref={forwardedRef} className="flex h-screen justify-between">
        <Sidebar navItems={navItems} title={title} />
        <main className="bg-slate-2 w-[calc(100%_-_275px)]">
          {title && (
            <Topbar
              title={title}
              activeView={activeView}
              setActiveView={setActiveView}
              markup={markup}
            />
          )}
          <div className="relative h-[calc(100vh_-_70px)] overflow-auto">
            <div className="mx-auto">{children}</div>
          </div>
        </main>
      </div>
    );
  },
);

Shell.displayName = "Shell";
