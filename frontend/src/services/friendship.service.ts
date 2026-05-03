import { api } from "./api";

// A nossa interface padronizada que a tela de Amigos consome
export interface IFriendItem {
  friendshipId: string;
  friendId: string;
  username: string;
  avatarUrl: string | null;
}

export const friendshipService = {
  /**
   * Busca a lista de amigos aceitos.
   * O backend já manda isso no formato certinho!
   */
  async getFriends(userId: string): Promise<IFriendItem[]> {
    try {
      const response = await api.get(`/friendships/friends/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao buscar lista de amigos."
      );
    }
  },

  /**
   * Busca as solicitações pendentes.
   * Como o backend manda os dados brutos do Prisma, nós "Mapeamos/Adaptamos" aqui!
   */
  async getPending(userId: string): Promise<IFriendItem[]> {
    try {
      const response = await api.get(`/friendships/pending/${userId}`);
      
      // ADAPTER: Pegamos o array bruto e transformamos num array de IFriendItem
      return response.data.map((req: any) => ({
        friendshipId: req.id,
        friendId: req.user1Id, 
        username: req.user1.username,
        avatarUrl: req.user1.avatarUrl
      }));

    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao buscar solicitações pendentes."
      );
    }
  },

  /**
   * Envia uma solicitação de amizade usando o username.
   */
  async sendRequest(senderId: string, receiverIdentifier: string): Promise<any> {
    try {
      const response = await api.post("/friendships/invite", {
        senderId,
        receiverIdentifier
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao enviar solicitação de amizade."
      );
    }
  },

  /**
   * Aceita uma solicitação de amizade específica.
   */
  async acceptRequest(friendshipId: string): Promise<any> {
    try {
      const response = await api.patch(`/friendships/accept/${friendshipId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao aceitar amizade."
      );
    }
  },

  /**
   * Recusa uma solicitação de amizade específica.
   */
  async declineRequest(friendshipId: string): Promise<any> {
    try {
      await api.delete(`/friendships/decline/${friendshipId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao recusar amizade."
      );
    }
  },

  /**
   * Remove um amigo ou cancela uma solicitação.
   */
  async removeFriend(friendshipId: string): Promise<void> {
    try {
      await api.delete(`/friendships/remove-friend/${friendshipId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        "Erro ao remover amizade."
      );
    }
  }
};