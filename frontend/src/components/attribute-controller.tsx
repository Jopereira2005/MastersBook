import { useState, useEffect } from "react";
import { 
  Heart, Droplet, Save, Loader2, Plus, X, Skull, 
  User2, Shield, Star, ScrollText, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ITablePlayer } from "@/interfaces/table-player";

interface AttributeControllerProps {
  player: ITablePlayer;
  onUpdate: (playerId: string, status: Partial<ITablePlayer>) => Promise<void>;
  children: React.ReactNode;
  canEdit: boolean; // ✨ Propriedade fundamental para o controle de acesso
}

export function AttributeController({ player, onUpdate, children, canEdit }: AttributeControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chaves dos atributos padrão para separar dos customizados
  const baseKeys = ["hp", "mana", "mp", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
  const maxAttr = player.character?.attributes || { hp: 10, mana: 10 };
  console.log(player)
  // Estados do Formulário
  const [form, setForm] = useState<Record<string, number | string>>({});
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");

  // Sincronização de dados ao abrir o Modal
  useEffect(() => {
    if (isOpen) {
      const current = player.currentAttributes || {};
      setForm({
        hp: current.hp ?? maxAttr.hp ?? 0,
        mana: current.mana ?? current.mp ?? maxAttr.mana ?? 0,
        forca: current.forca ?? maxAttr.forca ?? 10,
        destreza: current.destreza ?? maxAttr.destreza ?? 10,
        constituicao: current.constituicao ?? maxAttr.constituicao ?? 10,
        inteligencia: current.inteligencia ?? maxAttr.inteligencia ?? 10,
        sabedoria: current.sabedoria ?? maxAttr.sabedoria ?? 10,
        carisma: current.carisma ?? maxAttr.carisma ?? 10,
        ...Object.fromEntries(
          Object.entries(current).filter(([key]) => !baseKeys.includes(key))
        )
      });
      setConditions(player.conditions || []);
      setNewCondition("");
      setCustomKey("");
      setCustomValue("");
    }
  }, [isOpen, player.currentAttributes, player.conditions]);

  const handleNumericInput = (field: string, value: string) => {
    if (!canEdit) return;
    if (value === "") {
      setForm(prev => ({ ...prev, [field]: "" }));
      return;
    }
    const onlyNums = value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, [field]: Number(onlyNums) }));
  };

  const handleAddCondition = () => {
    if (canEdit && newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions(prev => [...prev, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const addCustomAttribute = () => {
    if (canEdit && customKey.trim()) {
      setForm(prev => ({ ...prev, [customKey.trim()]: Number(customValue) || 0 }));
      setCustomKey("");
      setCustomValue("");
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setLoading(true);
    try {
      const finalAttributes = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v) || 0])
      );
      await onUpdate(player.userId!, {
        currentAttributes: { ...finalAttributes, mp: finalAttributes.mana },
        conditions: conditions
      });
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="glass-card border-primary/20 w-[95vw] max-w-2xl shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-display text-2xl text-primary flex items-center gap-3 uppercase tracking-tighter">
            <span className="text-3xl">{player.character?.avatarUrl || "👤"}</span>
            {player.character?.firstName} {player.character?.lastName}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium uppercase text-[10px] tracking-[0.2em]">
            {canEdit ? "Gestão de Personagem" : "Visualização de Ficha (Somente Leitura)"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-8 pb-4">
            
            {/* 1. VISUALIZAÇÃO GERAL (BIOGRAFIA) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Raça</span>
                    <span className="text-xs font-semibold text-zinc-200 truncate flex items-center justify-center gap-1">
                      <User2 size={10} className="text-primary"/> {player.character?.race}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Classe</span>
                    <span className="text-xs font-semibold text-zinc-200 truncate flex items-center justify-center gap-1">
                      <Shield size={10} className="text-primary"/> {player.character?.class}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Nível</span>
                    <span className="text-xs font-bold text-primary flex items-center justify-center gap-1">
                      <Star size={10} fill="currentColor"/> {player.character?.level}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-lg p-3 relative overflow-hidden">
                  <ScrollText size={40} className="absolute -right-2 -bottom-2 text-white/5 rotate-12" />
                  <Label className="text-[10px] uppercase text-primary font-black mb-2 block">História / Bio</Label>
                  <p className="text-xs text-zinc-400 leading-relaxed italic line-clamp-4 hover:line-clamp-none transition-all">
                    {player.character?.bio || "Este herói ainda não tem uma lenda escrita..."}
                  </p>
                </div>
              </div>

              {/* ATRIBUTOS VITAIS (HP/MANA) */}
              <div className="space-y-4 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="space-y-1.5">
                  <Label className="text-red-400 text-[10px] uppercase font-black flex items-center gap-1"><Heart size={12}/> HP Atual</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={form.hp ?? ""} 
                      readOnly={!canEdit}
                      onChange={(e) => handleNumericInput("hp", e.target.value)} 
                      className={`bg-background/80 border-red-500/20 text-center font-mono h-9 text-sm ${!canEdit && 'border-transparent cursor-default'}`} 
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">/ {maxAttr.hp}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-cyan-400 text-[10px] uppercase font-black flex items-center gap-1"><Droplet size={12}/> Mana Atual</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={form.mana ?? ""} 
                      readOnly={!canEdit}
                      onChange={(e) => handleNumericInput("mana", e.target.value)} 
                      className={`bg-background/80 border-cyan-500/20 text-center font-mono h-9 text-sm ${!canEdit && 'border-transparent cursor-default'}`} 
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">/ {maxAttr.mana}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. ATRIBUTOS BASE */}
            <section className="space-y-3">
              <h4 className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2">
                <Sparkles size={12}/> Atributos de Sessão
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].map((attr) => (
                  <div key={attr} className="space-y-1 text-center bg-black/20 p-2 rounded-lg border border-white/5">
                    <Label className="text-[9px] uppercase text-zinc-400 block font-bold">{attr.slice(0,3)}</Label>
                    <Input 
                      value={form[attr] ?? ""} 
                      readOnly={!canEdit}
                      onChange={(e) => handleNumericInput(attr, e.target.value)} 
                      className="bg-transparent border-none text-center font-mono h-7 p-0 text-xs text-primary focus-visible:ring-0" 
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 3. RECURSOS CUSTOMIZADOS E CONDIÇÕES */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recursos Extras */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase text-primary font-black tracking-widest">Recursos de Classe</h4>
                {canEdit && (
                  <div className="flex gap-2">
                    <Input placeholder="Nome" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="bg-background/50 border-white/10 text-xs h-9 flex-1" />
                    <Input placeholder="Val" value={customValue} onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9]/g, ''))} className="bg-background/50 border-white/10 text-center font-mono w-16 h-9" />
                    <Button type="button" onClick={addCustomAttribute} size="icon" className="h-9 w-9 bg-primary/20 text-primary hover:bg-primary/40"><Plus size={16} /></Button>
                  </div>
                )}
                <div className="space-y-1.5">
                  {Object.entries(form).filter(([k]) => !baseKeys.includes(k)).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-white/5 p-2 rounded-md border border-white/5 group">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold truncate pr-2">{key}</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={val ?? ""} 
                          readOnly={!canEdit}
                          onChange={(e) => handleNumericInput(key, e.target.value)} 
                          className={`h-6 w-12 bg-black/40 border-none text-center font-mono text-xs text-primary focus-visible:ring-0 ${!canEdit && 'cursor-default'}`} 
                        />
                        {canEdit && <button onClick={() => { const n = {...form}; delete n[key]; setForm(n); }} className="text-red-500/50 hover:text-red-500"><X size={12}/></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condições */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase text-red-400 font-black tracking-widest">Status / Condições</h4>
                {canEdit && (
                  <div className="flex gap-2">
                    <Input value={newCondition} onChange={(e) => setNewCondition(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())} placeholder="Ex: Cego..." className="bg-background/50 border-red-500/20 text-xs h-9" />
                    <Button type="button" onClick={handleAddCondition} size="icon" variant="outline" className="h-9 w-9 border-red-500/20 text-red-400"><Plus size={16} /></Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {conditions.map(cond => (
                    <Badge key={cond} variant="outline" className="bg-red-950/40 text-red-400 border-red-500/30 text-[9px] py-1 pl-2 pr-1 flex items-center gap-1">
                      <Skull size={10} className="opacity-50" /> {cond}
                      {canEdit && <button onClick={() => setConditions(prev => prev.filter(c => c !== cond))} className="ml-1 hover:bg-red-500/20 rounded-full"><X size={10} /></button>}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-500">
            {canEdit ? "Cancelar" : "Fechar"}
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary shadow-glow text-white px-8 font-bold">
              {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save size={16} className="mr-2"/>}
              Sincronizar Status
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}