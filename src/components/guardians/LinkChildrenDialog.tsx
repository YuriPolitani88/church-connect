import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Baby, Link2 } from "lucide-react";
import { DbGuardian, ChildWithGuardians, useChildren } from "@/hooks/useKids";
import { useLinkChildrenToGuardian } from "@/hooks/useGuardianLinks";
import { format } from "date-fns";
import { toast } from "sonner";

interface LinkChildrenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guardian: DbGuardian | null;
  currentChildIds?: string[];
}

export function LinkChildrenDialog({
  open,
  onOpenChange,
  guardian,
  currentChildIds = [],
}: LinkChildrenDialogProps) {
  const { data: allChildren, isLoading: loadingChildren } = useChildren();
  const linkMutation = useLinkChildrenToGuardian();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentChildIds));

  // Reset selection when dialog opens with new guardian
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedIds(new Set(currentChildIds));
      setSearchQuery("");
    }
    onOpenChange(isOpen);
  };

  // Filter children by search
  const filteredChildren = useMemo(() => {
    if (!allChildren) return [];
    const query = searchQuery.toLowerCase();
    return allChildren.filter((child) =>
      child.full_name.toLowerCase().includes(query)
    );
  }, [allChildren, searchQuery]);

  // Check if child is already linked
  const isLinked = (childId: string) => currentChildIds.includes(childId);

  const toggleChild = (childId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(childId)) {
      newSet.delete(childId);
    } else {
      newSet.add(childId);
    }
    setSelectedIds(newSet);
  };

  const handleSubmit = async () => {
    if (!guardian) return;

    // Get new children to link (not already linked)
    const newChildIds = Array.from(selectedIds).filter(
      (id) => !currentChildIds.includes(id)
    );
    
    // Get children to unlink (were linked but now deselected)
    const unlinkChildIds = currentChildIds.filter(
      (id) => !selectedIds.has(id)
    );

    if (newChildIds.length === 0 && unlinkChildIds.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await linkMutation.mutateAsync({
        guardianId: guardian.id,
        linkChildIds: newChildIds,
        unlinkChildIds,
      });
      
      const actions: string[] = [];
      if (newChildIds.length > 0) {
        actions.push(`${newChildIds.length} vinculada(s)`);
      }
      if (unlinkChildIds.length > 0) {
        actions.push(`${unlinkChildIds.length} desvinculada(s)`);
      }
      
      toast.success(`Crianças atualizadas: ${actions.join(", ")}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar vínculos");
    }
  };

  if (!guardian) return null;

  const hasChanges =
    currentChildIds.length !== selectedIds.size ||
    currentChildIds.some((id) => !selectedIds.has(id));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Vincular Crianças
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione as crianças que deseja vincular a{" "}
            <span className="font-medium text-foreground">{guardian.full_name}</span>
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar criança..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Children list */}
          {loadingChildren ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Baby className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "Nenhuma criança encontrada"
                  : "Nenhuma criança cadastrada"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredChildren.map((child) => {
                  const isSelected = selectedIds.has(child.id);
                  const wasLinked = isLinked(child.id);
                  const initials = child.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={child.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleChild(child.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleChild(child.id)}
                        className="pointer-events-none"
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={child.photo_url || undefined} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{child.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(child.birth_date), "dd/MM/yyyy")}
                        </p>
                      </div>
                      {wasLinked && (
                        <Badge variant="outline" className="text-xs">
                          Vinculado
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Selection count */}
          <p className="text-sm text-muted-foreground text-center">
            {selectedIds.size} criança(s) selecionada(s)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || linkMutation.isPending}
          >
            {linkMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
