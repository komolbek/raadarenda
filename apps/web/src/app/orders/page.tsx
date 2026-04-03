'use client';

import { AuthGuard } from '@/components/auth-guard';

export default function OrdersPage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-2 text-muted-foreground">
          OrdersPage - TODO: migrate from existing app
        </p>
      </main>
    </AuthGuard>
  );
}
