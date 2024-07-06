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
          <AlertDialogTitle>Trocar grade de horários?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              Você já tem uma grade de horários para essa turma. Salvar uma nova
              grade de horários encerrará o período letivo atual e começará um
              novo período letivo.
            </p>
            <p>
              Se o período letivo atual não tiver terminado, sua data de término
              será alterada para hoje, e o novo período letivo será criado com a
              data de início para amanhã.
            </p>
            <p>
              Caso não tenha um período letivo em andamento, o período letivo
              criado terá a data de início como hoje e a data de término para o
              ano que vem.
            </p>
            <p>
              Não se preocupe, o período letivo pode ser alterado na lista de
              períodos letivos.
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
