import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, loading, children }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-zinc-950 border border-red-500/20 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-glow">
        <h2 className="text-xl font-display font-bold text-red-500 uppercase">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
        
        {/* Renderiza o campo de senha se ele for passado */}
        {children && <div className="py-2">{children}</div>}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirmar Exclusão"}
          </Button>
        </div>
      </div>
    </div>
  );
}