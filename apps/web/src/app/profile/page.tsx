'use client';

import { AuthGuard } from '@/components/auth-guard';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          ProfilePage - TODO: migrate from existing app
        </p>
      </main>
    </AuthGuard>
  );
}
