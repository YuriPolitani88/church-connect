import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, GraduationCap } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFormDialog } from "@/components/courses/CourseFormDialog";
import { CourseDetailDialog } from "@/components/courses/CourseDetailDialog";
import { useCourses } from "@/hooks/useCourses";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Course, CourseFormData } from "@/types/courses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Courses() {
  const { courses, isLoading, createCourse, updateCourse, deleteCourse, isCreating, isUpdating } = useCourses();
  const { isAdmin } = useAuthContext();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];

  const handleCreate = () => {
    setSelectedCourse(null);
    setFormOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormOpen(true);
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setDetailOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete.id);
      setDeleteOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleSubmit = async (data: CourseFormData) => {
    if (selectedCourse) {
      await updateCourse({ id: selectedCourse.id, ...data });
    } else {
      await createCourse(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Cursos</h1>
            <p className="text-muted-foreground">Gerencie os cursos e treinamentos da igreja</p>
          </div>
          {isAdmin() && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Curso
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground mt-1">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece criando o primeiro curso"}
            </p>
            {isAdmin() && !search && statusFilter === "all" && categoryFilter === "all" && (
              <Button onClick={handleCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Criar Curso
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => handleEdit(course)}
                onDelete={() => handleDeleteClick(course)}
                onView={() => handleView(course)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={selectedCourse}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <CourseDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        course={selectedCourse}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O curso "{courseToDelete?.title}" e todos os seus
              módulos, aulas e inscrições serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
