import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Baby,
  Calendar,
  GraduationCap,
  CreditCard,
  Settings,
  Church,
  ChevronLeft,
  Bell,
  LogOut,
  Shield,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Membros", href: "/members", icon: Users },
  { name: "Kids", href: "/kids", icon: Baby },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Cursos", href: "/courses", icon: GraduationCap },
  { name: "Financeiro", href: "/finance", icon: CreditCard },
  { name: "Configurações", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Administração", href: "/admin", icon: Shield },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuthContext();

  const allNavigation = isAdmin() 
    ? [...navigation, ...adminNavigation] 
    : navigation;
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-serif text-lg font-semibold text-sidebar-foreground">
              ChurchCRM
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {allNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3">
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <Bell className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Notificações</span>}
          </button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/10">
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
