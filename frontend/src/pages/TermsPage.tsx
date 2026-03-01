import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetTermsAndConditions } from '../hooks/useQueries';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();
  const { data: terms, isLoading } = useGetTermsAndConditions();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate({ to: '/' })}>
            <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-12 object-contain" />
          </button>
          <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 font-rajdhani text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <h1 className="font-orbitron font-bold text-3xl text-primary uppercase tracking-widest mb-8">
          Terms & Conditions
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : terms?.content ? (
          <div className="bg-card border border-border p-8">
            <pre className="font-saira text-foreground text-sm whitespace-pre-wrap leading-relaxed">
              {terms.content}
            </pre>
          </div>
        ) : (
          <div className="bg-card border border-border p-8 text-center">
            <p className="font-saira text-muted-foreground">Terms & Conditions have not been set yet. Please check back later.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 py-6 px-4 text-center">
        <p className="font-saira text-xs text-muted-foreground">
          © {new Date().getFullYear()} Raj Empire Esports. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
