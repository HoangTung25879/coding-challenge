import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <AlertDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lead</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            Are you sure you want to delete this lead? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
