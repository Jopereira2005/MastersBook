import { useState } from "react";
import { Save, Trash2, Copy, Loader2, Swords, Shield, Star, Sparkles, Heart, Droplet, ScrollText, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { characterService } from "@/services/character.service";
import { ICharacter } from "@/interfaces/character";
import { ISystem } from "@/interfaces/system";
import { ConfirmDialog } from "@/components/confirm-dialog";

const AVAILABLE_AVATARS = ["🧙‍♂️", "🧝‍♂️", "🧛", "🧟", "🐲", "⚔️", "🛡️", "🏹", "📜", "💎", "🌑", "🔥"];

interface CharacterFormProps {
  mode: "create" | "edit";
  initialData?: ICharacter | null;
  systems: ISystem[];
  userId: string;
  onSuccess: (char: ICharacter) => void;
}

export function CharacterForm({ mode, initialData, systems, userId, onSuccess }: CharacterFormProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    race: initialData?.race || "",
    class: initialData?.class || "",
    level: initialData?.level || 1,
    bio: initialData?.bio || "",
    avatarUrl: initialData?.avatarUrl || AVAILABLE_AVATARS[0],
    systemId: initialData?.systemId || "",
    attributes: initialData?.attributes || {
      hp: 10, mana: 10, forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10
    }
  });

  // Função para aceitar apenas números num input de texto
  const handleNumericInput = (field: string, value: string, isAttribute = false) => {
    const onlyNums = value.replace(/[^0-9]/g, '');
    const numValue = Number(onlyNums) || 0;

    if (isAttribute) {
      setForm(prev => ({
        ...prev,
        attributes: { ...prev.attributes, [field]: numValue }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.systemId) return toast.warning("Seleciona um sistema de RPG!");
    
    setLoading(true);
    try {
      if (mode === "edit" && initialData) {
        const updated = await characterService.update(initialData.id, form);
        toast.success("Grimório do personagem atualizado!");
        onSuccess(updated);
      } else {
        const created = await characterService.create({ ...form, userId });
        toast.success(`${form.firstName} ganhou vida!`);
        onSuccess(created);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar ficha.");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const duplicated = await characterService.create({
        ...form,
        lastName: `${form.lastName} (Cópia)`,
        userId
      });
      toast.success("Ficha duplicada com sucesso!");
      onSuccess(duplicated);
    } catch (error: any) {
      toast.error("Erro ao duplicar ficha.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    setIsDeleting(true);
    try {
      await characterService.delete(initialData.id);
      toast.success("Herói banido para o esquecimento.");
      onSuccess(initialData); 
    } catch (error: any) {
      toast.error("Erro ao deletar ficha.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SELEÇÃO DE AVATAR */}
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="h-20 w-20 flex items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5 text-4xl shadow-glow">
          {form.avatarUrl}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {AVAILABLE_AVATARS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => setForm({ ...form, avatarUrl: emoji })}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${form.avatarUrl === emoji ? "bg-primary text-white scale-110" : "bg-zinc-800 hover:bg-zinc-700"}`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* DADOS BIOGRÁFICOS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300"><Swords size={14} className="text-primary"/> Primeiro Nome</Label>
          <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Ex: Sir Paxe" className="bg-background/50 border-primary/20" required />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300">Sobrenome / Alcunha</Label>
          <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Ex: o Bagre" className="bg-background/50 border-primary/20" />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300"><User2 size={14} className="text-primary"/> Raça</Label>
          <Input value={form.race} onChange={(e) => setForm({ ...form, race: e.target.value })} placeholder="Ex: Tritão" className="bg-background/50 border-primary/20" required />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300"><Shield size={14} className="text-primary"/> Classe</Label>
          <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="Ex: Guerreiro" className="bg-background/50 border-primary/20" />
        </div>
      </div>

      {/* SISTEMA E NÍVEL */}
      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300"><Sparkles size={14} className="text-primary"/> Sistema</Label>
          <Select value={form.systemId} onValueChange={(val) => setForm({ ...form, systemId: val })} disabled={mode === "edit"}>
            <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-zinc-300"><Star size={14} className="text-primary"/> Nível</Label>
          <Input value={form.level} onChange={(e) => handleNumericInput("level", e.target.value)} className="bg-background/50 border-primary/20 text-center font-mono" />
        </div>
      </div>

      {/* ATRIBUTOS */}
      <div className="p-4 rounded-xl bg-card/40 border border-primary/10 space-y-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Atributos e Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-red-400 text-xs flex items-center gap-1"><Heart size={12}/> HP Máx</Label>
            <Input value={form.attributes.hp} onChange={(e) => handleNumericInput("hp", e.target.value, true)} className="bg-background/50 border-red-500/20 text-center font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-blue-400 text-xs flex items-center gap-1"><Droplet size={12}/> Mana Máx</Label>
            <Input value={form.attributes.mana} onChange={(e) => handleNumericInput("mana", e.target.value, true)} className="bg-background/50 border-blue-500/20 text-center font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].map((attr) => (
            <div key={attr} className="space-y-1 text-center">
              <Label className="text-[10px] uppercase text-zinc-500 block">{attr.slice(0,3)}</Label>
              <Input value={form.attributes[attr as keyof typeof form.attributes]} onChange={(e) => handleNumericInput(attr, e.target.value, true)} className="bg-background/50 border-primary/10 text-center font-mono h-9 p-0" />
            </div>
          ))}
        </div>
      </div>

      {/* BIO / HISTÓRIA */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-zinc-300"><ScrollText size={14} className="text-primary"/> Bio / História do Personagem</Label>
        <Textarea 
          value={form.bio} 
          onChange={(e) => setForm({ ...form, bio: e.target.value })} 
          placeholder="Conta-nos a lenda deste herói..." 
          className="bg-background/50 border-primary/20 min-h-[100px] resize-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow text-white font-bold">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
          {mode === "create" ? "Forjar Personagem" : "Salvar Alterações"}
        </Button>
        {mode === "edit" && (
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={handleDuplicate} disabled={loading} className="border-primary/30 text-primary hover:bg-primary/10"><Copy className="mr-2" size={18} /> Duplicar</Button>
            <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={loading} className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"><Trash2 className="mr-2" size={18} /> Deletar</Button>
          </div>
        )}
      </div>

    </form>
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} loading={isDeleting} title="Destruir Ficha?" description="Esta ação enviará o teu herói para o Vazio. Ele não poderá ser recuperado." />
    
    </>
  );
}