"use client";

import { useState } from "react";
import { Bell, Book, Calendar, CreditCard, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Progress } from "@acme/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

export default function ResponsibleDashboard() {
  const [selectedStudent, setSelectedStudent] = useState("maria");

  // Dados simulados - em uma aplicação real, estes viriam de uma API
  const students = {
    maria: {
      name: "Maria Silva",
      grade: "7º Ano",
      attendance: 95,
      nextAssignment: "Projeto de Ciências",
      canteenBalance: 50.0,
      recentGrades: [
        { subject: "Matemática", grade: 8.5 },
        { subject: "Português", grade: 9.0 },
        { subject: "Ciências", grade: 7.5 },
      ],
      notifications: 2,
    },
    joao: {
      name: "João Santos",
      grade: "5º Ano",
      attendance: 92,
      nextAssignment: "Redação de História",
      canteenBalance: 35.5,
      recentGrades: [
        { subject: "Matemática", grade: 7.0 },
        { subject: "Português", grade: 8.5 },
        { subject: "Ciências", grade: 9.0 },
      ],
      notifications: 1,
    },
  };

  const student = students[selectedStudent];

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Portal do Responsável
          </h1>
          <div className="flex items-center space-x-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o estudante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maria">Maria Silva</SelectItem>
                <SelectItem value="joao">João Santos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="Foto do usuário" />
              <AvatarFallback>RP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-grow py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Visão Geral - {student.name}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Frequência
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.attendance}%</div>
                <Progress value={student.attendance} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Próxima Tarefa
                </CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.nextAssignment}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrega em 3 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo Cantina
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {student.canteenBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Atualizado hoje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notificações
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.notifications}
                </div>
                <p className="text-xs text-muted-foreground">Novas mensagens</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="grades" className="w-full">
              <TabsList>
                <TabsTrigger value="grades">Notas Recentes</TabsTrigger>
                <TabsTrigger value="schedule">Horário</TabsTrigger>
                <TabsTrigger value="assignments">Tarefas</TabsTrigger>
              </TabsList>
              <TabsContent value="grades">
                <Card>
                  <CardHeader>
                    <CardTitle>Notas Recentes</CardTitle>
                    <CardDescription>
                      Desempenho nas últimas avaliações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {student.recentGrades.map((grade, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{grade.subject}</span>
                        <Badge
                          variant={grade.grade >= 7 ? "default" : "destructive"}
                        >
                          {grade.grade.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Horário de Aulas</CardTitle>
                    <CardDescription>
                      Horário semanal de {student.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>O horário detalhado estará disponível em breve.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="assignments">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas Pendentes</CardTitle>
                    <CardDescription>Próximas tarefas e prazos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Lista de tarefas pendentes será exibida aqui.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
