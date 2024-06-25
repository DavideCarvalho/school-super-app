/**
 * v0 by Vercel.
 * @see https://v0.dev/t/sVkaIv01xZU
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
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

export default function ClassLayout({
  params,
}: {
  params: { "class-slug": string[] };
}) {
  console.log("params", params);
  const classSlugParams = params["class-slug"] as unknown as string[];
  const classSlug = classSlugParams[0];
  const route = classSlugParams[1] ?? "assignments";
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Next Assignment
              </CardTitle>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Due 4/15/2023
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Final Project</div>
              <p className="text-sm text-muted-foreground">
                Create a web application that demonstrates your understanding of
                the course material.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Issues
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">3 Students</div>
              <p className="text-sm text-muted-foreground">
                Have missed more than 3 classes this semester.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Guest Speaker</div>
              <p className="text-sm text-muted-foreground">
                4/20/2023 - 2:00 PM
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
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
                        <TableCell className="font-medium">
                          Final Project
                        </TableCell>
                        <TableCell>4/15/2023</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CircleCheckIcon className="h-4 w-4 text-green-500" />
                            <span>Submitted</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Midterm Exam
                        </TableCell>
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
                        <TableCell className="font-medium">
                          Jane Smith
                        </TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Bob Johnson
                        </TableCell>
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
                        <TableCell className="font-medium">
                          Jane Smith
                        </TableCell>
                        <TableCell>92%</TableCell>
                        <TableCell>88%</TableCell>
                        <TableCell>90%</TableCell>
                        <TableCell>95%</TableCell>
                        <TableCell>91%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Bob Johnson
                        </TableCell>
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
        </div>
      </div>
    </div>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
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

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
