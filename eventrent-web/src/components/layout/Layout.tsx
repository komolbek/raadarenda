import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'bg-card text-foreground border border-border shadow-xl',
          success: {
            iconTheme: {
              primary: 'rgb(var(--primary))',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'rgb(var(--destructive))',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
}
