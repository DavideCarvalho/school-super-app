import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { api } from "~/trpc/server";
import { TabLink } from "./components/tab-link";
import { AssignmentsTableServer } from "./containers/assignments-table/assignments-table.server";
import { AttendancesTableServer } from "./containers/attendances-table/attendances-table.server";
import { GradesTableServer } from "./containers/grades-table/grades-table.server";

const routes = ["atividades", "presencas", "notas"];

export default async function ClassPage({
  params,
}: {
  params: { "class-slug": string[]; "school-slug": string };
}) {
  const classSlugParams = params["class-slug"] as unknown as string[];
  const classSlug = classSlugParams[0] as unknown as string;
  const wantedRouted =
    (classSlugParams[1] as unknown as string | undefined) ?? "atividades";
  const doesRouteExists = routes.includes(wantedRouted);
  if (!doesRouteExists) {
    return redirect("/escola");
  }
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }

  return (
    <Tabs defaultValue="atividades" className="w-full" value={wantedRouted}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
        <TabsTrigger value="atividades">
          <TabLink
            href={`/escola/${params["school-slug"]}/turma/${classSlug}/atividades`}
            label="Atividades"
          />
        </TabsTrigger>
        <TabsTrigger value="presencas">
          <TabLink
            href={`/escola/${params["school-slug"]}/turma/${classSlug}/presencas`}
            label="Presenças"
          />
        </TabsTrigger>
        <TabsTrigger value="notas">
          <TabLink
            href={`/escola/${params["school-slug"]}/turma/${classSlug}/notas`}
            label="Notas"
          />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="atividades">
        <Card>
          <CardHeader>
            <CardTitle>Atividades pra nota</CardTitle>
            <CardDescription>
              Veja, crie e edite todas as atividades pra nota dessa turma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignmentsTableServer classId={foundClass.id} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="presencas">
        <Card>
          <CardHeader>
            <CardTitle>Presença</CardTitle>
            <CardDescription>
              Veja, crie e edite todas as atividades pra nota dessa turma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendancesTableServer classId={foundClass.id} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notas">
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
            <CardDescription>Veja todas as notas dessa turma.</CardDescription>
          </CardHeader>
          <CardContent>
            <GradesTableServer classId={foundClass.id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
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
