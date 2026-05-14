import { useState, useRef, useEffect } from "react";
import { Send, Dices, ScrollText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IMessage } from "@/interfaces/message";
import { ITablePlayer } from "@/interfaces/table-player";
import { IUser } from "@/interfaces/user";

interface ChatStoryProps {
  messages: IMessage[];
  currentUser: IUser | null;
  currentPlayer: ITablePlayer | undefined;
  isGM: boolean;
  onSendMessage: (userId: string, content: string, type: 'STORY' | 'OOC' | 'LOG', characterId?: string | null) => void;
  onRollDice: (userId: string, notation: string, characterId?: string | null) => void;
}

export function ChatStory({ messages, currentUser, currentPlayer, isGM, onSendMessage, onRollDice }: ChatStoryProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storyMessages = messages.filter(m => m.type === "STORY" || m.type === "DICE");

  // ✨ MUDANÇA: Usamos um pequeno atraso para garantir que a DOM atualizou,
  // e alinhamos a referência fantasma exatamente no final do container ("end")
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

    if (content.startsWith("/r ") || content.startsWith("/roll ")) {
      const notation = content.replace(/^\/(r|roll)\s+/, "");
      onRollDice(currentUser.id!, notation, currentPlayer?.characterId);
    } else if (isGM && content.startsWith("/desc ")) {
      const descContent = content.replace(/^\/desc\s+/, "");
      onSendMessage(currentUser.id!, descContent, "STORY", null); 
    } else {
      onSendMessage(currentUser.id!, content, "STORY", currentPlayer?.characterId);
    }

    setInputValue("");
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

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* ✨ MUDANÇA: Removido o pb-48 daqui para evitar conflitos no cálculo */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6">
        {storyMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-30 space-y-4 select-none">
            <ScrollText size={80} className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <h2 className="font-display text-xl uppercase tracking-[0.3em]">A Lenda Começa...</h2>
          </div>
        ) : (
          storyMessages.map((msg, idx) => {
            const isDice = msg.type === "DICE";
            const isNarrator = msg.type === "STORY" && !msg.characterId;

            if (isNarrator) {
              return (
                <div key={msg.id || idx} className="flex justify-center my-10 animate-in fade-in zoom-in duration-500">
                  <div className="bg-black/80 border border-primary/20 rounded-xl px-8 py-5 max-w-2xl text-center shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <Sparkles size={18} className="text-primary mx-auto mb-3 opacity-80 drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    <p className="text-zinc-200 text-sm md:text-base font-serif italic leading-relaxed relative z-10">
                      {renderContent(msg.content)}
                    </p>
                  </div>
                </div>
              );
            }

            const nameToShow = msg.character?.firstName || msg.user?.username || "Desconhecido";
            const avatarToShow = msg.character?.avatarUrl || msg.user?.avatarUrl;

            return (
              <div key={msg.id || idx} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 group">
                <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.1)] shrink-0 mt-1 transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  <AvatarImage src={avatarToShow || undefined} className="object-cover" />
                  <AvatarFallback className="bg-zinc-900 text-primary font-bold">
                    {nameToShow.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col w-full max-w-[85%] md:max-w-[75%]">
                  <span className="text-xs md:text-sm font-bold text-white tracking-wide mb-1.5 ml-1 opacity-90">
                    {nameToShow}
                  </span>
                  
                  {isDice ? (
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 md:p-4 inline-block self-start shadow-inner backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-primary/80 font-black text-[10px] uppercase tracking-widest mb-2">
                        <Dices size={14} /> Sistema de Regras
                      </div>
                      <div className="text-zinc-100 text-sm md:text-base bg-black/80 rounded-lg p-3 border border-white/10 shadow-md">
                        {renderContent(msg.content)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-300 text-sm md:text-base leading-relaxed font-serif bg-white/5 hover:bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/5 hover:border-white/10 shadow-md transition-colors backdrop-blur-sm">
                      {renderContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* ✨ MUDANÇA: O ESPAÇADOR FANTASMA. Ele tem a altura exata do input e do degradê combinados.
            Assim, o navegador garante que este espaço vazio seja empurrado para o final da tela! */}
        <div ref={messagesEndRef} className="h-32 md:h-40 w-full shrink-0" />
      </div>

      <div className="absolute bottom-0 left-0 w-full px-4 pb-4 pt-24 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form onSubmit={handleSend} className="relative flex items-center group shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-2xl">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isGM ? "Descreva a cena (/desc) ou fale como NPC..." : "O que o seu personagem faz? (Use /r 1d20 para rolar)"} 
              className="bg-black/90 border-primary/40 h-14 pl-5 pr-16 text-sm md:text-base text-zinc-100 placeholder:text-zinc-600 rounded-2xl focus-visible:ring-primary focus-visible:border-primary backdrop-blur-xl transition-all font-serif"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputValue.trim()}
              className="absolute right-2 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl transition-all shadow-[0_0_15px_rgba(var(--primary),0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {inputValue.startsWith("/r") || inputValue.startsWith("/roll") ? <Dices size={18} /> : <Send size={18} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}