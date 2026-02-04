import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award } from 'lucide-react';
import type { CourseCertificate } from '@/hooks/useCourseCertificates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CertificateTemplateProps {
  certificate: CourseCertificate;
  validationUrl: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, validationUrl }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[800px] h-[600px] bg-gradient-to-br from-background via-background to-muted border-8 border-double border-primary/30 p-8 relative print:border-primary/50"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-primary/40 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-primary/40 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-primary/40 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-primary/40 rounded-br-lg" />

        <div className="h-full flex flex-col items-center justify-between text-center">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Award className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold tracking-wider text-primary uppercase">
                Certificado
              </h1>
              <Award className="h-10 w-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              de Conclusão de Curso
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 max-w-[600px]">
            <p className="text-muted-foreground">Certificamos que</p>
            
            <h2 className="text-3xl font-bold text-foreground border-b-2 border-primary/30 pb-2 px-8">
              {certificate.attendee_name}
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              concluiu com êxito o curso
            </p>
            
            <h3 className="text-2xl font-semibold text-primary">
              {certificate.course_title}
            </h3>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              {certificate.total_hours && (
                <span>Carga horária: <strong>{certificate.total_hours}h</strong></span>
              )}
              <span>Frequência: <strong>{certificate.attendance_rate}%</strong></span>
            </div>

            {certificate.instructor_name && (
              <p className="text-sm text-muted-foreground">
                Instrutor: <span className="font-medium">{certificate.instructor_name}</span>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between">
            <div className="text-left text-xs text-muted-foreground space-y-1">
              <p>Emitido em: {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              <p>Certificado nº: {certificate.certificate_number}</p>
              <p className="text-[10px]">Código de validação: {certificate.validation_code}</p>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <QRCodeSVG
                value={validationUrl}
                size={80}
                level="M"
                className="rounded"
              />
              <span className="text-[9px] text-muted-foreground">
                Escaneie para validar
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
