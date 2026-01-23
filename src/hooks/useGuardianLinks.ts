import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LinkChildrenParams {
  guardianId: string;
  linkChildIds: string[];
  unlinkChildIds: string[];
}

export const useLinkChildrenToGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ guardianId, linkChildIds, unlinkChildIds }: LinkChildrenParams) => {
      // Unlink children
      if (unlinkChildIds.length > 0) {
        const { error: unlinkError } = await supabase
          .from("child_guardians")
          .delete()
          .eq("guardian_id", guardianId)
          .in("child_id", unlinkChildIds);

        if (unlinkError) throw unlinkError;
      }

      // Link new children
      if (linkChildIds.length > 0) {
        const rows = linkChildIds.map((childId) => ({
          child_id: childId,
          guardian_id: guardianId,
          is_primary: false,
        }));

        const { error: linkError } = await supabase
          .from("child_guardians")
          .insert(rows);

        if (linkError) throw linkError;
      }

      return { linked: linkChildIds.length, unlinked: unlinkChildIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
    },
  });
};
