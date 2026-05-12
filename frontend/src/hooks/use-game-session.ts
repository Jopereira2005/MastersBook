import { useEffect, useState, useCallback } from "react";
import { tableService } from "@/services/table.service";
import { socket } from "@/services/socket.service";
import { toast } from "sonner";
import { ITable } from "@/interfaces/table";
import { ITableState } from "@/interfaces/table-state";
import { ITablePlayer } from "@/interfaces/table-player";

export function useGameSession(tableId: string | undefined) {
  const [data, setData] = useState<ITable | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const result = await tableService.getFullTable(tableId);
      setData(result);
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

    socket.on("state_updated", (newState: Partial<ITableState>) => {
      setData((prev) => (prev ? { ...prev, state: { ...prev.state, ...newState } } : null));
    });

    // 🎧 OUVINTE 2: Status dos Jogadores (Ajustado para 'newStatus')
    socket.on("player_status_updated", (payload: any) => {
      console.log("Mágica recebida via Socket:", payload);

      setData((prev) => {
        if (!prev || !prev.players) return prev;

        // ✨ O segredo está aqui: o teu backend envia 'newStatus'
        const incomingData = payload.newStatus; 
        const incomingPlayerId = payload.playerId; // ff894... (que é o userId)

        if (!incomingData || !incomingPlayerId) return prev;

        const updatedPlayers = prev.players.map((p) => {
          // Verificamos se o ID da relação ou o ID do usuário batem com o enviado
          const isTarget = String(p.userId) === String(incomingPlayerId) || 
                          String(p.id) === String(incomingPlayerId) ||
                          String(p.id) === String(incomingData.id);

          if (isTarget) {
            console.log(`Bingo! Atualizando ${p.character?.firstName || 'Jogador'}`);
            
            // Retornamos um novo objeto com os dados de 'newStatus'
            return { 
              ...p, 
              currentAttributes: incomingData.currentAttributes ?? p.currentAttributes, 
              conditions: incomingData.conditions ?? p.conditions,
              temporaryAttributes: incomingData.temporaryAttributes ?? p.temporaryAttributes
            };
          }
          return p;
        });

        // Criamos um novo objeto de mesa para disparar o re-render do React
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

    return () => {
      socket.off("state_updated");
      socket.off("player_status_updated");
      socket.off("player_joined");
      socket.off("player_left");
      socket.disconnect();
    };
  }, [tableId, loadSession]);

  // ✨ FUNÇÃO COM ATUALIZAÇÃO OTIMISTA
  const updatePlayerStatus = async (playerId: string, status: Partial<ITablePlayer>) => {
    if (!tableId || !data) return;

    // 1. Atualização Otimista: Muda no seu ecrã na hora
    setData((prev) => {
      if (!prev || !prev.players) return prev;
      return {
        ...prev,
        players: prev.players.map(p => 
          String(p.userId) === String(playerId) 
            ? { ...p, ...status } 
            : p
        )
      };
    });

    try {
      // 2. Envia para o servidor
      await tableService.patchPlayerStatus(tableId, playerId, status);
    } catch (error: any) {
      // 3. Se der erro, recarrega os dados originais
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

  return { data, loading, updateState, updatePlayerStatus, updatePlayerNotes };
}