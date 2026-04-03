'use client';

import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">Order Detail</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          ID: {params.id}
        </p>
        <p className="mt-2 text-muted-foreground">
          OrderDetailPage - TODO: migrate from existing app
        </p>
      </main>
    </AuthGuard>
  );
}
