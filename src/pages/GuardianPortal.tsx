import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Baby, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Heart,
  Pill,
  UtensilsCrossed,
  User,
  Calendar,
  MapPin
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useCurrentGuardian, 
  useGuardianChildren, 
  useGuardianCheckInHistory, 
  useGuardianAlerts,
  useMarkAlertRead 
} from "@/hooks/useGuardianPortal";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAge, getAgeGroupFromDate } from "@/hooks/useKids";

const alertTypeIcons = {
  pickup_request: Bell,
  health_issue: Heart,
  urgent: AlertTriangle,
  general: Bell,
};

const alertTypeLabels: Record<string, string> = {
  pickup_request: "Pedido de Busca",
  health_issue: "Saúde",
  urgent: "Urgente",
  general: "Geral",
};

const alertTypeColors: Record<string, string> = {
  pickup_request: "bg-primary/10 text-primary",
  health_issue: "bg-orange-500/10 text-orange-500",
  urgent: "bg-destructive/10 text-destructive",
  general: "bg-muted text-muted-foreground",
};

export default function GuardianPortal() {
  const [activeTab, setActiveTab] = useState("children");
  
  const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
  const { data: children, isLoading: childrenLoading } = useGuardianChildren();
  const { data: checkInHistory, isLoading: historyLoading } = useGuardianCheckInHistory();
  const { data: alerts, isLoading: alertsLoading } = useGuardianAlerts();
  const markAlertRead = useMarkAlertRead();

  // Enable realtime alerts subscription
  useRealtimeAlerts(guardian?.id);

  const unreadAlerts = alerts?.filter((a) => !a.is_read) || [];
  const checkedInChildren = children?.filter((c) => c.is_checked_in) || [];

  const handleMarkRead = (alertId: string) => {
    markAlertRead.mutate(alertId);
  };

  if (guardianLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!guardian) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Perfil de Responsável Não Encontrado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Sua conta não está vinculada a um perfil de responsável. 
            Entre em contato com a administração para vincular seu cadastro.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portal do Responsável</h1>
            <p className="text-muted-foreground">
              Bem-vindo(a), {guardian.full_name}
            </p>
          </div>
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1">
              <Bell className="h-4 w-4" />
              {unreadAlerts.length} alerta(s) não lido(s)
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Filhos</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Ativo</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{checkedInChildren.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Lidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{unreadAlerts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Meus Filhos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Children Tab */}
          <TabsContent value="children" className="space-y-4">
            {childrenLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : children && children.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <Card key={child.id} className={child.is_checked_in ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={child.photo_url || undefined} />
                          <AvatarFallback className="text-lg">
                            {child.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{child.full_name}</CardTitle>
                          <CardDescription>
                            {calculateAge(child.birth_date)} anos • {getAgeGroupFromDate(child.birth_date)}
                          </CardDescription>
                        </div>
                        {child.is_checked_in && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Presente
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {child.classroom && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {child.classroom.name}
                        </div>
                      )}
                      
                      {/* Alerts */}
                      <div className="flex flex-wrap gap-1">
                        {child.allergies && child.allergies.length > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {child.allergies.length} alergia(s)
                          </Badge>
                        )}
                        {child.medications && child.medications.length > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Pill className="h-3 w-3 mr-1" />
                            {child.medications.length} medicação(ões)
                          </Badge>
                        )}
                        {child.dietary_restrictions && child.dietary_restrictions.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <UtensilsCrossed className="h-3 w-3 mr-1" />
                            Restrições
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Baby className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma criança vinculada ao seu perfil.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Check-ins</CardTitle>
                <CardDescription>Últimos registros de entrada e saída</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : checkInHistory && checkInHistory.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {checkInHistory.map((checkIn) => (
                        <div
                          key={checkIn.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={checkIn.child?.photo_url || undefined} />
                            <AvatarFallback>
                              {checkIn.child?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{checkIn.child?.full_name || "Criança"}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(checkIn.check_in_time), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {format(new Date(checkIn.check_in_time), "HH:mm")}
                              </span>
                            </div>
                            {checkIn.check_out_time && (
                              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">
                                  Saída: {format(new Date(checkIn.check_out_time), "HH:mm")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum histórico de check-in encontrado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Recebidos</CardTitle>
                <CardDescription>Mensagens e notificações dos professores</CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {alerts.map((alert) => {
                        const Icon = alertTypeIcons[alert.alert_type as keyof typeof alertTypeIcons] || Bell;
                        return (
                          <div
                            key={alert.id}
                            className={`p-4 rounded-lg border ${
                              !alert.is_read ? "bg-primary/5 border-primary/20" : "bg-card"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-full ${alertTypeColors[alert.alert_type] || alertTypeColors.general}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {alertTypeLabels[alert.alert_type] || alert.alert_type}
                                  </Badge>
                                  {!alert.is_read && (
                                    <Badge variant="default" className="text-xs">Novo</Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium mb-1">
                                  {(alert.child as any)?.full_name || "Criança"}
                                </p>
                                <p className="text-sm text-muted-foreground">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDistanceToNow(new Date(alert.sent_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </p>
                              </div>
                              {!alert.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkRead(alert.id)}
                                  disabled={markAlertRead.isPending}
                                >
                                  Marcar como lido
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum alerta recebido.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
