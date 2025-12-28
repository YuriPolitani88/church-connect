import { Mail, Phone, MapPin, Calendar, User, Church, Gift, Clock, Flag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Member, memberTypeLabels, memberTypeColors, memberStatusLabels, memberStatusColors } from "@/types/member";
import { isBirthdayToday, isInactive, isRecurringVisitor } from "@/data/mockMembers";
import { cn } from "@/lib/utils";

interface MemberDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onEdit: (member: Member) => void;
}

export function MemberDetailDialog({ open, onOpenChange, member, onEdit }: MemberDetailDialogProps) {
  if (!member) return null;

  const hasBirthday = isBirthdayToday(member.birthDate);
  const inactive = isInactive(member.lastVisit);
  const recurring = isRecurringVisitor(member);

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(member);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Perfil do Membro</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
                {member.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              {hasBirthday && (
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                  <Gift className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold text-foreground">{member.fullName}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
                    memberTypeColors[member.type]
                  )}
                >
                  {memberTypeLabels[member.type]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                    memberStatusColors[member.status]
                  )}
                >
                  {memberStatusLabels[member.status]}
                </span>
                {member.baptized && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                    <CheckCircle className="h-3 w-3" />
                    Batizado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {(hasBirthday || inactive || recurring) && (
            <div className="flex flex-wrap gap-2">
              {hasBirthday && (
                <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-3 py-2 text-sm">
                  <Gift className="h-4 w-4 text-secondary-foreground" />
                  <span className="text-secondary-foreground">Aniversariante de hoje! 🎉</span>
                </div>
              )}
              {inactive && member.status === "active" && (
                <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-warning">Inativo há mais de 30 dias</span>
                </div>
              )}
              {recurring && (
                <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm">
                  <User className="h-4 w-4 text-accent" />
                  <span className="text-accent">Visitante recorrente ({member.visitCount} visitas)</span>
                </div>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contato
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">{member.phone}</span>
              </div>
              {member.postcode && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="rounded-lg bg-muted p-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-foreground">{member.postcode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações Pessoais
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nascimento</p>
                  <p className="text-foreground">
                    {new Date(member.birthDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              {member.nationality && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="rounded-lg bg-muted p-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nacionalidade</p>
                    <p className="text-foreground">{member.nationality}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Church Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações da Igreja
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {member.ministry && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="rounded-lg bg-muted p-2">
                    <Church className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ministério</p>
                    <p className="text-foreground">{member.ministry}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Última visita</p>
                  <p className="text-foreground">
                    {new Date(member.lastVisit).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de visitas</p>
                  <p className="text-foreground">{member.visitCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Membro desde</p>
                  <p className="text-foreground">
                    {new Date(member.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Observações
              </h3>
              <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                {member.notes}
              </p>
            </div>
          )}

          {/* Custom Fields */}
          {member.customFields.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Campos Personalizados
              </h3>
              <div className="grid gap-2">
                {member.customFields.map((field) => (
                  <div key={field.id} className="flex justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">{field.name}</span>
                    <span className="text-foreground font-medium">
                      {field.type === "checkbox" ? (field.value ? "Sim" : "Não") : String(field.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button variant="gradient" className="flex-1" onClick={handleEdit}>
              Editar Membro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
