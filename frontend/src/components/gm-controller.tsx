import { useState, useEffect } from "react";
import { 
  MapPin, Calendar, Cloud, Image as ImageIcon, 
  ScrollText, Save, Loader2, ThermometerSun,
  Sword, Globe2, ArrowUp, ArrowDown, Play, Square, SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { ITableState } from "@/interfaces/table-state";
import { ITablePlayer } from "@/interfaces/table-player";

interface GMControllerProps {
  initialState: ITableState | null | undefined;
  players: ITablePlayer[];
  onUpdate: (newState: Partial<ITableState>) => Promise<void>;
  onToggleCombat: (isActive: boolean, turnOrder: string[]) => void;
  onNextTurn: () => void;
}

export function GMController({ initialState, players, onUpdate, onToggleCombat, onNextTurn }: GMControllerProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentLocation: initialState?.currentLocation || "",
    inGameDate: initialState?.inGameDate || "",
    weather: initialState?.weather || "Céu Limpo",
    activeScene: initialState?.activeScene || "EXPLORATION",
    publicNotes: initialState?.publicNotes || "",
  });

  // Estado local para organizar a iniciativa antes de enviar
  const [localTurnOrder, setLocalTurnOrder] = useState<string[]>([]);

  useEffect(() => {
    if (initialState) {
      setForm({
        currentLocation: initialState.currentLocation || "",
        inGameDate: initialState.inGameDate || "",
        weather: initialState.weather || "Céu Limpo",
        activeScene: initialState.activeScene || "EXPLORATION",
        publicNotes: initialState.publicNotes || "",
      });

      // Se não houver combate, preenche a lista com os IDs de todos para o Mestre organizar
      if (!initialState.isCombatActive && players) {
        setLocalTurnOrder(players.map(p => p.userId!));
      }
    }
  }, [initialState, players]);

  const handleSaveMundo = async () => {
    setLoading(true);
    try {
      await onUpdate(form);
    } finally {
      setLoading(false);
    }
  };

  const movePlayer = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...localTurnOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setLocalTurnOrder(newOrder);
  };

  const isCombatActive = initialState?.isCombatActive || false;

  return (
    <Tabs defaultValue="mundo" className="w-full">
      <TabsList className="w-full bg-black/40 border border-white/5 grid grid-cols-2 mb-4">
        <TabsTrigger value="mundo" className="text-xs font-bold uppercase tracking-wider">
          <Globe2 size={14} className="mr-2"/> Mundo
        </TabsTrigger>
        <TabsTrigger value="combate" className="text-xs font-bold uppercase tracking-wider text-red-500 data-[state=active]:text-red-400">
          <Sword size={14} className="mr-2"/> Combate
        </TabsTrigger>
      </TabsList>

      {/* ==========================================
          ABA 1: O SEU CÓDIGO ORIGINAL DO MUNDO
      ============================================= */}
      <TabsContent value="mundo" className="space-y-6 py-2">
        <div className="space-y-4">
          {/* 1. LOCALIZAÇÃO E DATA */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-primary">
                <MapPin size={14} /> Localização Atual
              </Label>
              <Input 
                value={form.currentLocation} 
                onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                placeholder="Ex: Floresta dos Sussurros"
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-primary">
                <Calendar size={14} /> Data In-Game
              </Label>
              <Input 
                value={form.inGameDate} 
                onChange={(e) => setForm({ ...form, inGameDate: e.target.value })}
                placeholder="Ex: 14 de Kythorn, 1492"
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>

          {/* 2. CLIMA E CENA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-primary">
                <Cloud size={14} /> Clima
              </Label>
              <Select 
                value={form.weather} 
                onValueChange={(v) => setForm({ ...form, weather: v })}
              >
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Clima" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Céu Limpo">☀️ Limpo</SelectItem>
                  <SelectItem value="Chuva">🌧️ Chuva</SelectItem>
                  <SelectItem value="Tempestade">⚡ Tempestade</SelectItem>
                  <SelectItem value="Nevoeiro">🌫️ Nevoeiro</SelectItem>
                  <SelectItem value="Neve">❄️ Neve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-primary">
                <ImageIcon size={14} /> Cena Atual
              </Label>
              <Select 
                value={form.activeScene} 
                onValueChange={(v) => setForm({ ...form, activeScene: v })}
              >
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Cena" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPLORATION">🗺️ Exploração</SelectItem>
                  <SelectItem value="COMBAT">⚔️ Combate</SelectItem>
                  <SelectItem value="ROLEPLAY">🎭 Interpretação</SelectItem>
                  <SelectItem value="REST">⛺ Descanso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3. NOTAS PÚBLICAS */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-primary">
              <ScrollText size={14} /> Notas Narrativas (Público)
            </Label>
            <Textarea 
              value={form.publicNotes}
              onChange={(e) => setForm({ ...form, publicNotes: e.target.value })}
              placeholder="Descreve o ambiente para os jogadores..."
              className="bg-background/50 border-white/10 min-h-[120px] resize-none"
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Estas notas aparecerão no ecrã de todos os jogadores.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSaveMundo} 
          disabled={loading}
          className="w-full bg-gradient-primary shadow-glow text-white font-bold h-10"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Alterar Realidade
        </Button>
      </TabsContent>

      {/* ==========================================
          ABA 2: O NOVO MOTOR DE COMBATE
      ============================================= */}
      <TabsContent value="combate" className="space-y-4">
        <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
              <Sword size={16}/> {isCombatActive ? "Combate em Progresso" : "Preparar Iniciativa"}
            </h3>
            {isCombatActive && (
              <Badge className="bg-red-500 text-white animate-pulse">
                TURNO {initialState?.currentTurn !== undefined ? initialState.currentTurn + 1 : 1}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {(isCombatActive && initialState?.turnOrder ? initialState.turnOrder : localTurnOrder).map((userId, index) => {
              const p = players.find(pl => pl.userId === userId);
              if (!p) return null;
              const isCurrentTurn = isCombatActive && index === initialState?.currentTurn;

              return (
                <div key={userId} className={`flex items-center gap-3 p-2 rounded-lg border ${isCurrentTurn ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/40 border-white/5'}`}>
                  <div className="text-zinc-600 font-black text-xs w-4 text-center">{index + 1}</div>
                  <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                    <AvatarImage src={p.character?.avatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-zinc-900 text-xs font-bold text-zinc-500">{p.character?.firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrentTurn ? 'text-red-400' : 'text-zinc-200'}`}>
                      {p.character?.firstName} {isCurrentTurn && "(Agindo)"}
                    </p>
                  </div>
                  
                  {/* Setas só aparecem quando o combate NÃO está a decorrer para permitir reorganização */}
                  {!isCombatActive && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => movePlayer(index, 'up')} disabled={index === 0} className="text-zinc-500 hover:text-white disabled:opacity-30"><ArrowUp size={14}/></button>
                      <button onClick={() => movePlayer(index, 'down')} disabled={index === localTurnOrder.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30"><ArrowDown size={14}/></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {isCombatActive ? (
              <>
                <Button onClick={onNextTurn} className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-black uppercase tracking-widest h-12 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <SkipForward size={18} className="mr-2"/> Passar Turno
                </Button>
                <Button onClick={() => onToggleCombat(false, [])} variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-xs h-10">
                  <Square size={14} className="mr-2"/> Encerrar Combate
                </Button>
              </>
            ) : (
              <Button onClick={() => onToggleCombat(true, localTurnOrder)} className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest h-12 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <Play size={18} className="mr-2"/> Iniciar Combate
              </Button>
            )}
          </div>

        </div>
      </TabsContent>
    </Tabs>
  );
}