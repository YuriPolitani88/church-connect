import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Baby,
  UserPlus,
  QrCode,
  ClipboardList,
  Search,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { 
  useChildren, 
  useTodayCheckIns, 
  useClassrooms,
  hasAllergies, 
  getCheckInForChild,
  ChildWithGuardians,
  CheckInWithRelations
} from "@/hooks/useKids";
import ChildCard from "@/components/kids/ChildCard";
import ChildFormDialog from "@/components/kids/ChildFormDialog";
import CheckInDialog from "@/components/kids/CheckInDialog";
import TeacherPanel from "@/components/kids/TeacherPanel";

const ageGroupLabels: Record<string, string> = {
  "0-1 anos": "Berçário (0-1 ano)",
  "1-2 anos": "Maternal (1-2 anos)",
  "3-5 anos": "Jardim (3-5 anos)",
  "6-10 anos": "Infantil (6-10 anos)",
};

const Kids = () => {
  const { data: children, isLoading: loadingChildren } = useChildren();
  const { data: checkIns, isLoading: loadingCheckIns } = useTodayCheckIns();
  const { data: classrooms } = useClassrooms();

  const [activeTab, setActiveTab] = useState("children");
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [showChildForm, setShowChildForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildWithGuardians | null>(null);
  const [checkInMode, setCheckInMode] = useState<"checkin" | "checkout" | null>(null);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInWithRelations | undefined>();

  const isLoading = loadingChildren || loadingCheckIns;

  // Stats
  const todayCheckIns = checkIns?.filter((ci) => !ci.check_out_time) || [];
  const childrenWithAllergies = (children || []).filter(hasAllergies);

  // Filter children
  const filteredChildren = (children || []).filter((child) => {
    const matchesSearch = child.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAge = ageFilter === "all" || child.classroom?.age_range === ageFilter;
    return matchesSearch && matchesAge;
  });

  const handleCheckIn = (child: ChildWithGuardians) => {
    setSelectedChild(child);
    setCheckInMode("checkin");
    setCurrentCheckIn(undefined);
  };

  const handleCheckOut = (child: ChildWithGuardians) => {
    const checkIn = getCheckInForChild(child.id, checkIns);
    setSelectedChild(child);
    setCheckInMode("checkout");
    setCurrentCheckIn(checkIn);
  };

  const handleCloseChildForm = (open: boolean) => {
    setShowChildForm(open);
    if (!open) {
      setSelectedChild(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Baby className="h-8 w-8 text-primary" />
              Módulo Kids
            </h1>
            <p className="text-muted-foreground">
              Gestão completa do ministério infantil
            </p>
          </div>
          <Button onClick={() => { setSelectedChild(null); setShowChildForm(true); }} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nova Criança
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : children?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Crianças</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : todayCheckIns.length}</p>
                <p className="text-sm text-muted-foreground">Presentes Hoje</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : childrenWithAllergies.length}</p>
                <p className="text-sm text-muted-foreground">Com Alergias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <QrCode className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "-" : checkIns?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Check-ins Hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="children" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Crianças</span>
            </TabsTrigger>
            <TabsTrigger value="checkin" className="gap-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Check-in</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Painel Professora</span>
            </TabsTrigger>
          </TabsList>

          {/* Children List Tab */}
          <TabsContent value="children" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Faixa etária" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as idades</SelectItem>
                  {Object.entries(ageGroupLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChildren.map((child) => {
                  const checkIn = getCheckInForChild(child.id, checkIns);
                  return (
                    <ChildCard
                      key={child.id}
                      child={child}
                      isCheckedIn={!!checkIn}
                      onCheckIn={() => handleCheckIn(child)}
                      onCheckOut={() => handleCheckOut(child)}
                      onViewDetails={() => {
                        setSelectedChild(child);
                        setShowChildForm(true);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {!isLoading && filteredChildren.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {children?.length === 0 
                    ? "Nenhuma criança cadastrada. Clique em 'Nova Criança' para começar."
                    : "Nenhuma criança encontrada com os filtros aplicados."}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Check-in / Check-out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="p-8 border-2 border-dashed border-muted rounded-lg">
                    <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Selecione uma criança da lista para realizar check-in ou check-out
                    </p>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {(children || []).slice(0, 6).map((child) => {
                        const checkIn = getCheckInForChild(child.id, checkIns);
                        return (
                          <ChildCard
                            key={child.id}
                            child={child}
                            isCheckedIn={!!checkIn}
                            onCheckIn={() => handleCheckIn(child)}
                            onCheckOut={() => handleCheckOut(child)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher Panel Tab */}
          <TabsContent value="teacher">
            <TeacherPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Child Form Dialog */}
      <ChildFormDialog
        open={showChildForm}
        onOpenChange={handleCloseChildForm}
        child={selectedChild || undefined}
      />

      {/* Check-in/out Dialog */}
      {selectedChild && checkInMode && (
        <CheckInDialog
          open={!!checkInMode}
          onOpenChange={(open) => {
            if (!open) {
              setCheckInMode(null);
              setSelectedChild(null);
              setCurrentCheckIn(undefined);
            }
          }}
          child={selectedChild}
          mode={checkInMode}
          currentCheckIn={currentCheckIn}
        />
      )}
    </DashboardLayout>
  );
};

export default Kids;
