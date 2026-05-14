import { useState, useEffect } from "react";
import { 
  Heart, Droplet, Save, Loader2, Plus, X, Skull, 
  User2, Shield, Star, ScrollText, Sparkles, ShieldPlus, Minus, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ITablePlayer } from "@/interfaces/table-player";
import { toast } from "sonner";

interface AttributeControllerProps {
  player: ITablePlayer;
  onUpdate: (playerId: string, status: Partial<ITablePlayer>) => Promise<void>;
  onSyncCharacter?: (characterId: string, data: any) => Promise<void>;
  isOwner: boolean; 
  children: React.ReactNode;
  canEdit: boolean;
}

export function AttributeController({ player, onUpdate, onSyncCharacter, isOwner, children, canEdit }: AttributeControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);

  const baseKeys = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
  const maxAttr = player.character?.attributes || { hp: 10, mana: 10 };

  const [form, setForm] = useState<Record<string, number | string>>({});
  const [tempForm, setTempForm] = useState<Record<string, number | string>>({});
  const [tempHp, setTempHp] = useState<number | string>("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");
  const [customKey, setCustomKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      const current = player.currentAttributes || {};
      const temp = player.temporaryAttributes || {};
      
      setForm({
        hp: current.hp ?? maxAttr.hp ?? 0,
        mana: current.mana ?? current.mp ?? maxAttr.mana ?? 0,
        level: current.level ?? player.character?.level ?? 1,
        forca: current.forca ?? maxAttr.forca ?? 10,
        destreza: current.destreza ?? maxAttr.destreza ?? 10,
        constituicao: current.constituicao ?? maxAttr.constituicao ?? 10,
        inteligencia: current.inteligencia ?? maxAttr.inteligencia ?? 10,
        sabedoria: current.sabedoria ?? maxAttr.sabedoria ?? 10,
        carisma: current.carisma ?? maxAttr.carisma ?? 10,
        ...Object.fromEntries(
          Object.entries(current).filter(([key, value]) => 
            !["hp", "mana", "mp", "level", ...baseKeys].includes(key) && typeof value !== 'object' && value !== null
          )
        )
      });

      setTempForm({
        forca: temp.forca ?? "",
        destreza: temp.destreza ?? "",
        constituicao: temp.constituicao ?? "",
        inteligencia: temp.inteligencia ?? "",
        sabedoria: temp.sabedoria ?? "",
        carisma: temp.carisma ?? "",
      });
      
      setTempHp(temp.tempHp ?? "");
      setConditions(player.conditions || []);
      setCustomKey("");
    }
  }, [isOpen, player]);

  const handleNumericInput = (field: string, value: string, isTemp: boolean = false) => {
    if (!canEdit) return;
    if (value === "" || value === "-") {
      if (isTemp) setTempForm(prev => ({ ...prev, [field]: value }));
      else setForm(prev => ({ ...prev, [field]: value }));
      return;
    }
    const num = Number(value);
    if (!isNaN(num)) {
      if (isTemp) setTempForm(prev => ({ ...prev, [field]: num }));
      else setForm(prev => ({ ...prev, [field]: num }));
    }
  };

  const adjustValue = (field: string, amount: number) => {
    if (!canEdit) return;
    const currentVal = Number(form[field]) || 0;
    setForm(prev => ({ ...prev, [field]: currentVal + amount }));
  };

  const handleAddCustomResource = () => {
    const key = customKey.trim().toLowerCase();
    if (!key) return;

    const reservedKeys = ["hp", "mana", "mp", "level", ...baseKeys];
    
    if (reservedKeys.includes(key)) {
      toast.error(`"${key}" é um atributo reservado do sistema!`);
      return;
    }

    if (form[key] !== undefined) {
      toast.error(`O recurso "${key}" já existe!`);
      return;
    }

    setForm(prev => ({ ...prev, [key]: 0 }));
    setCustomKey("");
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setLoading(true);
    try {
      const cleanTempForm = Object.fromEntries(
        Object.entries(tempForm).map(([k, v]) => [k, Number(v) || 0]).filter(([_, v]) => v !== 0)
      );
      if (Number(tempHp) > 0) cleanTempForm.tempHp = Number(tempHp);

      const finalAttributes = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v) || 0])
      );

      await onUpdate(player.userId!, {
        currentAttributes: { ...finalAttributes, mp: finalAttributes.mana },
        temporaryAttributes: cleanTempForm,
        conditions: conditions
      });
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPermanent = async () => {
    if (!onSyncCharacter || !player.characterId) return;
    setSyncLoading(true);
    try {
      const finalAttributes = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v) || 0])
      );
      
      const levelToSync = finalAttributes.level;
      delete finalAttributes.level;

      await onSyncCharacter(player.characterId, { 
        level: levelToSync, 
        attributes: finalAttributes 
      });
      
      setSyncConfirmOpen(false);
    } catch (error) {
      toast.error("Falha ao sincronizar ficha original.");
    } finally {
      setSyncLoading(false);
    }
  };

  const getTotal = (attr: string) => (Number(form[attr]) || 0) + (Number(tempForm[attr]) || 0);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {/* Adicionado span para evitar erros de div dentro de butões em alguns casos */}
          <span className="cursor-pointer">{children}</span>
        </DialogTrigger>
        
        {/* Adicionado w-full e min-w-0 para respeitar mobile */}
        <DialogContent className="glass-card border-primary/20 w-[95vw] max-w-2xl shadow-2xl h-auto max-h-[90vh] flex flex-col p-0 overflow-hidden text-zinc-100">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-white/5 w-full min-w-0">
            <DialogTitle className="font-display text-xl md:text-2xl text-primary flex items-center gap-3 uppercase w-full">
              <span className="text-2xl md:text-3xl shrink-0">{player.character?.avatarUrl || "👤"}</span>
              <span className="truncate flex-1">{player.character?.firstName} {player.character?.lastName}</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium uppercase text-[10px] tracking-widest mt-1">
              Gestão de Atributos e Sessão
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 md:p-6 w-full">
            <div className="space-y-8 w-full min-w-0">
              
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="md:col-span-2 space-y-4 w-full min-w-0">
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center min-w-0">
                      <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Raça</span>
                      <span className="text-[10px] font-semibold text-zinc-200 truncate flex items-center justify-center gap-1">
                        <User2 size={10} className="text-primary shrink-0"/> <span className="truncate">{player.character?.race}</span>
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center min-w-0">
                      <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Classe</span>
                      <span className="text-[10px] font-semibold text-zinc-200 truncate flex items-center justify-center gap-1">
                        <Shield size={10} className="text-primary shrink-0"/> <span className="truncate">{player.character?.class}</span>
                      </span>
                    </div>
                    
                    <div className="bg-white/5 border border-white/5 rounded-lg p-1.5 flex flex-col items-center justify-center min-w-0">
                      <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-0.5">Nível</span>
                      {canEdit ? (
                        <div className="flex items-center justify-center w-full gap-0.5">
                          <button onClick={() => adjustValue('level', -1)} className="text-zinc-500 hover:text-red-400 p-0.5"><Minus size={10}/></button>
                          <Input value={form.level ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput("level", e.target.value)} className="h-5 w-8 bg-black/40 border-none text-center font-bold text-[10px] text-primary p-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                          <button onClick={() => adjustValue('level', 1)} className="text-zinc-500 hover:text-green-400 p-0.5"><Plus size={10}/></button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-primary flex items-center justify-center gap-1 mt-0.5">
                          <Star size={10} fill="currentColor"/> {form.level}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ✨ BIO / HISTÓRIA (BLINDADA CONTRA TEXTOS GIGANTES) ✨ */}
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 relative overflow-hidden flex flex-col w-full min-w-0">
                    <ScrollText size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 pointer-events-none" />
                    <Label className="text-[10px] uppercase text-primary font-black mb-2 block tracking-widest shrink-0">História</Label>
                    <div className="relative z-10 max-h-32 overflow-y-auto custom-scrollbar pr-2 w-full min-w-0">
                      <p className="text-[11px] text-zinc-400 leading-relaxed italic whitespace-pre-wrap break-words w-full">
                        {player.character?.bio || "Este herói ainda não tem uma lenda escrita..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-3 bg-primary/5 border border-primary/10 rounded-xl flex flex-col justify-center w-full">
                  <div className="space-y-1.5 w-full">
                    <Label className="text-red-400 text-[10px] uppercase font-black flex items-center gap-1"><Heart size={12}/> HP</Label>
                    <div className="flex items-center gap-1 w-full">
                      {canEdit && <button onClick={() => adjustValue('hp', -1)} className="h-8 w-8 shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><Minus size={12}/></button>}
                      <Input value={form.hp ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput("hp", e.target.value)} className="bg-zinc-900 border-red-500/20 text-center font-mono h-8 text-sm flex-1 min-w-0" />
                      {canEdit && <button onClick={() => adjustValue('hp', 1)} className="h-8 w-8 shrink-0 flex items-center justify-center bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"><Plus size={12}/></button>}
                    </div>
                  </div>
                  <div className="space-y-1.5 w-full">
                    <Label className="text-cyan-400 text-[10px] uppercase font-black flex items-center gap-1"><Droplet size={12}/> Mana</Label>
                    <div className="flex items-center gap-1 w-full">
                      {canEdit && <button onClick={() => adjustValue('mana', -1)} className="h-8 w-8 shrink-0 flex items-center justify-center bg-cyan-500/10 text-cyan-500 rounded hover:bg-cyan-500/20"><Minus size={12}/></button>}
                      <Input value={form.mana ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput("mana", e.target.value)} className="bg-zinc-900 border-cyan-500/20 text-center font-mono h-8 text-sm flex-1 min-w-0" />
                      {canEdit && <button onClick={() => adjustValue('mana', 1)} className="h-8 w-8 shrink-0 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20"><Plus size={12}/></button>}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col justify-center">
                  <Label className="text-amber-400 text-[9px] uppercase font-bold flex items-center gap-1 mb-2"><ShieldPlus size={12}/> Escudo</Label>
                  <Input value={tempHp} readOnly={!canEdit} onChange={(e) => setTempHp(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" className="bg-zinc-900 border-amber-500/30 text-center font-mono h-10 text-amber-400 text-lg font-bold w-full min-w-0" />
                </div>

                <div className="md:col-span-3 grid grid-cols-3 gap-2 w-full min-w-0">
                  {baseKeys.map((attr) => (
                    <div key={attr} className="bg-black/40 p-2 rounded-lg border border-white/5 flex flex-col min-w-0">
                      <div className="flex justify-between items-center mb-1 w-full">
                        <Label className="text-[9px] uppercase text-zinc-500 font-bold truncate pr-1">{attr.slice(0,3)}</Label>
                        <span className={`text-xs font-black shrink-0 ${Number(tempForm[attr]) !== 0 ? 'text-white' : 'text-zinc-600'}`}>{getTotal(attr)}</span>
                      </div>
                      <div className="flex gap-1 w-full">
                        <Input value={form[attr] ?? ""} onChange={(e) => handleNumericInput(attr, e.target.value)} readOnly={!canEdit} className="bg-white/5 border-none text-center font-mono h-6 p-0 text-[10px] flex-1 min-w-0 focus:ring-0" />
                        <Input value={tempForm[attr] ?? ""} placeholder="+0" onChange={(e) => handleNumericInput(attr, e.target.value, true)} readOnly={!canEdit} className={`bg-white/5 border-none text-center font-mono h-6 p-0 text-[10px] w-8 shrink-0 font-bold focus:ring-0 ${Number(tempForm[attr]) > 0 ? 'text-green-400' : Number(tempForm[attr]) < 0 ? 'text-red-400' : 'text-zinc-600'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 w-full">
                <div className="space-y-3 w-full min-w-0">
                  <h4 className="text-[10px] uppercase text-red-400 font-black tracking-widest">Condições</h4>
                  {canEdit && (
                    <div className="flex gap-2 w-full">
                      <Input value={newCondition} onChange={(e) => setNewCondition(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setConditions(prev => [...prev, newCondition]), setNewCondition(""))} placeholder="Ex: Cego..." className="bg-zinc-900 border-red-500/20 text-xs h-9 flex-1 min-w-0" />
                      <Button type="button" onClick={() => { if(newCondition) {setConditions(prev => [...prev, newCondition]); setNewCondition("");} }} className="h-9 w-9 bg-red-500/10 border-red-500/20 text-red-400 shrink-0" variant="outline"><Plus size={16}/></Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 w-full">
                    {conditions.map(cond => (
                      <Badge key={cond} variant="outline" className="bg-red-950/40 text-red-400 border-red-500/30 text-[9px] py-1 flex items-center gap-1 max-w-full">
                        <Skull size={10} className="shrink-0"/> <span className="truncate">{cond}</span>
                        {canEdit && <X size={10} className="ml-1 shrink-0 cursor-pointer hover:text-white" onClick={() => setConditions(prev => prev.filter(c => c !== cond))} />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 w-full min-w-0">
                  <h4 className="text-[10px] uppercase text-primary font-black tracking-widest">Recursos Extras</h4>
                  {canEdit && (
                    <div className="flex gap-2 w-full">
                      <Input 
                        value={customKey} 
                        onChange={(e) => setCustomKey(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomResource()}
                        placeholder="Ex: Aura..." 
                        className="bg-zinc-900 border-primary/20 text-xs h-9 flex-1 min-w-0" 
                      />
                      <Button type="button" onClick={handleAddCustomResource} className="h-9 w-9 bg-primary/10 border-primary/20 text-primary shrink-0" variant="outline"><Plus size={16}/></Button>
                    </div>
                  )}
                  <div className="space-y-2 w-full">
                    {Object.entries(form).filter(([k, v]) => !["hp", "mana", "mp", "level", ...baseKeys].includes(k) && typeof v !== 'object' && v !== null)
                      .map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between bg-black/30 p-2 px-3 rounded-md border border-white/5 group w-full min-w-0">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate pr-2 flex-1 min-w-0">{key}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Input value={val ?? ""} readOnly={!canEdit} onChange={(e) => handleNumericInput(key, e.target.value)} className="h-7 w-12 bg-white/5 border-none text-center font-mono text-xs text-primary focus:ring-0 shrink-0" />
                          {canEdit && (
                            <button onClick={() => {const n={...form}; delete n[key]; setForm(n);}} className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between shrink-0 gap-3 w-full">
            <div className="w-full md:w-auto flex justify-center md:justify-start">
              {isOwner && (
                <Button 
                  variant="outline" 
                  onClick={() => setSyncConfirmOpen(true)}
                  disabled={syncLoading}
                  className="w-full md:w-auto border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-bold text-[10px] md:text-xs uppercase gap-2 h-10 md:h-9"
                >
                  {syncLoading ? <Loader2 className="animate-spin shrink-0" size={14}/> : <RefreshCw className="shrink-0" size={14}/>}
                  <span className="truncate">Sincronizar Ficha</span>
                </Button>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 md:flex-none text-zinc-500 h-10 md:h-9 text-xs">
                Fechar
              </Button>
              {canEdit && (
                <Button onClick={handleSave} disabled={loading} className="flex-1 md:flex-none bg-gradient-primary text-white font-bold min-w-[120px] md:min-w-[140px] h-10 md:h-9">
                  {loading ? <Loader2 className="animate-spin mr-2 shrink-0" size={16}/> : <Save size={16} className="mr-2 shrink-0"/>}
                  Salvar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={syncConfirmOpen}
        onClose={() => setSyncConfirmOpen(false)}
        onConfirm={handleSyncPermanent}
        title="Sincronizar Ficha Definitiva?"
        description="Tem a certeza que deseja guardar o Nível e os Atributos atuais como definitivos na base de dados? Esta ação irá substituir os dados originais da sua ficha e não pode ser desfeita."
      /> 
    </>
  );
}