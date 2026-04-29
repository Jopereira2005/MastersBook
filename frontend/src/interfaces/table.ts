import { IUser } from "./user";
import { ISystem } from "./system";
import { ITablePlayer } from "./table-player";

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
}