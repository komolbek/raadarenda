"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAdminLanguageStore } from "@/stores/language-store";

export function Providers({ children }: { children: React.ReactNode }) {
  // The language store uses `skipHydration`, so it renders the SSR-safe
  // default until we rehydrate the persisted locale here, after mount.
  // This avoids an SSR/client hydration mismatch that could break event
  // handler attachment in Chromium browsers.
  useEffect(() => {
    void useAdminLanguageStore.persist.rehydrate();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
