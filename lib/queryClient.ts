import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

function errorMessage(error: unknown): string {
  const e = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
  const status  = e?.response?.status;
  const msg     = e?.response?.data?.message ?? e?.message ?? 'Unknown error';
  return status ? `[${status}] ${msg}` : msg;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) return; // not authenticated — handled by auth flow
      toast.error(`API error: ${errorMessage(error)}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) return;
      toast.error(`API error: ${errorMessage(error)}`);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime:    30_000,
      retry:        false,   // surface errors immediately — don't hide behind retries
    },
  },
});
