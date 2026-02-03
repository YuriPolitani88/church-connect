import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourseAttendanceReport } from "@/hooks/useLessonAttendance";
import { Check, X, Clock, BarChart3, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceReportProps {
  courseId: string;
}

function getStatusIcon(status: string | null) {
  switch (status) {
    case 'present':
      return <Check className="h-3.5 w-3.5 text-green-500" />;
    case 'absent':
      return <X className="h-3.5 w-3.5 text-red-500" />;
    case 'excused':
      return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return <span className="h-3.5 w-3.5 text-muted-foreground">-</span>;
  }
}

function getAttendanceRateBadge(rate: number) {
  if (rate >= 75) {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{rate}%</Badge>;
  } else if (rate >= 50) {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{rate}%</Badge>;
  } else {
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{rate}%</Badge>;
  }
}

export function AttendanceReport({ courseId }: AttendanceReportProps) {
  const { data: report, isLoading } = useCourseAttendanceReport(courseId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!report || report.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum dado de frequência disponível</p>
        <p className="text-sm">Inscreva alunos e registre presenças para ver o relatório</p>
      </div>
    );
  }

  const totalLessons = report[0]?.totalLessons ?? 0;
  const totalStudents = report.length;
  const averageAttendance = totalStudents > 0 
    ? Math.round(report.reduce((sum, r) => sum + r.attendanceRate, 0) / totalStudents) 
    : 0;
  const studentsAtRisk = report.filter(r => r.attendanceRate < 75).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total de Alunos</span>
            </div>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Total de Aulas</span>
            </div>
            <p className="text-2xl font-bold">{totalLessons}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Frequência Média</span>
            </div>
            <p className="text-2xl font-bold">{averageAttendance}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Em Risco (&lt;75%)</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{studentsAtRisk}</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequência por Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Aluno</TableHead>
                  <TableHead className="text-center w-20">Presenças</TableHead>
                  <TableHead className="text-center w-20">Faltas</TableHead>
                  <TableHead className="text-center w-20">Justif.</TableHead>
                  <TableHead className="min-w-[120px]">Frequência</TableHead>
                  {report[0]?.lessonDetails?.slice(0, 6).map((lesson) => (
                    <TableHead key={lesson.lessonId} className="text-center w-10" title={lesson.lessonTitle}>
                      {lesson.lessonTitle.substring(0, 3)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((student) => (
                  <TableRow key={student.enrollmentId}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{student.attendeeName}</p>
                        {student.attendeeEmail && (
                          <p className="text-xs text-muted-foreground">{student.attendeeEmail}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        {student.presentCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <X className="h-3 w-3 text-red-500" />
                        {student.absentCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        {student.excusedCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={student.attendanceRate} 
                          className="h-2 flex-1"
                        />
                        {getAttendanceRateBadge(student.attendanceRate)}
                      </div>
                    </TableCell>
                    {student.lessonDetails.slice(0, 6).map((lesson) => (
                      <TableCell key={lesson.lessonId} className="text-center">
                        {getStatusIcon(lesson.status)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Presente</span>
            </div>
            <div className="flex items-center gap-1">
              <X className="h-3 w-3 text-red-500" />
              <span>Ausente</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Justificado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
