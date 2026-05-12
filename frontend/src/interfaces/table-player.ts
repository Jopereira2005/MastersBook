import { IUser } from "./user";
import { ITable } from "./table";
import { ICharacter } from "./character";

export interface ITablePlayer {
  id?: string;
  
  // Status Temporário "Durante a Mesa"
  currentAttributes?: Record<string, any> | null;
  temporaryAttributes?: Record<string, any> | null;
  conditions?: string[] | null; // Ex: ["Envenenado", "Cego"]
  privateNotes?: string | null;

  // Relacionamentos
  userId?: string;
  user?: IUser;

  tableId?: string;
  table?: ITable;

  characterId?: string;
  character?: ICharacter;
}