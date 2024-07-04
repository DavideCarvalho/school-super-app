import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { api } from "~/trpc/server";
import { TabLink } from "./_components/tab-link";
import { NewAssignmentModalListener } from "./atividades/_components/new-assignment-modal-listener";
import { AssignmentsTableServer } from "./atividades/containers/assignments-table/assignments-table.server";
import { GradesTableServer } from "./containers/grades-table/grades-table.server";
import { AttendancesTableServer } from "./presencas/attendances-table/attendances-table.server";

const routes = ["atividades", "presencas", "notas"];

export default async function ClassPage({
  params,
}: {
  params: { "class-slug": string; "school-slug": string };
}) {
  const classSlug = params["class-slug"];
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }

  return null;

  // return (
  //   <Tabs defaultValue="atividades" className="w-full">
  //     <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
  //       <TabsTrigger value="atividades">
  //         <TabLink
  //           href={`/escola/${params["school-slug"]}/turma/${classSlug}/atividades`}
  //         >
  //           Atividades
  //         </TabLink>
  //       </TabsTrigger>
  //       <TabsTrigger value="presencas">
  //         <TabLink
  //           href={`/escola/${params["school-slug"]}/turma/${classSlug}/presencas`}
  //         >
  //           Presenças
  //         </TabLink>
  //       </TabsTrigger>
  //       <TabsTrigger value="notas">
  //         <TabLink
  //           href={`/escola/${params["school-slug"]}/turma/${classSlug}/notas`}
  //         >
  //           Notas
  //         </TabLink>
  //       </TabsTrigger>
  //     </TabsList>
  //     <TabsContent value="atividades">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Atividades pra nota</CardTitle>
  //           <CardDescription>
  //             Veja, crie e edite todas as atividades pra nota dessa turma.
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <NewAssignmentModalListener classId={foundClass.id} />
  //           <TabLink
  //             href={`${url.pathname}?${url.searchParams.toString()}#adicionar-atividade`}
  //           >
  //             <Button>Adicionar atividade</Button>
  //           </TabLink>
  //           <AssignmentsTableServer classId={foundClass.id} />
  //         </CardContent>
  //       </Card>
  //     </TabsContent>
  //     <TabsContent value="presencas">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Presença</CardTitle>
  //           <CardDescription>
  //             Veja, crie e edite todas as atividades pra nota dessa turma.
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <AttendancesTableServer classId={foundClass.id} />
  //         </CardContent>
  //       </Card>
  //     </TabsContent>
  //     <TabsContent value="notas">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Notas</CardTitle>
  //           <CardDescription>Veja todas as notas dessa turma.</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <GradesTableServer classId={foundClass.id} />
  //         </CardContent>
  //       </Card>
  //     </TabsContent>
  //   </Tabs>
  // );
}

function CircleCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Icone</title>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
