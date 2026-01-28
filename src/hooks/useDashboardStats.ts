import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completionRate: number;
  popularCourses: Array<{
    id: string;
    title: string;
    enrollmentCount: number;
  }>;
}

export interface DashboardStats {
  totalMembers: number;
  totalChildren: number;
  checkedInToday: number;
  courseStats: CourseStats;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all stats in parallel
      const [
        childrenResult,
        checkedInResult,
        coursesResult,
        enrollmentsResult,
        attendanceResult,
      ] = await Promise.all([
        // Total children
        supabase.from('children').select('id', { count: 'exact', head: true }),
        
        // Checked in today
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('is_checked_in', true),
        
        // Courses with status
        supabase.from('courses').select('id, title, status'),
        
        // All enrollments with course info
        supabase.from('course_enrollments').select('id, course_id, status'),
        
        // Lesson attendance for completion rate
        supabase.from('lesson_attendance').select('id, status'),
      ]);

      const courses = coursesResult.data || [];
      const enrollments = enrollmentsResult.data || [];
      const attendance = attendanceResult.data || [];

      // Calculate course stats
      const totalCourses = courses.length;
      const publishedCourses = courses.filter(c => c.status === 'published').length;
      const totalEnrollments = enrollments.length;

      // Calculate completion rate from attendance
      const totalAttendance = attendance.length;
      const completedAttendance = attendance.filter(a => a.status === 'present' || a.status === 'completed').length;
      const completionRate = totalAttendance > 0 
        ? Math.round((completedAttendance / totalAttendance) * 100) 
        : 0;

      // Calculate popular courses by enrollment count
      const courseEnrollmentMap = new Map<string, number>();
      enrollments.forEach(e => {
        const count = courseEnrollmentMap.get(e.course_id) || 0;
        courseEnrollmentMap.set(e.course_id, count + 1);
      });

      const popularCourses = courses
        .map(course => ({
          id: course.id,
          title: course.title,
          enrollmentCount: courseEnrollmentMap.get(course.id) || 0,
        }))
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 5);

      return {
        totalMembers: 0, // Would need a members table
        totalChildren: childrenResult.count || 0,
        checkedInToday: checkedInResult.count || 0,
        courseStats: {
          totalCourses,
          publishedCourses,
          totalEnrollments,
          completionRate,
          popularCourses,
        },
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}
