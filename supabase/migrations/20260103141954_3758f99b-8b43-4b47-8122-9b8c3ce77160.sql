-- Create update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create guardians table
CREATE TABLE public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  relationship TEXT DEFAULT 'parent',
  photo_url TEXT,
  is_authorized_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classrooms table
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  current_count INTEGER NOT NULL DEFAULT 0,
  teacher_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT,
  photo_url TEXT,
  classroom_id UUID REFERENCES public.classrooms(id),
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  special_needs TEXT[] DEFAULT '{}',
  medical_notes TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  is_checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create child_guardians junction table
CREATE TABLE public.child_guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  UNIQUE(child_id, guardian_id)
);

-- Create check_ins table
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id),
  checked_in_by UUID REFERENCES public.guardians(id),
  checked_out_by UUID REFERENCES public.guardians(id),
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  qr_code TEXT,
  notes TEXT
);

-- Create parent_alerts table
CREATE TABLE public.parent_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read/write for now, will be restricted with auth later)
CREATE POLICY "Anyone can view guardians" ON public.guardians FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guardians" ON public.guardians FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update guardians" ON public.guardians FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete guardians" ON public.guardians FOR DELETE USING (true);

CREATE POLICY "Anyone can view classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert classrooms" ON public.classrooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update classrooms" ON public.classrooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can view children" ON public.children FOR SELECT USING (true);
CREATE POLICY "Anyone can insert children" ON public.children FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update children" ON public.children FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete children" ON public.children FOR DELETE USING (true);

CREATE POLICY "Anyone can view child_guardians" ON public.child_guardians FOR SELECT USING (true);
CREATE POLICY "Anyone can insert child_guardians" ON public.child_guardians FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete child_guardians" ON public.child_guardians FOR DELETE USING (true);

CREATE POLICY "Anyone can view check_ins" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Anyone can insert check_ins" ON public.check_ins FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update check_ins" ON public.check_ins FOR UPDATE USING (true);

CREATE POLICY "Anyone can view parent_alerts" ON public.parent_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert parent_alerts" ON public.parent_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update parent_alerts" ON public.parent_alerts FOR UPDATE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default classrooms
INSERT INTO public.classrooms (name, age_range, capacity, teacher_name) VALUES
  ('Berçário', '0-1 anos', 10, 'Maria Silva'),
  ('Maternal', '2-3 anos', 15, 'Ana Costa'),
  ('Jardim I', '4-5 anos', 20, 'Paula Santos'),
  ('Jardim II', '6-7 anos', 20, 'Carla Oliveira'),
  ('Pré-Adolescentes', '8-11 anos', 25, 'Roberto Lima');

-- Now create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  max_attendees INTEGER,
  event_type TEXT DEFAULT 'general',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendee_phone TEXT,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can create events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete events" ON public.events FOR DELETE USING (true);

-- Registration policies
CREATE POLICY "Anyone can view registrations" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can register for events" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update registrations" ON public.event_registrations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete registrations" ON public.event_registrations FOR DELETE USING (true);

-- Trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample events
INSERT INTO public.events (title, description, event_date, start_time, end_time, location, max_attendees, event_type) VALUES
  ('Culto de Celebração', 'Culto dominical de celebração e adoração', '2026-01-04', '10:00', '12:00', 'Templo Principal', 300, 'worship'),
  ('Grupo de Jovens', 'Encontro semanal do grupo de jovens', '2026-01-03', '19:00', '21:00', 'Salão Social', 60, 'youth'),
  ('Escola Bíblica Dominical', 'Estudos bíblicos para todas as idades', '2026-01-04', '09:00', '10:00', 'Salas de Aula', 150, 'education'),
  ('Reunião de Oração', 'Momento de oração e intercessão', '2026-01-07', '19:30', '21:00', 'Capela', 50, 'prayer'),
  ('Ensaio do Coral', 'Ensaio semanal do coral da igreja', '2026-01-08', '20:00', '22:00', 'Salão de Música', 40, 'music');