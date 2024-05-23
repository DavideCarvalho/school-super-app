import Link from "next/link";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

interface NeedLoginDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function NeedLoginDialog({
  open,
  setOpen,
}: NeedLoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bem vindo ao ConectaProf!</DialogTitle>
          <DialogDescription>
            Pra participar da nossa comunidade, você precisa logar na sua conta.
            Se você não tiver uma conta, não sei preocupe, você pode criar uma
            conta, é simples e fácil! Se você já tem uma conta pelo Anuá, você
            pode colocar o mesmo email aqui para entrar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-between">
          <div>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Talvez depois
            </Button>
          </div>
          <Link href="/login">
            <Button className="bg-orange-600">Logar</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
