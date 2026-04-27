import { IUser } from "./user";
import { ISystem } from "./system";
import { ITablePlayer } from "./table-player";

export interface ICharacter {
  id: string;
  firstName: string;
  lastName: string;
  race: string;
  class: string;
  level: number;
  // O Json do Prisma pode ser tipado como um Record genérico ou uma interface específica
  attributes: Record<string, any>; 
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;

  userId: string;
  user?: IUser;

  systemId: string;
  system?: ISystem;

  tablePlayers?: ITablePlayer[];
}