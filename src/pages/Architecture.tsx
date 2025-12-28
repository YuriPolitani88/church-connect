import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Server, Smartphone, Globe, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Architecture() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Arquitetura do Sistema
        </h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral da arquitetura e modelo de dados do ChurchCRM
        </p>
      </div>

      {/* Architecture Overview Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="rounded-xl bg-primary/10 p-3 w-fit">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold">Frontend Web</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            React + TypeScript com Tailwind CSS. Dashboard administrativo responsivo e moderno.
          </p>
        </div>

        <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "100ms" }}>
          <div className="rounded-xl bg-accent/10 p-3 w-fit">
            <Smartphone className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold">App Mobile</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Flutter para iOS e Android. App para membros com check-in Kids e doações.
          </p>
        </div>

        <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "200ms" }}>
          <div className="rounded-xl bg-success/10 p-3 w-fit">
            <Server className="h-6 w-6 text-success" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold">Backend</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase (PostgreSQL + Auth + Storage + Edge Functions). Escalável e seguro.
          </p>
        </div>
      </div>

      {/* Architecture Diagram Section */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-serif text-xl font-semibold mb-6">Diagrama de Arquitetura</h2>
        <div className="bg-muted rounded-xl p-8 overflow-x-auto">
          <pre className="text-xs md:text-sm text-foreground font-mono whitespace-pre">
{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MULTI-TENANT SAAS                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐          │
│  │   Web Admin      │    │   Mobile App     │    │   Public Site    │          │
│  │   (React/TS)     │    │   (Flutter)      │    │   (Landing)      │          │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘          │
│           │                       │                       │                     │
│           └───────────────────────┼───────────────────────┘                     │
│                                   │                                             │
│                          ┌────────▼────────┐                                    │
│                          │   API Gateway   │                                    │
│                          │   (Supabase)    │                                    │
│                          └────────┬────────┘                                    │
│                                   │                                             │
│     ┌─────────────────────────────┼─────────────────────────────┐               │
│     │                             │                             │               │
│  ┌──▼──────────┐   ┌──────────────▼──────────────┐   ┌─────────▼────────┐      │
│  │    Auth     │   │      Edge Functions         │   │    Storage       │      │
│  │  (Supabase) │   │  (Notifications, Webhooks)  │   │  (Supabase S3)   │      │
│  └─────────────┘   └──────────────┬──────────────┘   └──────────────────┘      │
│                                   │                                             │
│                          ┌────────▼────────┐                                    │
│                          │   PostgreSQL    │                                    │
│                          │   (Multi-tenant)│                                    │
│                          └────────┬────────┘                                    │
│                                   │                                             │
│           ┌───────────────────────┼───────────────────────┐                     │
│           │                       │                       │                     │
│     ┌─────▼─────┐          ┌──────▼──────┐         ┌──────▼──────┐             │
│     │  Stripe   │          │  Firebase   │         │   SMTP      │             │
│     │ (Payments)│          │   (Push)    │         │  (Emails)   │             │
│     └───────────┘          └─────────────┘         └─────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
`}
          </pre>
        </div>
      </div>

      {/* Data Model Section */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-xl font-semibold">Modelo de Dados</h2>
        </div>
        
        <div className="bg-muted rounded-xl p-8 overflow-x-auto">
          <pre className="text-xs md:text-sm text-foreground font-mono whitespace-pre">
{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MODELO DE DADOS - CHURCHCRM                           │
├─────────────────────────────────────────────────────────────────────────────────┤

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│    CHURCHES      │      │     MEMBERS      │      │   MEMBER_TYPES   │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ id (PK)          │◄────┤│ church_id (FK)   │      │ id (PK)          │
│ name             │      │ id (PK)          │─────►│ name             │
│ slug             │      │ type_id (FK)     │      │ permissions      │
│ logo_url         │      │ full_name        │      └──────────────────┘
│ primary_color    │      │ email            │
│ settings (JSONB) │      │ phone            │      ┌──────────────────┐
│ stripe_account   │      │ postcode         │      │  CUSTOM_FIELDS   │
│ created_at       │      │ nationality      │      ├──────────────────┤
└──────────────────┘      │ baptized         │◄────┤│ member_id (FK)   │
                          │ ministry         │      │ field_name       │
                          │ custom_data(JSON)│      │ field_value      │
                          │ status           │      │ field_type       │
                          │ created_at       │      └──────────────────┘
                          └────────┬─────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│     CHILDREN     │   │ COURSE_ENROLLMENTS│   │    DONATIONS     │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │   │ id (PK)          │
│ parent_id (FK)   │   │ member_id (FK)   │   │ member_id (FK)   │
│ church_id (FK)   │   │ course_id (FK)   │   │ church_id (FK)   │
│ name             │   │ progress (%)     │   │ amount           │
│ birth_date       │   │ completed_at     │   │ currency         │
│ photo_url        │   │ certificate_url  │   │ stripe_id        │
│ allergies (!)    │   └────────┬─────────┘   │ recurring        │
│ medications      │            │             │ created_at       │
│ dietary_restrict │            ▼             └──────────────────┘
│ notes            │   ┌──────────────────┐
│ created_at       │   │     COURSES      │   ┌──────────────────┐
└────────┬─────────┘   ├──────────────────┤   │     EVENTS       │
         │             │ id (PK)          │   ├──────────────────┤
         │             │ church_id (FK)   │   │ id (PK)          │
         ▼             │ title            │   │ church_id (FK)   │
┌──────────────────┐   │ description      │   │ title            │
│   KIDS_CHECKINS  │   │ modules (JSONB)  │   │ description      │
├──────────────────┤   │ certificate_tmpl │   │ date_time        │
│ id (PK)          │   │ created_at       │   │ location         │
│ child_id (FK)    │   └──────────────────┘   │ capacity         │
│ church_id (FK)   │                          │ created_at       │
│ checked_in_at    │   ┌──────────────────┐   └──────────────────┘
│ checked_out_at   │   │  KIDS_ACTIVITIES │
│ checked_in_by    │   ├──────────────────┤   ┌──────────────────┐
│ classroom        │   │ id (PK)          │   │   DEVOTIONALS    │
│ notes            │   │ church_id (FK)   │   ├──────────────────┤
└──────────────────┘   │ title            │   │ id (PK)          │
                       │ description      │   │ church_id (FK)   │
┌──────────────────┐   │ file_urls (JSON) │   │ title            │
│    GUARDIANS     │   │ due_date         │   │ content          │
├──────────────────┤   │ created_at       │   │ video_url        │
│ id (PK)          │   └──────────────────┘   │ target_age       │
│ child_id (FK)    │                          │ publish_date     │
│ member_id (FK)   │   ┌──────────────────┐   │ created_at       │
│ relationship     │   │ ACTIVITY_SUBMITS │   └──────────────────┘
│ can_pickup       │   ├──────────────────┤
│ is_primary       │   │ id (PK)          │   ┌──────────────────┐
└──────────────────┘   │ activity_id (FK) │   │ DEVOTIONAL_LOGS  │
                       │ child_id (FK)    │   ├──────────────────┤
┌──────────────────┐   │ submitted_at     │   │ id (PK)          │
│     ALERTS       │   │ file_url         │   │ devotional_id(FK)│
├──────────────────┤   │ status           │   │ child_id (FK)    │
│ id (PK)          │   └──────────────────┘   │ completed_by(FK) │
│ child_id (FK)    │                          │ completed_at     │
│ teacher_id (FK)  │   ┌──────────────────┐   └──────────────────┘
│ parent_id (FK)   │   │  NOTIFICATIONS   │
│ message          │   ├──────────────────┤
│ urgency          │   │ id (PK)          │
│ read_at          │   │ church_id (FK)   │
│ created_at       │   │ member_id (FK)   │
└──────────────────┘   │ title            │
                       │ body             │
                       │ type             │
                       │ read_at          │
                       │ created_at       │
                       └──────────────────┘
`}
          </pre>
        </div>
      </div>

      {/* Security & Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-destructive/10 p-2.5">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="font-serif text-lg font-semibold">Segurança</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Row Level Security (RLS) para isolamento multi-tenant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Autenticação JWT com refresh tokens</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>GDPR compliance (UK)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Criptografia de dados sensíveis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Audit logs de ações administrativas</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-warning/10 p-2.5">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-serif text-lg font-semibold">Automações</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Alertas automáticos de visitantes recorrentes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Notificações de aniversário programadas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Certificados gerados automaticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Lembretes de devocionais Kids</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Webhooks Stripe para confirmação de doações</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Roadmap */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-serif text-xl font-semibold mb-6">Roadmap de Desenvolvimento</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-success/10 p-4 border-2 border-success/30">
            <div className="text-xs font-semibold text-success uppercase mb-2">Fase 1</div>
            <h4 className="font-medium text-foreground">Core & Auth</h4>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li>• Setup multi-tenant</li>
              <li>• Autenticação</li>
              <li>• Dashboard admin</li>
              <li>• CRUD membros</li>
            </ul>
          </div>
          <div className="rounded-xl bg-primary/10 p-4 border-2 border-primary/30">
            <div className="text-xs font-semibold text-primary uppercase mb-2">Fase 2</div>
            <h4 className="font-medium text-foreground">Módulo Kids</h4>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li>• Check-in/out</li>
              <li>• Alertas tempo real</li>
              <li>• Devocionais</li>
              <li>• Atividades</li>
            </ul>
          </div>
          <div className="rounded-xl bg-secondary/20 p-4 border-2 border-secondary/30">
            <div className="text-xs font-semibold text-secondary-foreground uppercase mb-2">Fase 3</div>
            <h4 className="font-medium text-foreground">Cursos & Financeiro</h4>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li>• Gestão de cursos</li>
              <li>• Certificados</li>
              <li>• Integração Stripe</li>
              <li>• Relatórios</li>
            </ul>
          </div>
          <div className="rounded-xl bg-muted p-4 border-2 border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Fase 4</div>
            <h4 className="font-medium text-foreground">App Mobile</h4>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li>• Flutter iOS/Android</li>
              <li>• Push notifications</li>
              <li>• Check-in mobile</li>
              <li>• Doações in-app</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
