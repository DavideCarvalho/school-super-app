"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { Form } from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import { api } from "~/trpc/react";

interface AssignmentsGradesClientProps {
  classId: string;
}

const schema = z.object({ grades: z.array(z.record(z.number().nullable())) });

export function AssignmentsGradesClient({
  classId,
}: AssignmentsGradesClientProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      grades: [],
    },
  });

  const { data: assignments } =
    api.assignment.getCurrentAcademicPeriodAssignments.useQuery({
      classId: classId,
    });
  const { data: studentsGrades } =
    api.assignment.getStudentsAssignmentsGradesForClassOnCurrentAcademicPeriod.useQuery(
      {
        classId: classId,
      },
    );

  const grades = form.watch("grades");

  useEffect(() => {
    if (!studentsGrades) return;
    const grades = studentsGrades.map((student) => student.grades);
    form.setValue("grades", grades);
  }, [studentsGrades, form.setValue]);

  async function onSubmit(data: z.infer<typeof schema>) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              {assignments?.map((assignment) => (
                <TableHead key={assignment.name}>{assignment.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {studentsGrades?.map((student, index) => {
              const studentGrades = grades[index] ?? {};
              return (
                <TableRow key={student.id}>
                  <TableCell>{student.User.name}</TableCell>
                  {Object.keys(studentGrades).map((assignmentName) => {
                    return (
                      <TableCell key={assignmentName}>
                        <Input
                          type="number"
                          min={0}
                          max={
                            assignments?.find((a) => a.name === assignmentName)
                              ?.grade
                          }
                          inputMode="numeric"
                          {...form.register(
                            `grades.${index}.${assignmentName}`,
                            {
                              valueAsNumber: true,
                            },
                          )}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Button type="submit" className="space-y-4">
          Salvar
        </Button>
      </form>
    </Form>
  );
}
