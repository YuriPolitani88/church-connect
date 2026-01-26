import { Calendar, Users, BookOpen, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Course } from "@/types/courses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CourseCardProps {
  course: Course;
  enrollmentCount?: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success/10 text-success",
  archived: "bg-warning/10 text-warning",
};

export function CourseCard({ course, enrollmentCount = 0, onEdit, onDelete, onView }: CourseCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lifted">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">{course.title}</h3>
            {course.instructor_name && (
              <p className="text-sm text-muted-foreground mt-1">Por {course.instructor_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[course.status]}>
              {statusLabels[course.status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {course.category && (
            <Badge variant="outline">{course.category}</Badge>
          )}
          {course.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {course.start_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(course.start_date), "dd MMM yyyy", { locale: ptBR })}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {enrollmentCount}
              {course.max_participants && ` / ${course.max_participants}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
