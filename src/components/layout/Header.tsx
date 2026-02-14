import { Bell, Search, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSiteSettingsContext } from "@/contexts/SiteSettingsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut, roles } = useAuthContext();
  const { churchName, logoUrl } = useSiteSettingsContext();

  const getRoleLabel = () => {
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('teacher')) return 'Professor(a)';
    return 'Responsável';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar membros, eventos, cursos..."
          className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </Button>

        {/* Church Selector */}
        <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 w-6 rounded-lg object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-lg bg-primary/10 p-1">
              <div className="h-full w-full rounded bg-primary" />
            </div>
          )}
          <span>{churchName || "Igreja Central"}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-muted-foreground text-xs">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}