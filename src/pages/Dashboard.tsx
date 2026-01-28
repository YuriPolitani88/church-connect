import { Users, Baby, GraduationCap, CreditCard, TrendingUp, UserCheck, FileCode2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BirthdayCard } from "@/components/dashboard/BirthdayCard";
import { CourseStatsCard } from "@/components/dashboard/CourseStatsCard";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const stats = [
  {
    title: "Total de Membros",
    value: "1,284",
    change: "+12 este mês",
    changeType: "positive" as const,
    icon: Users,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Visitantes Recentes",
    value: "47",
    change: "+8 esta semana",
    changeType: "positive" as const,
    icon: UserCheck,
    iconColor: "bg-accent/10 text-accent",
  },
  {
    title: "Kids Cadastradas",
    value: "156",
    change: "32 presentes hoje",
    changeType: "neutral" as const,
    icon: Baby,
    iconColor: "bg-warning/10 text-warning",
  },
  {
    title: "Cursos Ativos",
    value: "8",
    change: "234 alunos matriculados",
    changeType: "neutral" as const,
    icon: GraduationCap,
    iconColor: "bg-success/10 text-success",
  },
  {
    title: "Doações do Mês",
    value: "£12,450",
    change: "+18% vs mês anterior",
    changeType: "positive" as const,
    icon: CreditCard,
    iconColor: "bg-secondary/20 text-secondary-foreground",
  },
  {
    title: "Frequência Média",
    value: "78%",
    change: "+5% este mês",
    changeType: "positive" as const,
    icon: TrendingUp,
    iconColor: "bg-primary/10 text-primary",
  },
];

export default function Dashboard() {
  const { data: dashboardStats, isLoading } = useDashboardStats();

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Bem-vindo de volta, Pastor João
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está o resumo da sua igreja hoje
          </p>
        </div>
        <Link to="/architecture">
          <Button variant="outline" size="sm">
            <FileCode2 className="h-4 w-4 mr-2" />
            Ver Arquitetura
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={index * 50}
          />
        ))}
      </div>

      {/* Course Stats */}
      <div className="mb-8">
        <CourseStatsCard stats={dashboardStats?.courseStats} loading={isLoading} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Activity & Events */}
        <div className="space-y-6 lg:col-span-2">
          <UpcomingEvents />
          <RecentActivity />
        </div>

        {/* Right Column - Quick Actions & Birthdays */}
        <div className="space-y-6">
          <QuickActions />
          <BirthdayCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
