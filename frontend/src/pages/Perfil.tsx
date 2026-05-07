import { useState, useEffect } from "react";
import { User, Mail, Save, X, Edit2, Loader2, AtSign, Check, LogOut, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { userService } from "@/services/user.service";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Lista de Avatars (Emojis) disponíveis
const AVAILABLE_AVATARS = ["🧙‍♂️", "🧝‍♂️", "🧛", "🧟", "🐲", "⚔️", "🛡️", "🏹", "📜", "💎", "🌑", "🔥"];

const Perfil = () => {
  const { user, updateProfile, logout } = useAuth(); // <-- logout adicionado aqui
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Novos estados para exclusão de conta
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.avatarUrl || AVAILABLE_AVATARS[0],
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || AVAILABLE_AVATARS[0],
      });
    }
  };

  // Funções de Saída e Exclusão
  const handleLogout = () => {
    logout();
    toast.success("Você deixou a taverna. Até logo, aventureiro!");
  };

  const handleDeleteAccount = async () => {
    if (!passwordConfirmation) {
      return toast.error("É necessário informar a senha para confirmar o exílio.");
    }

    setIsDeleting(true);
    try {
      await userService.deleteAccount(passwordConfirmation);
      toast.success("Seu rastro foi apagado do MastersBook.");
      logout(); // Desloga e limpa a sessão após deletar
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar conta.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Configurações</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">Seu Perfil</h1>
      </header>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Lado Esquerdo: Seleção de Avatar */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-primary/20 bg-zinc-900 text-7xl shadow-glow">
            {formData.avatarUrl}
          </div>
          
          {isEditing && (
            <div className="grid grid-cols-4 gap-2 p-4 glass-card border-primary/10 animate-in fade-in zoom-in-95">
              {AVAILABLE_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: emoji })}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition-all hover:bg-primary/20 ${
                    formData.avatarUrl === emoji ? "bg-primary/30 ring-2 ring-primary" : "bg-zinc-800/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">
            {isEditing ? "Escolha seu novo símbolo" : "Sua identidade atual"}
          </p>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="glass-card p-8 border-primary/10">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold gradient-text uppercase tracking-wider">Dados da Conta</h2>
              
              {!isEditing ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="border-primary/30 text-primary hover:bg-primary/10 transition-all hover:scale-105"
                >
                  <Edit2 size={16} className="mr-2" /> Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground">
                    <X size={16} className="mr-2" /> Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={loading} className="bg-gradient-primary shadow-glow">
                    {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                    Salvar
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Email - Exibição Fixa (Não editável) */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-zinc-500 text-xs uppercase tracking-widest">E-mail de Contato (Vínculo da Conta)</Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-muted-foreground italic">
                  <Mail size={16} className="text-primary/40" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="username" className="text-zinc-400">Nickname (Nome de Usuário)</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <Input 
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    disabled={!isEditing}
                    className="pl-10 bg-background/50 border-primary/20 disabled:opacity-50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-400">Primeiro Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <Input 
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 bg-background/50 border-primary/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Sobrenome */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-400">Sobrenome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <Input 
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 bg-background/50 border-primary/20 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* NOVA SEÇÃO DE SAÍDA E SEGURANÇA */}
      <section className="space-y-6 pt-10 border-t border-border/50">
        
        {/* LOGOUT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card/20">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Encerrar Sessão</h3>
            <p className="text-sm text-muted-foreground">Saia da sua conta com segurança.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-primary/40 text-primary hover:bg-primary/10">
            <LogOut size={18} className="mr-2" /> Sair do Master'sBook
          </Button>
        </div>

        {/* ZONA DE PERIGO */}
        <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert size={20} />
            <h3 className="font-display font-bold uppercase tracking-wider">Zona de Perigo</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex-1 min-w-[250px]">
              Ao deletar sua conta, todos os seus personagens, mesas e conquistas serão perdidos para sempre no Vazio.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white transition-all"
            >
              <Trash2 size={18} className="mr-2" /> Deletar Perfil
            </Button>
          </div>
        </div>
      </section>

      {/* MODAL DE CONFIRMAÇÃO COM SENHA */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPasswordConfirmation("");
        }}
        onConfirm={handleDeleteAccount}
        loading={isDeleting}
        title="Exílio Permanente"
        description="Esta ação é irreversível. Para confirmar que você é o proprietário desta conta e deseja destruí-la, por favor, digite sua senha abaixo:"
      >
        {/* O children que criamos no ConfirmDialog recebe este input de senha */}
        <div className="mt-4 space-y-2 text-left">
          <Label htmlFor="confirm-pass" className="text-xs text-muted-foreground uppercase tracking-widest">Sua Senha Mestra</Label>
          <Input
            id="confirm-pass"
            type="password"
            placeholder="Digite sua senha..."
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="bg-background/50 border-red-500/30 focus-visible:ring-red-500"
          />
        </div>
      </ConfirmDialog>

    </div>
  );
};

export default Perfil;