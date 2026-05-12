import { IUser } from "./user";
import { ITable } from "./table";
import { ICharacter } from "./character";

export interface IMessage {
  id?: string;
  
  // Conteúdo e Tipo
  type: 'STORY' | 'OOC' | 'LOG' | 'DICE';
  content: string;
  createdAt?: string;

  // Relacionamentos
  userId?: string;
  user?: IUser;

  tableId?: string;
  table?: ITable;

  // Personagem é opcional (Nulo para mensagens OOC ou LOG de Sistema)
  characterId?: string | null;
  character?: ICharacter | null;
}