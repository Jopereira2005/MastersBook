import { ITable } from "./table";
import { ICharacter } from "./character";

export interface ISystem {
  id?: string;
  name?: string;
  description?: string | null;
  createdAt?: string;

  // Relacionamentos
  characters?: ICharacter[];
  tables?: ITable[];
}