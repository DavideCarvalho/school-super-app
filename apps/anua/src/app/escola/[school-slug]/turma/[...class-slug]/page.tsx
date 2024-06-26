import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { api } from "~/trpc/server";
import { AssignmentsTableServer } from "./containers/assignments-table/assignments-table.server";
import { GradesTableServer } from "./containers/grades-table/grades-table.server";

const routes = ["atividades", "presencas", "notas"];

export default async function ClassPage({
  params,
}: {
  params: { "class-slug": string[] };
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
        <TabsTrigger value="atividades">Atividades pra nota</TabsTrigger>
        <TabsTrigger value="presencas">Presença</TabsTrigger>
        <TabsTrigger value="notas">Notas</TabsTrigger>
      </TabsList>
      <TabsContent value="assignments">
        <Card>
          <CardHeader>
            <CardTitle>Atividades pra nota</CardTitle>
            <CardDescription>
              Veja, crie e edite todas as atividades pra nota dessa disciplina.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignmentsTableServer classId={foundClass.id} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="attendance">
        <Card>
          <CardHeader>
            <CardTitle>Presença</CardTitle>
          </CardHeader>
          <CardContent>
            <GradesTableServer classId={foundClass.id} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="grades">
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
            <CardDescription>
              View and manage grades for this class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment 1</TableHead>
                  <TableHead>Assignment 2</TableHead>
                  <TableHead>Midterm</TableHead>
                  <TableHead>Final</TableHead>
                  <TableHead>Overall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>85%</TableCell>
                  <TableCell>92%</TableCell>
                  <TableCell>88%</TableCell>
                  <TableCell>90%</TableCell>
                  <TableCell>89%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>92%</TableCell>
                  <TableCell>88%</TableCell>
                  <TableCell>90%</TableCell>
                  <TableCell>95%</TableCell>
                  <TableCell>91%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bob Johnson</TableCell>
                  <TableCell>78%</TableCell>
                  <TableCell>82%</TableCell>
                  <TableCell>75%</TableCell>
                  <TableCell>80%</TableCell>
                  <TableCell>79%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
