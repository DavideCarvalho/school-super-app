"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

export function ClassTabs() {
  const pathname = usePathname();
  const params = useParams();
  const [tabValue, setTabValue] = useState("atividades");
  const schoolSlug = params["school-slug"];
  const classSlug = params["class-slug"];
  useEffect(() => {
    const splittedPathName = pathname.split("/");
    if (splittedPathName[splittedPathName.length - 1] === classSlug) {
      setTabValue("atividades");
      return;
    }
    const finalPieceOfPath = splittedPathName[
      splittedPathName.length - 1
    ] as string;
    setTabValue(finalPieceOfPath);
  }, [pathname, classSlug]);
  return (
    <Tabs className="w-full" value={tabValue}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
        <TabsTrigger value="atividades">
          <Link
            className="w-full"
            href={`/escola/${schoolSlug}/turma/${classSlug}/atividades`}
          >
            Atividades
          </Link>
        </TabsTrigger>
        <TabsTrigger value="presencas">
          <Link
            className="w-full"
            href={`/escola/${schoolSlug}/turma/${classSlug}/presencas`}
          >
            Presenças
          </Link>
        </TabsTrigger>
        <TabsTrigger value="notas">
          <Link
            className="w-full"
            href={`/escola/${schoolSlug}/turma/${classSlug}/notas`}
          >
            Notas
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
