import { 
  Dialog, DialogContent, 
  DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, BookOpen, Users, Hash, Info, UserCheck, Gamepad2 } from "lucide-react";
import { ITable } from "@/interfaces/table";
import { toast } from "sonner";

interface CampaignDetailsModalProps {
  table: ITable;
  children: React.ReactNode;
}

export function CampaignDetailsModal({ table, children }: CampaignDetailsModalProps) {
  const copyInviteCode = () => {
    if (!table.inviteCode) return;
    navigator.clipboard.writeText(table.inviteCode);
    toast.success("Código de convite copiado!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3">
          {children}
        </div>
      </DialogTrigger>
      
      <DialogContent className="glass-card border-primary/20 w-[95vw] max-w-2xl shadow-2xl overflow-hidden p-0 flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho Visual Épico */}
        <div className="relative h-32 w-full bg-gradient-to-br from-primary/30 via-zinc-900 to-black p-6 flex flex-col justify-end">
          <div className="absolute top-4 right-6 opacity-10">
            <BookOpen size={80} />
          </div>
          <div className="z-10">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase text-[9px] mb-2 tracking-widest font-black">
              {table.system?.name || "Sistema Customizado"}
            </Badge>
            <DialogTitle className="font-display text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">
              {table.name}
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          
          {/* 1. Bio / Descrição */}
          <section className="space-y-3">
            <h4 className="text-[10px] uppercase text-primary font-black flex items-center gap-2 tracking-[0.2em]">
              <Info size={14} /> Descrição da Campanha
            </h4>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
              <p className="text-sm text-zinc-300 leading-relaxed font-serif italic">
                {table.description || "Nenhuma descrição foi escrita para esta jornada ainda..."}
              </p>
            </div>
          </section>

          {/* 2. Código de Convite */}
          <section className="space-y-3">
            <h4 className="text-[10px] uppercase text-primary font-black flex items-center gap-2 tracking-[0.2em]">
              <Hash size={14} /> Código de Convite
            </h4>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-3 rounded-lg group">
              <code className="flex-1 font-mono text-lg text-primary font-bold tracking-widest px-2 uppercase">
                {table.inviteCode}
              </code>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyInviteCode}
                className="text-zinc-500 hover:text-primary transition-all"
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-[9px] text-zinc-500 uppercase font-medium px-1">Compartilhe com novos aventureiros.</p>
          </section>

          <Separator className="bg-white/5" />

          {/* 3. Lista de Aventureiros (Jogador + Personagem) ✨ */}
          <section className="space-y-4">
            <h4 className="text-[10px] uppercase text-primary font-black flex items-center gap-2 tracking-[0.2em]">
              <Users size={14} /> Grupo de Heróis ({table.players?.length || 0})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* O Mestre em destaque */}
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-primary/40 ring-2 ring-primary/20">
                  <AvatarImage src={table.gm?.avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-zinc-900 text-primary font-bold">GM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tighter">{table.gm?.username}</p>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Mestre da Mesa</p>
                </div>
                <UserCheck size={14} className="ml-auto text-primary" />
              </div>

              {/* Jogadores & Personagens */}
              {table.players?.map((player) => (
                <div key={player.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                  
                  {/* Avatares Sobrepostos */}
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={player.character?.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-zinc-900 text-zinc-500 font-bold">
                        { 
                        player.character?.avatarUrl && player.character?.avatarUrl.length <= 5 ?
                          player.character?.avatarUrl :
                          player.character?.firstName?.charAt(0).toUpperCase() || "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Mini avatar do utilizador real */}
                    <Avatar className="absolute -bottom-1 -right-1 h-4 w-4 border border-zinc-900 ring-1 ring-zinc-800">
                      <AvatarImage src={player.user?.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary text-[8px] font-bold text-white">
                        { 
                          player.user?.avatarUrl && player.user?.avatarUrl.length <= 5 ?
                          player.user?.avatarUrl :
                          player.user?.username?.charAt(0).toUpperCase() || "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Informação do Personagem e do Jogador */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-200 truncate">
                      {player.character?.firstName} {player.character?.lastName}
                    </p>
                    <p className="text-[9px] text-zinc-500 uppercase font-black truncate">
                       {player.character?.class} • Lvl {player.character?.level || 1}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-primary/80 font-medium">
                      <Gamepad2 size={10} />
                      <span className="truncate">Jogado por <strong className="text-primary">@{player.user?.username}</strong></span>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end shrink-0">
          <DialogDescription className="sr-only">Informações completas sobre a campanha RPG.</DialogDescription>
          <Button variant="ghost" className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest h-8" asChild>
            <DialogTrigger>Fechar</DialogTrigger>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}