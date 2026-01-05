import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Types for the database
export type DbChild = Tables<"children">;
export type DbGuardian = Tables<"guardians">;
export type DbCheckIn = Tables<"check_ins">;
export type DbClassroom = Tables<"classrooms">;
export type DbParentAlert = Tables<"parent_alerts">;
export type DbChildGuardian = Tables<"child_guardians">;

// Extended types with relations
export interface ChildWithGuardians extends DbChild {
  guardians: DbGuardian[];
  classroom?: DbClassroom | null;
}

export interface CheckInWithRelations extends DbCheckIn {
  child?: DbChild;
  checked_in_by_guardian?: DbGuardian;
}

// Fetch all children with their guardians
export const useChildren = () => {
  return useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      // Fetch children
      const { data: children, error: childrenError } = await supabase
        .from("children")
        .select("*, classroom:classrooms(*)")
        .order("full_name");

      if (childrenError) throw childrenError;

      // Fetch child-guardian relations
      const { data: childGuardians, error: cgError } = await supabase
        .from("child_guardians")
        .select("*, guardian:guardians(*)");

      if (cgError) throw cgError;

      // Map guardians to children
      const childrenWithGuardians: ChildWithGuardians[] = (children || []).map((child) => {
        const guardianRelations = childGuardians?.filter((cg) => cg.child_id === child.id) || [];
        const guardians = guardianRelations
          .map((cg) => cg.guardian as unknown as DbGuardian)
          .filter(Boolean);
        return {
          ...child,
          guardians,
        };
      });

      return childrenWithGuardians;
    },
  });
};

// Fetch all guardians
export const useGuardians = () => {
  return useQuery({
    queryKey: ["guardians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guardians")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });
};

// Fetch all classrooms
export const useClassrooms = () => {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

// Fetch today's check-ins
export const useTodayCheckIns = () => {
  const today = new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["check-ins", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select(`
          *,
          child:children(*),
          checked_in_by_guardian:guardians!check_ins_checked_in_by_fkey(*)
        `)
        .gte("check_in_time", `${today}T00:00:00`)
        .lte("check_in_time", `${today}T23:59:59`);

      if (error) throw error;
      return data as CheckInWithRelations[];
    },
  });
};

// Create child mutation
export const useCreateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      child,
      guardianIds,
    }: {
      child: TablesInsert<"children">;
      guardianIds: string[];
    }) => {
      // Insert child
      const { data: newChild, error: childError } = await supabase
        .from("children")
        .insert(child)
        .select()
        .single();

      if (childError) throw childError;

      // Insert child-guardian relations
      if (guardianIds.length > 0) {
        const childGuardianRows = guardianIds.map((guardianId, index) => ({
          child_id: newChild.id,
          guardian_id: guardianId,
          is_primary: index === 0,
        }));

        const { error: cgError } = await supabase
          .from("child_guardians")
          .insert(childGuardianRows);

        if (cgError) throw cgError;
      }

      return newChild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

// Update child mutation
export const useUpdateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      child,
      guardianIds,
    }: {
      id: string;
      child: TablesUpdate<"children">;
      guardianIds: string[];
    }) => {
      // Update child
      const { data: updatedChild, error: childError } = await supabase
        .from("children")
        .update(child)
        .eq("id", id)
        .select()
        .single();

      if (childError) throw childError;

      // Delete existing child-guardian relations
      const { error: deleteError } = await supabase
        .from("child_guardians")
        .delete()
        .eq("child_id", id);

      if (deleteError) throw deleteError;

      // Insert new child-guardian relations
      if (guardianIds.length > 0) {
        const childGuardianRows = guardianIds.map((guardianId, index) => ({
          child_id: id,
          guardian_id: guardianId,
          is_primary: index === 0,
        }));

        const { error: cgError } = await supabase
          .from("child_guardians")
          .insert(childGuardianRows);

        if (cgError) throw cgError;
      }

      return updatedChild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

// Delete child mutation
export const useDeleteChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("children").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

// Check-in mutation
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      guardianId,
      classroomId,
      notes,
    }: {
      childId: string;
      guardianId?: string;
      classroomId?: string;
      notes?: string;
    }) => {
      const qrCode = `KIDS-${childId}-${new Date().toISOString()}`;

      const { data, error } = await supabase
        .from("check_ins")
        .insert({
          child_id: childId,
          checked_in_by: guardianId,
          classroom_id: classroomId,
          notes,
          qr_code: qrCode,
        })
        .select()
        .single();

      if (error) throw error;

      // Update child's is_checked_in status
      await supabase
        .from("children")
        .update({ is_checked_in: true })
        .eq("id", childId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

// Check-out mutation
export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checkInId,
      childId,
      guardianId,
    }: {
      checkInId: string;
      childId: string;
      guardianId?: string;
    }) => {
      const { data, error } = await supabase
        .from("check_ins")
        .update({
          check_out_time: new Date().toISOString(),
          checked_out_by: guardianId,
        })
        .eq("id", checkInId)
        .select()
        .single();

      if (error) throw error;

      // Update child's is_checked_in status
      await supabase
        .from("children")
        .update({ is_checked_in: false })
        .eq("id", childId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

// Create parent alert mutation
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: TablesInsert<"parent_alerts">) => {
      const { data, error } = await supabase
        .from("parent_alerts")
        .insert(alert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-alerts"] });
    },
  });
};

// Create guardian mutation
export const useCreateGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guardian: TablesInsert<"guardians">) => {
      const { data, error } = await supabase
        .from("guardians")
        .insert(guardian)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
    },
  });
};

// Helper functions
export const hasAllergies = (child: DbChild | ChildWithGuardians): boolean => {
  return (child.allergies?.length ?? 0) > 0;
};

export const hasSpecialNeeds = (child: DbChild | ChildWithGuardians): boolean => {
  return (child.special_needs?.length ?? 0) > 0 || (child.medications?.length ?? 0) > 0;
};

export const getCheckInForChild = (
  childId: string,
  checkIns: CheckInWithRelations[] | undefined
): CheckInWithRelations | undefined => {
  if (!checkIns) return undefined;
  return checkIns.find(
    (ci) => ci.child_id === childId && !ci.check_out_time
  );
};

// Calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Get age group from birth date
export const getAgeGroupFromDate = (birthDate: string): string => {
  const age = calculateAge(birthDate);
  if (age < 1) return "0-1 anos";
  if (age < 3) return "1-2 anos";
  if (age < 6) return "3-5 anos";
  return "6-10 anos";
};
