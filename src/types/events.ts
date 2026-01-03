export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  max_attendees: number | null;
  event_type: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  guardian_id: string | null;
  attendee_name: string;
  attendee_email: string | null;
  attendee_phone: string | null;
  status: string;
  notes: string | null;
  registered_at: string;
}

export type EventType = 'worship' | 'youth' | 'education' | 'prayer' | 'music' | 'general';

export const eventTypeLabels: Record<EventType, string> = {
  worship: 'Culto',
  youth: 'Jovens',
  education: 'Educação',
  prayer: 'Oração',
  music: 'Música',
  general: 'Geral',
};

export const eventTypeColors: Record<EventType, string> = {
  worship: 'bg-primary/10 text-primary',
  youth: 'bg-accent/10 text-accent',
  education: 'bg-blue-500/10 text-blue-600',
  prayer: 'bg-purple-500/10 text-purple-600',
  music: 'bg-pink-500/10 text-pink-600',
  general: 'bg-muted text-muted-foreground',
};
