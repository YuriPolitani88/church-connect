import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export function UpcomingEvents() {
  const { data: events, isLoading } = useUpcomingEvents(3);

  if (isLoading) {
    return (
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Próximos Eventos
        </h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/events">Ver todos</Link>
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {events?.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhum evento próximo
          </p>
        ) : (
          events?.map((event, index) => {
            const formattedDate = format(parseISO(event.event_date), "EEEE, d MMM", { locale: ptBR });
            const formattedTime = event.start_time.slice(0, 5);

            return (
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
                        <span className="capitalize">{formattedDate}</span> às {formattedTime}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                      )}
                      {event.max_attendees && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.max_attendees} vagas
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    {formattedTime}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
