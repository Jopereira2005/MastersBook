import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Calendar, Cloud, ScrollText, 
  Globe2, BookText, Quote
} from "lucide-react";
import { ITableState } from "@/interfaces/table-state";
import { Button } from "./ui/button";

interface TableStateModalProps {
  state: ITableState | undefined;
  children: React.ReactNode;
}

export function TableStates({ state, children }: TableStateModalProps) {
  if (!state) return <>{children}</>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      
      <DialogContent className="glass-card border-primary/20 w-[95vw] max-w-lg shadow-2xl overflow-hidden p-0 flex flex-col max-h-[85vh]">
        
        {/* Cabeçalho do Estado do Mundo */}
        <div className="p-6 bg-gradient-to-b from-primary/10 to-transparent border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Globe2 size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl uppercase tracking-wider text-white">
                Estado do Mundo
              </DialogTitle>
              <DialogDescription className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">
                Crónicas e Condições da Região
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Informações Rápidas (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center">
              <MapPin size={16} className="text-primary mb-2" />
              <span className="text-[8px] uppercase text-zinc-500 font-black mb-1">Localização</span>
              <span className="text-xs font-bold text-zinc-200">{state.currentLocation || "Desconhecido"}</span>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center">
              <Calendar size={16} className="text-primary mb-2" />
              <span className="text-[8px] uppercase text-zinc-500 font-black mb-1">Data In-Game</span>
              <span className="text-xs font-bold text-zinc-200">{state.inGameDate || "Era Incerta"}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center">
              <Cloud size={16} className="text-primary mb-2" />
              <span className="text-[8px] uppercase text-zinc-500 font-black mb-1">Clima Atual</span>
              <span className="text-xs font-bold text-zinc-200 capitalize">{state.weather || "Céu Limpo"}</span>
            </div>
          </div>

          {/* Notas Narrativas (O Coração da História) ✨ */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] uppercase text-primary font-black flex items-center gap-2 tracking-[0.2em]">
              <BookText size={14} /> Notas do Narrador
            </h4>
            <div className="relative group">
              <Quote size={40} className="absolute -top-2 -left-2 text-primary/10 rotate-180" />
              <div className="bg-black/40 border border-primary/10 p-5 rounded-2xl shadow-inner italic leading-relaxed text-zinc-300 text-sm font-serif">
                {state.publicNotes ? (
                  <div className="whitespace-pre-wrap">{state.publicNotes}</div>
                ) : (
                  <span className="text-zinc-600">O mestre ainda não registou notas públicas nesta sessão...</span>
                )}
              </div>
              <Quote size={40} className="absolute -bottom-2 -right-2 text-primary/10" />
            </div>
          </div>

          {/* Cena Ativa */}
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between">
             <div className="flex items-center gap-2">
               <ScrollText size={14} className="text-primary" />
               <span className="text-[10px] uppercase font-bold text-zinc-400">Cena Atual</span>
             </div>
             <Badge className="bg-primary text-primary-foreground font-black text-[10px]">
               {state.activeScene || "Exploração"}
             </Badge>
          </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
          <Button variant="ghost" className="text-zinc-500 text-[10px] uppercase font-bold h-8" asChild>
            <DialogTrigger>Fechar Relatório</DialogTrigger>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}