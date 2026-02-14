import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  label: string;
  category: string;
}

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | null }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  const createSetting = useMutation({
    mutationFn: async (setting: { setting_key: string; setting_value?: string | null; setting_type: string; label: string; category: string }) => {
      const { error } = await supabase.from("site_settings").insert(setting);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  const deleteSetting = useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase.from("site_settings").delete().eq("setting_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  const getSetting = (key: string) => settings.find((s) => s.setting_key === key)?.setting_value ?? null;

  return { settings, isLoading, updateSetting, createSetting, deleteSetting, getSetting };
}
