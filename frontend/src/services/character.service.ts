import { api } from "./api";
import { ICharacter } from "@/interfaces/character";

export const characterService = {
  async getByUser(userId: string): Promise<ICharacter[]> {
    try {
      const response = await api.get(`/characters/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao invocar os teus heróis."
      );
    }
  },

  async getById(characterId: string): Promise<ICharacter> {
    try {
      const response = await api.get(`/characters/${characterId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao consultar os pergaminhos deste herói."
      );
    }
  },

  async getByUserAndSystem(userId: string, systemId: string): Promise<ICharacter[]> {
    try {
      const response = await api.get(`/characters/user/${userId}/system/${systemId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao invocar os seus heróis."
      );
    }
  },

  async create(data: Partial<ICharacter>): Promise<ICharacter> {
    try {
      const response = await api.post("/characters/create", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao forjar a nova ficha."
      );
    }
  },

  async update(characterId: string, data: Partial<ICharacter>): Promise<{ character: ICharacter }> {
    try {
      const response = await api.patch(`/characters/update/${characterId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao atualizar o grimório do herói."
      );
    }
  },

  async delete(characterId: string): Promise<void> {
    try {
      await api.delete(`/characters/delete/${characterId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao apagar a ficha."
      );
    }
  }
};