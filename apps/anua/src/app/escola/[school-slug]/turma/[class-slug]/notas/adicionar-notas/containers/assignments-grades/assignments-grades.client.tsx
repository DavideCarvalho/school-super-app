"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
  subjectId: string;
}

const schema = z.object({
  students: z.array(
    z.object({
      id: z.string(),
      User: z.object({
        id: z.string(),
        name: z.string(),
      }),
      grades: z.array(
        z.object({
          Assignment: z.object({
            id: z.string(),
            name: z.string(),
          }),
          StudentHasAssignment: z
            .object({
              grade: z.number().min(0).nullable().optional(),
            })
            .nullable(),
        }),
      ),
    }),
  ),
});

export function AssignmentsGradesClient({
  subjectId,
  classId,
}: AssignmentsGradesClientProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      students: [],
    },
  });

  const { data: assignments, refetch: refetchAssignments } =
    api.assignment.getCurrentAcademicPeriodAssignments.useQuery({
      classId,
      subjectId,
    });
  const { data: studentsGrades, refetch: refetchStudentsGrades } =
    api.assignment.getStudentsAssignmentsGradesForClassOnCurrentAcademicPeriod.useQuery(
      {
        classId: classId,
      },
    );
  const { mutateAsync: saveStudentsGrades } =
    api.grade.saveStudentsGradesForClassOnCurrentAcademicPeriod.useMutation();

  const students = form.watch("students");

  useEffect(() => {
    if (!studentsGrades) return;
    form.setValue("students", studentsGrades);
  }, [studentsGrades, form.setValue]);

  async function onSubmit(data: z.infer<typeof schema>) {
    const toastId = toast.loading("Salvando notas...");
    try {
      const grades = data.students.flatMap((student) =>
        student.grades.map((grade) => ({
          studentId: student.id,
          assignmentId: grade.Assignment.id,
          grade: grade.StudentHasAssignment?.grade,
        })),
      );
      await saveStudentsGrades({
        classId,
        subjectId,
        grades,
      });
      toast.dismiss(toastId);
      toast.success("Notas salvas com sucesso!");
      await form.reset();
      await Promise.all([refetchStudentsGrades(), refetchAssignments()]);
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro ao salvar notas");
    }
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
            {students?.map((student, studentIndex) => {
              return (
                <TableRow key={student.id}>
                  <TableCell>{student.User.name}</TableCell>
                  {student.grades.map((_, gradeIndex) => {
                    if (!assignments) return null;
                    const currentAssignmentColumn = assignments[gradeIndex];
                    if (!currentAssignmentColumn) return null;
                    const gradeForCurrentAssignment = student.grades.find(
                      (grade) =>
                        grade.Assignment.id === currentAssignmentColumn.id,
                    );
                    if (!gradeForCurrentAssignment) return null;
                    return (
                      <TableCell key={gradeForCurrentAssignment.Assignment.id}>
                        <Input
                          type="number"
                          min={0}
                          max={
                            assignments?.find(
                              (a) =>
                                a.id ===
                                gradeForCurrentAssignment.Assignment.id,
                            )?.grade
                          }
                          inputMode="numeric"
                          value={
                            gradeForCurrentAssignment?.StudentHasAssignment
                              ?.grade ?? ""
                          }
                          onChange={(e) => {
                            const grade = e.target.valueAsNumber;
                            if (Number.isNaN(grade)) {
                              form.setValue(
                                `students.${studentIndex}.grades.${gradeIndex}.StudentHasAssignment.grade`,
                                null,
                              );
                              return;
                            }
                            form.setValue(
                              `students.${studentIndex}.grades.${gradeIndex}.StudentHasAssignment.grade`,
                              grade,
                            );
                          }}
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
