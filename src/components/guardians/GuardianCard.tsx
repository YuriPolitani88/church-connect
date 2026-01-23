import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Eye, Pencil, Users, Link2 } from "lucide-react";
import { DbGuardian } from "@/hooks/useKids";

const relationshipLabels: Record<string, string> = {
  father: "Pai",
  mother: "Mãe",
  parent: "Responsável",
  guardian: "Responsável Legal",
  grandparent: "Avô/Avó",
  other: "Outro",
};

interface GuardianCardProps {
  guardian: DbGuardian;
  childrenCount?: number;
  onView: (guardian: DbGuardian) => void;
  onEdit: (guardian: DbGuardian) => void;
  onLinkChildren: (guardian: DbGuardian) => void;
}

export function GuardianCard({ guardian, childrenCount = 0, onView, onEdit, onLinkChildren }: GuardianCardProps) {
  const initials = guardian.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-medium">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={guardian.photo_url || undefined} alt={guardian.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">
                  {guardian.full_name}
                </h3>
                <Badge variant="secondary" className="mt-1">
                  {relationshipLabels[guardian.relationship || "parent"] || guardian.relationship}
                </Badge>
              </div>
              
              {childrenCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {childrenCount}
                </Badge>
              )}
            </div>

            <div className="mt-3 space-y-1.5">
              {guardian.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="truncate">{guardian.phone}</span>
                </div>
              )}
              {guardian.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{guardian.email}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(guardian)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(guardian)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onLinkChildren(guardian)}
                className="w-full"
              >
                <Link2 className="h-4 w-4 mr-1" />
                Vincular Crianças
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
