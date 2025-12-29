import { useState } from "react";
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
import { X, Plus, AlertTriangle, User } from "lucide-react";
import { Child, Guardian, ageGroupLabels, relationshipLabels } from "@/types/kids";
import { mockGuardians } from "@/data/mockKids";
import { useToast } from "@/hooks/use-toast";

interface ChildFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child?: Child;
}

const ChildFormDialog = ({ open, onOpenChange, child }: ChildFormDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!child;

  const [formData, setFormData] = useState({
    fullName: child?.fullName || "",
    birthDate: child?.birthDate || "",
    ageGroup: child?.ageGroup || "preschool" as Child["ageGroup"],
    classRoom: child?.classRoom || "",
    emergencyNotes: child?.emergencyNotes || "",
  });

  const [allergies, setAllergies] = useState<string[]>(child?.allergies || []);
  const [newAllergy, setNewAllergy] = useState("");
  
  const [medications, setMedications] = useState<string[]>(child?.medications || []);
  const [newMedication, setNewMedication] = useState("");
  
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(child?.dietaryRestrictions || []);
  const [newDietary, setNewDietary] = useState("");
  
  const [specialNeeds, setSpecialNeeds] = useState<string[]>(child?.specialNeeds || []);
  const [newSpecialNeed, setNewSpecialNeed] = useState("");

  const [selectedGuardians, setSelectedGuardians] = useState<Guardian[]>(child?.guardians || []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGuardians.length === 0) {
      toast({
        title: "Responsável obrigatório",
        description: "Adicione pelo menos um responsável à criança.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isEditing ? "Criança atualizada" : "Criança cadastrada",
      description: `${formData.fullName} foi ${isEditing ? "atualizado" : "cadastrado"} com sucesso.`,
    });
    onOpenChange(false);
  };

  const toggleGuardian = (guardian: Guardian) => {
    if (selectedGuardians.find((g) => g.id === guardian.id)) {
      setSelectedGuardians(selectedGuardians.filter((g) => g.id !== guardian.id));
    } else {
      setSelectedGuardians([...selectedGuardians, guardian]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Editar Criança" : "Cadastrar Nova Criança"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Faixa Etária *</Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(value: Child["ageGroup"]) =>
                  setFormData({ ...formData, ageGroup: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ageGroupLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classRoom">Sala *</Label>
              <Input
                id="classRoom"
                value={formData.classRoom}
                onChange={(e) => setFormData({ ...formData, classRoom: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Guardians */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsáveis *
            </Label>
            <div className="flex flex-wrap gap-2">
              {mockGuardians.map((guardian) => (
                <Badge
                  key={guardian.id}
                  variant={selectedGuardians.find((g) => g.id === guardian.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleGuardian(guardian)}
                >
                  {guardian.name} ({relationshipLabels[guardian.relationship]})
                </Badge>
              ))}
            </div>
            {selectedGuardians.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Selecionados: {selectedGuardians.map((g) => g.name).join(", ")}
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

          {/* Emergency Notes */}
          <div className="space-y-2">
            <Label htmlFor="emergencyNotes">Observações de Emergência</Label>
            <Textarea
              id="emergencyNotes"
              value={formData.emergencyNotes}
              onChange={(e) => setFormData({ ...formData, emergencyNotes: e.target.value })}
              placeholder="Instruções importantes para situações de emergência..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Salvar Alterações" : "Cadastrar Criança"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChildFormDialog;
