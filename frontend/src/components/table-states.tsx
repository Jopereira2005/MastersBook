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
        {/* min-w-0 para proteger o Flexbox pai */}
        <div className="cursor-pointer min-w-0">
          {children}
        </div>
      </DialogTrigger>
      
      <DialogContent className="glass-card border-primary/20 w-[95vw] max-w-lg shadow-2xl overflow-hidden p-0 flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Estado do Mundo */}
        <div className="p-4 md:p-6 bg-gradient-to-b from-primary/10 to-transparent border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/20 p-2 rounded-lg shrink-0">
              <Globe2 size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-display text-lg md:text-xl uppercase tracking-wider text-white truncate">
                Estado do Mundo
              </DialogTitle>
              <DialogDescription className="text-[9px] md:text-[10px] uppercase text-zinc-500 font-bold tracking-widest truncate">
                Crónicas e Condições da Região
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Corpo com Scroll Seguro */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 w-full">
          
          {/* Informações Rápidas (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center min-w-0">
              <MapPin size={16} className="text-primary mb-2 shrink-0" />
              <span className="text-[8px] uppercase text-zinc-500 font-black mb-1">Localização</span>
              <span className="text-xs font-bold text-zinc-200 break-words w-full">{state.currentLocation || "Desconhecido"}</span>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center min-w-0">
              <Calendar size={16} className="text-primary mb-2 shrink-0" />
              <span className="text-[8px] uppercase text-zinc-500 font-black mb-1">Data In-Game</span>
              <span className="text-xs font-bold text-zinc-200 break-words w-full">{state.inGameDate || "Era Incerta"}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center min-w-0">
              <Cloud size={16} className="text-primary mb-2 shrink-0" />
              <span className="text-[8px] uppercase text-zinc-500 font-black mb-1">Clima Atual</span>
              <span className="text-xs font-bold text-zinc-200 capitalize break-words w-full">{state.weather || "Céu Limpo"}</span>
            </div>
          </div>

          {/* Notas Narrativas ✨ (BLINDADO CONTRA TEXTOS GIGANTES) */}
          <section className="space-y-3 pt-2 w-full min-w-0">
            <h4 className="text-[10px] uppercase text-primary font-black flex items-center gap-2 tracking-[0.2em]">
              <BookText size={14} className="shrink-0" /> Notas do Narrador
            </h4>
            
            <div className="relative group w-full min-w-0">
              <Quote size={40} className="absolute -top-2 -left-2 text-primary/10 rotate-180 pointer-events-none" />
              
              {/* Box com altura máxima, scroll interno e controle de quebra de palavras */}
              <div className="bg-black/40 border border-primary/10 p-5 rounded-2xl shadow-inner italic leading-relaxed text-zinc-300 text-sm font-serif max-h-[40vh] overflow-y-auto overflow-x-hidden custom-scrollbar w-full min-w-0">
                {state.publicNotes ? (
                  <p className="whitespace-pre-wrap break-words w-full">
                    {state.publicNotes}
                  </p>
                ) : (
                  <span className="text-zinc-600">O mestre ainda não registou notas públicas nesta sessão...</span>
                )}
              </div>
              
              <Quote size={40} className="absolute -bottom-2 -right-2 text-primary/10 pointer-events-none" />
            </div>
          </section>

          {/* Cena Ativa */}
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between gap-4 w-full min-w-0">
             <div className="flex items-center gap-2 shrink-0">
               <ScrollText size={14} className="text-primary" />
               <span className="text-[10px] uppercase font-bold text-zinc-400">Cena Atual</span>
             </div>
             <Badge className="bg-primary text-primary-foreground font-black text-[10px] truncate max-w-[200px]">
               {state.activeScene || "Exploração"}
             </Badge>
          </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end shrink-0">
          <Button variant="ghost" className="text-zinc-500 text-[10px] uppercase font-bold h-8 tracking-widest" asChild>
            <DialogTrigger>Fechar</DialogTrigger>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}