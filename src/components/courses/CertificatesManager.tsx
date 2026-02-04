import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Download, Trash2, AlertCircle, CheckCircle2, Loader2, Eye, Printer } from 'lucide-react';
import { useCourseCertificates } from '@/hooks/useCourseCertificates';
import { useCourseAttendanceReport } from '@/hooks/useLessonAttendance';
import { useCourses } from '@/hooks/useCourses';
import { CertificateTemplate } from './CertificateTemplate';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CertificatesManagerProps {
  courseId: string;
  courseTitle: string;
  instructorName?: string | null;
}

const MIN_ATTENDANCE_RATE = 75;

export function CertificatesManager({ courseId, courseTitle, instructorName }: CertificatesManagerProps) {
  const { certificates, isLoading, issueCertificate, deleteCertificate, isIssuing } = useCourseCertificates(courseId);
  const { data: attendanceData, isLoading: isLoadingAttendance } = useCourseAttendanceReport(courseId);
  const [selectedCertificate, setSelectedCertificate] = useState<typeof certificates[0] | null>(null);
  const [minRate, setMinRate] = useState(MIN_ATTENDANCE_RATE);
  const certificateRef = useRef<HTMLDivElement>(null);

  const eligibleStudents = attendanceData?.filter(
    (student) =>
      student.attendanceRate >= minRate &&
      student.totalLessons > 0 &&
      !certificates.find((c) => c.enrollment_id === student.enrollmentId)
  ) ?? [];

  const handleIssueCertificate = async (student: typeof eligibleStudents[0]) => {
    await issueCertificate({
      enrollmentId: student.enrollmentId,
      attendeeName: student.attendeeName,
      courseTitle,
      instructorName: instructorName ?? undefined,
      attendanceRate: student.attendanceRate,
    });
  };

  const handleIssueAll = async () => {
    for (const student of eligibleStudents) {
      await issueCertificate({
        enrollmentId: student.enrollmentId,
        attendeeName: student.attendeeName,
        courseTitle,
        instructorName: instructorName ?? undefined,
        attendanceRate: student.attendanceRate,
      });
    }
  };

  const handlePrint = () => {
    const printContent = certificateRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificado - ${selectedCertificate?.attendee_name}</title>
          <style>
            @media print {
              body { margin: 0; }
              .certificate { page-break-after: always; }
            }
            body {
              font-family: Georgia, serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const validationUrl = selectedCertificate
    ? `${window.location.origin}/certificate/${selectedCertificate.validation_code}`
    : '';

  if (isLoading || isLoadingAttendance) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            Configurações de Emissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="minRate">Frequência mínima para certificado (%)</Label>
              <Input
                id="minRate"
                type="number"
                min={0}
                max={100}
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                className="w-32"
              />
            </div>
            {eligibleStudents.length > 0 && (
              <Button onClick={handleIssueAll} disabled={isIssuing}>
                {isIssuing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                Emitir todos ({eligibleStudents.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eligible Students */}
      {eligibleStudents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Alunos Elegíveis ({eligibleStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eligibleStudents.map((student) => (
                <div
                  key={student.enrollmentId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{student.attendeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      Frequência: {student.attendanceRate}%
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleIssueCertificate(student)}
                    disabled={isIssuing}
                  >
                    {isIssuing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-1" />
                        Emitir
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students not eligible */}
      {attendanceData && attendanceData.filter(s => s.attendanceRate < minRate && s.totalLessons > 0).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Alunos sem Frequência Mínima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceData
                .filter(s => s.attendanceRate < minRate && s.totalLessons > 0)
                .map((student) => (
                  <div
                    key={student.enrollmentId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-muted-foreground">{student.attendeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        Frequência: {student.attendanceRate}% (mínimo: {minRate}%)
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      Não elegível
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issued Certificates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Certificados Emitidos ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum certificado emitido ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{cert.attendee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.certificate_number} • Emitido em{' '}
                      {format(new Date(cert.issued_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedCertificate(cert)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[850px] max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Visualizar Certificado</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4">
                          <div className="overflow-auto max-w-full">
                            <CertificateTemplate
                              ref={certificateRef}
                              certificate={cert}
                              validationUrl={`${window.location.origin}/certificate/${cert.validation_code}`}
                            />
                          </div>
                          <Button onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir / Salvar PDF
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCertificate(cert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
