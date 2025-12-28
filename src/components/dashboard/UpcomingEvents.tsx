import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    id: 1,
    title: "Culto de Celebração",
    date: "Domingo, 29 Dez",
    time: "10:00",
    location: "Templo Principal",
    attendees: 245,
  },
  {
    id: 2,
    title: "Grupo de Jovens",
    date: "Sábado, 28 Dez",
    time: "19:00",
    location: "Salão Social",
    attendees: 45,
  },
  {
    id: 3,
    title: "Escola Bíblica Dominical",
    date: "Domingo, 29 Dez",
    time: "09:00",
    location: "Salas de Aula",
    attendees: 120,
  },
];

export function UpcomingEvents() {
  return (
    <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Próximos Eventos
        </h3>
        <Button variant="ghost" size="sm">
          Ver todos
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="group rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-soft animate-fade-in"
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h4>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date} às {event.time}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.attendees} confirmados
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                {event.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
