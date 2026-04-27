import { useState } from "react";
import { Plus, Heart, Shield, Swords, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Ficha {
  id: string;
  nome: string;
  classe: string;
  raca: string;
  nivel: number;
  hp: number;
  ca: number;
  ataque: number;
  cor: string;
}

const initial: Ficha[] = [
  { id: "1", nome: "Aelin Ashryver", classe: "Ranger", raca: "Meio-elfa", nivel: 8, hp: 72, ca: 16, ataque: 9, cor: "from-purple-500 to-fuchsia-500" },
  { id: "2", nome: "Theron Stormblade", classe: "Paladino", raca: "Humano", nivel: 6, hp: 64, ca: 19, ataque: 8, cor: "from-indigo-500 to-purple-600" },
  { id: "3", nome: "Mirelle Nightwhisper", classe: "Bruxa", raca: "Tiefling", nivel: 7, hp: 49, ca: 13, ataque: 10, cor: "from-violet-600 to-pink-500" },
  { id: "4", nome: "Bren Ironfist", classe: "Bárbaro", raca: "Anão", nivel: 5, hp: 78, ca: 15, ataque: 7, cor: "from-purple-700 to-blue-600" },
];

const Fichas = () => {
  const [fichas, setFichas] = useState<Ficha[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", classe: "", raca: "", nivel: 1 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFichas([
      ...fichas,
      {
        id: crypto.randomUUID(),
        ...form,
        hp: 10 + form.nivel * 6,
        ca: 12 + Math.floor(form.nivel / 2),
        ataque: 2 + Math.floor(form.nivel / 2),
        cor: "from-purple-500 to-fuchsia-500",
      },
    ]);
    setForm({ nome: "", classe: "", raca: "", nivel: 1 });
    setOpen(false);
    toast.success("Ficha criada com sucesso!");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Personagens</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Minhas Fichas</h1>
          <p className="mt-1 text-muted-foreground">Suas lendas vivas em cada campanha.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus size={16} className="mr-2" /> Nova Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/30">
            <DialogHeader>
              <DialogTitle className="font-display gradient-text">Criar Personagem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do personagem</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Classe</Label>
                  <Input value={form.classe} onChange={(e) => setForm({ ...form, classe: e.target.value })} placeholder="Mago" required />
                </div>
                <div className="space-y-2">
                  <Label>Raça</Label>
                  <Input value={form.raca} onChange={(e) => setForm({ ...form, raca: e.target.value })} placeholder="Elfo" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nível</Label>
                <Input type="number" min={1} max={20} value={form.nivel} onChange={(e) => setForm({ ...form, nivel: +e.target.value })} required />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary">Criar Ficha</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {fichas.map((f) => (
          <article key={f.id} className="glow-card overflow-hidden">
            <div className={`relative h-32 bg-gradient-to-br ${f.cor}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
              <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">{f.raca}</p>
                  <h3 className="font-display text-xl text-white drop-shadow">{f.nome}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/70 backdrop-blur font-display text-lg border border-white/20">
                  {f.nivel}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles size={14} className="text-primary" />
                <span className="font-medium">{f.classe}</span>
                <span className="text-muted-foreground">· Nv. {f.nivel}</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 p-2">
                  <Heart size={14} className="mx-auto text-rose-400" />
                  <p className="mt-1 font-display text-sm">{f.hp}</p>
                  <p className="text-[10px] text-muted-foreground">HP</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <Shield size={14} className="mx-auto text-sky-400" />
                  <p className="mt-1 font-display text-sm">{f.ca}</p>
                  <p className="text-[10px] text-muted-foreground">CA</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <Swords size={14} className="mx-auto text-amber-400" />
                  <p className="mt-1 font-display text-sm">+{f.ataque}</p>
                  <p className="text-[10px] text-muted-foreground">ATQ</p>
                </div>
              </div>

              <Button variant="outline" className="mt-4 w-full border-primary/40 hover:bg-primary/10">
                Ver Ficha Completa
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Fichas;
