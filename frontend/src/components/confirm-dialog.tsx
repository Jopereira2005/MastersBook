import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  loading, 
  children 
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="glass-card border-destructive/20 shadow-glow max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-display font-bold text-red-500 uppercase tracking-wide">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Espaço para conteúdo extra (como o campo de senha no Perfil) */}
        {children && <div className="py-2">{children}</div>}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            disabled={loading} 
            onClick={onClose}
            className="bg-transparent border-white/10 hover:bg-white/5 text-white"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Evita fechar antes da lógica terminar se necessário
              onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90 font-bold"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}