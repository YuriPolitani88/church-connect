import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type DbChild = Tables<"children">;
export type DbCheckIn = Tables<"check_ins">;
export type DbParentAlert = Tables<"parent_alerts">;
export type DbGuardian = Tables<"guardians">;
export type DbClassroom = Tables<"classrooms">;

export interface ChildWithDetails extends DbChild {
  classroom?: DbClassroom | null;
}

export interface CheckInWithDetails extends DbCheckIn {
  child?: DbChild | null;
  classroom?: DbClassroom | null;
}

// Fetch current guardian profile linked to the authenticated user
export const useCurrentGuardian = () => {
  return useQuery({
    queryKey: ["current-guardian"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("guardians")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

// Fetch children for the current guardian
export const useGuardianChildren = () => {
  return useQuery({
    queryKey: ["guardian-children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First get the guardian record
      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (guardianError) throw guardianError;
      if (!guardian) return [];

      // Get child IDs from child_guardians
      const { data: childGuardians, error: cgError } = await supabase
        .from("child_guardians")
        .select("child_id")
        .eq("guardian_id", guardian.id);

      if (cgError) throw cgError;
      if (!childGuardians || childGuardians.length === 0) return [];

      const childIds = childGuardians.map((cg) => cg.child_id);

      // Fetch children with classroom info
      const { data: children, error: childrenError } = await supabase
        .from("children")
        .select("*, classroom:classrooms(*)")
        .in("id", childIds)
        .order("full_name");

      if (childrenError) throw childrenError;
      return children as ChildWithDetails[];
    },
  });
};

// Fetch check-in history for guardian's children
export const useGuardianCheckInHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ["guardian-check-in-history", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First get the guardian record
      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (guardianError) throw guardianError;
      if (!guardian) return [];

      // Get child IDs from child_guardians
      const { data: childGuardians, error: cgError } = await supabase
        .from("child_guardians")
        .select("child_id")
        .eq("guardian_id", guardian.id);

      if (cgError) throw cgError;
      if (!childGuardians || childGuardians.length === 0) return [];

      const childIds = childGuardians.map((cg) => cg.child_id);

      // Fetch check-ins for these children
      const { data: checkIns, error: checkInsError } = await supabase
        .from("check_ins")
        .select("*, child:children(*), classroom:classrooms(*)")
        .in("child_id", childIds)
        .order("check_in_time", { ascending: false })
        .limit(limit);

      if (checkInsError) throw checkInsError;
      return checkIns as CheckInWithDetails[];
    },
  });
};

// Fetch alerts for the current guardian
export const useGuardianAlerts = () => {
  return useQuery({
    queryKey: ["guardian-alerts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First get the guardian record
      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (guardianError) throw guardianError;
      if (!guardian) return [];

      // Fetch alerts with child info
      const { data: alerts, error: alertsError } = await supabase
        .from("parent_alerts")
        .select("*, child:children(id, full_name, photo_url)")
        .eq("guardian_id", guardian.id)
        .order("sent_at", { ascending: false });

      if (alertsError) throw alertsError;
      return alerts;
    },
  });
};

// Mark alert as read
export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("parent_alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardian-alerts"] });
    },
  });
};
