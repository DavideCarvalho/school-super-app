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

export default function ClassPage({
  params,
}: {
  params: { "class-slug": string[] };
}) {
  const classSlugParams = params["class-slug"] as unknown as string[];
  const classSlug = classSlugParams[0];
  const route = classSlugParams[1] ?? "assignments";
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
              View and manage all assignments for this class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Final Project</TableCell>
                  <TableCell>4/15/2023</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CircleCheckIcon className="h-4 w-4 text-green-500" />
                      <span>Submitted</span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Midterm Exam</TableCell>
                  <TableCell>3/1/2023</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CircleCheckIcon className="h-4 w-4 text-green-500" />
                      <span>Graded</span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Lab 5</TableCell>
                  <TableCell>2/28/2023</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CircleCheckIcon className="h-4 w-4 text-green-500" />
                      <span>Graded</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
