import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Member, MemberType, MemberStatus, CustomField, memberTypeLabels } from "@/types/member";

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSave: (member: Member) => void;
}

const emptyMember: Omit<Member, "id"> = {
  fullName: "",
  email: "",
  phone: "",
  postcode: "",
  nationality: "",
  birthDate: "",
  type: "visitor",
  status: "pending",
  baptized: false,
  ministry: "",
  customFields: [],
  visitCount: 1,
  lastVisit: new Date().toISOString().split("T")[0],
  createdAt: new Date().toISOString().split("T")[0],
};

const ministryOptions = ["Louvor", "Células", "Kids", "Mídia", "Mulheres", "Homens", "Jovens", "Pastoral", "Diaconia", "Intercessão"];
const nationalityOptions = ["Brasileiro", "Brasileira", "Português", "Portuguesa", "Angolano", "Angolana", "Moçambicano", "Moçambicana", "Britânico", "Britânica", "Outro"];

export function MemberFormDialog({ open, onOpenChange, member, onSave }: MemberFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Member, "id"> & { id?: string }>(emptyMember);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData(emptyMember);
    }
    setErrors({});
  }, [member, open]);

  const handleChange = (field: keyof Member, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome é obrigatório";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        id: member?.id || String(Date.now()),
      } as Member);
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: String(Date.now()),
      name: "",
      type: "text",
      value: "",
      required: false,
    };
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  };

  const removeCustomField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== id),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {member ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Informações Básicas</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Nome Completo <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                    errors.fullName ? "border-destructive" : "border-input focus:border-primary"
                  }`}
                  placeholder="Nome completo do membro"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                    errors.email ? "border-destructive" : "border-input focus:border-primary"
                  }`}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Telefone <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                    errors.phone ? "border-destructive" : "border-input focus:border-primary"
                  }`}
                  placeholder="+44 7700 900000"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Data de Nascimento <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className={`mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                    errors.birthDate ? "border-destructive" : "border-input focus:border-primary"
                  }`}
                />
                {errors.birthDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.birthDate}</p>
                )}
              </div>

              {/* Postcode */}
              <div>
                <label className="text-sm font-medium text-foreground">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleChange("postcode", e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="SW1A 1AA"
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="text-sm font-medium text-foreground">Nacionalidade</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione...</option>
                  {nationalityOptions.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-foreground">Tipo de Pessoa</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value as MemberType)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {(Object.entries(memberTypeLabels) as [MemberType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Church Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Informações da Igreja</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Ministry */}
              <div>
                <label className="text-sm font-medium text-foreground">Ministério</label>
                <select
                  value={formData.ministry}
                  onChange={(e) => handleChange("ministry", e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Nenhum</option>
                  {ministryOptions.map((ministry) => (
                    <option key={ministry} value={ministry}>
                      {ministry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as MemberStatus)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              {/* Baptized */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="baptized"
                  checked={formData.baptized}
                  onChange={(e) => handleChange("baptized", e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="baptized" className="text-sm font-medium text-foreground">
                  Batizado
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground">Observações</label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="mt-1 min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Observações sobre o membro..."
            />
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Campos Personalizados</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Campo
              </Button>
            </div>

            {formData.customFields.length > 0 && (
              <div className="space-y-3">
                {formData.customFields.map((field) => (
                  <div key={field.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex-1 grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateCustomField(field.id, { name: e.target.value })}
                        placeholder="Nome do campo"
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateCustomField(field.id, { type: e.target.value as CustomField["type"] })}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="date">Data</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                      {field.type === "checkbox" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.value as boolean}
                            onChange={(e) => updateCustomField(field.id, { value: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-muted-foreground">Valor</span>
                        </div>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          value={field.value as string}
                          onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                          placeholder="Valor"
                          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      onClick={() => removeCustomField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient">
              {member ? "Salvar Alterações" : "Cadastrar Membro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
