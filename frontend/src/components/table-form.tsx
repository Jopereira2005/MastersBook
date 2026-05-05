import { useState } from "react";
import { Loader2, RefreshCw, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { tableService } from "@/services/table.service";
import { ISystem } from "@/interfaces/system";
import { ITable } from "@/interfaces/table";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface TableFormProps {
  mode: "create" | "edit";
  initialData?: ITable;
  sistemas?: ISystem[];
  userId: string;
  onSuccess: (mesa: ITable) => void;
  onDelete?: (mesaId: string) => void;
}

export function TableForm({ mode, initialData, sistemas, userId, onSuccess, onDelete }: TableFormProps) {
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    systemId: initialData?.systemId || ""
  });

  const isEdit = mode === "edit";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && initialData) {
        // 1. Envia para o backend (não precisamos salvar o 'result' numa variável aqui)
        await tableService.updateTable(initialData.id, {
          name: form.name,
          description: form.description
        });
        
        toast.success("Grimório da mesa atualizado!");
        
        // 2. A MÁGICA AQUI: Forçamos o envio dos dados que sabemos que mudaram, 
        // mantendo o initialData intacto. Isso ignora o que o backend responde e força a UI a atualizar!
        onSuccess({
          ...initialData,
          name: form.name,
          description: form.description
        });

      } else {
        if (!form.systemId) throw new Error("Selecione um sistema!");
        
        // No Create, nós precisamos do result, pois o backend gera o ID novo
        const result = await tableService.create({ ...form, gmId: userId });
        toast.success(`A campanha "${result.name}" foi forjada!`);
        onSuccess(result);
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!initialData) return;
    setIsRegenerating(true);
    try {
      const { newInviteCode } = await tableService.regenerateInviteCode(initialData.id);
      toast.success(`Novo código gerado: ${newInviteCode}`);
      onSuccess({ ...initialData, inviteCode: newInviteCode }); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!initialData) return;
    
    setIsDeleting(true);
    try {
      await tableService.deleteTable(initialData.id);
      toast.success("A campanha foi destruída com sucesso.");
      setShowDeleteModal(false); 
      if (onDelete) onDelete(initialData.id); 
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar a mesa.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Campanha</Label>
          <Input 
            id="name"
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            placeholder="Ex: A Sombra do Dragão"
            className="bg-background/50 border-primary/20"
            required 
          />
        </div>

        <div className="space-y-2">
          <Label>Sistema de RPG</Label>
          {isEdit ? (
            <>
              <Input 
                disabled 
                value={initialData?.system?.name || "Sistema não identificado"} 
                className="bg-background/50 border-primary/20 opacity-70"
              />
              <p className="text-[10px] text-muted-foreground italic">O sistema não pode ser alterado após a invocação.</p>
            </>
          ) : (
            <Select 
              value={form.systemId} 
              onValueChange={(val) => setForm({ ...form, systemId: val })}
            >
              <SelectTrigger className="bg-background/50 border-primary/20">
                <SelectValue placeholder="Escolha o sistema..." />
              </SelectTrigger>
              <SelectContent>
                {sistemas?.map((sys) => (
                  <SelectItem key={sys.id} value={sys.id}>{sys.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição / Bio da Mesa</Label>
          <Textarea 
            id="description"
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            placeholder="Conte sobre o mundo, tom da campanha e avisos..."
            className="bg-background/50 border-primary/20 resize-none h-32"
          />
        </div>

        {isEdit && initialData && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
            <Label className="text-xs uppercase tracking-widest text-primary">Segurança de Acesso</Label>
            <div className="flex items-center justify-between bg-background/40 p-2 rounded border border-border/50">
              <code className="text-lg font-mono font-bold text-primary">{initialData.inviteCode}</code>
              <div className="flex gap-2">
                 <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    navigator.clipboard.writeText(initialData.inviteCode!);
                    toast.success("Código copiado!");
                  }}
                >
                  <Copy size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  disabled={isRegenerating}
                  onClick={handleRegenerateCode}
                  className="text-[10px] gap-1"
                >
                  {isRegenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  REGERAR
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CORREÇÃO DOS BOTÕES AQUI */}
        <div className="flex items-center gap-3 pt-2">
          {isEdit && (
            <Button 
              type="button" 
              variant="destructive" 
              disabled={loading || isDeleting}
              onClick={() => setShowDeleteModal(true)} 
              // shrink-0 garante que o botão da lixeira não esmague nem mude de tamanho no celular
              className="shrink-0 px-3 bg-red-950/40 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50 transition-all"
              title="Deletar Mesa"
            >
              <Trash2 size={18} />
            </Button>
          )}
          
          {/* flex-1 garante que o botão de salvar preencha perfeitamente todo o espaço livre */}
          <Button type="submit" disabled={loading || isDeleting} className="bg-gradient-primary shadow-glow flex-1">
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : (isEdit ? "Salvar Alterações" : "Invocar Mesa")}
          </Button>
        </div>
      </form>

      <ConfirmDialog 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Destruir Campanha"
        description={`Você tem certeza que deseja destruir a campanha "${initialData?.name}"? Todas as fichas, históricos e o mundo serão perdidos para sempre no Vazio.`}
      />
    </>
  );
}