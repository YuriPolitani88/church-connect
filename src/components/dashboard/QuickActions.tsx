import { UserPlus, CalendarPlus, Baby, Send, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionColor = "gradient" | "outline";

const actions: { icon: typeof UserPlus; label: string; color: ActionColor }[] = [
  { icon: UserPlus, label: "Novo Membro", color: "gradient" },
  { icon: CalendarPlus, label: "Novo Evento", color: "outline" },
  { icon: Baby, label: "Check-in Kids", color: "outline" },
  { icon: Send, label: "Enviar Aviso", color: "outline" },
  { icon: FileText, label: "Novo Curso", color: "outline" },
  { icon: CreditCard, label: "Ver Doações", color: "outline" },
];

export function QuickActions() {
  return (
    <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "200ms" }}>
      <h3 className="font-serif text-lg font-semibold text-foreground">
        Ações Rápidas
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.color}
            className="h-auto flex-col gap-2 py-4 animate-fade-in"
            style={{ animationDelay: `${index * 50 + 300}ms` }}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
