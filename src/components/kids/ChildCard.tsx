import { Child, ageGroupLabels } from "@/types/kids";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Pill,
  UtensilsCrossed,
  Heart,
  QrCode,
  LogOut,
  Eye,
} from "lucide-react";
import { hasAllergies, hasSpecialNeeds, getCheckInForChild } from "@/data/mockKids";

interface ChildCardProps {
  child: Child;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onViewDetails?: () => void;
  showCheckInStatus?: boolean;
}

const ChildCard = ({
  child,
  onCheckIn,
  onCheckOut,
  onViewDetails,
  showCheckInStatus = true,
}: ChildCardProps) => {
  const checkIn = getCheckInForChild(child.id);
  const isCheckedIn = !!checkIn;
  const hasAllergyAlert = hasAllergies(child);
  const hasSpecialAlert = hasSpecialNeeds(child);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        hasAllergyAlert ? "border-destructive/50 bg-destructive/5" : ""
      } ${hasSpecialAlert && !hasAllergyAlert ? "border-warning/50 bg-warning/5" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={child.photoUrl} alt={child.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(child.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg truncate">{child.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {ageGroupLabels[child.ageGroup]} • {child.classRoom}
                </p>
              </div>
              {showCheckInStatus && (
                <Badge variant={isCheckedIn ? "default" : "secondary"}>
                  {isCheckedIn ? "Presente" : "Ausente"}
                </Badge>
              )}
            </div>

            {/* Alert Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {hasAllergyAlert && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Alergia: {child.allergies.join(", ")}
                </Badge>
              )}
              {child.medications.length > 0 && (
                <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning border-warning/30">
                  <Pill className="h-3 w-3" />
                  Medicação
                </Badge>
              )}
              {child.dietaryRestrictions.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <UtensilsCrossed className="h-3 w-3" />
                  Restrição Alimentar
                </Badge>
              )}
              {child.specialNeeds.length > 0 && (
                <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent border-accent/30">
                  <Heart className="h-3 w-3" />
                  Atenção Especial
                </Badge>
              )}
            </div>

            {/* Guardians */}
            <div className="mt-2 text-sm text-muted-foreground">
              Responsáveis: {child.guardians.map((g) => g.name).join(", ")}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {!isCheckedIn && onCheckIn && (
                <Button size="sm" onClick={onCheckIn} className="gap-1">
                  <QrCode className="h-4 w-4" />
                  Check-in
                </Button>
              )}
              {isCheckedIn && onCheckOut && (
                <Button size="sm" variant="outline" onClick={onCheckOut} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  Check-out
                </Button>
              )}
              {onViewDetails && (
                <Button size="sm" variant="ghost" onClick={onViewDetails} className="gap-1">
                  <Eye className="h-4 w-4" />
                  Detalhes
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildCard;
