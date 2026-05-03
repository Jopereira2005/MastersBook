import { 
  createContext, 
  useCallback, 
  useContext, 
  useEffect, 
  useMemo, 
  useState, 
  ReactNode 
} from "react";
import { authService } from "@/services/auth.service"; // 👈 Importação correta!
import { IUser } from "@/interfaces/user";

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string, 
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string
  ) => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>; // 👈 Nova função no contrato!
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca o usuário no LocalStorage ao carregar o app
  useEffect(() => {
    const savedUser = authService.current();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const u = await authService.login(identifier, password);
    setUser(u);
  }, []);

  const register = useCallback(async (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    const u = await authService.register(username, firstName, lastName, email, password);
    setUser(u);
  }, []);

  /**
   * NOVA FUNÇÃO: updateProfile
   * Ela usa o ID do usuário logado e os dados novos para atualizar a API e o Estado Global
   */
  const updateProfile = useCallback(async (data: Partial<IUser>) => {
    if (!user?.id) throw new Error("Usuário não autenticado.");

    // Chama a service (que já atualiza o LocalStorage)
    const updatedUser: any = await authService.updateProfile(user.id, data);
    console.log("Perfil atualizado:", updatedUser);
    // Atualiza o Estado Global do React para refletir a mudança na UI instantaneamente
    setUser(updatedUser.user);
  }, [user]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, updateProfile, logout }),
    [user, loading, login, register, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
}