import { useState, useEffect } from "react";
import { Plus, Users, Crown, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TableService } from "@/services/table.service";
import { ITable } from "@/interfaces/table";

// ⚠️ MOCK DE USUÁRIO: Altere para um ID real do seu banco de dados
const TEST_USER_ID = "dd4d3980-8d83-4970-aa91-af415a0891fc"; 

const Mesas = () => {
  // Estados para gerenciar as mesas
  const [minhasMesas, setMinhasMesas] = useState<ITable[]>([]);
  const [mesasDisponiveis, setMesasDisponiveis] = useState<ITable[]>([]);
  
  // Estados de Interface e Formulário
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", systemId: "" });

  // Busca inicial das mesas
  useEffect(() => {
    carregarMesas();
  }, []);

  const carregarMesas = async () => {
    setIsLoading(true);
    try {
      // Usando getAll para poder separar o que é meu e o que é dos outros
      const todasAsMesas = await TableService.getAll();
      
      // Filtra as mesas onde o usuário logado é o mestre
      setMinhasMesas(todasAsMesas.filter((mesa) => mesa.gmId === TEST_USER_ID));
      
      // Filtra as mesas onde ele NÃO é o mestre (para poder entrar)
      setMesasDisponiveis(todasAsMesas.filter((mesa) => mesa.gmId !== TEST_USER_ID));
    } catch (error: any) {
      toast.error(error.message || "Falha ao carregar as campanhas das trevas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const novaMesa = await TableService.create({
        name: form.name,
        description: form.description,
        systemId: form.systemId,
        gmId: TEST_USER_ID // Passando o ID do mestre criador
      });

      // Adiciona a nova mesa diretamente no estado (sem precisar recarregar a API)
      setMinhasMesas((prev) => [...prev, novaMesa]);
      
      setForm({ name: "", description: "", systemId: "" });
      setOpen(false);
      toast.success(`A campanha "${novaMesa.name}" foi forjada com sucesso!`);
    } catch (error: any) {
      // Tratamento profissional de erros do Zod ou do Servidor
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => toast.error(`${err.campo}: ${err.mensagem}`));
      } else {
        toast.error(error.error || error.message || "Erro desconhecido ao criar a mesa.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Sub-componente para renderizar os cartões para evitar repetição de código
  const renderCardMesa = (m: ITable, isMestre: boolean) => (
    <article key={m.id} className="glow-card p-6 flex flex-col h-full bg-card/40 backdrop-blur-sm border border-border/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary">
            {m.system?.name || "Sistema Customizado"}
          </span>
          <h3 className="font-display text-xl mt-1 text-card-foreground break-words">{m.name}</h3>
        </div>
        {isMestre && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary whitespace-nowrap flex items-center gap-1">
            <Crown size={12} /> Mestre
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-3 flex-1">
        {m.description || "Sem descrição disponível para esta aventura."}
      </p>

      <div className="mt-5 space-y-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Crown size={14} className="text-primary" /> {m.gm?.username || "Mestre Desconhecido"}
        </p>
        <p className="flex items-center gap-2">
          <Users size={14} className="text-primary" /> {m.players?.length || 0} aventureiros na party
        </p>
      </div>

      <Button 
        variant={isMestre ? "outline" : "default"}
        className={`mt-5 w-full shadow-glow hover:opacity-90 transition-all ${isMestre ? 'border-primary text-primary hover:bg-primary/10' : 'bg-gradient-primary text-primary-foreground'}`}
      >
        {isMestre ? "Gerenciar Campanha" : (
          <span className="flex items-center gap-2">Entrar na Mesa <ArrowRight size={16} /></span>
        )}
      </Button>
    </article>
  );

  return (
    <div className="space-y-10 pb-10">
      {/* HEADER E MODAL */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Taverna</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Mesas de Jogo</h1>
          <p className="mt-1 text-muted-foreground">Crie seu universo ou junte-se à party de outros mestres.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow hover:scale-105 transition-transform">
              <Plus size={18} className="mr-2" /> Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl gradient-text">Forjar nova mesa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5 mt-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Campanha</Label>
                <Input 
                  id="nome"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="Ex: A Maldição de Strahd"
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                  required 
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (Sinopse)</Label>
                <Textarea 
                  id="descricao"
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Conte um pouco sobre o universo..."
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary resize-none h-24"
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sistema">ID do Sistema de RPG</Label>
                <Input 
                  id="sistema"
                  value={form.systemId} 
                  onChange={(e) => setForm({ ...form, systemId: e.target.value })} 
                  placeholder="Ex: UUID do D&D 5e gerado no banco" 
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary font-mono text-sm"
                  required 
                  disabled={isCreating}
                />
                <p className="text-[10px] text-muted-foreground mt-1">*Temporário até criarmos o dropdown de sistemas.</p>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isCreating} className="w-full bg-gradient-primary shadow-glow">
                  {isCreating ? <Loader2 className="animate-spin mr-2" size={18} /> : "Invocar Mesa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* ESTADO DE LOADING GLOBAL */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-70">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-muted-foreground font-display tracking-widest uppercase text-sm">Consultando os oráculos...</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SEÇÃO 1: MINHAS MESAS (MESTRE) */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground/90">
              <Crown className="text-primary" size={24}/> Suas Campanhas (Mestre)
            </h2>
            {minhasMesas.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/10">
                <p className="text-muted-foreground">Você ainda não mestra nenhuma campanha.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {minhasMesas.map((m) => renderCardMesa(m, true))}
              </div>
            )}
          </section>

          {/* SEÇÃO 2: MESAS DISPONÍVEIS (PARA ENTRAR) */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground/90">
              <Users className="text-primary" size={24}/> Procurando Jogadores
            </h2>
            {mesasDisponiveis.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/10">
                <p className="text-muted-foreground">Nenhuma taverna procurando aventureiros no momento.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mesasDisponiveis.map((m) => renderCardMesa(m, false))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
};

export default Mesas;