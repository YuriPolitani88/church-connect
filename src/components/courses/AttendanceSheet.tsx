import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourseModules, useCourseLessons, useCourseEnrollments } from "@/hooks/useCourses";
import { useLessonAttendance } from "@/hooks/useLessonAttendance";
import { Check, X, Clock, Users, Save, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CourseLesson, CourseEnrollment } from "@/types/courses";

interface AttendanceSheetProps {
  courseId: string;
}

type AttendanceStatus = 'present' | 'absent' | 'excused';

function LessonAttendanceForm({ 
  lesson, 
  enrollments 
}: { 
  lesson: CourseLesson; 
  enrollments: CourseEnrollment[];
}) {
  const { attendance, bulkRecordAttendance, isRecording } = useLessonAttendance(lesson.id);
  const [localStatus, setLocalStatus] = useState<Record<string, AttendanceStatus>>({});

  // Initialize local status from existing attendance
  useEffect(() => {
    const initialStatus: Record<string, AttendanceStatus> = {};
    enrollments.forEach(e => {
      const existingAtt = attendance.find(a => a.enrollment_id === e.id);
      initialStatus[e.id] = (existingAtt?.status as AttendanceStatus) ?? 'absent';
    });
    setLocalStatus(initialStatus);
  }, [enrollments, attendance]);

  const handleStatusChange = (enrollmentId: string, status: AttendanceStatus) => {
    setLocalStatus(prev => ({ ...prev, [enrollmentId]: status }));
  };

  const handleSaveAll = async () => {
    const records = Object.entries(localStatus).map(([enrollmentId, status]) => ({
      enrollmentId,
      status,
    }));
    await bulkRecordAttendance(records);
  };

  const handleMarkAllPresent = () => {
    const newStatus: Record<string, AttendanceStatus> = {};
    enrollments.forEach(e => {
      newStatus[e.id] = 'present';
    });
    setLocalStatus(newStatus);
  };

  const presentCount = Object.values(localStatus).filter(s => s === 'present').length;
  const absentCount = Object.values(localStatus).filter(s => s === 'absent').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{lesson.title}</CardTitle>
            {lesson.scheduled_date && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(lesson.scheduled_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Check className="h-3 w-3 text-green-500" />
              {presentCount}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <X className="h-3 w-3 text-red-500" />
              {absentCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllPresent}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Marcar todos presentes
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum aluno inscrito neste curso
          </p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <div 
                key={enrollment.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium text-sm">{enrollment.attendee_name}</p>
                  {enrollment.attendee_email && (
                    <p className="text-xs text-muted-foreground">{enrollment.attendee_email}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={localStatus[enrollment.id] === 'present' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleStatusChange(enrollment.id, 'present')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={localStatus[enrollment.id] === 'absent' ? 'destructive' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleStatusChange(enrollment.id, 'absent')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={localStatus[enrollment.id] === 'excused' ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleStatusChange(enrollment.id, 'excused')}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={handleSaveAll} 
          disabled={isRecording || enrollments.length === 0}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isRecording ? 'Salvando...' : 'Salvar Presenças'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AttendanceSheet({ courseId }: AttendanceSheetProps) {
  const { modules, isLoading: modulesLoading } = useCourseModules(courseId);
  const { enrollments, isLoading: enrollmentsLoading } = useCourseEnrollments(courseId);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const { lessons, isLoading: lessonsLoading } = useCourseLessons(selectedModuleId);

  // Auto-select first module
  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  if (modulesLoading || enrollmentsLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Crie módulos e aulas primeiro</p>
        <p className="text-sm">A lista de chamada estará disponível após cadastrar as aulas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um módulo" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {enrollments.length} alunos
        </Badge>
      </div>

      {lessonsLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          Carregando aulas...
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma aula neste módulo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <LessonAttendanceForm
              key={lesson.id}
              lesson={lesson}
              enrollments={enrollments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
