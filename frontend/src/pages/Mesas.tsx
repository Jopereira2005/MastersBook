import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, Users, Crown, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"; // <-- DialogDescription adicionado
import { toast } from "sonner";

import { JoinTableForm } from "@/components/join-table-form";
import { TableCard } from "@/components/table-card";
import { TableForm } from "@/components/table-form";
import { tableService } from "@/services/table.service";
import { systemService } from "@/services/system.service";
import { useAuth } from "@/hooks/use-auth";
import { ITable } from "@/interfaces/table";
import { ISystem } from "@/interfaces/system";

const Mesas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gmTables, setGmTables] = useState<ITable[]>([]);
  const [playerTables, setPlayerTables] = useState<ITable[]>([]);
  const [availableTables, setAvailableTables] = useState<ITable[]>([]);
  const [systems, setSystems] = useState<ISystem[]>([]);

  const [openJoin, setOpenJoin] = useState(false);
  const [joiningTable, setJoiningTable] = useState<ITable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editingTable, setEditingTable] = useState<ITable | null>(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gm, participating, available, systemList] = await Promise.all([
        tableService.getByGm(user!.id),
        tableService.getByPlayer(user!.id),
        tableService.getAvailable(user!.id),
        systemService.getAll(),
      ]);

      setGmTables(gm);
      setPlayerTables(participating);
      setAvailableTables(available);
      setSystems(systemList);
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao consultar os oráculos.");
    } finally {
      setIsLoading(false);
    }
  };

  // NOVA LÓGICA DE AÇÃO: Direciona para o jogo ou para o modal de código
  const handleAction = (tableId: string) => {
    const isAvailable = availableTables.some((t) => t.id === tableId);

    if (isAvailable) {
      const table = availableTables.find((t) => t.id === tableId);
      setJoiningTable(table || null);
    } else {
      toast.info("Abrindo sessão de jogo...");
      navigate(`/mesa/${tableId}`); // <-- TELETRANSPORTE PARA O VTT
    }
  };

  // LÓGICA DE EDIÇÃO: Exclusiva do Mestre
  const handleEditClick = (table: ITable) => {
    setEditingTable(table);
  };

  const handleDeleteTable = (tableId: string) => {
    setGmTables((prev) => prev.filter((table) => table.id !== tableId));
    setEditingTable(null);
  };

  return (
    <div className="space-y-10 pb-20">
      
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Taverna</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Mesas de Jogo</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          
          {/* MODAL ENTRAR NA MESA */}
          <Dialog 
            open={openJoin || !!joiningTable} 
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpenJoin(false);
                setJoiningTable(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => setOpenJoin(true)} 
                className="flex-1 sm:flex-none border-primary/30 hover:bg-primary/10 text-primary"
              >
                <Key size={18} className="mr-2" /> Usar Código
              </Button>
            </DialogTrigger>

            <DialogContent className="glass-card border-primary/30 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl gradient-text">Entrar em uma Campanha</DialogTitle>
                <DialogDescription className="sr-only">Digite o código para entrar em uma mesa</DialogDescription>
              </DialogHeader>
              
              <JoinTableForm 
                userId={user!.id} 
                targetTable={joiningTable}
                onSuccess={(tableId) => {
                  setOpenJoin(false);
                  setJoiningTable(null);
                  toast.info("Invocando os portões da sessão...");
                  navigate(`/mesa/${tableId}`);
                }} 
              />
            </DialogContent>
          </Dialog>

          {/* MODAL CRIAR MESA */}
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none bg-gradient-primary shadow-glow hover:scale-105 transition-transform">
                <Plus size={18} className="mr-2" /> Nova Mesa
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/30 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl gradient-text">Forjar Nova Campanha</DialogTitle>
                <DialogDescription className="sr-only">Formulário de criação de mesa</DialogDescription>
              </DialogHeader>

              <TableForm
                mode="create"
                sistemas={systems}
                userId={user!.id}
                onSuccess={(newTable) => {
                  setGmTables((prev) => [newTable, ...prev]);
                  setOpenCreate(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* MODAL EDITAR MESA */}
      <Dialog open={!!editingTable} onOpenChange={(isOpen) => !isOpen && setEditingTable(null)}>
        <DialogContent className="glass-card border-primary/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gradient-text">Configurações da Mesa</DialogTitle>
            <DialogDescription className="sr-only">Ajustes da campanha pelo mestre</DialogDescription>
          </DialogHeader>
          {editingTable && (
            <TableForm
              mode="edit"
              initialData={editingTable}
              sistemas={systems}
              userId={user!.id}
              onSuccess={(updatedFields) => {
                setGmTables((prev) => 
                  prev.map((t) => (t.id === updatedFields.id ? { ...t, ...updatedFields } : t))
                );
                setEditingTable(null);
              }}
              onDelete={handleDeleteTable} 
            />
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-70">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-muted-foreground font-display tracking-widest uppercase text-xs">Consultando pergaminhos...</p>
        </div>
      ) : (
        <div className="space-y-16">
          
          <section>
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground/90">
              <Crown className="text-primary" size={22} /> Campanhas que Mestra
            </h2>
            {gmTables.length === 0 ? (
              <div className="text-center p-10 border border-dashed border-border/40 rounded-2xl bg-muted/5 italic text-muted-foreground text-sm">
                Livro de mestre em branco.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gmTables.map((table) => (
                  <TableCard 
                    key={table.id} 
                    table={table} 
                    isMestre={true} 
                    onActionClick={handleAction} 
                    onEditClick={handleEditClick} // <-- Passando a função de edição
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground/90">
              <Shield className="text-primary" size={22} /> Campanhas que Participa
            </h2>
            {playerTables.length === 0 ? (
              <div className="text-center p-10 border border-dashed border-border/40 rounded-2xl bg-muted/5 italic text-muted-foreground text-sm">
                Você ainda não faz parte de nenhuma party aventureira.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {playerTables.map((table) => (
                  <TableCard 
                    key={table.id} 
                    table={table} 
                    isMestre={false} 
                    onActionClick={handleAction} 
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground/90">
              <Users className="text-primary" size={22} /> Procurando Aventureiros
            </h2>
            {availableTables.length === 0 ? (
              <div className="text-center p-10 border border-dashed border-border/40 rounded-2xl bg-muted/5 italic text-muted-foreground text-sm">
                Nenhuma party à procura de membros no momento.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableTables.map((table) => (
                  <TableCard 
                    key={table.id} 
                    table={table} 
                    isMestre={false}
                    isAvailable={true} // <-- Ativando o layout de "Entrar" com chave
                    onActionClick={handleAction} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Mesas;