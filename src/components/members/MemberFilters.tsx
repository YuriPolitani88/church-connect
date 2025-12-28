import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberType, MemberStatus, memberTypeLabels, memberStatusLabels } from "@/types/member";

interface MemberFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: MemberType | "all";
  onTypeFilterChange: (value: MemberType | "all") => void;
  statusFilter: MemberStatus | "all";
  onStatusFilterChange: (value: MemberStatus | "all") => void;
  ministryFilter: string;
  onMinistryFilterChange: (value: string) => void;
  ministries: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function MemberFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  ministryFilter,
  onMinistryFilterChange,
  ministries,
  onClearFilters,
  hasActiveFilters,
}: MemberFiltersProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as MemberType | "all")}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos os tipos</option>
            {(Object.entries(memberTypeLabels) as [MemberType, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as MemberStatus | "all")}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos os status</option>
            {(Object.entries(memberStatusLabels) as [MemberStatus, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Ministry Filter */}
          <select
            value={ministryFilter}
            onChange={(e) => onMinistryFilterChange(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos os ministérios</option>
            {ministries.map((ministry) => (
              <option key={ministry} value={ministry}>
                {ministry}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
