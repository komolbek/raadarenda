'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Client-side guard for protected routes. Server-side middleware already
 * redirects un-cookied requests to /auth, so the guard's only job here is
 * to handle the case where the cookie is present but localStorage doesn't
 * have a matching session (e.g. the user cleared site data in one tab).
 *
 * We intentionally don't block rendering on the zustand persist hydration
 * flag — it has a tiny race window on the first client tick that used to
 * leave the guard stuck on the spinner forever when the callback fired
 * before the setState applied.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [mounted, isAuthenticated, router]);

  // Pre-mount (SSR / first client render) → brief spinner so we don't flash
  // content at signed-out users who got here via a stale cookie.
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // After mount: render children. If the user turns out not to be
  // authenticated, the effect above kicks them to /auth on the next tick.
  return <>{children}</>;
}
