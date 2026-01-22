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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DbGuardian, useCreateGuardian } from "@/hooks/useKids";
import { useToast } from "@/hooks/use-toast";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TablesUpdate } from "@/integrations/supabase/types";

const relationshipOptions = [
  { value: "father", label: "Pai" },
  { value: "mother", label: "Mãe" },
  { value: "parent", label: "Responsável" },
  { value: "guardian", label: "Responsável Legal" },
  { value: "grandparent", label: "Avô/Avó" },
  { value: "other", label: "Outro" },
];

interface GuardianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guardian?: DbGuardian;
}

// Hook for updating guardian
const useUpdateGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      guardian,
    }: {
      id: string;
      guardian: TablesUpdate<"guardians">;
    }) => {
      const { data, error } = await supabase
        .from("guardians")
        .update(guardian)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

const GuardianFormDialog = ({ open, onOpenChange, guardian }: GuardianFormDialogProps) => {
  const { toast } = useToast();
  const createGuardian = useCreateGuardian();
  const updateGuardian = useUpdateGuardian();
  
  const isEditing = !!guardian;

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    relationship: "",
    photo_url: "",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (guardian) {
        setFormData({
          full_name: guardian.full_name,
          phone: guardian.phone || "",
          email: guardian.email || "",
          relationship: guardian.relationship || "",
          photo_url: guardian.photo_url || "",
        });
      } else {
        setFormData({
          full_name: "",
          phone: "",
          email: "",
          relationship: "",
          photo_url: "",
        });
      }
    }
  }, [open, guardian]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const guardianData = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        email: formData.email || null,
        relationship: formData.relationship || null,
        photo_url: formData.photo_url || null,
      };

      if (isEditing && guardian) {
        await updateGuardian.mutateAsync({
          id: guardian.id,
          guardian: guardianData,
        });
        toast({
          title: "Responsável atualizado",
          description: `${formData.full_name} foi atualizado com sucesso.`,
        });
      } else {
        await createGuardian.mutateAsync(guardianData);
        toast({
          title: "Responsável cadastrado",
          description: `${formData.full_name} foi cadastrado com sucesso.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar responsável. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createGuardian.isPending || updateGuardian.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Responsável" : "Cadastrar Novo Responsável"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <Label>Foto do Responsável</Label>
            <PhotoUpload
              currentPhotoUrl={formData.photo_url}
              onPhotoUploaded={(url) => setFormData({ ...formData, photo_url: url })}
              onPhotoRemoved={() => setFormData({ ...formData, photo_url: "" })}
              folder="guardians"
              entityId={guardian?.id}
              initials={formData.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
              size="lg"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Parentesco *</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o parentesco" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+55 11 99999-9999"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuardianFormDialog;
