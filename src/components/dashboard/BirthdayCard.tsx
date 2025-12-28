import { Gift, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const birthdays = [
  { id: 1, name: "João Santos", age: 35, avatar: "JS" },
  { id: 2, name: "Maria Oliveira", age: 28, avatar: "MO" },
  { id: 3, name: "Pedro Costa", age: 42, avatar: "PC" },
];

export function BirthdayCard() {
  return (
    <div className="animate-slide-up rounded-2xl border border-border bg-gradient-to-br from-secondary/20 to-secondary/5 p-6 shadow-soft" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-secondary/30 p-2.5">
            <Gift className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Aniversariantes
            </h3>
            <p className="text-sm text-muted-foreground">Hoje, 28 de Dezembro</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-3">
        {birthdays.map((person, index) => (
          <div
            key={person.id}
            className="flex items-center gap-3 rounded-xl bg-card/50 p-3 animate-fade-in"
            style={{ animationDelay: `${index * 100 + 400}ms` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {person.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{person.name}</p>
              <p className="text-xs text-muted-foreground">Completa {person.age} anos</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="mt-4 w-full" size="sm">
        Ver todos os aniversariantes
      </Button>
    </div>
  );
}
