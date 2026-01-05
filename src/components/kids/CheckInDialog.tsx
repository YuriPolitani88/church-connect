import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  Pill,
  UtensilsCrossed,
  Heart,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";
import { ChildWithGuardians, useCheckIn, useCheckOut, calculateAge, CheckInWithRelations } from "@/hooks/useKids";
import { useToast } from "@/hooks/use-toast";

const relationshipLabels: Record<string, string> = {
  father: "Pai",
  mother: "Mãe",
  parent: "Responsável",
  guardian: "Responsável Legal",
  grandparent: "Avô/Avó",
  other: "Outro",
};

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: ChildWithGuardians;
  mode: "checkin" | "checkout";
  currentCheckIn?: CheckInWithRelations;
}

const CheckInDialog = ({ open, onOpenChange, child, mode, currentCheckIn }: CheckInDialogProps) => {
  const { toast } = useToast();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const qrCodeValue = `KIDS-${child.id}-${today}-${Date.now()}`;

  const handleAction = async () => {
    setIsProcessing(true);
    
    try {
      if (mode === "checkin") {
        await checkInMutation.mutateAsync({
          childId: child.id,
          guardianId: child.guardians[0]?.id,
          classroomId: child.classroom_id || undefined,
        });
        toast({
          title: "Check-in realizado!",
          description: `${child.full_name} foi registrado com sucesso.`,
        });
      } else {
        if (currentCheckIn) {
          await checkOutMutation.mutateAsync({
            checkInId: currentCheckIn.id,
            childId: child.id,
            guardianId: child.guardians[0]?.id,
          });
        }
        toast({
          title: "Check-out realizado!",
          description: `${child.full_name} foi liberado com sucesso.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao realizar ${mode === "checkin" ? "check-in" : "check-out"}.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getAgeGroupLabel = (ageRange: string | undefined) => {
    if (!ageRange) return "";
    const labels: Record<string, string> = {
      "0-1 anos": "Berçário",
      "1-2 anos": "Maternal",
      "3-5 anos": "Jardim",
      "6-10 anos": "Infantil",
    };
    return labels[ageRange] || ageRange;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "checkin" ? "Check-in" : "Check-out"} - {child.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Child Info */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              {child.photo_url ? (
                <img
                  src={child.photo_url}
                  alt={child.full_name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{child.full_name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{calculateAge(child.birth_date)} anos</span>
              </div>
              <Badge variant="outline" className="mt-1">
                {getAgeGroupLabel(child.classroom?.age_range)} • {child.classroom?.name || "Sem sala"}
              </Badge>
            </div>
          </div>

          {/* Critical Alerts */}
          {((child.allergies?.length ?? 0) > 0 || (child.special_needs?.length ?? 0) > 0) && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-destructive font-semibold">
                <AlertTriangle className="h-5 w-5" />
                ATENÇÃO - Informações Críticas
              </div>
              {(child.allergies?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Alergias:</span>
                  <span>{child.allergies?.join(", ")}</span>
                </div>
              )}
              {(child.medications?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-warning" />
                  <span className="font-medium">Medicações:</span>
                  <span>{child.medications?.join(", ")}</span>
                </div>
              )}
              {(child.dietary_restrictions?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span className="font-medium">Restrições:</span>
                  <span>{child.dietary_restrictions?.join(", ")}</span>
                </div>
              )}
              {(child.special_needs?.length ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="font-medium">Atenção especial:</span>
                  <span>{child.special_needs?.join(", ")}</span>
                </div>
              )}
              {child.medical_notes && (
                <div className="mt-2 text-sm italic">{child.medical_notes}</div>
              )}
            </div>
          )}

          <Separator />

          {/* Guardians */}
          <div className="space-y-2">
            <h4 className="font-semibold">Responsáveis Autorizados</h4>
            {child.guardians.map((guardian) => (
              <div
                key={guardian.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <div>
                  <span className="font-medium">{guardian.full_name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({relationshipLabels[guardian.relationship || "parent"] || guardian.relationship})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {guardian.phone}
                </div>
              </div>
            ))}
            {child.guardians.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
            <QRCodeSVG
              value={qrCodeValue}
              size={150}
              level="H"
              includeMargin
              className="rounded-lg"
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "checkin"
                  ? "QR Code para identificação"
                  : "Escaneie para confirmar check-out"}
              </p>
              {mode === "checkin" && (
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
              {mode === "checkout" && currentCheckIn && (
                <div className="text-xs text-muted-foreground mt-1">
                  Check-in às {new Date(currentCheckIn.check_in_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleAction}
            disabled={isProcessing}
            className="w-full gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>Processando...</>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Confirmar {mode === "checkin" ? "Check-in" : "Check-out"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInDialog;
