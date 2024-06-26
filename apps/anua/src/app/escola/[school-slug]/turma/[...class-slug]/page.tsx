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
import { AssignmentsTableServer } from "./containers/assignments-table.server copy";

export default async function ClassPage({
  params,
}: {
  params: { "class-slug": string[] };
}) {
  const classSlugParams = params["class-slug"] as unknown as string[];
  const classSlug = classSlugParams[0] as unknown as string;
  const route = classSlugParams[1] ?? "assignments";
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }
  return (
    <Tabs defaultValue="assignments" className="w-full" value={route}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
        <TabsTrigger value="assignments">Atividades pra nota</TabsTrigger>
        <TabsTrigger value="attendance">Presença</TabsTrigger>
        <TabsTrigger value="grades">Notas</TabsTrigger>
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
            <CardTitle>Attendance</CardTitle>
            <CardDescription>
              View and manage attendance for this class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Absences</TableHead>
                  <TableHead>Tardies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bob Johnson</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>2</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="grades">
        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
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
