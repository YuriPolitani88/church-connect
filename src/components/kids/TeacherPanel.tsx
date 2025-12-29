import { useState } from "react";
import { Child, ageGroupLabels } from "@/types/kids";
import { mockChildren, mockClassRooms, hasAllergies, hasSpecialNeeds, getCheckInForChild } from "@/data/mockKids";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Pill,
  Heart,
  Bell,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import SendAlertDialog from "./SendAlertDialog";

const TeacherPanel = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertChild, setAlertChild] = useState<Child | null>(null);

  // Get checked-in children for today
  const checkedInChildren = mockChildren.filter((child) => {
    const checkIn = getCheckInForChild(child.id);
    return checkIn !== undefined;
  });

  // Filter by room and search
  const filteredChildren = checkedInChildren.filter((child) => {
    const matchesRoom = selectedRoom === "all" || child.classRoom === selectedRoom;
    const matchesSearch = child.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesSearch;
  });

  // Sort to show children with alerts first
  const sortedChildren = [...filteredChildren].sort((a, b) => {
    const aHasAlert = hasAllergies(a) || hasSpecialNeeds(a);
    const bHasAlert = hasAllergies(b) || hasSpecialNeeds(b);
    if (aHasAlert && !bHasAlert) return -1;
    if (!aHasAlert && bHasAlert) return 1;
    return a.fullName.localeCompare(b.fullName);
  });

  // Stats by room
  const roomStats = mockClassRooms.map((room) => {
    const count = checkedInChildren.filter((c) => c.classRoom === room.name).length;
    const withAllergies = checkedInChildren.filter(
      (c) => c.classRoom === room.name && hasAllergies(c)
    ).length;
    return { ...room, count, withAllergies };
  });

  const totalWithAllergies = checkedInChildren.filter(hasAllergies).length;
  const totalWithSpecialNeeds = checkedInChildren.filter(hasSpecialNeeds).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{checkedInChildren.length}</p>
              <p className="text-sm text-muted-foreground">Crianças Presentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{totalWithAllergies}</p>
              <p className="text-sm text-muted-foreground">Com Alergias</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Pill className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{totalWithSpecialNeeds}</p>
              <p className="text-sm text-muted-foreground">Atenção Especial</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockClassRooms.length}</p>
              <p className="text-sm text-muted-foreground">Salas Ativas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Capacidade por Sala</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roomStats.map((room) => (
              <div
                key={room.id}
                className={`p-3 rounded-lg border ${
                  room.count >= room.capacity
                    ? "border-destructive bg-destructive/5"
                    : room.count >= room.capacity * 0.8
                    ? "border-warning bg-warning/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="font-medium text-sm">{room.name}</div>
                <div className="text-2xl font-bold">
                  {room.count}/{room.capacity}
                </div>
                {room.withAllergies > 0 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {room.withAllergies} alergia(s)
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Children List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Crianças Presentes Hoje
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar criança..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar sala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as salas</SelectItem>
                  {mockClassRooms.map((room) => (
                    <SelectItem key={room.id} value={room.name}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criança</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Alertas</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedChildren.map((child) => {
                const checkIn = getCheckInForChild(child.id);
                const childHasAllergies = hasAllergies(child);
                const childHasSpecialNeeds = hasSpecialNeeds(child);

                return (
                  <TableRow
                    key={child.id}
                    className={
                      childHasAllergies
                        ? "bg-destructive/5"
                        : childHasSpecialNeeds
                        ? "bg-warning/5"
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {child.photoUrl ? (
                            <img
                              src={child.photoUrl}
                              alt={child.fullName}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {child.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{child.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {ageGroupLabels[child.ageGroup]}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{child.classRoom}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {childHasAllergies && (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {child.allergies.join(", ")}
                          </Badge>
                        )}
                        {child.medications.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs bg-warning/10 text-warning"
                          >
                            <Pill className="h-3 w-3" />
                            Medicação
                          </Badge>
                        )}
                        {child.specialNeeds.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs bg-accent/10 text-accent"
                          >
                            <Heart className="h-3 w-3" />
                            Atenção
                          </Badge>
                        )}
                        {!childHasAllergies &&
                          child.medications.length === 0 &&
                          child.specialNeeds.length === 0 && (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {checkIn?.checkInTime || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setAlertChild(child)}
                      >
                        <Bell className="h-4 w-4" />
                        Alertar Pais
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedChildren.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma criança presente no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Send Alert Dialog */}
      {alertChild && (
        <SendAlertDialog
          open={!!alertChild}
          onOpenChange={(open) => !open && setAlertChild(null)}
          child={alertChild}
        />
      )}
    </div>
  );
};

export default TeacherPanel;
