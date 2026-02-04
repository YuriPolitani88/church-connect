-- Create table for course certificates
CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  attendee_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  instructor_name TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_rate NUMERIC(5,2) NOT NULL,
  total_hours INTEGER,
  validation_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view certificates (for validation)
CREATE POLICY "Anyone can view certificates for validation"
ON public.course_certificates
FOR SELECT
USING (true);

-- Policy: Admins can manage certificates
CREATE POLICY "Admins can manage certificates"
ON public.course_certificates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.course_certificates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM course_enrollments
    WHERE course_enrollments.id = course_certificates.enrollment_id
    AND course_enrollments.user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_certificates_enrollment ON public.course_certificates(enrollment_id);
CREATE INDEX idx_certificates_validation_code ON public.course_certificates(validation_code);
CREATE INDEX idx_certificates_course ON public.course_certificates(course_id);