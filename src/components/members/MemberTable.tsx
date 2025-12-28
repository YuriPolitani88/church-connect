import { Phone, Mail, Gift, AlertTriangle, TrendingUp, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Member, memberTypeLabels, memberTypeColors, memberStatusColors, memberStatusLabels } from "@/types/member";
import { isBirthdayToday, isInactive, isRecurringVisitor } from "@/data/mockMembers";
import { cn } from "@/lib/utils";

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onView: (member: Member) => void;
}

export function MemberTable({ members, onEdit, onView }: MemberTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Membro
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contato
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ministério
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Alertas
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => {
              const hasBirthday = isBirthdayToday(member.birthDate);
              const inactive = isInactive(member.lastVisit);
              const recurring = isRecurringVisitor(member);

              return (
                <tr
                  key={member.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    hasBirthday && "bg-secondary/5"
                  )}
                >
                  {/* Member */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          {member.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        {hasBirthday && (
                          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary">
                            <Gift className="h-2.5 w-2.5 text-secondary-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{member.nationality}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[180px]">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                        memberTypeColors[member.type]
                      )}
                    >
                      {memberTypeLabels[member.type]}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                        memberStatusColors[member.status]
                      )}
                    >
                      {memberStatusLabels[member.status]}
                    </span>
                  </td>

                  {/* Ministry */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{member.ministry || "-"}</span>
                  </td>

                  {/* Alerts */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {inactive && member.status === "active" && (
                        <div className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-xs text-warning" title="Inativo há mais de 30 dias">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                      )}
                      {recurring && (
                        <div className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs text-accent" title={`Visitante recorrente (${member.visitCount}x)`}>
                          <TrendingUp className="h-3 w-3" />
                        </div>
                      )}
                      {hasBirthday && (
                        <div className="flex items-center gap-1 rounded-md bg-secondary/20 px-2 py-1 text-xs text-secondary-foreground" title="Aniversariante do dia">
                          <Gift className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(member)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-medium text-foreground">Nenhum membro encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tente ajustar os filtros ou adicione novos membros.</p>
        </div>
      )}
    </div>
  );
}
