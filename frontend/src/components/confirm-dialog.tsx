import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  loading 
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-950 border border-red-500/20 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)] rounded-2xl p-6 w-full max-w-md m-4 space-y-6 animate-in zoom-in-95">
        
        {/* Cabeçalho do Alerta */}
        <div className="flex items-center gap-4 text-red-500">
          <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-display font-bold uppercase tracking-wider">{title}</h2>
        </div>

        {/* Mensagem */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button"
            variant="ghost" 
            onClick={onClose} 
            disabled={loading} 
            className="hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-muted-foreground"
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            variant="destructive" 
            onClick={onConfirm} 
            disabled={loading} 
            className="bg-red-600 hover:bg-red-700 shadow-glow"
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Sim, Destruir
          </Button>
        </div>
      </div>
    </div>
  );
}