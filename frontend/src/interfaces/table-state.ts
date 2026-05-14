import { ITable } from "./table";

export interface ITableState {
  id?: string;
  
  currentLocation?: string | null;
  inGameDate?: string | null;
  weather?: string | null;
  activeScene?: string; // Ex: "EXPLORATION", "COMBAT"

  initiativeOrder?: Record<string, any>[] | null;  
  publicNotes?: string | null;

  isCombatActive?: boolean;
  turnOrder?: string[];
  currentTurn?: number;

  tableId?: string;
  table?: ITable;
}