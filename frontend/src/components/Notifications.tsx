import { useState, useEffect, useRef } from "react";
import { Bell, UserPlus, Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { friendshipService, IFriendItem } from "@/services/friendship.service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [open, setOpen] = useState(false);
  const [pendentes, setPendentes] = useState<IFriendItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  
  const ref = useRef<HTMLDivElement>(null);

  // Fecha o menu de notificações ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Busca as notificações quando o menu é aberto
  useEffect(() => {
    if (open && user?.id) {
      carregarNotificacoes();
    }
  }, [open, user?.id]);

  const carregarNotificacoes = async () => {
    setIsLoading(true);
    try {
      const data = await friendshipService.getPending(user!.id);
      setPendentes(data);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    setIsActionLoading(friendshipId);
    try {
      await friendshipService.acceptRequest(friendshipId);
      toast.success("Novo aliado adicionado à party!");
      setPendentes(prev => prev.filter(p => p.friendshipId !== friendshipId));
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
      toast.info("Solicitação recusada.");
      setPendentes(prev => prev.filter(p => p.friendshipId !== friendshipId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const unreadCount = pendentes.length;

  return (
    <div className="relative" ref={ref}>
      {/* SINO DE NOTIFICAÇÃO */}
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-glow animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {/* PAINEL FLUTUANTE */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl bg-background/95 backdrop-blur-md border border-primary/20 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-4 border-b border-primary/10 bg-card/50 flex items-center justify-between">
            <h3 className="font-display font-bold text-white">Notificações</h3>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-semibold">
              {unreadCount} Novas
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : pendentes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Bell size={32} className="opacity-20 mb-3" />
                <p className="text-sm italic">A taverna está silenciosa...</p>
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {pendentes.map((req) => (
                  <div key={req.friendshipId} className="p-4 hover:bg-primary/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarFallback className="bg-zinc-800 text-primary">
                          {req.avatarUrl || req.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm text-foreground leading-tight">
                          <span className="font-bold text-primary">@{req.username}</span> quer entrar na tua party.
                        </p>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAccept(req.friendshipId)}
                            disabled={isActionLoading === req.friendshipId}
                            className="h-7 text-[10px] flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-glow"
                          >
                            {isActionLoading === req.friendshipId ? <Loader2 size={12} className="animate-spin"/> : <Check size={12} className="mr-1"/>}
                            Aceitar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDecline(req.friendshipId)}
                            disabled={isActionLoading === req.friendshipId}
                            className="h-7 text-[10px] flex-1 border-border/50 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <X size={12} className="mr-1"/> Recusar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RODAPÉ DO PAINEL */}
          <div className="p-3 border-t border-primary/10 bg-card/50 text-center">
            <button 
              onClick={() => {
                setOpen(false);
                navigate('/amigos');
              }}
              className="text-xs text-primary hover:text-primary/80 font-semibold uppercase tracking-widest transition-colors"
            >
              Ver todos os amigos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}