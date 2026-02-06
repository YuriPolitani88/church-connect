import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Award, Eye, Printer, Calendar, User, BarChart3 } from 'lucide-react';
import { useGuardianCourses, type GuardianCourseWithStats } from '@/hooks/useGuardianCourses';
import { CertificateTemplate } from '@/components/courses/CertificateTemplate';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function AttendanceBadge({ rate }: { rate: number }) {
  if (rate >= 75) {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{rate}%</Badge>;
  } else if (rate >= 50) {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{rate}%</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{rate}%</Badge>;
}

function CourseEnrollmentCard({ enrollment }: { enrollment: GuardianCourseWithStats }) {
  const [showCert, setShowCert] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const el = certRef.current;
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Certificado</title><style>body{font-family:Georgia,serif;margin:0;padding:20px;display:flex;justify-content:center;}@media print{body{margin:0;}}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  const course = enrollment.course;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{course?.title ?? 'Curso'}</CardTitle>
              {course?.instructor_name && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  {course.instructor_name}
                </CardDescription>
              )}
            </div>
            {enrollment.certificate && (
              <Badge className="bg-primary/10 text-primary gap-1 shrink-0">
                <Award className="h-3 w-3" />
                Certificado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {course?.category && (
            <Badge variant="outline">{course.category}</Badge>
          )}

          {course?.start_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(course.start_date), "dd MMM yyyy", { locale: ptBR })}
              {course.end_date && ` — ${format(new Date(course.end_date), "dd MMM yyyy", { locale: ptBR })}`}
            </div>
          )}

          {/* Attendance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Frequência
              </span>
              <AttendanceBadge rate={enrollment.attendanceRate} />
            </div>
            <Progress value={enrollment.attendanceRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {enrollment.presentCount} de {enrollment.totalLessons} aulas
            </p>
          </div>

          {enrollment.certificate && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCert(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Certificado
            </Button>
          )}
        </CardContent>
      </Card>

      {enrollment.certificate && (
        <Dialog open={showCert} onOpenChange={setShowCert}>
          <DialogContent className="max-w-[850px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Meu Certificado</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <div className="overflow-auto max-w-full">
                <CertificateTemplate
                  ref={certRef}
                  certificate={enrollment.certificate}
                  validationUrl={`${window.location.origin}/certificate/${enrollment.certificate.validation_code}`}
                />
              </div>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir / Salvar PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function GuardianCoursesTab() {
  const { data: courses, isLoading } = useGuardianCourses();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map(i => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Você não está inscrito em nenhum curso.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map(enrollment => (
        <CourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
