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
    <TabsContent value="notas">
      <Card>
        <CardHeader>
          <CardTitle>Atividades pra nota</CardTitle>
          <CardDescription>
            Veja, crie e edite todas as atividades pra nota dessa turma.
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </TabsContent>
  );
}
