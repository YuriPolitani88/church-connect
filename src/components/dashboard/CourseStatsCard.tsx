import { GraduationCap, Users, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseStats } from "@/hooks/useDashboardStats";

interface CourseStatsCardProps {
  stats: CourseStats | undefined;
  loading?: boolean;
}

export function CourseStatsCard({ stats, loading }: CourseStatsCardProps) {
  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-5 w-5 text-primary" />
          Estatísticas de Cursos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Courses */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              Total de Cursos
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{stats.totalCourses}</span>
              <span className="text-sm text-muted-foreground">
                ({stats.publishedCourses} publicados)
              </span>
            </div>
          </div>

          {/* Total Enrollments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Total de Alunos
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalEnrollments}</div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Taxa de Presença
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">{stats.completionRate}%</span>
              <Progress value={stats.completionRate} className="h-2 flex-1" />
            </div>
          </div>

          {/* Popular Courses */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Cursos Populares
            </div>
            {stats.popularCourses.length > 0 ? (
              <div className="space-y-1">
                {stats.popularCourses.slice(0, 3).map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-foreground">
                      {index + 1}. {course.title}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {course.enrollmentCount} alunos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Nenhum curso ainda</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
