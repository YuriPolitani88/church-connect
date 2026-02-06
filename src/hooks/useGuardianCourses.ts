import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CourseCertificate } from '@/hooks/useCourseCertificates';

export interface GuardianEnrollment {
  id: string;
  course_id: string;
  attendee_name: string;
  status: string;
  enrolled_at: string;
  course: {
    title: string;
    description: string | null;
    instructor_name: string | null;
    category: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
}

export interface GuardianCourseWithStats extends GuardianEnrollment {
  attendanceRate: number;
  presentCount: number;
  totalLessons: number;
  certificate: CourseCertificate | null;
}

export function useGuardianCourses() {
  return useQuery({
    queryKey: ['guardian-courses'],
    queryFn: async (): Promise<GuardianCourseWithStats[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch user's enrollments with course info
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('id, course_id, attendee_name, status, enrolled_at, courses(title, description, instructor_name, category, status, start_date, end_date)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollError) throw enrollError;
      if (!enrollments || enrollments.length === 0) return [];

      // Fetch certificates for user
      const enrollmentIds = enrollments.map(e => e.id);
      const { data: certificates } = await supabase
        .from('course_certificates')
        .select('*')
        .in('enrollment_id', enrollmentIds);

      // Fetch attendance stats for each enrollment
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];

      // Get all modules for these courses
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, course_id')
        .in('course_id', courseIds);

      const moduleIds = modules?.map(m => m.id) ?? [];

      // Get all lessons
      const { data: lessons } = moduleIds.length > 0
        ? await supabase
            .from('course_lessons')
            .select('id, module_id')
            .in('module_id', moduleIds)
        : { data: [] };

      // Get attendance records
      const lessonIds = lessons?.map(l => l.id) ?? [];
      const { data: attendance } = lessonIds.length > 0
        ? await supabase
            .from('lesson_attendance')
            .select('enrollment_id, lesson_id, status')
            .in('enrollment_id', enrollmentIds)
        : { data: [] };

      // Build module->course mapping
      const moduleToCourse = new Map<string, string>();
      modules?.forEach(m => moduleToCourse.set(m.id, m.course_id));

      // Count lessons per course
      const lessonsPerCourse = new Map<string, number>();
      lessons?.forEach(l => {
        const cId = moduleToCourse.get(l.module_id);
        if (cId) lessonsPerCourse.set(cId, (lessonsPerCourse.get(cId) ?? 0) + 1);
      });

      return enrollments.map(enrollment => {
        const cert = certificates?.find(c => c.enrollment_id === enrollment.id) ?? null;
        const enrollmentAttendance = attendance?.filter(a => a.enrollment_id === enrollment.id) ?? [];
        const presentCount = enrollmentAttendance.filter(a => a.status === 'present').length;
        const totalLessons = lessonsPerCourse.get(enrollment.course_id) ?? 0;

        return {
          ...enrollment,
          course: enrollment.courses as GuardianEnrollment['course'],
          attendanceRate: totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : 0,
          presentCount,
          totalLessons,
          certificate: cert as CourseCertificate | null,
        };
      });
    },
  });
}
