import { useState, useRef, useEffect } from "react";
import { Send, Dices, ScrollText, Sparkles, Pencil, Trash2, Check, X, Skull, UserCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IMessage } from "@/interfaces/message";
import { ITablePlayer } from "@/interfaces/table-player";
import { IUser } from "@/interfaces/user";
import { toast } from "sonner";

interface ChatStoryProps {
  messages: IMessage[];
  currentUser: IUser | null;
  currentPlayer: ITablePlayer | undefined;
  isGM: boolean;
  onSendMessage: (userId: string, content: string, type: 'STORY' | 'OOC' | 'LOG', characterId?: string | null) => void;
  onRollDice: (userId: string, notation: string, characterId?: string | null) => void;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function ChatStory({ 
  messages, currentUser, currentPlayer, isGM, 
  onSendMessage, onRollDice, onEditMessage, onDeleteMessage 
}: ChatStoryProps) {
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const storyMessages = messages.filter(m => m.type === "STORY" || m.type === "DICE");

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [storyMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !currentUser) return;
    const content = inputValue.trim();

    // 🎲 DADOS (COM MATEMÁTICA AVANÇADA) ✨
    if (content.startsWith("/r ") || content.startsWith("/roll ")) {
      let notation = content.replace(/^\/(r|roll)\s+/, "").toLowerCase();
      
      // 1. Tradução dos Atributos
      if (currentPlayer && currentPlayer.character) {
        const current = currentPlayer.currentAttributes || {};
        const temp = currentPlayer.temporaryAttributes || {};
        const maxAttr = (typeof currentPlayer.character.attributes === 'object' ? currentPlayer.character.attributes : {}) || {};

        const attributesMap = [
          { keys: ['força', 'forca', 'str', 'for'], attr: 'forca' },
          { keys: ['destreza', 'des', 'dex'], attr: 'destreza' },
          { keys: ['constituição', 'constituicao', 'con'], attr: 'constituicao' },
          { keys: ['inteligência', 'inteligencia', 'int'], attr: 'inteligencia' },
          { keys: ['sabedoria', 'sab'], attr: 'sabedoria' },
          { keys: ['carisma', 'car'], attr: 'carisma' },
          { keys: ['nível', 'nivel', 'level', 'lvl'], attr: 'level' },
          { keys: ['hp', 'vida'], attr: 'hp' },
          { keys: ['mana', 'mp'], attr: 'mana' },
        ];

        const customKeys = Object.keys(current).filter(k => !attributesMap.some(a => a.attr === k));
        customKeys.forEach(k => attributesMap.push({ keys: [k.toLowerCase()], attr: k }));

        attributesMap.forEach(group => {
           const baseValue = current[group.attr] !== undefined ? current[group.attr] : maxAttr[group.attr];
           const val = (Number(baseValue) || 0) + (Number(temp[group.attr]) || 0);
           const mod = Math.floor((val - 10) / 2);

           group.keys.forEach(alias => {
              const regexMod = new RegExp(`(^|[^a-zà-ÿ])(mod${alias}|${alias}mod)([^a-zà-ÿ]|$)`, 'g');
              notation = notation.replace(regexMod, `$1${mod}$3`);

              const regexRaw = new RegExp(`(^|[^a-zà-ÿ])(${alias})([^a-zà-ÿ]|$)`, 'g');
              notation = notation.replace(regexRaw, `$1${val}$3`);
           });
        });
      }

      // 2. Limpeza Matemática (O segredo para não dar erro)
      notation = notation.replace(/\s+/g, ''); // Remove todos os espaços "1d20 + 2" -> "1d20+2"
      notation = notation.replace(/\+\+/g, '+'); // Duplo positivo
      notation = notation.replace(/--/g, '+');   // Menos com menos dá mais
      notation = notation.replace(/\+\-/g, '-'); // Mais com menos dá menos
      notation = notation.replace(/\-\+/g, '-'); // Menos com mais dá menos

      // 3. Validação de Segurança
      // Se ainda sobrar palavras com 3+ letras (ex: 'forca' sem ter ficha), bloqueamos
      if (/[a-zà-ÿ]{3,}/.test(notation)) {
        toast.error("Formato inválido ou atributo desconhecido. Dica: não uses atributos se não tiveres ficha associada.");
        return;
      }

      onRollDice(currentUser.id!, notation, currentPlayer?.characterId);
    } 
    // 📜 NARRADOR
    else if (isGM && (content.startsWith("/desc ") || content.startsWith("/narrar "))) {
      const descContent = content.replace(/^\/(desc|narrar)\s+/, "");
      onSendMessage(currentUser.id!, descContent, "STORY", null); 
    } 
    // 🧙‍♂️ NPC
    else if (isGM && content.startsWith("/npc ")) {
      if (!content.includes(":")) {
        toast.error("Formato incorreto. Use: /npc Nome: Fala");
        return;
      }
      const processed = content.replace(/^\/npc\s+/i, "[NPC] ");
      onSendMessage(currentUser.id!, processed, "STORY", null);
    } 
    // 👹 INIMIGO
    else if (isGM && content.startsWith("/enemy ")) {
      if (!content.includes(":")) {
        toast.error("Formato incorreto. Use: /enemy Nome: Fala");
        return;
      }
      const processed = content.replace(/^\/enemy\s+/i, "[ENEMY] ");
      onSendMessage(currentUser.id!, processed, "STORY", null);
    } 
    // 🗣️ JOGADOR
    else {
      onSendMessage(currentUser.id!, content, "STORY", currentPlayer?.characterId);
    }
    setInputValue("");
    setShowCommands(false);
  };

  const handleStartEdit = (msg: IMessage) => {
    setEditingId(msg.id!);
    setEditValue(msg.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    await onEditMessage(editingId, editValue.trim());
    setEditingId(null);
  };

  const insertCommand = (cmd: string) => {
    setInputValue(cmd);
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-primary font-black text-xl mx-1 bg-primary/10 px-1 rounded shadow-sm">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const availableCommands = [
    { cmd: "/r 1d20+1", label: "Rolar Dados", desc: "Ex: 1d20+forca", icon: <Dices size={14}/>, show: true },
    { cmd: "/narrar ", label: "Narrar", desc: "Descreve o cenário", icon: <Sparkles size={14}/>, show: isGM },
    { cmd: "/npc Nome: ", label: "Falar como NPC", desc: "Cria balão verde", icon: <UserCircle size={14}/>, show: isGM },
    { cmd: "/enemy Nome: ", label: "Falar como Inimigo", desc: "Cria balão vermelho", icon: <Skull size={14}/>, show: isGM },
  ].filter(c => c.show);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6">
        {storyMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-30 space-y-4 select-none">
            <ScrollText size={80} className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <h2 className="font-display text-xl uppercase tracking-[0.3em]">A Lenda Começa...</h2>
          </div>
        ) : (
          storyMessages.map((msg, idx) => {
            const isDice = msg.type === "DICE";
            const isMine = msg.userId === currentUser?.id;
            const canDelete = isGM || isMine;
            const canEdit = isMine && !isDice;

            const isGMMessage = msg.type === "STORY" && !msg.characterId;
            const isNPC = isGMMessage && msg.content.startsWith("[NPC] ");
            const isEnemy = isGMMessage && msg.content.startsWith("[ENEMY] ");
            const isNarrator = isGMMessage && !isNPC && !isEnemy;

            if (isNarrator) {
              return (
                <div key={msg.id || idx} className="group flex flex-col items-center my-10 animate-in fade-in zoom-in duration-500">
                  <div className="bg-black/80 border border-primary/20 rounded-xl px-8 py-5 max-w-2xl text-center shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden w-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <Sparkles size={18} className="text-primary mx-auto mb-3 opacity-80" />
                    
                    {editingId === msg.id ? (
                       <div className="space-y-3 relative z-10 w-full">
                         <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="bg-zinc-900 border-primary/40 text-center font-serif italic w-full" />
                         <div className="flex justify-center gap-2">
                           <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 h-7 text-[10px]">Salvar</Button>
                           <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[10px]">Cancelar</Button>
                         </div>
                       </div>
                    ) : (
                      <p className="text-zinc-200 text-sm md:text-base font-serif italic leading-relaxed relative z-10 break-words whitespace-pre-wrap">
                        {renderContent(msg.content)}
                      </p>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      {canEdit && <button onClick={() => handleStartEdit(msg)} className="p-1.5 bg-black/60 rounded text-zinc-400 hover:text-primary"><Pencil size={12}/></button>}
                      {canDelete && <button onClick={() => onDeleteMessage(msg.id!)} className="p-1.5 bg-black/60 rounded text-zinc-400 hover:text-red-500"><Trash2 size={12}/></button>}
                    </div>
                  </div>
                </div>
              );
            }

            let displayName = msg.character?.firstName || msg.user?.username || "Desconhecido";
            let avatarToShow = msg.character?.avatarUrl || msg.user?.avatarUrl;
            let displayContent = msg.content;
            let bubbleType = "NORMAL";

            if (isNPC) {
                const match = msg.content.match(/^\[NPC\]\s+([^:]+):\s*([\s\S]*)/);
                if (match) {
                    displayName = match[1].trim();
                    displayContent = match[2].trim();
                }
                bubbleType = "NPC";
            } else if (isEnemy) {
                const match = msg.content.match(/^\[ENEMY\]\s+([^:]+):\s*([\s\S]*)/);
                if (match) {
                    displayName = match[1].trim();
                    displayContent = match[2].trim();
                }
                bubbleType = "ENEMY";
            }

            let bubbleClasses = "text-zinc-300 bg-white/5 hover:bg-white/10 border-white/5";
            let nameClasses = "text-white opacity-90";
            let avatarRing = "border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.1)] group-hover:border-primary/60";

            if (bubbleType === "ENEMY") {
               bubbleClasses = "text-red-200 bg-red-950/20 hover:bg-red-950/30 border-red-500/20";
               nameClasses = "text-red-500 font-black";
               avatarRing = "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
            } else if (bubbleType === "NPC") {
               bubbleClasses = "text-emerald-100 bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/20";
               nameClasses = "text-emerald-400 font-black";
               avatarRing = "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
            }

            return (
              <div key={msg.id || idx} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 group">
                <Avatar className={`h-10 w-10 md:h-12 md:w-12 border shrink-0 mt-1 transition-all duration-300 ${avatarRing}`}>
                  {bubbleType === "NORMAL" && <AvatarImage src={avatarToShow || undefined} className="object-cover" />}
                  <AvatarFallback className={`font-bold ${bubbleType === 'ENEMY' ? 'bg-red-950 text-red-500' : bubbleType === 'NPC' ? 'bg-emerald-950 text-emerald-500' : 'bg-zinc-900 text-primary'}`}>
                    {bubbleType === 'ENEMY' ? <Skull size={20} /> : bubbleType === 'NPC' ? <UserCircle size={20} /> : displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col w-full max-w-[85%] md:max-w-[75%] relative min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <span className={`text-xs md:text-sm tracking-wide truncate ${nameClasses}`}>{displayName}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && <button onClick={() => handleStartEdit(msg)} className="text-zinc-500 hover:text-primary"><Pencil size={10}/></button>}
                      {canDelete && <button onClick={() => onDeleteMessage(msg.id!)} className="text-zinc-500 hover:text-red-500"><Trash2 size={10}/></button>}
                    </div>
                  </div>
                  
                  {editingId === msg.id ? (
                    <div className="bg-zinc-900 border border-primary/30 p-2 rounded-xl space-y-2 w-full">
                       <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="min-h-[80px] bg-transparent border-none text-sm font-serif w-full p-2 focus:ring-1 focus:ring-primary/50" />
                       <div className="flex justify-end gap-2 pr-2">
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 text-red-500"><X size={14}/></Button>
                          <Button size="icon" onClick={handleSaveEdit} className="h-7 w-7 bg-green-600"><Check size={14}/></Button>
                       </div>
                    </div>
                  ) : (
                    <>
                      {isDice ? (
                        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 md:p-4 inline-block self-start shadow-inner backdrop-blur-sm max-w-full">
                          <div className="flex items-center gap-2 text-primary/80 font-black text-[10px] uppercase tracking-widest mb-2">
                            <Dices size={14} /> Sistema de Regras
                          </div>
                          <div className="text-zinc-100 text-sm md:text-base bg-black/80 rounded-lg p-3 border border-white/10 shadow-md break-words">
                            {renderContent(msg.content)}
                          </div>
                        </div>
                      ) : (
                        <div className={`text-sm md:text-base leading-relaxed font-serif p-4 rounded-2xl rounded-tl-none border shadow-md transition-colors backdrop-blur-sm break-words whitespace-pre-wrap ${bubbleClasses}`}>
                          {renderContent(displayContent)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-32 md:h-40 w-full shrink-0" />
      </div>

      <div className="absolute bottom-0 left-0 w-full px-4 pb-4 pt-24 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pointer-events-none z-30">
        <div className="max-w-4xl mx-auto pointer-events-auto relative">
          
          {showCommands && (
            <div className="absolute bottom-full left-0 mb-3 w-[280px] bg-zinc-900/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-2 pb-1.5 mb-1.5 border-b border-white/10 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12}/> Comandos Rápidos
              </div>
              {availableCommands.map(c => (
                <button 
                  key={c.cmd} 
                  type="button" 
                  onClick={() => insertCommand(c.cmd)} 
                  className="flex items-center justify-between px-3 py-2 hover:bg-primary/20 rounded-xl text-left transition-colors group"
                >
                   <div className="flex items-center gap-2 min-w-0">
                     <span className="text-primary/70 group-hover:text-primary">{c.icon}</span>
                     <span className="font-mono text-xs text-zinc-200 group-hover:text-white font-bold">{c.cmd.trim()}</span>
                   </div>
                   <span className="text-[10px] text-zinc-500 truncate pl-2">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="relative flex items-center group shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-2xl">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowCommands(!showCommands)} 
              className={`absolute left-2 h-10 w-10 z-10 transition-colors ${showCommands ? 'text-primary bg-primary/10' : 'text-zinc-500 hover:text-primary hover:bg-primary/5'}`}
            >
              <Terminal size={18} />
            </Button>

            <Input 
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setShowCommands(false)}
              placeholder={isGM ? "Cena (/desc) ou NPC..." : "O que fazes? (/r 1d20+forca)"} 
              className="bg-black/90 border-primary/40 h-14 pl-14 pr-16 text-xs md:text-sm text-zinc-100 placeholder:text-zinc-600 rounded-2xl focus-visible:ring-primary font-serif"
            />
            
            <Button type="submit" size="icon" disabled={!inputValue.trim()} className="absolute right-2 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl transition-all shadow-glow">
              {inputValue.startsWith("/r") ? <Dices size={18} /> : <Send size={18} />}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}

function Textarea({ value, onChange, className }: any) {
    return <textarea value={value} onChange={onChange} className={`focus:outline-none resize-none custom-scrollbar ${className}`} />;
}