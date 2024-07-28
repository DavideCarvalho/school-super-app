import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { TabsContent } from "@acme/ui/tabs";

export default function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    // <TabsContent value="presencas">
    <Card>
      <CardHeader>
        <CardTitle>Presenças</CardTitle>
        <CardDescription>
          Veja e adicione A presença de todos os alunos dessa turma.
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
    // </TabsContent>
  );
}
