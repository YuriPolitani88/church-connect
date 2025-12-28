import { UserPlus, Gift, GraduationCap, Baby, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "member",
    title: "Novo membro cadastrado",
    description: "Maria Silva se tornou membro",
    time: "Há 5 minutos",
    icon: UserPlus,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    type: "birthday",
    title: "Aniversariante do dia",
    description: "João Santos completa 35 anos",
    time: "Hoje",
    icon: Gift,
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    id: 3,
    type: "course",
    title: "Curso concluído",
    description: "Ana Costa finalizou Discipulado Básico",
    time: "Há 2 horas",
    icon: GraduationCap,
    color: "bg-accent/10 text-accent",
  },
  {
    id: 4,
    type: "kids",
    title: "Check-in Kids",
    description: "15 crianças fizeram check-in",
    time: "Há 3 horas",
    icon: Baby,
    color: "bg-warning/10 text-warning",
  },
  {
    id: 5,
    type: "donation",
    title: "Nova doação",
    description: "Doação recebida: £150.00",
    time: "Há 4 horas",
    icon: CreditCard,
    color: "bg-success/10 text-success",
  },
];

export function RecentActivity() {
  return (
    <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-serif text-lg font-semibold text-foreground">
        Atividade Recente
      </h3>
      <div className="mt-6 space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn("rounded-xl p-2.5", activity.color)}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
