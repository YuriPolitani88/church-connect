import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, BookOpen, Users, FileText, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { useCourseModules, useCourseLessons, useCourseEnrollments } from "@/hooks/useCourses";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Course, CourseModule } from "@/types/courses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CourseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}

function ModuleLessons({ module }: { module: CourseModule }) {
  const { lessons, createLesson, deleteLesson } = useCourseLessons(module.id);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;
    await createLesson({ title: newLessonTitle });
    setNewLessonTitle("");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-2">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <CardTitle className="text-base font-medium">{module.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {lessons.length} aulas
              </Badge>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{lesson.title}</p>
                    {lesson.scheduled_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(lesson.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteLesson(lesson.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Nova aula..."
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLesson()}
                className="h-9"
              />
              <Button size="sm" onClick={handleAddLesson} disabled={!newLessonTitle.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ModulesTab({ courseId }: { courseId: string }) {
  const { modules, createModule, deleteModule } = useCourseModules(courseId);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    await createModule({ title: newModuleTitle });
    setNewModuleTitle("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Novo módulo..."
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
        />
        <Button onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
      
      {modules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum módulo cadastrado</p>
          <p className="text-sm">Adicione o primeiro módulo acima</p>
        </div>
      ) : (
        modules.map((module) => (
          <ModuleLessons key={module.id} module={module} />
        ))
      )}
    </div>
  );
}

function EnrollmentsTab({ courseId, maxParticipants }: { courseId: string; maxParticipants?: number | null }) {
  const { enrollments, createEnrollment, deleteEnrollment } = useCourseEnrollments(courseId);
  const [newAttendee, setNewAttendee] = useState({ name: "", email: "", phone: "" });

  const handleAddEnrollment = async () => {
    if (!newAttendee.name.trim()) return;
    await createEnrollment({
      attendee_name: newAttendee.name,
      attendee_email: newAttendee.email || undefined,
      attendee_phone: newAttendee.phone || undefined,
    });
    setNewAttendee({ name: "", email: "", phone: "" });
  };

  const isFull = maxParticipants ? enrollments.length >= maxParticipants : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">
            {enrollments.length}
            {maxParticipants && ` / ${maxParticipants}`} inscritos
          </span>
        </div>
        {isFull && <Badge variant="destructive">Vagas esgotadas</Badge>}
      </div>

      {!isFull && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Nome do participante *"
              value={newAttendee.name}
              onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="E-mail"
                type="email"
                value={newAttendee.email}
                onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
              />
              <Input
                placeholder="Telefone"
                value={newAttendee.phone}
                onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
              />
            </div>
            <Button onClick={handleAddEnrollment} disabled={!newAttendee.name.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Inscrever
            </Button>
          </CardContent>
        </Card>
      )}

      {enrollments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma inscrição ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <p className="font-medium">{enrollment.attendee_name}</p>
                <p className="text-sm text-muted-foreground">
                  {enrollment.attendee_email}
                  {enrollment.attendee_phone && ` • ${enrollment.attendee_phone}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteEnrollment(enrollment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CourseDetailDialog({ open, onOpenChange, course }: CourseDetailDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{course.title}</DialogTitle>
          {course.description && (
            <p className="text-sm text-muted-foreground">{course.description}</p>
          )}
        </DialogHeader>

        <Tabs defaultValue="modules" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Módulos
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Inscrições
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Materiais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-4">
            <ModulesTab courseId={course.id} />
          </TabsContent>

          <TabsContent value="enrollments" className="mt-4">
            <EnrollmentsTab courseId={course.id} maxParticipants={course.max_participants} />
          </TabsContent>

          <TabsContent value="materials" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Gestão de materiais em breve</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
