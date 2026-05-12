import { io, Socket } from "socket.io-client";

// Pegamos a URL base da nossa API. 
// Nota: Se o seu VITE_API_URL termina com "/api", o replace remove isso, 
// pois o Socket.io precisa conectar na raiz do servidor.
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const socket: Socket = io(API_URL, {
  autoConnect: false, // Só conectamos quando o jogador realmente entrar numa mesa
  reconnection: true, // Tenta reconectar automaticamente se a internet cair
});