import { useState, useEffect } from "react";
import { Plus, Loader2, Sparkles, Search, Heart, Droplet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { characterService } from "@/services/character.service";
import { systemService } from "@/services/system.service";
import { ICharacter } from "@/interfaces/character";
import { ISystem } from "@/interfaces/system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CharacterForm } from "@/components/character-form";
import { toast } from "sonner";

export default function Fichas() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<ICharacter[]>([]);
  const [systems, setSystems] = useState<ISystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de controlo do Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<ICharacter | null>(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Procura em simultâneo os heróis e os sistemas disponíveis
      const [charList, systemList] = await Promise.all([
        characterService.getByUser(user!.id),
        systemService.getAll()
      ]);
      setCharacters(charList);
      setSystems(systemList);
    } catch (error: any) {
      toast.error("Erro ao ler os teus pergaminhos antigos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (char: ICharacter) => {
    setEditingChar(char);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingChar(null);
    loadData(); // Recarrega a lista para refletir as mudanças (incluindo duplicações ou deletes)
  };

  // Filtro de busca inteligente (Primeiro Nome, Sobrenome ou Classe)
  const filteredChars = characters.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.race?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER DA PÁGINA */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Grimório</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">Seus Heróis</h1>
        </div>
        <Button 
          onClick={() => { setEditingChar(null); setIsFormOpen(true); }} 
          className="bg-gradient-primary shadow-glow hover:scale-105 transition-transform text-white font-bold"
        >
          <Plus size={18} className="mr-2" /> Novo Personagem
        </Button>
      </header>

      {/* BARRA DE PESQUISA */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Buscar por nome ou classe..." 
          className="pl-10 bg-card/30 border-primary/10 focus:border-primary/40 focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ÁREA DE CONTEÚDO / LISTAGEM */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-70">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="font-display tracking-widest uppercase text-xs text-muted-foreground">Invocando aliados...</p>
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center p-20 glass-card border-dashed border-primary/20">
          <Sparkles className="mx-auto text-primary/40 mb-4" size={48} />
          <p className="text-muted-foreground">O teu grimório está vazio. Você não tem heróis neste mundo.</p>
          <Button variant="link" onClick={() => setIsFormOpen(true)} className="text-primary mt-2 p-0">
            Que tal forjar o primeiro?
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredChars.map((char) => (
            <button 
              key={char.id} 
              onClick={() => handleOpenEdit(char)}
              className="glow-card p-6 flex flex-col items-center text-center space-y-4 group transition-all w-full relative"
            >
              {/* Avatar (Emoji) */}
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-zinc-900 border border-primary/20 text-3xl group-hover:scale-110 transition-transform shadow-glow">
                
                {char.avatarUrl && char.avatarUrl.length <= 5 ? (
                  <span>{char.avatarUrl}</span>
                ) : (
                  "👤"
                )}
              </div>

              <div className="w-full">
                {/* Nome Completo */}
                <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors truncate">
                  {char.firstName} {char.lastName}
                </h3>
                
                {/* Classe e Nível */}
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold truncate">
                  {char.class || "Sem Classe"} • Nvl {char.level || 1}
                </p>
                
                {/* Resumo Rápido de Status (HP e Mana) */}
                {char.attributes && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20">
                      <Heart size={10} className="fill-red-400/20"/> {char.attributes.hp}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
                      <Droplet size={10} className="fill-blue-400/20"/> {char.attributes.mana}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      <Dialog 
        open={isFormOpen} 
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingChar(null);
        }}
      >
        <DialogContent className="glass-card border-primary/30 sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gradient-text">
              {editingChar ? "Editar Herói" : "Forjar Novo Herói"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preenche os detalhes do seu herói, como nome, raça, classe e atributos para salvar no seu grimório.
            </DialogDescription>
          </DialogHeader>
          
          <CharacterForm 
            mode={editingChar ? "edit" : "create"}
            initialData={editingChar}
            systems={systems}
            userId={user!.id}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}