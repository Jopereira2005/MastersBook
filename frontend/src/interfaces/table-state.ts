import { ITable } from "./table";

export interface ITableState {
  id?: string;
  
  currentLocation?: string | null;
  inGameDate?: string | null;
  weather?: string | null;
  activeScene?: string; // Ex: "EXPLORATION", "COMBAT"
  
  // A ordem de iniciativa guarda os turnos (Ex: [{ name: "Goblin", roll: 15 }])
  initiativeOrder?: Record<string, any>[] | null; 
  
  publicNotes?: string | null;

  // Relação 1-para-1 com a Mesa
  tableId?: string;
  table?: ITable;
}