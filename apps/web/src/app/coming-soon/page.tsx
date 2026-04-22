'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ComingSoonForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get('next') || '/';

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Введите код доступа');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      if (res.status === 401) setError('Неверный код');
      else setError('Ошибка доступа. Попробуйте позже.');
    } catch {
      setError('Ошибка подключения');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Rent Event
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Скоро запуск
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Мы готовим что-то особенное. Если у вас есть код раннего доступа — введите его ниже.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur"
        >
          <label htmlFor="access-code" className="mb-2 block text-sm font-medium text-foreground">
            Код доступа
          </label>
          <input
            id="access-code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitting}
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Введите код"
            autoFocus
          />

          {error && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Проверка…' : 'Войти'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoonForm />
    </Suspense>
  );
}
