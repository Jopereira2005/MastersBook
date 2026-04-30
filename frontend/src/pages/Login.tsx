import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import heroImage from "@/assets/hero-rpg.jpg";

const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // Estados do formulário
  const [identifier, setIdentifier] = useState(""); // Usado no Login (Email ou Username)
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  // Função para limpar os inputs quando trocar de aba
  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    setIdentifier("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        if (password.length < 6) throw new Error("A senha deve ter ao menos 6 caracteres.");
        if (password !== confirm) throw new Error("As senhas não coincidem.");
        await register(username, firstName, lastName, email, password);
        toast.success("Conta criada! Bem-vindo, aventureiro.");
      } else {
        await login(identifier, password);
        toast.success("Login realizado com sucesso!");
      }
      navigate("/home");
    } catch (err: any) {
      // Como estamos usando o axios agora, o erro pode vir aninhado em err.response.data
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Erro ao autenticar";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/90 to-background" />

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse-glow">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold gradient-text text-glow">Eldritch Quest</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Forje seu destino entre as sombras e a magia
            </p>
          </div>

          <div className="glass-card p-8">
            {/* Abas de Troca */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === "login" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("register")}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === "register" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                }`}
              >
                Cadastrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* === CAMPOS EXCLUSIVOS DE CADASTRO === */}
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Nome de Usuário)</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        required
                        placeholder="ex: gandalf_br"
                        className="pl-10 bg-input/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Seu nome"
                        className="bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sobrenome</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Seu sobrenome"
                        className="bg-input/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="voce@reino.com"
                        className="pl-10 bg-input/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* === CAMPO EXCLUSIVO DE LOGIN === */}
              {mode === "login" && (
                <div className="space-y-2">
                  <Label htmlFor="identifier">Username ou Email</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      placeholder="gandalf_br ou email@reino.com"
                      className="pl-10 bg-input/50"
                    />
                  </div>
                </div>
              )}

              {/* === CAMPOS DE SENHA (COMUNS AOS DOIS) === */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pl-10 bg-input/50"
                  />
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="pl-10 bg-input/50"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 hover:shadow-elegant transition-all h-11 text-base font-semibold mt-6"
              >
                {loading ? "Conjurando..." : mode === "login" ? "Entrar no Reino" : "Criar Conta"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {mode === "login" ? "Novo aventureiro? " : "Já possui conta? "}
              <button
                type="button"
                onClick={() => handleModeChange(mode === "login" ? "register" : "login")}
                className="text-primary hover:text-primary-glow font-medium"
              >
                {mode === "login" ? "Crie sua conta" : "Faça login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;