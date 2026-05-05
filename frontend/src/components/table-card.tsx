import { Crown, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ITable } from "@/interfaces/table";

interface TableCardProps {
  table: ITable;
  isMestre: boolean;
  onActionClick?: (tableId: string) => void;
}

export function TableCard({ table, isMestre, onActionClick }: TableCardProps) {
  return (
    <article className="glow-card p-6 flex flex-col h-full bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl">
      
      {/* LINHA 1: Sistema e Indicador de Mestre */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary truncate flex-1">
          {table.system?.name || "Sistema Customizado"}
        </span>
        
        {isMestre && (
          <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs text-primary whitespace-nowrap flex items-center gap-1">
            <Crown size={12} /> Mestre
          </span>
        )}
      </div>

      {/* LINHA 2: Nome da Campanha */}
      <h3 className="font-display text-xl text-card-foreground break-words leading-tight">
        {table.name}
      </h3>

      {/* DESCRIÇÃO */}
      <p className="mt-3 text-sm text-muted-foreground line-clamp-3 flex-1">
        {table.description || "Sem descrição disponível para esta aventura."}
      </p>

      {/* RODAPÉ DO CARD */}
      <div className="mt-5 space-y-2 text-xs text-muted-foreground">
        { !isMestre && (
          <p className="flex items-center gap-2">
            <Crown size={14} className="text-primary" /> 
            {table.gm?.username || "Mestre Desconhecido"}
          </p>
        )}
        <p className="flex items-center gap-2">
          <Users size={14} className="text-primary" /> 
          {table.players?.length || 0} aventureiros na party
        </p>
      </div>

      {/* BOTÃO DE AÇÃO */}
      <Button 
        variant={isMestre ? "outline" : "default"}
        onClick={() => onActionClick && onActionClick(table.id)}
        className={`mt-5 w-full shadow-glow hover:opacity-90 transition-all ${
          isMestre 
            ? 'border-primary text-primary hover:bg-primary/10' 
            : 'bg-gradient-primary text-primary-foreground'
        }`}
      >
        {isMestre ? (
          "Gerenciar Campanha"
        ) : (
          <span className="flex items-center gap-2">
            Entrar na Mesa <ArrowRight size={16} />
          </span>
        )}
      </Button>
    </article>
  );
}