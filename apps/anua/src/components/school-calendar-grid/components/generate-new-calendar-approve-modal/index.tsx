import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface GenerateNewCalendarApproveModalProps {
  open: boolean;
  onContinue: () => void;
  closeModal: () => void;
}

export function GenerateNewCalendarApproveModal({
  open,
  onContinue,
  closeModal,
}: GenerateNewCalendarApproveModalProps) {
  async function onApprove() {
    await onContinue();
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Salvar grade de horários?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              Uma grade de horários precisa estar vinculada a um período letivo!
              O período letivo determina o início e o fim das aulas. Se você não
              tiver um período letivo, criaremos um período letivo para você e
              salvaremos a grade de horários!
            </p>
            <p>
              Se você tem um período letivo em andamento, salvaremos a grade no
              período letivo corrente.
            </p>
            <p>
              Não se preocupe, você pode editar o período letivo criado
              automaticamente na tela de períodos letivos.
            </p>
            <p>Deseja continuar?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeModal}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onApprove}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
