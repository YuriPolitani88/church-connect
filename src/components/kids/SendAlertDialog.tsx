import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Heart, Phone, Send, Loader2 } from "lucide-react";
import { ChildWithGuardians, useCreateAlert } from "@/hooks/useKids";
import { useToast } from "@/hooks/use-toast";

interface SendAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: ChildWithGuardians;
}

const alertTypeLabels: Record<string, string> = {
  pickup_request: "Pedido de Busca",
  health_issue: "Problema de Saúde",
  urgent: "Urgente",
  general: "Geral",
};

const alertTypes: { value: string; icon: React.ReactNode; color: string }[] = [
  { value: "pickup_request", icon: <Phone className="h-4 w-4" />, color: "bg-primary/10 text-primary" },
  { value: "health_issue", icon: <Heart className="h-4 w-4" />, color: "bg-warning/10 text-warning" },
  { value: "urgent", icon: <AlertTriangle className="h-4 w-4" />, color: "bg-destructive/10 text-destructive" },
  { value: "general", icon: <Bell className="h-4 w-4" />, color: "bg-muted text-muted-foreground" },
];

const quickMessages: Record<string, string[]> = {
  pickup_request: [
    "Por favor, venha buscar {nome} assim que possível.",
    "{nome} está pedindo pelos pais.",
    "Precisamos que venha buscar {nome}.",
  ],
  health_issue: [
    "{nome} está se sentindo mal e precisa de atenção.",
    "{nome} teve uma pequena queda, mas está bem. Só para informar.",
    "{nome} está com febre leve. Por favor, venha buscá-lo(a).",
  ],
  urgent: [
    "URGENTE: Por favor, venha buscar {nome} imediatamente.",
    "Situação urgente com {nome}. Ligue para a igreja.",
  ],
  general: [
    "{nome} está se divertindo muito hoje!",
    "{nome} participou ativamente da aula.",
    "Lembrete: não se esqueça de trazer a mochila na próxima semana.",
  ],
};

const SendAlertDialog = ({ open, onOpenChange, child }: SendAlertDialogProps) => {
  const { toast } = useToast();
  const createAlert = useCreateAlert();
  const [alertType, setAlertType] = useState<string>("general");
  const [message, setMessage] = useState("");

  const firstName = child.full_name.split(" ")[0];

  const handleQuickMessage = (msg: string) => {
    setMessage(msg.replace("{nome}", firstName));
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Digite uma mensagem para enviar aos pais.",
        variant: "destructive",
      });
      return;
    }

    if (child.guardians.length === 0) {
      toast({
        title: "Sem responsáveis",
        description: "Esta criança não tem responsáveis cadastrados.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send alert to all guardians
      for (const guardian of child.guardians) {
        await createAlert.mutateAsync({
          child_id: child.id,
          guardian_id: guardian.id,
          alert_type: alertType,
          message: message.trim(),
        });
      }

      toast({
        title: "Alerta enviado!",
        description: `Notificação enviada para os responsáveis de ${child.full_name}.`,
      });
      
      onOpenChange(false);
      setMessage("");
      setAlertType("general");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar alerta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enviar Alerta para os Pais
          </DialogTitle>
          <DialogDescription>
            Envie uma notificação para os responsáveis de {child.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Child Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {child.photo_url ? (
                <img src={child.photo_url} alt={child.full_name} className="h-12 w-12 object-cover" />
              ) : (
                <span className="font-medium text-primary">{child.full_name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="font-medium">{child.full_name}</div>
              <div className="text-sm text-muted-foreground">
                Responsáveis: {child.guardians.map((g) => g.full_name).join(", ") || "Nenhum"}
              </div>
            </div>
          </div>

          {/* Alert Type */}
          <div className="space-y-3">
            <Label>Tipo de Alerta</Label>
            <RadioGroup
              value={alertType}
              onValueChange={setAlertType}
              className="grid grid-cols-2 gap-2"
            >
              {alertTypes.map((type) => (
                <div key={type.value}>
                  <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                  <Label
                    htmlFor={type.value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                      hover:bg-muted/50 ${type.color}`}
                  >
                    {type.icon}
                    <span className="text-sm font-medium">{alertTypeLabels[type.value]}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Quick Messages */}
          <div className="space-y-2">
            <Label>Mensagens Rápidas</Label>
            <div className="flex flex-wrap gap-2">
              {quickMessages[alertType]?.map((msg, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleQuickMessage(msg)}
                >
                  {msg.replace("{nome}", firstName).slice(0, 30)}...
                </Badge>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem para os pais..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createAlert.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={createAlert.isPending} className="gap-2">
              {createAlert.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Alerta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendAlertDialog;
