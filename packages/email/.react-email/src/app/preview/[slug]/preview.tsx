"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CodeContainer } from "../../../components/code-container";
import { Shell } from "../../../components/shell";
import { Tooltip } from "../../../components/tooltip";

export default function Preview({
  navItems,
  slug,
  markup,
  reactMarkup,
  plainText,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = React.useState("desktop");
  const [activeLang, setActiveLang] = React.useState("jsx");

  React.useEffect(() => {
    const view = searchParams.get("view");
    const lang = searchParams.get("lang");

    if (view === "source" || view === "desktop") {
      setActiveView(view);
    }

    if (lang === "jsx" || lang === "markup" || lang === "markdown") {
      setActiveLang(lang);
    }
  }, [searchParams]);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    router.push(`${pathname}?view=${view}`);
  };

  const handleLangChange = (lang: string) => {
    setActiveLang(lang);
    router.push(`${pathname}?view=source&lang=${lang}`);
  };

  return (
    <Shell
      navItems={navItems}
      title={slug}
      markup={markup}
      activeView={activeView}
      setActiveView={handleViewChange}
    >
      {activeView === "desktop" ? (
        <iframe srcDoc={markup} className="h-[calc(100vh_-_70px)] w-full" />
      ) : (
        <div className="mx-auto flex max-w-3xl gap-6 p-6">
          <Tooltip.Provider>
            <CodeContainer
              markups={[
                { language: "jsx", content: reactMarkup },
                { language: "markup", content: markup },
                { language: "markdown", content: plainText },
              ]}
              activeLang={activeLang}
              setActiveLang={handleLangChange}
            />
          </Tooltip.Provider>
        </div>
      )}
    </Shell>
  );
}
