import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSendEmail } from '@/hooks/useSendEmail';

export interface CourseCertificate {
  id: string;
  enrollment_id: string;
  course_id: string;
  certificate_number: string;
  attendee_name: string;
  course_title: string;
  instructor_name: string | null;
  issued_at: string;
  attendance_rate: number;
  total_hours: number | null;
  validation_code: string;
  created_at: string;
}

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${random}`;
}

function generateValidationCode(): string {
  return Math.random().toString(36).substring(2, 14).toUpperCase();
}

export function useCourseCertificates(courseId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: sendEmail } = useSendEmail();

  const certificatesQuery = useQuery({
    queryKey: ['course-certificates', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_certificates')
        .select('*')
        .eq('course_id', courseId)
        .order('issued_at', { ascending: false });
      
      if (error) throw error;
      return data as CourseCertificate[];
    },
    enabled: !!courseId,
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async ({
      enrollmentId,
      attendeeName,
      courseTitle,
      instructorName,
      attendanceRate,
      totalHours,
      attendeeEmail,
    }: {
      enrollmentId: string;
      attendeeName: string;
      courseTitle: string;
      instructorName?: string;
      attendanceRate: number;
      totalHours?: number;
      attendeeEmail?: string | null;
    }) => {
      const validationCode = generateValidationCode();
      const certificateNumber = generateCertificateNumber();

      const { data, error } = await supabase
        .from('course_certificates')
        .insert({
          enrollment_id: enrollmentId,
          course_id: courseId,
          certificate_number: certificateNumber,
          attendee_name: attendeeName,
          course_title: courseTitle,
          instructor_name: instructorName,
          attendance_rate: attendanceRate,
          total_hours: totalHours,
          validation_code: validationCode,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Send email notification if attendee has email
      if (attendeeEmail) {
        const validationUrl = `${window.location.origin}/certificate/${validationCode}`;
        try {
          await sendEmail({
            to: attendeeEmail,
            subject: `Certificado de Conclusão - ${courseTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">🎓 Certificado Emitido!</h1>
                <p>Olá <strong>${attendeeName}</strong>,</p>
                <p>Parabéns por concluir o curso <strong>${courseTitle}</strong>!</p>
                <p>Seu certificado foi emitido com os seguintes dados:</p>
                <ul>
                  <li><strong>Número:</strong> ${certificateNumber}</li>
                  <li><strong>Frequência:</strong> ${attendanceRate}%</li>
                  ${instructorName ? `<li><strong>Instrutor:</strong> ${instructorName}</li>` : ''}
                </ul>
                <p>Você pode validar seu certificado acessando o link abaixo:</p>
                <p><a href="${validationUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Validar Certificado</a></p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">Este é um e-mail automático. Por favor, não responda.</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Erro ao enviar e-mail do certificado:', emailError);
          // Don't fail the certificate issuance if email fails
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-certificates', courseId] });
      toast({ title: 'Certificado emitido com sucesso!' });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast({ title: 'Certificado já emitido', description: 'Este aluno já possui certificado para este curso.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro ao emitir certificado', description: error.message, variant: 'destructive' });
      }
    },
  });

  const deleteCertificateMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      const { error } = await supabase
        .from('course_certificates')
        .delete()
        .eq('id', certificateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-certificates', courseId] });
      toast({ title: 'Certificado revogado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao revogar certificado', description: error.message, variant: 'destructive' });
    },
  });

  return {
    certificates: certificatesQuery.data ?? [],
    isLoading: certificatesQuery.isLoading,
    issueCertificate: issueCertificateMutation.mutateAsync,
    deleteCertificate: deleteCertificateMutation.mutateAsync,
    isIssuing: issueCertificateMutation.isPending,
  };
}

export function useCertificateValidation(validationCode: string) {
  return useQuery({
    queryKey: ['certificate-validation', validationCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_certificates')
        .select('*')
        .eq('validation_code', validationCode)
        .maybeSingle();
      
      if (error) throw error;
      return data as CourseCertificate | null;
    },
    enabled: !!validationCode && validationCode.length >= 8,
  });
}
