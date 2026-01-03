import { useState } from "react";
import { Plus, Calendar, Search, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCard } from "@/components/events/EventCard";
import { EventFormDialog } from "@/components/events/EventFormDialog";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/useEvents";
import type { Event } from "@/types/events";
import { eventTypeLabels } from "@/types/events";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";

export default function Events() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const today = startOfDay(new Date());

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || event.event_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents?.filter(e => 
    isAfter(parseISO(e.event_date), today) || format(parseISO(e.event_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );
  
  const pastEvents = filteredEvents?.filter(e => 
    isBefore(parseISO(e.event_date), today)
  );

  const handleSubmit = (data: Partial<Event>) => {
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...data }, {
        onSuccess: () => {
          setFormOpen(false);
          setEditingEvent(null);
        },
      });
    } else {
      createEvent.mutate(data as Omit<Event, "id" | "created_at" | "updated_at">, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleDelete = (event: Event) => {
    if (confirm(`Deseja realmente excluir o evento "${event.title}"?`)) {
      deleteEvent.mutate(event.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Eventos</h1>
            <p className="text-muted-foreground">Gerencie os eventos da igreja</p>
          </div>
          <Button onClick={() => { setEditingEvent(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(eventTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Próximos ({upcomingEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past">
              Anteriores ({pastEvents?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : upcomingEvents?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium text-foreground">Nenhum evento próximo</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie um novo evento para começar.
                </p>
                <Button className="mt-4" onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Evento
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingEvents?.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium text-foreground">Nenhum evento anterior</h3>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pastEvents?.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EventFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEvent(null);
        }}
        event={editingEvent}
        onSubmit={handleSubmit}
        isLoading={createEvent.isPending || updateEvent.isPending}
      />
    </DashboardLayout>
  );
}
