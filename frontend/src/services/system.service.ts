import { api } from "./api";
import { ISystem } from "@/interfaces/system";

export const systemService = {
  async getAll(): Promise<ISystem[]> {
    try {
      const response = await api.get<ISystem[]>("/systems/get-all"); // Ajuste a rota conforme necessário, pode ser /systems ou /systems/all dependendo do backend
      
      // pode ser necessário ajustar para response.data.systems ou similar.
      return response.data; 
    } catch (error: any) {
      // Captura o erro do Axios e extrai a mensagem do backend
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erro ao buscar os sistemas de RPG.";
        
      throw new Error(errorMessage);
    }
  }
};