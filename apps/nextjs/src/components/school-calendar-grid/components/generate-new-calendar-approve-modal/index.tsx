import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
          <AlertDialogTitle>Trocar grade de horários?</AlertDialogTitle>
          <AlertDialogDescription>
            Você já tem uma grade de horários para essa turma. Salvar uma nova
            grade de horários vai sobrescrever a grade de horários existente.
            Tem certeza que deseja continuar?
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
