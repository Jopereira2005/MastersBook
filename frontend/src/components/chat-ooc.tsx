import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Edit2, Trash2, Check, X, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IMessage } from "@/interfaces/message";
import { IUser } from "@/interfaces/user";

interface ChatOOCProps {
  messages: IMessage[];
  currentUser: IUser | null;
  onSendMessage: (userId: string, content: string, type: 'OOC' | 'STORY') => void;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
}

export function ChatOOC({ messages, currentUser, onSendMessage, onLoadMore, hasMore, onEdit, onDelete }: ChatOOCProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Estados de Moderação
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const oocMessages = messages.filter(m => m.type === "OOC");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll apenas se NÃO estivermos editando e NÃO estivermos carregando histórico
  useEffect(() => {
    if (!loadingMore && !editingId) {
      scrollToBottom();
    }
  }, [oocMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !currentUser) return;
    onSendMessage(currentUser.id!, inputValue.trim(), "OOC");
    setInputValue("");
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    // Salva a altura atual para evitar que a tela pule
    const container = scrollContainerRef.current;
    const prevHeight = container?.scrollHeight || 0;

    await onLoadMore();

    // Restaura a posição do scroll milissegundos depois do React renderizar
    setTimeout(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - prevHeight;
      }
      setLoadingMore(false);
    }, 100);
  };

  const startEdit = (msg: IMessage) => {
    if (!msg.id) return;
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await onEdit(editingId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/20">
      
      {/* ÁREA DE MENSAGENS */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {/* BOTÃO DE CARREGAR MAIS */}
        {hasMore && oocMessages.length > 0 && (
          <div className="flex justify-center pb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLoadMore} 
              disabled={loadingMore}
              className="h-7 text-[10px] text-zinc-500 hover:text-primary bg-black/20 rounded-full px-4 border border-white/5"
            >
              {loadingMore ? <Loader2 size={12} className="animate-spin mr-2" /> : <ChevronUp size={12} className="mr-2" />}
              Carregar mensagens antigas
            </Button>
          </div>
        )}

        {oocMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-50 space-y-2">
            <MessageSquare size={32} />
            <p className="text-xs">Nenhuma conversa ainda...</p>
          </div>
        ) : (
          oocMessages.map((msg, idx) => {
            const isMe = msg.userId === currentUser?.id;
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const isEditing = editingId === msg.id;

            return (
              <div key={msg.id || idx} className={`group flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                
                <Avatar className="h-6 w-6 border border-white/10 shrink-0 mt-1">
                  <AvatarFallback className="text-[8px] md:text-[10px]">
                      {msg.user?.avatarUrl && msg.user?.avatarUrl.length <= 5 ? 
                          msg.user?.avatarUrl : 
                          msg.user?.firstName?.charAt(0).toUpperCase() || "?"
                        }
                    </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col max-w-[85%] ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-baseline gap-1 mb-1 px-1">
                    <span className="text-[9px] font-bold text-zinc-400">
                      {isMe ? "Você" : msg.user?.username || "Desconhecido"}
                    </span>
                    <span className="text-[7px] text-zinc-600">{time}</span>
                  </div>
                  
                  {/* ✨ LÓGICA DE EDIÇÃO E BALÃO */}
                  <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {isEditing ? (
                      // MODO EDIÇÃO
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-primary/30">
                        <Input 
                          value={editContent} 
                          onChange={(e) => setEditContent(e.target.value)} 
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="h-7 text-xs bg-transparent border-none min-w-[150px] px-2" 
                        />
                        <button onClick={saveEdit} className="text-green-500 hover:text-green-400 p-1"><Check size={14}/></button>
                        <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400 p-1"><X size={14}/></button>
                      </div>
                    ) : (
                      // MODO NORMAL
                      <div className={`px-3 py-2 rounded-xl text-xs break-words shadow-sm relative ${
                        isMe 
                          ? "bg-primary/20 text-primary-foreground rounded-tr-none border border-primary/20" 
                          : "bg-white/5 text-zinc-200 rounded-tl-none border border-white/5"
                      }`}>
                        {msg.content}
                      </div>
                    )}

                    {/* ✨ BOTÕES DE MODERAÇÃO (HOVER) */}
                    {isMe && !isEditing && msg.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                        <button onClick={() => startEdit(msg)} className="text-zinc-500 hover:text-primary transition-colors p-1 rounded hover:bg-white/5">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => onDelete(msg.id!)} className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-white/5">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ÁREA DE INPUT */}
      <div className="p-3 bg-zinc-900/50 border-t border-white/5 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Conversar em off..." 
            className="bg-black/40 border-white/10 text-xs h-9 focus-visible:ring-primary/50 flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim()}
            className="h-9 w-9 bg-primary/20 text-primary hover:bg-primary/40 shrink-0 transition-all"
          >
            <Send size={14} />
          </Button>
        </form>
      </div>
    </div>
  );
}