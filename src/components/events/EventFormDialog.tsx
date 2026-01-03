import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Event } from "@/types/events";
import { eventTypeLabels } from "@/types/events";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSubmit: (data: Partial<Event>) => void;
  isLoading?: boolean;
}

export function EventFormDialog({ open, onOpenChange, event, onSubmit, isLoading }: EventFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    max_attendees: "",
    event_type: "general",
    is_recurring: false,
    recurrence_pattern: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time || "",
        location: event.location || "",
        max_attendees: event.max_attendees?.toString() || "",
        event_type: event.event_type,
        is_recurring: event.is_recurring,
        recurrence_pattern: event.recurrence_pattern || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        location: "",
        max_attendees: "",
        event_type: "general",
        is_recurring: false,
        recurrence_pattern: "",
      });
    }
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      end_time: formData.end_time || null,
      description: formData.description || null,
      location: formData.location || null,
      recurrence_pattern: formData.recurrence_pattern || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {event ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Data *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo</Label>
              <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora Início *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Hora Fim</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_attendees">Capacidade</Label>
              <Input
                id="max_attendees"
                type="number"
                min="1"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="is_recurring">Evento Recorrente</Label>
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
          </div>

          {formData.is_recurring && (
            <div className="space-y-2">
              <Label htmlFor="recurrence_pattern">Padrão de Recorrência</Label>
              <Select 
                value={formData.recurrence_pattern} 
                onValueChange={(v) => setFormData({ ...formData, recurrence_pattern: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quinzenal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Salvando..." : event ? "Atualizar" : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
