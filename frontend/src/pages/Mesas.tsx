import { useState } from "react";
import { Plus, Users, Crown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Mesa {
  id: string;
  nome: string;
  descricao: string;
  jogadores: number;
  maxJogadores: number;
  mestre: string;
  proxima: string;
  sistema: string;
}

const initial: Mesa[] = [
  { id: "1", nome: "Profecia das Sombras", descricao: "Uma escuridão antiga desperta. Sua party é a última esperança.", jogadores: 5, maxJogadores: 6, mestre: "Mestre Vael", proxima: "Sáb 20h", sistema: "D&D 5e" },
  { id: "2", nome: "Crônicas de Eldoria", descricao: "Política, intriga e magia em um reino à beira do caos.", jogadores: 4, maxJogadores: 5, mestre: "Lyra Stormwind", proxima: "Sex 19h", sistema: "Pathfinder" },
  { id: "3", nome: "Forja dos Deuses", descricao: "Heróis lendários enfrentam titãs em uma campanha épica.", jogadores: 3, maxJogadores: 6, mestre: "Theron Black", proxima: "Dom 18h", sistema: "Tormenta20" },
  { id: "4", nome: "Sussurros da Lua Negra", descricao: "Mistério gótico em uma cidade onde os mortos não descansam.", jogadores: 6, maxJogadores: 6, mestre: "Morgana Vex", proxima: "Qua 21h", sistema: "Vampiro" },
];

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", sistema: "", maxJogadores: 5 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMesas([
      ...mesas,
      { id: crypto.randomUUID(), ...form, jogadores: 1, mestre: "Você", proxima: "A definir" },
    ]);
    setForm({ nome: "", descricao: "", sistema: "", maxJogadores: 5 });
    setOpen(false);
    toast.success("Mesa criada com sucesso!");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Campanhas</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Mesas de Jogo</h1>
          <p className="mt-1 text-muted-foreground">Gerencie e participe de mesas com sua party.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus size={16} className="mr-2" /> Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/30">
            <DialogHeader>
              <DialogTitle className="font-display gradient-text">Criar nova mesa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sistema</Label>
                  <Input value={form.sistema} onChange={(e) => setForm({ ...form, sistema: e.target.value })} placeholder="D&D 5e" required />
                </div>
                <div className="space-y-2">
                  <Label>Máx. jogadores</Label>
                  <Input type="number" min={2} max={10} value={form.maxJogadores} onChange={(e) => setForm({ ...form, maxJogadores: +e.target.value })} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary">Criar Mesa</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mesas.map((m) => (
          <article key={m.id} className="glow-card p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{m.sistema}</span>
                <h3 className="font-display text-xl mt-1">{m.nome}</h3>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
                {m.jogadores}/{m.maxJogadores}
              </span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground line-clamp-3 flex-1">{m.descricao}</p>

            <div className="mt-5 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Crown size={14} className="text-primary" /> {m.mestre}</p>
              <p className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> Próxima: {m.proxima}</p>
              <p className="flex items-center gap-2"><Users size={14} className="text-primary" /> {m.jogadores} jogadores</p>
            </div>

            <Button className="mt-5 w-full bg-gradient-primary shadow-glow hover:opacity-90">
              Entrar na Mesa
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Mesas;
