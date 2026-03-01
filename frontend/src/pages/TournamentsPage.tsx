import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Calendar, Map, DollarSign, Award, AlertCircle } from 'lucide-react';
import { useAllTournaments } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import type { Tournament } from '../backend';
import { TournamentStatus } from '../backend';

function formatDate(time: bigint): string {
    const ms = Number(time) / 1_000_000;
    return new Date(ms).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function TournamentCard({ tournament, onRegister }: { tournament: Tournament; onRegister: (t: Tournament) => void }) {
    const isFull = tournament.filledSlots >= tournament.totalSlots;
    const statusLabel = isFull ? 'FULL' : tournament.status === TournamentStatus.upcoming ? 'OPEN' : tournament.status.toUpperCase();
    const statusColor = isFull ? 'oklch(0.55 0.22 25)' : tournament.status === TournamentStatus.upcoming ? 'oklch(0.65 0.22 45)' : 'oklch(0.55 0.02 60)';

    return (
        <div className="clip-angular" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
            {/* Card Header */}
            <div className="p-4 border-b" style={{ borderColor: 'oklch(0.22 0.02 50)', background: 'linear-gradient(135deg, oklch(0.15 0.01 50), oklch(0.13 0 0))' }}>
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-orbitron text-base font-bold leading-tight" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        {tournament.name}
                    </h3>
                    <span className="shrink-0 px-2 py-0.5 font-saira text-xs tracking-widest uppercase rounded-sm font-bold" style={{ background: `${statusColor}20`, border: `1px solid ${statusColor}`, color: statusColor }}>
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.65 0.22 45)' }} />
                    <div>
                        <p className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Entry Fee</p>
                        <p className="font-orbitron text-sm font-bold" style={{ color: 'oklch(0.65 0.22 45)' }}>₹{tournament.entryFee.toString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.75 0.18 85)' }} />
                    <div>
                        <p className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Prize Pool</p>
                        <p className="font-orbitron text-sm font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>₹{tournament.prizePool.toString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.55 0.02 60)' }} />
                    <div>
                        <p className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Slots</p>
                        <p className="font-rajdhani text-sm font-semibold" style={{ color: 'oklch(0.80 0.01 80)' }}>
                            {tournament.filledSlots.toString()}/{tournament.totalSlots.toString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.55 0.02 60)' }} />
                    <div>
                        <p className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Map</p>
                        <p className="font-rajdhani text-sm font-semibold" style={{ color: 'oklch(0.80 0.01 80)' }}>{tournament.map}</p>
                    </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.55 0.02 60)' }} />
                    <div>
                        <p className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Date & Time</p>
                        <p className="font-rajdhani text-sm font-semibold" style={{ color: 'oklch(0.80 0.01 80)' }}>{formatDate(tournament.dateTime)}</p>
                    </div>
                </div>
            </div>

            {/* Match Rules */}
            {tournament.matchRules && tournament.matchRules.trim() && (
                <div className="mx-4 mb-4 p-3 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.08)', border: '1px solid oklch(0.65 0.22 45 / 0.25)' }}>
                    <p className="font-saira text-xs tracking-widest uppercase mb-2" style={{ color: 'oklch(0.65 0.22 45)' }}>⚔ Match Rules</p>
                    <p className="font-rajdhani text-sm whitespace-pre-wrap" style={{ color: 'oklch(0.70 0.02 60)' }}>{tournament.matchRules}</p>
                </div>
            )}

            {/* Register Button */}
            <div className="px-4 pb-4">
                <Button
                    onClick={() => onRegister(tournament)}
                    disabled={isFull}
                    className="w-full font-saira tracking-widest uppercase font-bold clip-angular-sm"
                    style={{
                        background: isFull ? 'oklch(0.20 0 0)' : 'oklch(0.65 0.22 45)',
                        color: isFull ? 'oklch(0.45 0.02 60)' : 'oklch(0.08 0 0)',
                        cursor: isFull ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isFull ? 'FULL' : 'Register Now'}
                </Button>
            </div>
        </div>
    );
}

export default function TournamentsPage() {
    const { data: tournaments, isLoading, error } = useAllTournaments();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleRegister = (tournament: Tournament) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }
        setSelectedTournament(tournament);
    };

    return (
        <div className="min-h-screen px-4 py-12" style={{ background: 'oklch(0.10 0 0)' }}>
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block mb-3 px-3 py-1 font-saira text-xs tracking-widest uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                        Active Tournaments
                    </div>
                    <h1 className="font-orbitron text-3xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        BATTLE ARENA
                    </h1>
                    <p className="font-rajdhani text-base mt-2" style={{ color: 'oklch(0.55 0.02 60)' }}>
                        Register for upcoming BGMI tournaments and compete for glory
                    </p>
                </div>

                {/* Login Prompt */}
                {showLoginPrompt && (
                    <div className="mb-6 p-4 rounded-sm flex items-center justify-between gap-4" style={{ background: 'oklch(0.65 0.22 45 / 0.1)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" style={{ color: 'oklch(0.65 0.22 45)' }} />
                            <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.01 80)' }}>
                                You need to be logged in to register for a tournament.
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => navigate({ to: '/login' })} className="font-saira text-xs tracking-wider uppercase" style={{ borderColor: 'oklch(0.65 0.22 45)', color: 'oklch(0.65 0.22 45)' }}>
                                Login
                            </Button>
                            <Button size="sm" onClick={() => navigate({ to: '/register' })} className="font-saira text-xs tracking-wider uppercase" style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}>
                                Register
                            </Button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                                <Skeleton className="h-6 w-3/4 mb-4" style={{ background: 'oklch(0.18 0 0)' }} />
                                <Skeleton className="h-4 w-full mb-2" style={{ background: 'oklch(0.18 0 0)' }} />
                                <Skeleton className="h-4 w-2/3" style={{ background: 'oklch(0.18 0 0)' }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-12">
                        <p className="font-rajdhani text-lg" style={{ color: 'oklch(0.70 0.22 25)' }}>Failed to load tournaments. Please try again.</p>
                    </div>
                )}

                {/* Tournaments Grid */}
                {!isLoading && !error && (
                    <>
                        {(!tournaments || tournaments.length === 0) ? (
                            <div className="text-center py-20">
                                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                <h3 className="font-orbitron text-xl font-bold mb-2" style={{ color: 'oklch(0.55 0.02 60)' }}>No Active Tournaments</h3>
                                <p className="font-rajdhani" style={{ color: 'oklch(0.40 0.02 60)' }}>Check back soon for upcoming tournaments!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tournaments.map((t) => (
                                    <TournamentCard key={t.id} tournament={t} onRegister={handleRegister} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Payment Modal */}
            {selectedTournament && (
                <PaymentModal
                    tournament={selectedTournament}
                    open={!!selectedTournament}
                    onClose={() => setSelectedTournament(null)}
                />
            )}
        </div>
    );
}
