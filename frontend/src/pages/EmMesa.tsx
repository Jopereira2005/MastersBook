import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, MapPin, Calendar, Cloud, Users, 
  ChevronRight, Sword, ScrollText, 
  Settings2, MessageSquare, ThermometerSun, Save,
  Heart, Zap, UserMinus, LogOut, Activity
} from "lucide-react";

// Hooks e Contextos
import { useGameSession } from "@/hooks/use-game-session";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet, SheetContent, SheetHeader, 
  SheetTitle, SheetTrigger, SheetDescription 
} from "@/components/ui/sheet";

// Componentes Customizados
import { CampaignDetailsModal } from "@/components/campaign-details-modal";
import { GMController } from "@/components/gm-controller";
import { AttributeController } from "@/components/attribute-controller";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ChatStory } from "@/components/chat-story";
import { ChatOOC } from "@/components/chat-ooc";
import { SystemLogs } from "@/components/system-logs";
import { tableService } from "@/services/table.service";
import { toast } from "sonner";

export default function EmMesa() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { 
    data: table, 
    loading, 
    updateState, 
    updatePlayerNotes, 
    updatePlayerStatus,
    messages,
    sendMessage,
    rollDice,
    loadMoreMessages,
    hasMoreMessages,
    editMessage,
    deleteMessage,
    syncCharacterAttributes
  } = useGameSession(id);

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [playerToRemove, setPlayerToRemove] = useState<{id: string, name: string} | null>(null);
  console.log(table);
  const currentPlayerLink = table?.players?.find(p => p.userId === user?.id);
  const [notesBuffer, setNotesBuffer] = useState("");

  useEffect(() => {
    if (currentPlayerLink) {
      setNotesBuffer(currentPlayerLink.privateNotes || "");
    }
  }, [currentPlayerLink?.privateNotes]);

  useEffect(() => {
    if (!loading && table && user) {
      const isGM = user.id === table.gmId;
      const isPlayer = table.players?.some(p => p.userId === user.id);
      if (!isGM && !isPlayer) {
        toast.error("Acesso Negado!");
        navigate("/mesas");
      }
    }
  }, [table, loading, user, navigate]);

  if (loading || !table) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="font-display text-sm text-primary/70 uppercase tracking-widest">Sintonizando realidade...</p>
      </div>
    );
  }

  const isGM = user?.id === table.gmId;
  const state = table.state;

  // ✨ FUNÇÃO CORRIGIDA: Agora recebe o targetUserId e não o id da relação
  const handleRemovePlayer = async (targetUserId: string) => {
    if (!id || !user) return;
    try {
      await tableService.removePlayer(id, targetUserId, user.id);
      
      if (targetUserId === user.id) {
        toast.success("Você abandonou a mesa.");
        navigate("/mesas");
      } else {
        toast.success("Jogador removido.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover jogador.");
    } finally {
      setPlayerToRemove(null);
    }
  };

  const renderSidebar = () => (
    <Tabs defaultValue="party" className="flex-1 flex flex-col h-full w-full overflow-hidden">
      <div className="px-4 pt-4 shrink-0">
        <TabsList className="w-full bg-black/40 border border-white/5 p-1 h-auto flex flex-wrap">
          <TabsTrigger value="party" className="flex-1 min-w-[60px] text-[10px] md:text-xs gap-1 py-2"><Users size={14}/> Party</TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 min-w-[60px] text-[10px] md:text-xs gap-1 py-2"><MessageSquare size={14}/> Chat</TabsTrigger>
          <TabsTrigger value="logs" className="flex-1 min-w-[60px] text-[10px] md:text-xs gap-1 py-2"><Activity size={14}/> Logs</TabsTrigger>
          {currentPlayerLink && (
            <TabsTrigger value="notes" className="flex-1 min-w-[60px] text-[10px] md:text-xs gap-1 py-2"><ScrollText size={14}/> Notas</TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="party" className="flex-1 overflow-hidden flex-col m-0 p-4 data-[state=active]:flex data-[state=inactive]:hidden">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 shrink-0 px-1">Membros da Party</h3>
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4 pb-10">
            {table.players?.map((player) => {
              const isMe = player.userId === user?.id;
              const canEdit = isGM || isMe; 
              const baseKeys = ["hp", "mana", "mp", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "level"];

              return (
                <div key={player.id} className="group relative p-3 rounded-xl bg-white/5 border border-white/5 space-y-3 transition-all hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                      <AvatarImage src={player.character?.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-zinc-900 text-primary text-xs">
                        {player.character?.firstName?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-white truncate">{player.character?.firstName} {isMe && "(Você)"}</p>
                      <p className="text-[10px] text-zinc-500 uppercase truncate">{player.character?.class} • Lvl {player.currentAttributes?.level ?? player.character?.level ?? 1}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <AttributeController 
                        player={player} 
                        onUpdate={updatePlayerStatus} 
                        canEdit={canEdit}
                        onSyncCharacter={syncCharacterAttributes}
                        isOwner={isMe}
                      >
                        <Button variant="ghost" size="icon" className={`h-7 w-7 transition-all ${canEdit ? 'text-zinc-400 hover:text-primary' : 'text-zinc-500 hover:text-white opacity-40 group-hover:opacity-100'}`}>
                          {canEdit ? <Settings2 size={12} /> : <ScrollText size={12} />}
                        </Button>
                      </AttributeController>

                      {/* ✨ CORREÇÃO: Enviamos o player.userId! em vez de player.id! */}
                      {isGM && !isMe && (
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => setPlayerToRemove({ id: player.userId!, name: player.character?.firstName || "este jogador" })}
                        >
                          <UserMinus size={12} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold">
                        <span className="flex items-center gap-1 text-red-400/80"><Heart size={8}/> Vida</span>
                        <div className="flex gap-2">
                          {player.temporaryAttributes?.tempHp > 0 && (
                            <span className="text-amber-400">+{player.temporaryAttributes.tempHp} Escudo</span>
                          )}
                          <span className="text-zinc-300">
                            {player.currentAttributes?.hp || 0} / {player.character?.attributes?.hp || 1}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-1.5 w-full bg-red-950/30 rounded-full overflow-hidden border border-red-500/10">
                        <div className="absolute h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700 shadow-[0_0_8px_rgba(239,68,68,0.4)]" style={{ width: `${Math.min(100, Math.max(0, ((player.currentAttributes?.hp || 0) / (player.character?.attributes?.hp || 1)) * 100))}%` }} />
                        {player.temporaryAttributes?.tempHp > 0 && (
                          <div className="absolute h-full bg-amber-400/60 transition-all duration-500" style={{ width: `${Math.min(100, (player.temporaryAttributes.tempHp / (player.character?.attributes?.hp || 1)) * 100)}%` }} />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-cyan-400/80">
                        <span className="flex items-center gap-1"><Zap size={8}/> Mana</span>
                        <span>{player.currentAttributes?.mana || 0} / {player.character?.attributes?.mana || 1}</span>
                      </div>
                      <div className="h-1.5 w-full bg-cyan-950/30 rounded-full overflow-hidden border border-cyan-500/10">
                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700 shadow-[0_0_8px_rgba(34,211,238,0.4)]" style={{ width: `${Math.min(100, Math.max(0, ((player.currentAttributes?.mana || 0) / (player.character?.attributes?.mana || 1)) * 100))}%` }} />
                      </div>
                    </div>

                    {player.currentAttributes && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(player.currentAttributes)
                          // ✨ CORREÇÃO: Ignoramos as chaves base e também qualquer Objeto!
                          .filter(([key, value]) => !baseKeys.includes(key) && typeof value !== 'object' && value !== null)
                          .map(([key, value]) => (
                            <div key={key} className="flex flex-col bg-black/20 rounded px-2 py-1 border border-white/5">
                              <span className="text-[7px] text-zinc-500 uppercase font-black truncate">{key}</span>
                              <span className="text-[10px] font-mono text-primary leading-none">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {player.conditions && player.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/5">
                        {player.conditions.map((cond, idx) => (
                          <Badge key={idx} variant="outline" className="bg-red-950/30 text-red-400 border-red-500/20 text-[8px] uppercase px-1.5 py-0">{cond}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="notes" className="flex-1 m-0 p-4 space-y-3 overflow-y-auto flex-col data-[state=active]:flex data-[state=inactive]:hidden">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Grimório Pessoal</h3>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] text-primary hover:bg-primary/10" onClick={() => updatePlayerNotes(currentPlayerLink!.userId!, notesBuffer)}>
            <Save size={12} className="mr-1"/> Salvar
          </Button>
        </div>
        <div className="relative group flex-1">
          <Textarea className="h-full min-h-[400px] w-full bg-black/20 border-white/5 resize-none text-xs leading-relaxed p-4 pb-10" value={notesBuffer} onChange={(e) => setNotesBuffer(e.target.value)} />
          {notesBuffer !== (currentPlayerLink?.privateNotes || "") && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] text-amber-500 animate-pulse bg-black/60 px-2 py-1 rounded-md pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Não Salvo
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="chat" className="flex-1 h-full w-full overflow-hidden m-0 flex-col data-[state=active]:flex data-[state=inactive]:hidden">
        <ChatOOC 
          messages={messages || []} 
          currentUser={user} 
          onSendMessage={sendMessage} 
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
          onEdit={editMessage}
          onDelete={deleteMessage}
        />
      </TabsContent>

      <TabsContent value="logs" className="flex-1 h-full w-full overflow-hidden m-0 flex-col data-[state=active]:flex data-[state=inactive]:hidden">
        <SystemLogs messages={messages || []} />
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden relative">
      <header className="h-16 border-b border-primary/20 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-30 shrink-0 relative">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <CampaignDetailsModal table={table}>
            <div className="min-w-0 text-left">
              <h1 className="font-display text-sm md:text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
                {table.name}
              </h1>
              <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-primary font-bold">
                {table.system?.name}
              </p>
            </div>
          </CampaignDetailsModal>

          <Separator orientation="vertical" className="h-8 bg-zinc-800 hidden xs:block" />
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-2 text-zinc-400"><MapPin size={12} /><span className="text-[10px]">{state?.currentLocation || "Local Desconhecido"}</span></div>
            <div className="flex items-center gap-2 text-zinc-400"><Calendar size={12} /><span className="text-[10px]">{state?.inGameDate || "Data Incerta"}</span></div>
            <div className="flex items-center gap-2 text-zinc-400"><Cloud size={12} /><span className="text-[10px] capitalize">{state?.weather || "Céu Limpo"}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGM && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary/20 text-primary text-[10px] md:text-xs font-bold shadow-glow h-8 md:h-9">
                  <Settings2 size={14} className="md:mr-2" /><span className="hidden md:inline">Painel do Mestre</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-card border-l border-primary/20 w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="font-display text-2xl gradient-text flex items-center gap-2"><ThermometerSun className="text-primary" /> Mundo</SheetTitle>
                  <SheetDescription className="sr-only">Painel de controle do mestre.</SheetDescription>
                </SheetHeader>
                <GMController initialState={table.state} onUpdate={updateState} />
              </SheetContent>
            </Sheet>
          )}

          {!isGM && currentPlayerLink && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 text-[10px] font-bold gap-1 h-8 px-2"
              onClick={() => setPlayerToRemove({ id: user!.id, name: "esta mesa" })}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Abandonar</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate("/mesas")} className="text-zinc-500 hover:text-white text-xs">Sair</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 relative flex flex-col min-w-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black overflow-hidden">
          
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none z-0">
             <ScrollText size={250} className="text-primary mb-8" />
             <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-[0.4em] text-center max-w-4xl px-4">
               {state?.activeScene || "A Lenda Começa"}
             </h2>
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-2xl z-20">
             <div className="bg-primary/20 p-1.5 md:p-2 rounded-full"><Sword size={12} className="text-primary" /></div>
             <div className="flex items-center gap-2 px-1">
                {table.players?.slice(0, 5).map((p, i) => (
                  <Avatar key={i} className={`h-6 w-6 md:h-8 md:w-8 border ${i === 0 ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 opacity-60'}`}>
                    <AvatarImage src={p.character?.avatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="text-[8px] md:text-[10px] bg-zinc-900">
                      {p.character?.firstName?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
             </div>
          </div>

          <div className="absolute top-[70px] md:top-[80px] left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
             <span className="text-[9px] uppercase tracking-[0.3em] text-primary/80 font-bold bg-black/40 px-4 py-1 rounded-full border border-primary/20 backdrop-blur-md shadow-lg">
               Cena Atual: {state?.activeScene || "Exploração Livre"}
             </span>
          </div>

          <div className="flex-1 w-full h-full relative z-10 overflow-hidden">
            <ChatStory 
              messages={messages || []}
              currentUser={user}
              currentPlayer={currentPlayerLink}
              isGM={isGM}
              onSendMessage={sendMessage}
              onRollDice={rollDice}
            />
          </div>
        </main>

        <aside 
          className={`
            ${sidebarOpen ? (isMobile ? 'w-[85vw]' : 'w-80') : 'w-0'} 
            ${isMobile ? 'absolute right-0 h-full z-40' : 'relative h-full z-20'}
            transition-all duration-300 ease-in-out flex flex-col
          `}
        >
          <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 pointer-events-none shadow-2xl" />

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`
              absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 z-50 cursor-pointer
              ${sidebarOpen 
                ? '-left-4 h-9 w-9 bg-zinc-800 border border-white/10 rounded-full text-zinc-400 hover:text-white shadow-xl rotate-0' 
                : '-left-8 h-20 w-8 bg-primary/20 border-y border-l border-primary/30 rounded-l-2xl text-primary hover:bg-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)]'}
            `}
          >
            {sidebarOpen ? <ChevronRight size={20} className="mr-0.5" /> : <Users size={18} className="ml-1" />}
          </button>

          <div className="w-full h-full overflow-hidden relative z-10">
            <div className="w-[85vw] md:w-80 h-full flex flex-col">
              {renderSidebar()}
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog 
        isOpen={!!playerToRemove} 
        onClose={() => setPlayerToRemove(null)} 
        onConfirm={() => playerToRemove && handleRemovePlayer(playerToRemove.id)} 
        title={playerToRemove?.id === user?.id ? "Abandonar Sessão?" : "Expulsar Jogador?"}
        description={playerToRemove?.id === user?.id 
          ? "Tens a certeza que desejas abandonar esta jornada?" 
          : `Deseja remover ${playerToRemove?.name} desta aventura permanentemente?`
        }
      />
    </div>
  );
}