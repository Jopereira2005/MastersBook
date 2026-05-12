import { useState } from "react";
import { 
  MapPin, Calendar, Cloud, Image, 
  ScrollText, Save, Loader2, ThermometerSun 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { ITableState } from "@/interfaces/table-state";

interface GMControllerProps {
  initialState: ITableState | null | undefined;
  onUpdate: (newState: Partial<ITableState>) => Promise<void>;
}

export function GMController({ initialState, onUpdate }: GMControllerProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentLocation: initialState?.currentLocation || "",
    inGameDate: initialState?.inGameDate || "",
    weather: initialState?.weather || "Céu Limpo",
    activeScene: initialState?.activeScene || "EXPLORATION",
    publicNotes: initialState?.publicNotes || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
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
              <Image size={14} /> Cena Atual
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
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-gradient-primary shadow-glow text-white font-bold"
      >
        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
        Alterar Realidade
      </Button>
    </div>
  );
}