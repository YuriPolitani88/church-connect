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
} from "lucide-react";
import { mockChildren, mockCheckIns, hasAllergies } from "@/data/mockKids";
import { ageGroupLabels, Child } from "@/types/kids";
import ChildCard from "@/components/kids/ChildCard";
import ChildFormDialog from "@/components/kids/ChildFormDialog";
import CheckInDialog from "@/components/kids/CheckInDialog";
import TeacherPanel from "@/components/kids/TeacherPanel";

const Kids = () => {
  const [activeTab, setActiveTab] = useState("children");
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [showChildForm, setShowChildForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [checkInMode, setCheckInMode] = useState<"checkin" | "checkout" | null>(null);

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const todayCheckIns = mockCheckIns.filter(
    (ci) => ci.date === today && ci.status === "checked_in"
  );
  const childrenWithAllergies = mockChildren.filter(hasAllergies);

  // Filter children
  const filteredChildren = mockChildren.filter((child) => {
    const matchesSearch = child.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAge = ageFilter === "all" || child.ageGroup === ageFilter;
    return matchesSearch && matchesAge;
  });

  const handleCheckIn = (child: Child) => {
    setSelectedChild(child);
    setCheckInMode("checkin");
  };

  const handleCheckOut = (child: Child) => {
    setSelectedChild(child);
    setCheckInMode("checkout");
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
          <Button onClick={() => setShowChildForm(true)} className="gap-2">
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
                <p className="text-2xl font-bold">{mockChildren.length}</p>
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
                <p className="text-2xl font-bold">{todayCheckIns.length}</p>
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
                <p className="text-2xl font-bold">{childrenWithAllergies.length}</p>
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
                <p className="text-2xl font-bold">{mockCheckIns.length}</p>
                <p className="text-sm text-muted-foreground">Check-ins Semana</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChildren.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onCheckIn={() => handleCheckIn(child)}
                  onCheckOut={() => handleCheckOut(child)}
                  onViewDetails={() => {
                    setSelectedChild(child);
                    setShowChildForm(true);
                  }}
                />
              ))}
            </div>

            {filteredChildren.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhuma criança encontrada com os filtros aplicados.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {mockChildren.slice(0, 6).map((child) => (
                      <ChildCard
                        key={child.id}
                        child={child}
                        onCheckIn={() => handleCheckIn(child)}
                        onCheckOut={() => handleCheckOut(child)}
                      />
                    ))}
                  </div>
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
        onOpenChange={setShowChildForm}
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
            }
          }}
          child={selectedChild}
          mode={checkInMode}
        />
      )}
    </DashboardLayout>
  );
};

export default Kids;
