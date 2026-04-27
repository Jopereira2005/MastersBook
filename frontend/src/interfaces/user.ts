import { ICharacter } from "./character";
import { ITable } from "./table";
import { ITablePlayer } from "./table-player";
import { IFriendship } from "./friendship";

export interface IUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string; 

  // Relacionamentos
  characters?: ICharacter[];
  ownedTables?: ITable[];
  memberships?: ITablePlayer[];
  friendsSent?: IFriendship[];
  friendsRecv?: IFriendship[];
}