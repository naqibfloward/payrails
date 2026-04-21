import { treaty } from "@elysiajs/eden";
import type { ApiTypes } from "../../../../packages/api-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const API_URL = "http://localhost:3001";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      throwOnError: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

export const client = treaty<ApiTypes>(API_URL, {
  fetch: {
    credentials: "include",
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
