import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";

// Páginas
import Login from "./pages/Login";
import Home from "./pages/Home";
import Mesas from "./pages/Mesas";
import EmMesa from "./pages/EmMesa"; // <-- NOVO COMPONENTE IMPORTADO
import Fichas from "./pages/Fichas";
import Perfil from "./pages/Perfil";
import Amigos from "./pages/Amigos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* 1. ROTA PÚBLICA */}
            <Route path="/" element={<Login />} />

            {/* 2. ROTAS PROTEGIDAS COM LAYOUT PADRÃO (Com Sidebar/Navbar) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/mesas" element={<Mesas />} /> {/* <-- Mudei para plural /mesas */}
              <Route path="/fichas" element={<Fichas />} />
              <Route path="/amigos" element={<Amigos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            {/* 3. ROTA DO VTT (Protegida, mas SEM o Layout Padrão para ocupar 100% da tela) */}
            <Route 
              path="/mesa/:id" 
              element={
                <ProtectedRoute>
                  <EmMesa />
                </ProtectedRoute>
              } 
            />

            {/* 4. ROTA NÃO ENCONTRADA */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;