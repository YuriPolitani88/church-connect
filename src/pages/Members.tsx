import { useState, useMemo } from "react";
import { UserPlus, LayoutGrid, List, Users, UserCheck, AlertTriangle, Gift, Download } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { MemberFilters } from "@/components/members/MemberFilters";
import { MemberCard } from "@/components/members/MemberCard";
import { MemberTable } from "@/components/members/MemberTable";
import { MemberFormDialog } from "@/components/members/MemberFormDialog";
import { MemberDetailDialog } from "@/components/members/MemberDetailDialog";
import { mockMembers, isInactive, isRecurringVisitor, isBirthdayToday } from "@/data/mockMembers";
import { Member, MemberType, MemberStatus } from "@/types/member";

type ViewMode = "grid" | "table";

export default function Members() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MemberType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");
  const [ministryFilter, setMinistryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Get unique ministries
  const ministries = useMemo(() => {
    const uniqueMinistries = new Set(members.map((m) => m.ministry).filter(Boolean));
    return Array.from(uniqueMinistries).sort();
  }, [members]);

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const inactive = members.filter((m) => isInactive(m.lastVisit) && m.status === "active").length;
    const birthdays = members.filter((m) => isBirthdayToday(m.birthDate)).length;
    const recurringVisitors = members.filter((m) => isRecurringVisitor(m)).length;
    return { total, active, inactive, birthdays, recurringVisitors };
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          member.fullName.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.phone.includes(search);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== "all" && member.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== "all" && member.status !== statusFilter) return false;

      // Ministry filter
      if (ministryFilter !== "all" && member.ministry !== ministryFilter) return false;

      return true;
    });
  }, [members, search, typeFilter, statusFilter, ministryFilter]);

  const hasActiveFilters = search !== "" || typeFilter !== "all" || statusFilter !== "all" || ministryFilter !== "all";

  const handleClearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setMinistryFilter("all");
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleNewMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleSaveMember = (member: Member) => {
    if (selectedMember) {
      // Update existing
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
    } else {
      // Add new
      setMembers((prev) => [...prev, { ...member, id: String(Date.now()) }]);
    }
    setIsFormOpen(false);
    setSelectedMember(null);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Gestão de Membros</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os membros, visitantes e líderes da sua igreja
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="gradient" onClick={handleNewMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total de Membros"
          value={stats.total}
          icon={Users}
          iconColor="bg-primary/10 text-primary"
          delay={0}
        />
        <StatCard
          title="Membros Ativos"
          value={stats.active}
          icon={UserCheck}
          iconColor="bg-success/10 text-success"
          delay={50}
        />
        <StatCard
          title="Inativos (+30 dias)"
          value={stats.inactive}
          icon={AlertTriangle}
          iconColor="bg-warning/10 text-warning"
          delay={100}
        />
        <StatCard
          title="Aniversariantes Hoje"
          value={stats.birthdays}
          icon={Gift}
          iconColor="bg-secondary/20 text-secondary-foreground"
          delay={150}
        />
        <StatCard
          title="Visitantes Recorrentes"
          value={stats.recurringVisitors}
          icon={Users}
          iconColor="bg-accent/10 text-accent"
          delay={200}
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MemberFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          ministryFilter={ministryFilter}
          onMinistryFilterChange={setMinistryFilter}
          ministries={ministries}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* View toggle and results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length} membro{filteredMembers.length !== 1 ? "s" : ""} encontrado
          {filteredMembers.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Members list */}
      {viewMode === "table" ? (
        <MemberTable members={filteredMembers} onEdit={handleEdit} onView={handleView} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} onEdit={handleEdit} onView={handleView} />
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-medium text-foreground">Nenhum membro encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os filtros ou adicione novos membros.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <MemberFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        member={selectedMember}
        onSave={handleSaveMember}
      />
      <MemberDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        member={selectedMember}
        onEdit={handleEdit}
      />
    </DashboardLayout>
  );
}
