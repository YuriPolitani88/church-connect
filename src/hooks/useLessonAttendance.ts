import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LessonAttendance } from '@/types/courses';

export function useLessonAttendance(lessonId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['lesson-attendance', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_attendance')
        .select('*')
        .eq('lesson_id', lessonId);
      
      if (error) throw error;
      return data as LessonAttendance[];
    },
    enabled: !!lessonId,
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      status, 
      notes 
    }: { 
      enrollmentId: string; 
      status: string; 
      notes?: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if attendance already exists
      const { data: existing } = await supabase
        .from('lesson_attendance')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('enrollment_id', enrollmentId)
        .single();
      
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('lesson_attendance')
          .update({ status, notes, recorded_at: new Date().toISOString(), recorded_by: user?.id })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('lesson_attendance')
          .insert({
            lesson_id: lessonId,
            enrollment_id: enrollmentId,
            status,
            notes,
            recorded_by: user?.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-attendance', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-attendance-report'] });
      toast({ title: 'Presença registrada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar presença', description: error.message, variant: 'destructive' });
    },
  });

  const bulkRecordAttendanceMutation = useMutation({
    mutationFn: async (records: { enrollmentId: string; status: string; notes?: string }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      for (const record of records) {
        const { data: existing } = await supabase
          .from('lesson_attendance')
          .select('id')
          .eq('lesson_id', lessonId)
          .eq('enrollment_id', record.enrollmentId)
          .single();
        
        if (existing) {
          await supabase
            .from('lesson_attendance')
            .update({ 
              status: record.status, 
              notes: record.notes, 
              recorded_at: new Date().toISOString(),
              recorded_by: user?.id 
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('lesson_attendance')
            .insert({
              lesson_id: lessonId,
              enrollment_id: record.enrollmentId,
              status: record.status,
              notes: record.notes,
              recorded_by: user?.id,
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-attendance', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-attendance-report'] });
      toast({ title: 'Presenças registradas!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar presenças', description: error.message, variant: 'destructive' });
    },
  });

  return {
    attendance: attendanceQuery.data ?? [],
    isLoading: attendanceQuery.isLoading,
    recordAttendance: recordAttendanceMutation.mutateAsync,
    bulkRecordAttendance: bulkRecordAttendanceMutation.mutateAsync,
    isRecording: recordAttendanceMutation.isPending || bulkRecordAttendanceMutation.isPending,
  };
}

export interface AttendanceReportData {
  enrollmentId: string;
  attendeeName: string;
  attendeeEmail: string | null;
  totalLessons: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number;
  lessonDetails: {
    lessonId: string;
    lessonTitle: string;
    status: string | null;
    date: string | null;
  }[];
}

export function useCourseAttendanceReport(courseId: string) {
  return useQuery({
    queryKey: ['course-attendance-report', courseId],
    queryFn: async (): Promise<AttendanceReportData[]> => {
      // Fetch enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('id, attendee_name, attendee_email')
        .eq('course_id', courseId);
      
      if (enrollmentsError) throw enrollmentsError;
      
      // Fetch modules
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);
      
      if (modulesError) throw modulesError;
      
      if (!modules || modules.length === 0) {
        return enrollments?.map(e => ({
          enrollmentId: e.id,
          attendeeName: e.attendee_name,
          attendeeEmail: e.attendee_email,
          totalLessons: 0,
          presentCount: 0,
          absentCount: 0,
          excusedCount: 0,
          attendanceRate: 0,
          lessonDetails: [],
        })) ?? [];
      }
      
      // Fetch all lessons for these modules
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id, title, scheduled_date, module_id')
        .in('module_id', modules.map(m => m.id))
        .order('order_index', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      
      // Fetch all attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from('lesson_attendance')
        .select('*')
        .in('lesson_id', lessons?.map(l => l.id) ?? []);
      
      if (attendanceError) throw attendanceError;
      
      // Build report for each enrollment
      return (enrollments ?? []).map(enrollment => {
        const enrollmentAttendance = attendance?.filter(a => a.enrollment_id === enrollment.id) ?? [];
        
        const presentCount = enrollmentAttendance.filter(a => a.status === 'present').length;
        const absentCount = enrollmentAttendance.filter(a => a.status === 'absent').length;
        const excusedCount = enrollmentAttendance.filter(a => a.status === 'excused').length;
        const totalLessons = lessons?.length ?? 0;
        
        const lessonDetails = (lessons ?? []).map(lesson => {
          const att = enrollmentAttendance.find(a => a.lesson_id === lesson.id);
          return {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            status: att?.status ?? null,
            date: lesson.scheduled_date,
          };
        });
        
        return {
          enrollmentId: enrollment.id,
          attendeeName: enrollment.attendee_name,
          attendeeEmail: enrollment.attendee_email,
          totalLessons,
          presentCount,
          absentCount,
          excusedCount,
          attendanceRate: totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : 0,
          lessonDetails,
        };
      });
    },
    enabled: !!courseId,
  });
}
