import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, AlertTriangle, User, Loader2 } from "lucide-react";
import { ChildWithGuardians, DbGuardian, useGuardians, useClassrooms, useCreateChild, useUpdateChild } from "@/hooks/useKids";
import { useToast } from "@/hooks/use-toast";
import { PhotoUpload } from "@/components/ui/photo-upload";

const relationshipLabels: Record<string, string> = {
  father: "Pai",
  mother: "Mãe",
  parent: "Responsável",
  guardian: "Responsável Legal",
  grandparent: "Avô/Avó",
  other: "Outro",
};

interface ChildFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child?: ChildWithGuardians;
}

const ChildFormDialog = ({ open, onOpenChange, child }: ChildFormDialogProps) => {
  const { toast } = useToast();
  const { data: guardians, isLoading: loadingGuardians } = useGuardians();
  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  
  const isEditing = !!child;

  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    classroom_id: "",
    gender: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_notes: "",
    photo_url: "",
  });

  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [newDietary, setNewDietary] = useState("");
  
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [newSpecialNeed, setNewSpecialNeed] = useState("");

  const [selectedGuardianIds, setSelectedGuardianIds] = useState<string[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (child) {
        setFormData({
          full_name: child.full_name,
          birth_date: child.birth_date,
          classroom_id: child.classroom_id || "",
          gender: child.gender || "",
          emergency_contact: child.emergency_contact || "",
          emergency_phone: child.emergency_phone || "",
          medical_notes: child.medical_notes || "",
          photo_url: child.photo_url || "",
        });
        setAllergies(child.allergies || []);
        setMedications(child.medications || []);
        setDietaryRestrictions(child.dietary_restrictions || []);
        setSpecialNeeds(child.special_needs || []);
        setSelectedGuardianIds(child.guardians.map(g => g.id));
      } else {
        setFormData({
          full_name: "",
          birth_date: "",
          classroom_id: "",
          gender: "",
          emergency_contact: "",
          emergency_phone: "",
          medical_notes: "",
          photo_url: "",
        });
        setAllergies([]);
        setMedications([]);
        setDietaryRestrictions([]);
        setSpecialNeeds([]);
        setSelectedGuardianIds([]);
      }
    }
  }, [open, child]);

  const addToList = (
    list: string[],
    setList: (val: string[]) => void,
    value: string,
    setValue: (val: string) => void
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue("");
    }
  };

  const removeFromList = (list: string[], setList: (val: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGuardianIds.length === 0) {
      toast({
        title: "Responsável obrigatório",
        description: "Adicione pelo menos um responsável à criança.",
        variant: "destructive",
      });
      return;
    }

    try {
      const childData = {
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        classroom_id: formData.classroom_id || null,
        gender: formData.gender || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        medical_notes: formData.medical_notes || null,
        photo_url: formData.photo_url || null,
        allergies,
        medications,
        dietary_restrictions: dietaryRestrictions,
        special_needs: specialNeeds,
      };

      if (isEditing && child) {
        await updateChild.mutateAsync({
          id: child.id,
          child: childData,
          guardianIds: selectedGuardianIds,
        });
        toast({
          title: "Criança atualizada",
          description: `${formData.full_name} foi atualizado com sucesso.`,
        });
      } else {
        await createChild.mutateAsync({
          child: childData,
          guardianIds: selectedGuardianIds,
        });
        toast({
          title: "Criança cadastrada",
          description: `${formData.full_name} foi cadastrado com sucesso.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar criança. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const toggleGuardian = (guardianId: string) => {
    if (selectedGuardianIds.includes(guardianId)) {
      setSelectedGuardianIds(selectedGuardianIds.filter((id) => id !== guardianId));
    } else {
      setSelectedGuardianIds([...selectedGuardianIds, guardianId]);
    }
  };

  const isLoading = createChild.isPending || updateChild.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Editar Criança" : "Cadastrar Nova Criança"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <Label>Foto da Criança</Label>
            <PhotoUpload
              currentPhotoUrl={formData.photo_url}
              onPhotoUploaded={(url) => setFormData({ ...formData, photo_url: url })}
              onPhotoRemoved={() => setFormData({ ...formData, photo_url: "" })}
              folder="children"
              entityId={child?.id}
              initials={formData.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
              size="lg"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento *</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroom_id">Sala *</Label>
              <Select
                value={formData.classroom_id}
                onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClassrooms ? "Carregando..." : "Selecione a sala"} />
                </SelectTrigger>
                <SelectContent>
                  {classrooms?.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} ({classroom.age_range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contato de Emergência</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="Nome do contato"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_phone}
                onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                placeholder="+55 11 99999-9999"
              />
            </div>
          </div>

          {/* Guardians */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsáveis *
            </Label>
            {loadingGuardians ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando responsáveis...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {guardians?.map((guardian) => (
                  <Badge
                    key={guardian.id}
                    variant={selectedGuardianIds.includes(guardian.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleGuardian(guardian.id)}
                  >
                    {guardian.full_name} ({relationshipLabels[guardian.relationship || "parent"] || guardian.relationship})
                  </Badge>
                ))}
              </div>
            )}
            {selectedGuardianIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Selecionados: {guardians?.filter(g => selectedGuardianIds.includes(g.id)).map((g) => g.full_name).join(", ")}
              </div>
            )}
          </div>

          {/* Allergies - CRITICAL */}
          <div className="space-y-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <Label className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Alergias (Campo Crítico)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Amendoim, Leite, Ovo..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addToList(allergies, setAllergies, newAllergy, setNewAllergy);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addToList(allergies, setAllergies, newAllergy, setNewAllergy)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive" className="gap-1">
                  {allergy}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromList(allergies, setAllergies, index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div className="space-y-3">
            <Label>Medicamentos</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Inalador, Insulina..."
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addToList(medications, setMedications, newMedication, setNewMedication);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addToList(medications, setMedications, newMedication, setNewMedication)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {medications.map((med, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {med}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromList(medications, setMedications, index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label>Restrições Alimentares</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Sem glúten, Vegano..."
                value={newDietary}
                onChange={(e) => setNewDietary(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addToList(dietaryRestrictions, setDietaryRestrictions, newDietary, setNewDietary);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addToList(dietaryRestrictions, setDietaryRestrictions, newDietary, setNewDietary)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.map((item, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromList(dietaryRestrictions, setDietaryRestrictions, index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Special Needs */}
          <div className="space-y-3">
            <Label>Necessidades Especiais</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Autismo, TDAH..."
                value={newSpecialNeed}
                onChange={(e) => setNewSpecialNeed(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addToList(specialNeeds, setSpecialNeeds, newSpecialNeed, setNewSpecialNeed);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addToList(specialNeeds, setSpecialNeeds, newSpecialNeed, setNewSpecialNeed)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialNeeds.map((item, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-warning/10 text-warning border-warning/30">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromList(specialNeeds, setSpecialNeeds, index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Medical Notes */}
          <div className="space-y-2">
            <Label htmlFor="medical_notes">Observações Médicas/Emergência</Label>
            <Textarea
              id="medical_notes"
              value={formData.medical_notes}
              onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
              placeholder="Instruções importantes para situações de emergência..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Cadastrar Criança"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChildFormDialog;
