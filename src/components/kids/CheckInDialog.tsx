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
import { Child, ageGroupLabels, relationshipLabels } from "@/types/kids";
import { getCheckInForChild } from "@/data/mockKids";
import { useToast } from "@/hooks/use-toast";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: Child;
  mode: "checkin" | "checkout";
}

const CheckInDialog = ({ open, onOpenChange, child, mode }: CheckInDialogProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const checkIn = getCheckInForChild(child.id);

  const today = new Date().toISOString().split("T")[0];
  const qrCodeValue = `KIDS-${child.id}-${today}-${Date.now()}`;

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      toast({
        title: mode === "checkin" ? "Check-in realizado!" : "Check-out realizado!",
        description: `${child.fullName} foi ${mode === "checkin" ? "registrado" : "liberado"} com sucesso.`,
      });
      setIsProcessing(false);
      onOpenChange(false);
    }, 1000);
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "checkin" ? "Check-in" : "Check-out"} - {child.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Child Info */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              {child.photoUrl ? (
                <img
                  src={child.photoUrl}
                  alt={child.fullName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{child.fullName}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{calculateAge(child.birthDate)} anos</span>
              </div>
              <Badge variant="outline" className="mt-1">
                {ageGroupLabels[child.ageGroup]} • {child.classRoom}
              </Badge>
            </div>
          </div>

          {/* Critical Alerts */}
          {(child.allergies.length > 0 || child.specialNeeds.length > 0) && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-destructive font-semibold">
                <AlertTriangle className="h-5 w-5" />
                ATENÇÃO - Informações Críticas
              </div>
              {child.allergies.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Alergias:</span>
                  <span>{child.allergies.join(", ")}</span>
                </div>
              )}
              {child.medications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-warning" />
                  <span className="font-medium">Medicações:</span>
                  <span>{child.medications.join(", ")}</span>
                </div>
              )}
              {child.dietaryRestrictions.length > 0 && (
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span className="font-medium">Restrições:</span>
                  <span>{child.dietaryRestrictions.join(", ")}</span>
                </div>
              )}
              {child.specialNeeds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="font-medium">Atenção especial:</span>
                  <span>{child.specialNeeds.join(", ")}</span>
                </div>
              )}
              {child.emergencyNotes && (
                <div className="mt-2 text-sm italic">{child.emergencyNotes}</div>
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
                  <span className="font-medium">{guardian.name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({relationshipLabels[guardian.relationship]})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {guardian.phone}
                </div>
              </div>
            ))}
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
              {mode === "checkout" && checkIn && (
                <div className="text-xs text-muted-foreground mt-1">
                  Check-in às {checkIn.checkInTime}
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
