import { api } from "./api"; // Verifique se o caminho do seu axios configurado é este
import { IMessage } from "@/interfaces/message";

export const messageService = {
  /**
   * Busca mensagens antigas de uma mesa (Paginação)
   */
  async getTableMessages(tableId: string, page: number = 1, limit: number = 50): Promise<IMessage[]> {
    const response = await api.get(`/messages/table/${tableId}`, {
      params: { page, limit }
    });
    return response.data; 
  },

  /**
   * Edita o conteúdo de uma mensagem existente
   */
  async updateMessage(id: string, content: string): Promise<IMessage> {
    const response = await api.patch(`/messages/update/${id}`, { content });
    return response.data;
  },

  /**
   * Deleta uma mensagem da mesa
   */
  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/messages/delete/${id}`);
  }
};