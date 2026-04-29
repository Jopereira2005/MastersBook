import { useState } from "react";
import { Plus, Heart, Shield, Swords, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

  forca: number;
  destreza: number;
  constituicao: number;
  sabedoria: number;
  inteligencia: number;

  cor: string;
}

const initial: Ficha[] = [
  {
    id: "1",
    nome: "Aelin Ashryver",
    classe: "Ranger",
    raca: "Meio-elfa",
    nivel: 8,
    hp: 72,
    ca: 16,
    ataque: 9,
    forca: 14,
    destreza: 18,
    constituicao: 12,
    sabedoria: 13,
    inteligencia: 10,
    cor: "from-purple-500 to-fuchsia-500",
  },
];

const classes = ["Guerreiro", "Mago", "Ladino", "Clérigo", "Paladino", "Ranger"];
const racas = ["Humano", "Elfo", "Anão", "Orc", "Tiefling", "Meio-elfo"];

const Fichas = () => {
  const [fichas, setFichas] = useState<Ficha[]>(initial);
  const [open, setOpen] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);

  const [form, setForm] = useState({
    nome: "",
    classe: "",
    raca: "",
    nivel: 1,
    forca: 0,
    destreza: 0,
    constituicao: 0,
    sabedoria: 0,
    inteligencia: 0,
  });

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

    setForm({
      nome: "",
      classe: "",
      raca: "",
      nivel: 1,
      forca: 0,
      destreza: 0,
      constituicao: 0,
      sabedoria: 0,
      inteligencia: 0,
    });

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
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Classe</Label>
                  <Select onValueChange={(value) => setForm({ ...form, classe: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Raça</Label>
                  <Select onValueChange={(value) => setForm({ ...form, raca: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a raça" />
                    </SelectTrigger>
                    <SelectContent>
                      {racas.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Nível</Label>
                <Input type="number" min={1} max={20} value={form.nivel}
                  onChange={(e) => setForm({ ...form, nivel: +e.target.value })} />
              </div>

              {/* ATRIBUTOS */}
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Força" type="number" onChange={(e) => setForm({ ...form, forca: +e.target.value })} />
                <Input placeholder="Destreza" type="number" onChange={(e) => setForm({ ...form, destreza: +e.target.value })} />
                <Input placeholder="Constituição" type="number" onChange={(e) => setForm({ ...form, constituicao: +e.target.value })} />
                <Input placeholder="Sabedoria" type="number" onChange={(e) => setForm({ ...form, sabedoria: +e.target.value })} />
                <Input placeholder="Inteligência" type="number" onChange={(e) => setForm({ ...form, inteligencia: +e.target.value })} />
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
          <article key={f.id} className="glow-card p-5">
            <h3 className="font-display text-xl">{f.nome}</h3>
            <p className="text-sm text-muted-foreground">{f.classe} • Nv. {f.nivel}</p>

            <Button
              className="mt-4 w-full"
              onClick={() => {
                setSelectedFicha(f);
                setOpenModal(true);
              }}
            >
              Ver Ficha Completa
            </Button>
          </article>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ficha Completa</DialogTitle>
          </DialogHeader>

          {selectedFicha && (
            <div className="space-y-2">
              <p><strong>Nome:</strong> {selectedFicha.nome}</p>
              <p><strong>Classe:</strong> {selectedFicha.classe}</p>
              <p><strong>Raça:</strong> {selectedFicha.raca}</p>
              <p><strong>Nível:</strong> {selectedFicha.nivel}</p>

              <hr />

              <p>HP: {selectedFicha.hp}</p>
              <p>Força: {selectedFicha.forca}</p>
              <p>Destreza: {selectedFicha.destreza}</p>
              <p>Constituição: {selectedFicha.constituicao}</p>
              <p>Sabedoria: {selectedFicha.sabedoria}</p>
              <p>Inteligência: {selectedFicha.inteligencia}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fichas;