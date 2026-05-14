import { useEffect, useState, useCallback } from "react";
import { tableService } from "@/services/table.service";
import { messageService } from "@/services/message.service"; // ✨ IMPORTAMOS A SERVICE
import { socket } from "@/services/socket.service";
import { toast } from "sonner";
import { ITable } from "@/interfaces/table";
import { ITableState } from "@/interfaces/table-state";
import { ITablePlayer } from "@/interfaces/table-player";
import { IMessage } from "@/interfaces/message";
import { characterService } from "@/services/character.service";

export function useGameSession(tableId: string | undefined) {
  const [data, setData] = useState<ITable | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✨ ESTADOS DO CHAT
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const loadSession = useCallback(async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const result = await tableService.getFullTable(tableId);
      setData(result);
      if (result.messages) {
        setMessages(result.messages);
      }
    } catch (error: any) {
      toast.error("A ligação ao multiverso falhou.");
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    loadSession();
    if (!tableId) return;

    socket.connect();
    socket.emit("join_table", tableId);

    // 🎧 OUVINTES EXISTENTES
    socket.on("state_updated", (newState: Partial<ITableState>) => {
      setData((prev) => (prev ? { ...prev, state: { ...prev.state, ...newState } } : null));
    });

    socket.on("player_status_updated", (payload: any) => {
      setData((prev) => {
        if (!prev || !prev.players) return prev;

        const incomingData = payload.newStatus; 
        const incomingPlayerId = payload.playerId;

        if (!incomingData || !incomingPlayerId) return prev;

        const updatedPlayers = prev.players.map((p) => {
          const isTarget = String(p.userId) === String(incomingPlayerId) || 
                           String(p.id) === String(incomingPlayerId) ||
                           String(p.id) === String(incomingData.id);

          if (isTarget) {
            return { 
              ...p, 
              currentAttributes: incomingData.currentAttributes ?? p.currentAttributes, 
              conditions: incomingData.conditions ?? p.conditions,
              temporaryAttributes: incomingData.temporaryAttributes ?? p.temporaryAttributes
            };
          }
          return p;
        });
        return { ...prev, players: updatedPlayers };
      });
    });

    socket.on("player_joined", (newPlayer: ITablePlayer) => {
      setData((prev) => {
        if (!prev) return null;
        if (prev.players?.some(p => p.id === newPlayer.id)) return prev;
        return { ...prev, players: [...(prev.players || []), newPlayer] };
      });
    });

    socket.on("player_left", (payload: { playerId: string }) => {
      setData((prev) => {
        if (!prev || !prev.players) return prev;
        return {
          ...prev,
          players: prev.players.filter(p => String(p.id) !== String(payload.playerId) && String(p.userId) !== String(payload.playerId))
        };
      });
    });

    // 💬 ✨ OUVINTES DE CHAT ✨ 💬
    socket.on("new_message", (message: IMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message_deleted", ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    socket.on("message_updated", (updatedMsg: IMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
    });

    socket.on("system_error", ({ message }: { message: string }) => {
      toast.error(message || "Ação inválida no sistema.");
    });

    return () => {
      socket.off("state_updated");
      socket.off("player_status_updated");
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("new_message");
      socket.off("message_deleted");
      socket.off("message_updated");
      socket.off("system_error");
      socket.disconnect();
    };
  }, [tableId, loadSession]);

  // --- MÉTODOS DE ESTADO ---
  const updatePlayerStatus = async (playerId: string, status: Partial<ITablePlayer>) => {
    if (!tableId || !data) return;
    setData((prev) => {
      if (!prev || !prev.players) return prev;
      return {
        ...prev,
        players: prev.players.map(p => 
          String(p.userId) === String(playerId) ? { ...p, ...status } : p
        )
      };
    });
    try {
      await tableService.patchPlayerStatus(tableId, playerId, status);
    } catch (error: any) {
      loadSession();
      toast.error("Falha ao sincronizar com o servidor.");
    }
  };

  const updateState = async (newState: Partial<ITableState>) => {
    if (!tableId) return;
    try {
      await tableService.patchState(tableId, newState);
    } catch (error: any) {
      toast.error("Erro ao moldar a realidade.");
    }
  };

  const updatePlayerNotes = async (playerId: string, privateNotes: string) => {
    if (!tableId) return;
    try {
      await tableService.patchPlayerNotes(tableId, playerId, privateNotes);
      setData((prev) => {
        if (!prev || !prev.players) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            String(p.userId) === String(playerId) ? { ...p, privateNotes } : p
          ),
        };
      });
      toast.success("Grimório salvo!");
    } catch (error: any) {
      toast.error("Erro ao salvar notas.");
    }
  };

  const syncCharacterAttributes = async (characterId: string, syncData: any) => {
    try {
      const updatedCharacter = await characterService.update(characterId, syncData);
    
      setData((prev) => {
        if (!prev || !prev.players) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.characterId === characterId 
              ? { ...p, character: updatedCharacter.character } 
              : p
          )
        };
      });

      toast.success("Evolução salva na ficha original!");
    } catch (error) {
      toast.error("Erro ao salvar permanentemente.");
    }
  };

  // 💬 ✨ MÉTODOS DE CHAT E PAGINAÇÃO ✨ 💬

  const sendMessage = (userId: string, content: string, type: 'STORY' | 'OOC', characterId?: string | null) => {
    if (!tableId) return;
    socket.emit('send_message', { tableId, userId, content, type, characterId: type === 'STORY' ? characterId : null });
  };

  const rollDice = (userId: string, notation: string, characterId?: string | null) => {
    if (!tableId) return;
    socket.emit('roll_dice', { tableId, userId, characterId, notation });
  };

  // ✨ Carregar mensagens antigas (Paginação)
  const loadMoreMessages = async () => {
    if (!tableId || !hasMoreMessages) return;
    const nextPage = messagePage + 1;
    
    try {
      const olderMessages = await messageService.getTableMessages(tableId, nextPage, 50);
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }
      // Coloca as mensagens antigas no início do array
      setMessages((prev) => [...olderMessages, ...prev]);
      setMessagePage(nextPage);
    } catch (error) {
      toast.error("Erro ao carregar mensagens antigas.");
    }
  };

  // ✨ Editar mensagem
  const editMessage = async (messageId: string, newContent: string) => {
    try {
      await messageService.updateMessage(messageId, newContent);
      // Não fazemos setMessages aqui pois o socket cuidará disso via "message_updated"
    } catch (error: any) {
      toast.error("Erro ao editar a mensagem.");
    }
  };

  // ✨ Deletar mensagem
  const deleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      // Não fazemos setMessages aqui pois o socket cuidará disso via "message_deleted"
    } catch (error: any) {
      toast.error("Erro ao deletar a mensagem.");
    }
  };

  const toggleCombat = (isActive: boolean, turnOrder: string[]) => {
    if (!socket || !tableId) return;
    socket.emit("toggle_combat", { tableId: tableId, isActive, turnOrder });
  };

  const nextTurn = () => {
    if (!socket || !tableId) return;
    socket.emit("next_turn", { tableId: tableId });
  };

  return { 
    data, 
    loading, 
    messages, 
    updateState, 
    updatePlayerStatus, 
    updatePlayerNotes,
    sendMessage, 
    rollDice,
    loadMoreMessages,
    hasMoreMessages, 
    editMessage,     
    deleteMessage,
    syncCharacterAttributes,
    toggleCombat, 
    nextTurn
  };
}