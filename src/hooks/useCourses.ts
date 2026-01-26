import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Course, CourseFormData, CourseModule, CourseLesson, CourseEnrollment } from '@/types/courses';

export function useCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Course[];
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Curso criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar curso', description: error.message, variant: 'destructive' });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...courseData }: CourseFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Curso atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar curso', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Curso excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir curso', description: error.message, variant: 'destructive' });
    },
  });

  return {
    courses: coursesQuery.data ?? [],
    isLoading: coursesQuery.isLoading,
    error: coursesQuery.error,
    createCourse: createCourseMutation.mutateAsync,
    updateCourse: updateCourseMutation.mutateAsync,
    deleteCourse: deleteCourseMutation.mutateAsync,
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
    isDeleting: deleteCourseMutation.isPending,
  };
}

export function useCourseModules(courseId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const modulesQuery = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as CourseModule[];
    },
    enabled: !!courseId,
  });

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { title: string; description?: string }) => {
      const maxOrder = modulesQuery.data?.reduce((max, m) => Math.max(max, m.order_index), -1) ?? -1;
      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          ...moduleData,
          order_index: maxOrder + 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      toast({ title: 'Módulo criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar módulo', description: error.message, variant: 'destructive' });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase
        .from('course_modules')
        .delete()
        .eq('id', moduleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      toast({ title: 'Módulo excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir módulo', description: error.message, variant: 'destructive' });
    },
  });

  return {
    modules: modulesQuery.data ?? [],
    isLoading: modulesQuery.isLoading,
    createModule: createModuleMutation.mutateAsync,
    deleteModule: deleteModuleMutation.mutateAsync,
  };
}

export function useCourseLessons(moduleId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const lessonsQuery = useQuery({
    queryKey: ['course-lessons', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as CourseLesson[];
    },
    enabled: !!moduleId,
  });

  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: { title: string; description?: string; scheduled_date?: string }) => {
      const maxOrder = lessonsQuery.data?.reduce((max, l) => Math.max(max, l.order_index), -1) ?? -1;
      const { data, error } = await supabase
        .from('course_lessons')
        .insert({
          module_id: moduleId,
          ...lessonData,
          order_index: maxOrder + 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', moduleId] });
      toast({ title: 'Aula criada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar aula', description: error.message, variant: 'destructive' });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('course_lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', moduleId] });
      toast({ title: 'Aula excluída com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir aula', description: error.message, variant: 'destructive' });
    },
  });

  return {
    lessons: lessonsQuery.data ?? [],
    isLoading: lessonsQuery.isLoading,
    createLesson: createLessonMutation.mutateAsync,
    deleteLesson: deleteLessonMutation.mutateAsync,
  };
}

export function useCourseEnrollments(courseId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollmentsQuery = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!courseId,
  });

  const createEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentData: { attendee_name: string; attendee_email?: string; attendee_phone?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: user?.id,
          ...enrollmentData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] });
      toast({ title: 'Inscrição realizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao realizar inscrição', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('id', enrollmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] });
      toast({ title: 'Inscrição cancelada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao cancelar inscrição', description: error.message, variant: 'destructive' });
    },
  });

  return {
    enrollments: enrollmentsQuery.data ?? [],
    isLoading: enrollmentsQuery.isLoading,
    createEnrollment: createEnrollmentMutation.mutateAsync,
    deleteEnrollment: deleteEnrollmentMutation.mutateAsync,
  };
}
