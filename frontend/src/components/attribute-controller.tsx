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
import { ITablePlayer } from "@/interfaces/table-player";

interface AttributeControllerProps {
  player: ITablePlayer;
  onUpdate: (playerId: string, status: Partial<ITablePlayer>) => Promise<void>;
  children: React.ReactNode;
  canEdit: boolean;
}

export function AttributeController({ player, onUpdate, children, canEdit }: AttributeControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseKeys = ["hp", "mana", "mp", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
  const maxAttr = player.character?.attributes || { hp: 10, mana: 10 };

  const [form, setForm] = useState<Record<string, number | string>>({});
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");
  const [customKey, setCustomKey] = useState("");

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
    }
  }, [isOpen]);

  const handleNumericInput = (field: string, value: string) => {
    if (!canEdit) return;
    if (value === "") {
      setForm(prev => ({ ...prev, [field]: "" }));
      return;
    }
    const onlyNums = value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, [field]: Number(onlyNums) }));
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
      
      <DialogContent className="glass-card border-primary/20 w-[95vw] max-w-2xl shadow-2xl h-auto max-h-[85vh] md:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-white/5">
          <DialogTitle className="font-display text-xl md:text-2xl text-primary flex items-center gap-3 uppercase">
            <span className="text-2xl md:text-3xl">{player.character?.avatarUrl || "👤"}</span>
            <span className="truncate">{player.character?.firstName} {player.character?.lastName}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium uppercase text-[10px] tracking-widest mt-1">
            {canEdit ? "Gestão de Status e Atributos" : "Visualização do Personagem"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="space-y-8">
            
            {/* 1. INFO GERAL */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">Raça</span>
                    <span className="text-xs font-semibold text-zinc-200 truncate">{player.character?.race}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">Classe</span>
                    <span className="text-xs font-semibold text-zinc-200 truncate">{player.character?.class}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">Nível</span>
                    <span className="text-xs font-bold text-primary">{player.character?.level}</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                  <span className="text-[10px] uppercase text-primary font-black mb-1 block">Bio</span>
                  <p className="text-xs text-zinc-400 italic leading-relaxed">{player.character?.bio || "Sem lenda."}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-red-400 text-[10px] uppercase font-bold flex items-center gap-1"><Heart size={12}/> HP</Label>
                  <div className="flex items-center gap-2">
                    <Input value={form.hp ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput("hp", e.target.value)} className="bg-background/80 border-red-500/20 text-center font-mono h-9" />
                    <span className="text-xs text-zinc-500">/{maxAttr.hp}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-cyan-400 text-[10px] uppercase font-bold flex items-center gap-1"><Droplet size={12}/> Mana</Label>
                  <div className="flex items-center gap-2">
                    <Input value={form.mana ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput("mana", e.target.value)} className="bg-background/80 border-cyan-500/20 text-center font-mono h-9" />
                    <span className="text-xs text-zinc-500">/{maxAttr.mana}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. ATRIBUTOS BASE */}
            <section className="space-y-3">
              <h4 className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2"><Sparkles size={12}/> Atributos Principais</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].map((attr) => (
                  <div key={attr} className="bg-black/20 p-2 rounded-lg border border-white/5 text-center">
                    <Label className="text-[9px] uppercase text-zinc-400 block font-bold mb-1">{attr.slice(0,3)}</Label>
                    <Input value={form[attr] ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput(attr, e.target.value)} className="bg-transparent border-none text-center font-mono h-7 p-0 text-primary focus-visible:ring-0" />
                  </div>
                ))}
              </div>
            </section>

            {/* 3. DINÂMICOS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Custom */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase text-primary font-black">Recursos Extras</h4>
                {canEdit && (
                  <div className="flex gap-2">
                    <Input placeholder="Nome" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="bg-background/50 border-white/10 text-xs h-9 flex-1" />
                    <Button type="button" onClick={() => {if(customKey){setForm(prev => ({...prev, [customKey]: 0})); setCustomKey("");}}} className="h-9 w-9 bg-primary/20 text-primary"><Plus size={16}/></Button>
                  </div>
                )}
                <div className="space-y-2">
                  {Object.entries(form).filter(([k]) => !baseKeys.includes(k)).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-white/5 p-2 px-3 rounded-md border border-white/5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase truncate pr-2">{key}</span>
                      <div className="flex items-center gap-2">
                        <Input value={val ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput(key, e.target.value)} className="h-6 w-12 bg-black/40 border-none text-center font-mono text-xs text-primary" />
                        {canEdit && <X size={12} className="text-red-500/50 cursor-pointer" onClick={() => {const n={...form}; delete n[key]; setForm(n);}} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condições */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase text-red-400 font-black">Condições</h4>
                {canEdit && (
                  <div className="flex gap-2">
                    <Input value={newCondition} onChange={(e) => setNewCondition(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setConditions(prev => [...prev, newCondition]), setNewCondition(""))} placeholder="Nova..." className="bg-background/50 border-red-500/20 text-xs h-9 flex-1" />
                    <Button type="button" onClick={() => {setConditions(prev => [...prev, newCondition]); setNewCondition("");}} className="h-9 w-9 border-red-500/20 text-red-400" variant="outline"><Plus size={16}/></Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {conditions.map(cond => (
                    <Badge key={cond} variant="outline" className="bg-red-950/40 text-red-400 border-red-500/30 text-[10px] py-1 flex items-center gap-1">
                      <Skull size={10}/> {cond}
                      {canEdit && <X size={10} className="ml-1 cursor-pointer" onClick={() => setConditions(prev => prev.filter(c => c !== cond))} />}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-500">
            {canEdit ? "Cancelar" : "Fechar"}
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary text-white px-8 font-bold">
              {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save size={16} className="mr-2"/>}
              Sincronizar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}