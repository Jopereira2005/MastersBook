import { IUser } from "./user";
import { ISystem } from "./system";
import { ITablePlayer } from "./table-player";
import { ITableState } from "./table-state"; // Importar o novo estado
import { IMessage } from "./message";

export interface ITable {
  id?: string;
  name?: string;
  description?: string | null;
  inviteCode?: string;

  gmId?: string;
  gm?: IUser;

  systemId?: string;
  system?: ISystem;

  players?: ITablePlayer[];
  
  // O Estado da Sessão atual (Pode ser nulo caso a mesa acabe de ser criada)
  state?: ITableState | null; 
  messages?: IMessage[];
}