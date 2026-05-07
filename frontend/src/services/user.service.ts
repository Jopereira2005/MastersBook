import { api } from "./api";
import { IUser } from "@/interfaces/user";

const CURRENT_KEY = "@MastersBook:user";

export const userService = {
  // Retorna o utilizador logado atualmente (LocalStorage)
  current(): IUser | null {
    const data = localStorage.getItem(CURRENT_KEY);
    return data ? JSON.parse(data) : null;
  },


  // Faz o login na API
  async login(identifier: string, password: string): Promise<IUser> {
    const response = await api.post("/users/login", { 
      login: identifier, 
      password 
    });
    
    const userData = response.data.user || response.data;

    const user: IUser = {
      id: userData.id,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      avatarUrl: userData.avatarUrl || null,
    };

    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    return user;
  },

  // Cadastra um novo utilizador

  async register(
    username: string, 
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string
  ): Promise<IUser> {
    const response = await api.post("/users/register", {
      username,
      firstName,
      lastName,
      email,
      password
    });
    
    const userData = response.data.user || response.data;

    const user: IUser = {
      id: userData.id,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      avatarUrl: userData.avatarUrl || null,
    };

    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    return user;
  },


   // Envia os novos dados para o backend e atualiza o LocalStorage
  async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    try {
      // Faz a chamada PATCH para o backend
      const response = await api.patch<IUser>(`/users/update/${userId}`, data);
      const updatedUser = response.data;

      // Sincroniza o LocalStorage com os novos dados
      this.update(updatedUser);

      return updatedUser;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erro ao atualizar os dados do aventureiro.";
      throw new Error(errorMessage);
    }
  },

  // Atualiza apenas os dados locais (LocalStorage)
  update(user: IUser) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  },

  
  // Encerra a sessão
  logout() {
    localStorage.removeItem(CURRENT_KEY);
  },

  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete("/users/delete", { data: { password } });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao deletar o perfil. Verifique a sua senha."
      );
    }
  }
};