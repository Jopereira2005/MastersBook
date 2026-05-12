import { table } from "console";
import { api } from "./api";
import { ITable } from "@/interfaces/table";

export interface CreateTableDTO {
  name: string;
  description?: string;
  systemId: string;
  gmId: string;
}

export const tableService = {
  async create(data: Partial<ITable>): Promise<{ table: ITable }> {
    try {
      const response = await api.post<{ table: ITable }>('/tables/create', data);
      return response.data;
    } catch (error: any) {
      // Tratamento para capturar erros de validação do Zod no backend
      if (error.response?.data?.errors) {
         throw error.response.data;
      }
      
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erro ao invocar a nova mesa.";
      throw new Error(errorMessage);
    }
  },

  async getByPlayer(userId: string): Promise<ITable[]> {
    try {
      const response = await api.get<ITable[]>(`/tables/player/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erro ao buscar as mesas em que você é jogador.";
      throw new Error(errorMessage);
    }
  },

  async getAvailable(userId: string): Promise<ITable[]> {
    try {
      const response = await api.get<ITable[]>(`/tables/available/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erro ao buscar as mesas disponíveis na Taverna.";
      throw new Error(errorMessage);
    }
  },

  async getByGm(gmId: string): Promise<ITable[]> {
    try {
      const response = await api.get<ITable[]>(`/tables/get-by-gm/${gmId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erro ao buscar as suas campanhas de Mestre.";
      throw new Error(errorMessage);
    }
  },

  async updateTable(id: string, data: { name: string; description: string }): Promise<ITable> {
    try {
      const response = await api.patch<ITable>(`/tables/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao atualizar a mesa.");
    }
  },

  async regenerateInviteCode(id: string): Promise<{ newInviteCode: string }> {
    try {
      const response = await api.patch(`/tables/regenerate-code/${id}`);
      console.log("Código de convite regenerado:", response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao gerar novo código.");
    }
  },

  async deleteTable(tableId: string): Promise<void> {
    try {
      await api.delete(`/tables/delete/${tableId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao eliminar a mesa de RPG."
      );
    }
  },

  async joinTable(inviteCode: string, userId: string, characterId: string): Promise<{ tableId: string }> {
    try {
      const response = await api.post<{ tableId: string }>("/tables/join", { inviteCode, userId, characterId });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao tentar entrar na campanha. Verifique o código e tente novamente."
      );
    }
  },

  async getFullTable(tableId: string) {
    try {
      const response = await api.get(`/tables/get/${tableId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao carregar os pergaminhos da sessão."
      );
    }
  },

  async patchState(tableId: string, newState: any) {
    try {
      const response = await api.patch(`/tables/state/${tableId}`, newState);
      return response.data; // Retorna o TableState atualizado
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao manipular a realidade do mundo."
      );
    }
  },

  async patchPlayerStatus(tableId: string, playerId: string, status: any) {
    try {
      console.log("Enviando status para o backend:", { tableId, playerId, status });
      const response = await api.patch(`/tables/${tableId}/players/${playerId}/status`, status);
      return response.data; // Retorna o TablePlayer atualizado
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao atualizar o status do herói."
      );
    }
  },

  async patchPlayerNotes(tableId: string, playerId: string, privateNotes: string) {
    try {
      // Enviamos as notes dentro de um objeto
      const response = await api.patch(`/tables/${tableId}/players/${playerId}/notes`, { privateNotes });
      console.log("Erro ao salvar as anotações:", response);
      return response.data; // Retorna o TablePlayer atualizado
    } catch (error: any) {
      console.log("Erro ao salvar as anotações:", error);
      throw new Error(
        error.response?.data?.message || 
        "Erro ao salvar suas anotações no grimório."
      );
    }
  },

  async removePlayer(tableId: string, playerId: string, requesterId: string) {
    try {
      // No Axios, o body do DELETE deve ser enviado dentro da chave 'data' no objeto de configuração
      const response = await api.delete(`/tables/${tableId}/players/${playerId}`, {
        data: { requesterId }
      });
      
      return response.data;
    } catch (error: any) {
      console.log("Erro ao remover jogador da mesa:", error);
      throw new Error(
        error.response?.data?.message || 
        "Erro ao remover o aventureiro da mesa ou sair da sessão."
      );
    }
  },
};