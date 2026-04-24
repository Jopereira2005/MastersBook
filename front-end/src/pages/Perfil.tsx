import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, LogOut, Mail, User as UserIcon, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const avatarOptions = [
  "🧙", "🧝", "🧚", "🦸", "🧛", "🧞", "🐉", "⚔️",
];

const Perfil = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🧙");

  const handleSave = () => {
    updateUser({ name, avatar });
    setEditing(false);
    toast.success("Perfil atualizado!");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Aventureiro</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Meu Perfil</h1>
      </header>

      <section className="glow-card p-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-primary text-6xl shadow-glow animate-pulse-glow">
              {avatar}
            </div>
            {editing && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 rounded-full border border-primary/40 bg-card/95 p-1.5 backdrop-blur shadow-glow">
                {avatarOptions.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all ${
                      avatar === a ? "bg-primary scale-110" : "hover:bg-primary/20"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          <h2 className="mt-8 font-display text-3xl">{user?.name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Camera size={12} /> Membro desde 2026
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><UserIcon size={14} /> Nome</Label>
            <Input value={name} disabled={!editing} onChange={(e) => setName(e.target.value)} className="bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail size={14} /> Email</Label>
            <Input value={user?.email || ""} disabled className="bg-input/50" />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {editing ? (
            <>
              <Button onClick={handleSave} className="flex-1 bg-gradient-primary shadow-glow">
                <Save size={16} className="mr-2" /> Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => { setEditing(false); setName(user?.name || ""); }} className="flex-1">
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)} className="flex-1 bg-gradient-primary shadow-glow">
              Editar Perfil
            </Button>
          )}
          <Button onClick={handleLogout} variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10">
            <LogOut size={16} className="mr-2" /> Sair
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Fichas criadas", v: 4 },
          { l: "Mesas ativas", v: 2 },
          { l: "Sessões jogadas", v: 28 },
        ].map((s) => (
          <div key={s.l} className="glow-card p-5 text-center">
            <p className="font-display text-3xl gradient-text">{s.v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Perfil;
