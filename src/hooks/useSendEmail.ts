import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export function useSendEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendEmailParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const response = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'E-mail enviado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar e-mail',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
