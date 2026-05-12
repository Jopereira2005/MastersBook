import { useState, useEffect } from "react";
import { Loader2, Key, Swords, ShieldAlert, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

import { tableService } from "@/services/table.service";
import { characterService } from "@/services/character.service"; 
import { ICharacter } from "@/interfaces/character"; 
import { ITable } from "@/interfaces/table";

interface JoinTableFormProps {
  userId: string;
  targetTable?: ITable | null;
  onSuccess: (tableId: string) => void;
}

export function JoinTableForm({ userId, targetTable, onSuccess }: JoinTableFormProps) {
  const [loading, setLoading] = useState(false);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  
  const [characters, setCharacters] = useState<ICharacter[]>([]);
  
  const [inviteCode, setInviteCode] = useState(""); 
  const [characterId, setCharacterId] = useState("");

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoadingCharacters(true);
      try {
        let data: ICharacter[];
        
        if (targetTable?.systemId) {
          data = await characterService.getByUserAndSystem(userId, targetTable.systemId);
        } else {
          data = await characterService.getByUser(userId);
        }
        
        setCharacters(data);
      } catch (error: any) {
        toast.error("Erro ao invocar os teus heróis: " + error.message);
      } finally {
        setIsLoadingCharacters(false);
      }
    };

    fetchCharacters();
  }, [userId, targetTable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterId) return toast.warning("Seleciona um herói para entrar na aventura!");
    if (!inviteCode.trim()) return toast.warning("O código de convite é obrigatório.");

    setLoading(true);
    try {
      // Chamamos o serviço e capturamos a resposta (que deve conter o tableId ou a própria mesa)
      const response = await tableService.joinTable(inviteCode.trim(), userId, characterId);
      const tableId = response.tableId || targetTable?.id;

      toast.success("As portas da taverna abriram-se! Entraste na mesa.");
      onSuccess(tableId); 
      
    } catch (error: any) {
      toast.error(error.message || "Código inválido ou herói indisponível.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">  
      {/* Aviso de qual mesa está a tentar entrar */}
      {targetTable && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
          <Dices className="text-primary shrink-0" size={24} />
          <div className="min-w-0">
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">A unir-se à campanha</p>
            <p className="text-sm font-semibold text-foreground truncate">{targetTable.name}</p>
          </div>
        </div>
      )}

      {/* Código de Convite */}
      <div className="space-y-2">
        <Label htmlFor="inviteCode" className="flex items-center gap-2 text-zinc-300">
          <Key size={16} className="text-primary" /> Código de Convite
        </Label>
        <Input 
          id="inviteCode"
          value={inviteCode} 
          disabled={loading} 
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())} 
          placeholder="Ex: XYZ123"
          className="bg-background/50 border-primary/20 font-mono text-lg tracking-widest uppercase"
          required 
        />
        <p className="text-[10px] text-muted-foreground italic">Solicita o código secreto ao Mestre da campanha.</p>
      </div>

      {/* Seleção de Personagem*/}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-zinc-300">
          <Swords size={16} className="text-primary" /> Seleciona o teu Herói
        </Label>
        
        {isLoadingCharacters ? (
          <div className="flex items-center justify-center p-3 border border-primary/10 rounded-md bg-background/50">
            <Loader2 className="animate-spin text-primary" size={18} />
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-red-500/30 rounded-md bg-red-500/5 text-center gap-2">
            <ShieldAlert className="text-red-400" size={24} />
            <p className="text-xs text-red-400 font-medium">
              {targetTable 
                ? `Não tens heróis para o sistema ${targetTable.system?.name || "desta mesa"}!` 
                : "Não possuis fichas criadas!"}
            </p>
            <p className="text-[10px] text-muted-foreground italic">Cria um herói adequado antes de entrares.</p>
          </div>
        ) : (
          <Select value={characterId} onValueChange={setCharacterId} disabled={loading}>
            <SelectTrigger className="bg-background/50 border-primary/20 h-14">
              <SelectValue placeholder="Escolhe o teu herói..." />
            </SelectTrigger>
            
            <SelectContent className="glass-card border-primary/20">
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.id} className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                      <AvatarFallback className="bg-zinc-800 text-primary font-bold">
                        {char.avatarUrl && char.avatarUrl.length <= 5 ? char.avatarUrl : char.firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm">{char.firstName} {char.lastName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase truncate max-w-[180px]">
                        {char.class || "Sem Classe"} • Nvl {char.level}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={loading || characters.length === 0 || !inviteCode} 
        className="w-full bg-gradient-primary shadow-glow text-white font-bold h-12"
      >
        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Entrar na Taverna"}
      </Button>
    </form>
  );
}