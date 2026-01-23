import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { GuardianCard } from "@/components/guardians/GuardianCard";
import { GuardianDetailDialog } from "@/components/guardians/GuardianDetailDialog";
import { LinkChildrenDialog } from "@/components/guardians/LinkChildrenDialog";
import GuardianFormDialog from "@/components/kids/GuardianFormDialog";
import { useGuardians, useChildren, DbGuardian, DbChild } from "@/hooks/useKids";
import { Users, UserPlus, Search, Phone, Mail } from "lucide-react";

const relationshipOptions = [
  { value: "all", label: "Todos os Parentescos" },
  { value: "father", label: "Pai" },
  { value: "mother", label: "Mãe" },
  { value: "parent", label: "Responsável" },
  { value: "guardian", label: "Responsável Legal" },
  { value: "grandparent", label: "Avô/Avó" },
  { value: "other", label: "Outro" },
];

const Guardians = () => {
  const { data: guardians, isLoading: guardiansLoading } = useGuardians();
  const { data: children, isLoading: childrenLoading } = useChildren();

  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [selectedGuardian, setSelectedGuardian] = useState<DbGuardian | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<DbGuardian | undefined>();

  // Build guardian -> children mapping
  const guardianChildrenMap = useMemo(() => {
    const map = new Map<string, DbChild[]>();
    if (children) {
      children.forEach((child) => {
        child.guardians?.forEach((guardian) => {
          const existing = map.get(guardian.id) || [];
          existing.push(child);
          map.set(guardian.id, existing);
        });
      });
    }
    return map;
  }, [children]);

  // Filter guardians
  const filteredGuardians = useMemo(() => {
    if (!guardians) return [];
    
    return guardians.filter((guardian) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        guardian.full_name.toLowerCase().includes(searchLower) ||
        guardian.phone?.toLowerCase().includes(searchLower) ||
        guardian.email?.toLowerCase().includes(searchLower);

      // Relationship filter
      const matchesRelationship =
        relationshipFilter === "all" || guardian.relationship === relationshipFilter;

      return matchesSearch && matchesRelationship;
    });
  }, [guardians, searchQuery, relationshipFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!guardians) return { total: 0, withEmail: 0, withPhone: 0, withChildren: 0 };
    
    return {
      total: guardians.length,
      withEmail: guardians.filter((g) => g.email).length,
      withPhone: guardians.filter((g) => g.phone).length,
      withChildren: guardians.filter((g) => (guardianChildrenMap.get(g.id)?.length || 0) > 0).length,
    };
  }, [guardians, guardianChildrenMap]);

  const handleView = (guardian: DbGuardian) => {
    setSelectedGuardian(guardian);
    setIsDetailOpen(true);
  };

  const handleEdit = (guardian: DbGuardian) => {
    setEditingGuardian(guardian);
    setIsFormOpen(true);
  };

  const handleLinkChildren = (guardian: DbGuardian) => {
    setSelectedGuardian(guardian);
    setIsLinkDialogOpen(true);
  };

  const handleNewGuardian = () => {
    setEditingGuardian(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingGuardian(undefined);
    }
  };

  const isLoading = guardiansLoading || childrenLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Responsáveis</h1>
            <p className="text-muted-foreground">
              Gerencie os responsáveis cadastrados no sistema
            </p>
          </div>
          <Button onClick={handleNewGuardian} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Responsável
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Responsáveis"
            value={stats.total}
            icon={Users}
            loading={isLoading}
          />
          <StatCard
            title="Com E-mail"
            value={stats.withEmail}
            icon={Mail}
            iconColor="bg-blue-500/10 text-blue-500"
            loading={isLoading}
          />
          <StatCard
            title="Com Telefone"
            value={stats.withPhone}
            icon={Phone}
            iconColor="bg-green-500/10 text-green-500"
            loading={isLoading}
          />
          <StatCard
            title="Com Crianças"
            value={stats.withChildren}
            icon={Users}
            iconColor="bg-amber-500/10 text-amber-500"
            loading={isLoading}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Parentesco" />
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

        {/* Guardians Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : filteredGuardians.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum responsável encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || relationshipFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Clique em 'Novo Responsável' para cadastrar"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGuardians.map((guardian) => (
              <GuardianCard
                key={guardian.id}
                guardian={guardian}
                childrenCount={guardianChildrenMap.get(guardian.id)?.length || 0}
                onView={handleView}
                onEdit={handleEdit}
                onLinkChildren={handleLinkChildren}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <GuardianDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        guardian={selectedGuardian}
        children={selectedGuardian ? guardianChildrenMap.get(selectedGuardian.id) : undefined}
      />

      {/* Form Dialog */}
      <GuardianFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        guardian={editingGuardian}
      />

      {/* Link Children Dialog */}
      <LinkChildrenDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        guardian={selectedGuardian}
        currentChildIds={
          selectedGuardian
            ? guardianChildrenMap.get(selectedGuardian.id)?.map((c) => c.id) || []
            : []
        }
      />
    </DashboardLayout>
  );
};

export default Guardians;
