import { api } from "./api";
import { IUser } from "@/interfaces/user";

const CURRENT_KEY = "rpg_current_user";

export const authService = {
  // Retorna o usuário logado atualmente no localStorage
  current(): IUser | null {
    const data = localStorage.getItem(CURRENT_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Recebe um 'identifier' (que pode ser email ou username) e a senha
  async login(identifier: string, password: string): Promise<IUser> {
    // Mandamos como 'login' para o backend saber que pode ser qualquer um dos dois
    const res = await api.post("/users/login", { login: identifier, password });
    
    // Pega o user que veio do backend
    const userData = res.data.user || res.data;

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

  async register(username: string, firstName: string, lastName: string, email: string, password: string): Promise<IUser> {
    const res = await api.post("/users/register", {
      username,
      firstName,
      lastName,
      email,
      password
    });
    
    const userData = res.data.user || res.data;

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

  logout() {
    localStorage.removeItem(CURRENT_KEY);
  },

  update(user: IUser) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  },

  async updateProfile(
    id: string,
    firstName: string,
    lastName: string,
    avatar: string
  ): Promise<IUser> {
    const username = `${firstName}_${lastName}`.toLowerCase();

    const res = await api.patch(`/users/update/${id}`, {
      username,
      firstName,
      lastName,
      avatarUrl: avatar
    });

    const userData = res.data.user || res.data;

    const updatedUser: IUser = {
      id: userData.id,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      avatarUrl: userData.avatarUrl || null,
    };

    localStorage.setItem(CURRENT_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  },
};