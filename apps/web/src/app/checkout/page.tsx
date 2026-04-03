'use client';

import { AuthGuard } from '@/components/auth-guard';

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          CheckoutPage - TODO: migrate from existing app
        </p>
      </main>
    </AuthGuard>
  );
}
