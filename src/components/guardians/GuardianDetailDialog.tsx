import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Calendar, Shield, Baby } from "lucide-react";
import { DbGuardian, DbChild } from "@/hooks/useKids";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const relationshipLabels: Record<string, string> = {
  father: "Pai",
  mother: "Mãe",
  parent: "Responsável",
  guardian: "Responsável Legal",
  grandparent: "Avô/Avó",
  other: "Outro",
};

interface GuardianDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guardian: DbGuardian | null;
  children?: DbChild[];
}

export function GuardianDetailDialog({
  open,
  onOpenChange,
  guardian,
  children = [],
}: GuardianDetailDialogProps) {
  if (!guardian) return null;

  const initials = guardian.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Responsável</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with photo and name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={guardian.photo_url || undefined} alt={guardian.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{guardian.full_name}</h2>
              <Badge variant="secondary" className="mt-1">
                {relationshipLabels[guardian.relationship || "parent"] || guardian.relationship}
              </Badge>
              {guardian.is_authorized_pickup && (
                <Badge variant="outline" className="ml-2 mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Autorizado para busca
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Informações de Contato</h3>
            
            {guardian.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{guardian.phone}</p>
                </div>
              </div>
            )}

            {guardian.email && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{guardian.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">
                  {format(new Date(guardian.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Children */}
          {children.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  Crianças Vinculadas ({children.length})
                </h3>
                <div className="grid gap-2">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={child.photo_url || undefined} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                          {child.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{child.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(child.birth_date), "dd/MM/yyyy")}
                        </p>
                      </div>
                      {child.is_checked_in && (
                        <Badge className="ml-auto bg-green-500">Presente</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
