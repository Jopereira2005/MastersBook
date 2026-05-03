import { useState, useEffect } from "react";
import { Users, UserPlus, UserMinus, Check, X, Loader2, Search, Ghost } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { friendshipService } from "@/services/friendship.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Interface baseada no DTO que o teu backend retorna
export interface IFriendItem {
  friendshipId: string;
  friendId: string;
  username: string;
  avatarUrl: string | null;
}

const Amigos = () => {
  const { user } = useAuth();
  
  // Estados de Dados
  const [amigos, setAmigos] = useState<IFriendItem[]>([]);
  const [pendentes, setPendentes] = useState<IFriendItem[]>([]);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user?.id) {
      carregarAmizades();
    }
  }, [user?.id]);

  const carregarAmizades = async () => {
    setIsLoading(true);
    try {
      const [listaAmigos, listaPendentes] = await Promise.all([
        friendshipService.getFriends(user!.id),
        friendshipService.getPending(user!.id)
      ]);
      setAmigos(listaAmigos);
      setPendentes(listaPendentes);
    } catch (error: any) {
      toast.error(error.message || "Erro ao invocar a sua lista de contatos.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enviar pedido de amizade DIRETO pelo username
   */
  const handleSendRequest = async () => {
    const target = searchQuery.trim();
    if (!target) return;
    
    if (target.toLowerCase() === user?.username?.toLowerCase()) {
      return toast.warning("Você não pode enviar um pedido a si mesmo, lobo solitário.");
    }

    setIsSearching(true);
    try {
      // O Backend recebe o username no campo target/user2Id e processa a busca
      await friendshipService.sendRequest(user!.id, target);
      
      toast.success(`Coruja enviada para @${target}!`);
      setSearchQuery(""); 
      carregarAmizades(); 
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar o convite para a party.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    setIsActionLoading(friendshipId);
    try {
      await friendshipService.acceptRequest(friendshipId);
      toast.success("Novo aliado adicionado à party!");
      carregarAmizades(); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDecline = async (friendshipId: string) => {
    setIsActionLoading(friendshipId);
    try {
      await friendshipService.declineRequest(friendshipId);
      toast.info("Solicitação de amizade recusada.");
      setPendentes(prev => prev.filter(p => p.friendshipId !== friendshipId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm("Deseja realmente remover este aliado da sua party?")) return;
    
    setIsActionLoading(friendshipId);
    try {
      await friendshipService.removeFriend(friendshipId);
      toast.success("Aliado removido.");
      setAmigos(prev => prev.filter(a => a.friendshipId !== friendshipId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* HEADER E BARRA DE PESQUISA */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Social</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">Sua Party</h1>
          <p className="text-muted-foreground text-sm">Gerencie seus aliados e pedidos de amizade.</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
            <Input 
              placeholder="Convide pelo username ou email..." 
              className="pl-10 bg-background/40 border-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
            />
          </div>
          <Button 
            onClick={handleSendRequest} 
            disabled={!searchQuery.trim() || isSearching}
            className="bg-gradient-primary shadow-glow hover:scale-105 transition-transform"
          >
            {isSearching ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-70">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-muted-foreground font-display tracking-widest uppercase text-xs">Localizando aliados...</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          
          {/* COLUNA ESQUERDA: LISTA DE ALIADOS (ESTILO ADVENTURER LICENSE) */}
          <section className="space-y-6">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2 text-foreground/90 tracking-wide">
              <Users className="text-primary" size={20}/> Aliados da Party
            </h2>

            {amigos.length === 0 ? (
              <div className="text-center p-16 glass-card border-dashed border-primary/10">
                <Ghost className="mx-auto mb-4 text-primary/20" size={48} />
                <p className="text-muted-foreground italic text-sm">Sua party ainda está vazia. Invoque novos aliados!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {amigos.map((friend) => (
                  <div 
                    key={friend.friendshipId} 
                    className="glow-card flex items-center gap-5 p-5 bg-card/30 backdrop-blur-sm border border-primary/10 rounded-2xl transition-all hover:border-primary/40 hover:bg-card/50 group"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-glow transition-transform group-hover:scale-105">
                        <AvatarFallback className="bg-zinc-900 text-primary text-3xl font-display uppercase font-bold">
                          {friend.avatarUrl || friend.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background shadow-lg" title="Pronto para o combate"></div>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Aventureiro</span>
                      </div>
                      <p className="font-display text-xl font-bold text-white tracking-tight break-all">
                        @{friend.username}
                      </p>
                      <p className="text-xs text-muted-foreground italic line-clamp-1">
                        Aliado jurado do MastersBook
                      </p>
                    </div>

                    <div className="shrink-0 ml-auto">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={isActionLoading === friend.friendshipId}
                        onClick={() => handleRemove(friend.friendshipId)}
                        className="h-10 w-10 text-muted-foreground/60 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors border border-border/40 hover:border-red-900"
                        title="Remover aliado"
                      >
                        {isActionLoading === friend.friendshipId ? (
                          <Loader2 size={18} className="animate-spin text-primary" />
                        ) : (
                          <UserMinus size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COLUNA DIREITA: PEDIDOS PENDENTES */}
          <aside className="space-y-6">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2 text-foreground/90">
              <UserPlus className="text-primary" size={20}/> Pedidos Pendentes
            </h2>

            <div className="space-y-3">
              {pendentes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/5 p-4 rounded-lg border border-border/50 text-center">
                  Sem corujas de convite no momento.
                </p>
              ) : (
                pendentes.map((req) => (
                  <div key={req.friendshipId} className="glass-card p-4 space-y-4 border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarFallback className="bg-zinc-800 text-primary">
                          {req.avatarUrl || req.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">@{req.username}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Quer entrar na party</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAccept(req.friendshipId)} 
                        disabled={isActionLoading === req.friendshipId}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 h-8 text-xs gap-1"
                      >
                        {isActionLoading === req.friendshipId ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                        Aceitar
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => handleDecline(req.friendshipId)}
                        disabled={isActionLoading === req.friendshipId}
                        className="flex-1 h-8 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400 border border-border/50"
                      >
                        <X size={14} className="mr-1"/> Recusar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

        </div>
      )}
    </div>
  );
};

export default Amigos;