import axios from 'axios';
import { api } from './api.ts'; // Sua instância base do axios configurada
import { ITable } from '../interfaces/table';

// DTO (Data Transfer Object) para criação: define o que a API espera receber
export interface CreateTableDTO {
  name: string;
  description: string;
  systemId: string;
  gmId: string;
}

// DTO para atualizar uma mesa (todos os campos opcionais)
export type UpdateTableDTO = Partial<CreateTableDTO>;

// DTO para entrar na mesa usando o código de convite
export interface JoinTableDTO {
  inviteCode: string;
  userId: string;
  characterId?: string; 
}

export const TableService = {
  /**
   * Busca todas as mesas do sistema (ou as mesas do usuário logado, 
   * dependendo de como você configurou a rota '/tables' no backend)
   */
  getAll: async (): Promise<ITable[]> => {
    try {
      const response = await api.get<ITable[]>('/tables');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Erro inesperado ao buscar mesas." };
    }
  },

  /**
   * Busca apenas as mesas onde o usuário específico é o Mestre (GM)
   */
  getByGm: async (gmId: string): Promise<ITable[]> => {
    try {
      const response = await api.get<ITable[]>(`/tables/gm/${gmId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Erro inesperado ao buscar as mesas do Mestre." };
    }
  },

  /**
   * Cria uma nova mesa
   */
  create: async (data: CreateTableDTO): Promise<ITable> => {
    try {
      const response = await api.post<ITable>('/tables', data);
      return response.data;
    } catch (error) {
      // Retorna o erro exato do backend (ex: Erros de validação do Zod)
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data; 
      }
      throw { message: "Erro inesperado ao criar a mesa." };
    }
  },

  /**
   * Atualiza os dados de uma mesa existente
   */
  update: async (id: string, data: UpdateTableDTO): Promise<ITable> => {
    try {
      const response = await api.patch<ITable>(`/tables/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Erro inesperado ao atualizar a mesa." };
    }
  },

  /**
   * Deleta uma mesa específica pelo ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/tables/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Erro inesperado ao deletar a mesa." };
    }
  },

  /**
   * Entra em uma mesa utilizando o código de convite (inviteCode)
   */
  join: async (data: JoinTableDTO): Promise<any> => {
    try {
      const response = await api.post('/tables/join', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Erro inesperado ao tentar entrar na mesa." };
    }
  }
};