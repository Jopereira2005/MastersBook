import { IUser } from "./user";

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';

export interface IFriendship {
  id?: string;
  status?: FriendshipStatus;
  createdAt?: string;
  updatedAt?: string;

  user1Id?: string;
  user1?: IUser;

  user2Id: string;
  user2?: IUser;
}