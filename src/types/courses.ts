export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null;
  category: string | null;
  tags: string[];
  status: CourseStatus;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  duration_minutes: number | null;
  order_index: number;
  scheduled_date: string | null;
  created_at: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string | null;
  guardian_id: string | null;
  attendee_name: string;
  attendee_email: string | null;
  attendee_phone: string | null;
  status: string;
  enrolled_at: string;
}

export interface LessonAttendance {
  id: string;
  lesson_id: string;
  enrollment_id: string;
  status: string;
  notes: string | null;
  recorded_at: string;
  recorded_by: string | null;
}

export interface CourseFormData {
  title: string;
  description?: string;
  instructor_name?: string;
  category?: string;
  tags?: string[];
  status: CourseStatus;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
}
