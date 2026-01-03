import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event, EventType } from "@/types/events";
import { eventTypeLabels, eventTypeColors } from "@/types/events";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  registrationCount?: number;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onRegister?: (event: Event) => void;
}

export function EventCard({ event, registrationCount = 0, onEdit, onDelete, onRegister }: EventCardProps) {
  const eventType = event.event_type as EventType;
  const colorClass = eventTypeColors[eventType] || eventTypeColors.general;
  const label = eventTypeLabels[eventType] || "Geral";

  const formattedDate = format(parseISO(event.event_date), "EEEE, d 'de' MMMM", { locale: ptBR });
  const formattedTime = event.start_time.slice(0, 5);
  const formattedEndTime = event.end_time?.slice(0, 5);

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={colorClass}>{label}</Badge>
            {event.is_recurring && (
              <Badge variant="outline" className="text-xs">Recorrente</Badge>
            )}
          </div>
          
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {event.title}
          </h3>
          
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span className="capitalize">{formattedDate}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/70" />
              {formattedTime}
              {formattedEndTime && ` - ${formattedEndTime}`}
            </span>
          </div>
          
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary/70" />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary/70" />
              {registrationCount} inscritos
              {event.max_attendees && ` / ${event.max_attendees}`}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-center">
            <div className="text-xs text-muted-foreground">
              {format(parseISO(event.event_date), "MMM", { locale: ptBR }).toUpperCase()}
            </div>
            <div className="text-xl font-bold text-primary">
              {format(parseISO(event.event_date), "d")}
            </div>
          </div>
          
          <div className="flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(event)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(event)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {onRegister && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            onClick={() => onRegister(event)} 
            className="w-full"
            disabled={event.max_attendees ? registrationCount >= event.max_attendees : false}
          >
            {event.max_attendees && registrationCount >= event.max_attendees 
              ? "Esgotado" 
              : "Inscrever-se"}
          </Button>
        </div>
      )}
    </div>
  );
}
