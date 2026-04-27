import { IUser } from "./user";
import { ITable } from "./table";
import { ICharacter } from "./character";

export interface ITablePlayer {
  id: string;
  
  userId: string;
  user?: IUser;

  tableId: string;
  table?: ITable;

  characterId: string;
  character?: ICharacter;
}