import axios from 'axios';

export const api = axios.create({
  // Utiliza a variável de ambiente do Vite. 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Opcional: timeout de 10 segundos para evitar que a aplicação fique presa se a API cair
});

// 2. Intercetor de Respostas (Response Interceptor)
// Captura erros globais para evitar que a sua aplicação "quebre" silenciosamente
api.interceptors.response.use(
  (response) => {
    // Se a resposta for sucesso (200, 201, etc.), apenas a devolvemos
    return response;
  },
  (error) => {
    if (error.request && !error.response) {
      console.error('Erro de rede: Não foi possível ligar ao servidor do MastersBook.');
    }

    return Promise.reject(error);
  }
);