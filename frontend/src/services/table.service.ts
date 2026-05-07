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
  async create(data: Partial<ITable>): Promise<ITable> {
    try {
      const response = await api.post<ITable>('/tables/create', data);
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

  /**
   * Busca as mesas onde o usuário está participando como Jogador.
   * Rota: /tables/player/{userId}
   */
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

  async joinTable(inviteCode: string, userId: string, characterId: string): Promise<void> {
    try {
      await api.post("/tables/join", { inviteCode, userId, characterId });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao tentar entrar na campanha. Verifique o código e tente novamente."
      );
    }
  }
};