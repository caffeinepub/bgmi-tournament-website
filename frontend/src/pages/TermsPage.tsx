import React from 'react';
import { useTermsAndConditions } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

export default function TermsPage() {
    const { data: terms, isLoading } = useTermsAndConditions();

    return (
        <div className="min-h-screen px-4 py-12" style={{ background: 'oklch(0.10 0 0)' }}>
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-10">
                    <div className="inline-block mb-3 px-3 py-1 font-saira text-xs tracking-widest uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                        Legal
                    </div>
                    <h1 className="font-orbitron text-3xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        TERMS & CONDITIONS
                    </h1>
                    <p className="font-rajdhani text-sm mt-2" style={{ color: 'oklch(0.55 0.02 60)' }}>
                        Raj Empire Esports — Tournament Platform Rules
                    </p>
                </div>

                <div className="p-6 clip-angular" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-4 w-full" style={{ background: 'oklch(0.18 0 0)' }} />
                            ))}
                        </div>
                    ) : !terms?.content ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'oklch(0.30 0.02 50)' }} />
                            <p className="font-rajdhani text-lg" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                Terms & Conditions have not been set yet.
                            </p>
                            <p className="font-rajdhani text-sm mt-2" style={{ color: 'oklch(0.35 0.02 50)' }}>
                                Please check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <p className="font-rajdhani text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'oklch(0.75 0.01 80)' }}>
                                {terms.content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
