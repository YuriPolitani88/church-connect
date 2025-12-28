import { Phone, Mail, MapPin, Calendar, MoreVertical, Gift, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Member, memberTypeLabels, memberTypeColors, memberStatusColors } from "@/types/member";
import { isBirthdayToday, isInactive, isRecurringVisitor } from "@/data/mockMembers";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onView: (member: Member) => void;
}

export function MemberCard({ member, onEdit, onView }: MemberCardProps) {
  const hasBirthday = isBirthdayToday(member.birthDate);
  const inactive = isInactive(member.lastVisit);
  const recurring = isRecurringVisitor(member);

  return (
    <div
      className={cn(
        "group rounded-2xl border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-lifted",
        hasBirthday && "border-secondary ring-2 ring-secondary/20",
        inactive && member.status === "active" && "border-warning/50",
        recurring && "border-accent/50"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
            {member.fullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          {hasBirthday && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
              <Gift className="h-3 w-3 text-secondary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-foreground truncate">{member.fullName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    memberTypeColors[member.type]
                  )}
                >
                  {memberTypeLabels[member.type]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    memberStatusColors[member.status]
                  )}
                >
                  {member.status === "active" ? "Ativo" : member.status === "inactive" ? "Inativo" : "Pendente"}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Contact info */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{member.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{member.postcode}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Última visita: {new Date(member.lastVisit).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          {/* Alerts */}
          {(inactive || recurring) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {inactive && member.status === "active" && (
                <div className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  Inativo há +30 dias
                </div>
              )}
              {recurring && (
                <div className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">
                  <TrendingUp className="h-3 w-3" />
                  Visitante recorrente ({member.visitCount}x)
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(member)} className="flex-1">
              Ver perfil
            </Button>
            <Button variant="default" size="sm" onClick={() => onEdit(member)} className="flex-1">
              Editar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
