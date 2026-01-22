import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type ParentAlert = Tables<"parent_alerts">;

interface RealtimeAlertPayload {
  new: ParentAlert;
  old: ParentAlert | null;
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

export const useRealtimeAlerts = (guardianId: string | null | undefined) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!guardianId) return;

    // Subscribe to realtime changes on parent_alerts
    const channel = supabase
      .channel(`alerts-${guardianId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "parent_alerts",
          filter: `guardian_id=eq.${guardianId}`,
        },
        async (payload) => {
          const newAlert = payload.new as ParentAlert;
          
          // Fetch child name for the notification
          const { data: child } = await supabase
            .from("children")
            .select("full_name")
            .eq("id", newAlert.child_id)
            .single();

          // Show toast notification
          const alertTypeLabels: Record<string, string> = {
            pickup_request: "🔔 Pedido de Busca",
            health_issue: "❤️ Alerta de Saúde",
            urgent: "⚠️ Alerta Urgente",
            general: "📢 Nova Mensagem",
          };

          toast(alertTypeLabels[newAlert.alert_type] || "📢 Novo Alerta", {
            description: `${child?.full_name || "Criança"}: ${newAlert.message}`,
            duration: 8000,
            action: {
              label: "Ver",
              onClick: () => {
                // Navigate to alerts tab if needed
                window.location.hash = "#alerts";
              },
            },
          });

          // Invalidate alerts query to refresh the list
          queryClient.invalidateQueries({ queryKey: ["guardian-alerts"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "parent_alerts",
          filter: `guardian_id=eq.${guardianId}`,
        },
        () => {
          // Just refresh the list on updates
          queryClient.invalidateQueries({ queryKey: ["guardian-alerts"] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [guardianId, queryClient]);

  return null;
};
