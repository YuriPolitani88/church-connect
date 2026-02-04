import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CourseMaterial } from '@/types/courses';

const BUCKET_NAME = 'course-materials';

export function useCourseMaterials(courseId: string, lessonId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: ['course-materials', courseId, lessonId],
    queryFn: async () => {
      let query = supabase
        .from('course_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (lessonId) {
        query = query.eq('lesson_id', lessonId);
      } else {
        query = query.eq('course_id', courseId).is('lesson_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CourseMaterial[];
    },
    enabled: !!courseId,
  });

  const uploadMaterialMutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // Save material record
      const { data, error } = await supabase
        .from('course_materials')
        .insert({
          course_id: courseId,
          lesson_id: lessonId || null,
          title,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', courseId, lessonId] });
      toast({ title: 'Material enviado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao enviar material', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (material: CourseMaterial) => {
      // Extract file path from URL
      const urlParts = material.file_url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage delete warning:', storageError);
      }

      // Delete record
      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', material.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', courseId, lessonId] });
      toast({ title: 'Material excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir material', description: error.message, variant: 'destructive' });
    },
  });

  return {
    materials: materialsQuery.data ?? [],
    isLoading: materialsQuery.isLoading,
    uploadMaterial: uploadMaterialMutation.mutateAsync,
    deleteMaterial: deleteMaterialMutation.mutateAsync,
    isUploading: uploadMaterialMutation.isPending,
  };
}
