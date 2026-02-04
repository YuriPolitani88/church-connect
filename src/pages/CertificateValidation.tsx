import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useCertificateValidation } from '@/hooks/useCourseCertificates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CertificateValidation() {
  const { code } = useParams<{ code: string }>();
  const { data: certificate, isLoading, error } = useCertificateValidation(code ?? '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Validando certificado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {certificate ? (
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {certificate ? 'Certificado Válido' : 'Certificado Não Encontrado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {certificate ? (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Certificamos que</p>
                  <p className="text-xl font-bold mt-1">{certificate.attendee_name}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">concluiu o curso</p>
                  <p className="text-lg font-semibold text-primary mt-1">
                    {certificate.course_title}
                  </p>
                </div>

                {certificate.instructor_name && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Instrutor: {certificate.instructor_name}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  {certificate.total_hours && (
                    <Badge variant="secondary">
                      {certificate.total_hours}h de carga horária
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {certificate.attendance_rate}% de frequência
                  </Badge>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Número do certificado:</strong> {certificate.certificate_number}
                  </p>
                  <p>
                    <strong>Data de emissão:</strong>{' '}
                    {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p>
                    <strong>Código de validação:</strong> {certificate.validation_code}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                O código de validação "{code}" não corresponde a nenhum certificado em nosso sistema.
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique se o código foi digitado corretamente ou se o QR Code foi escaneado com sucesso.
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
