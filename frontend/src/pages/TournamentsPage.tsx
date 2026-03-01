import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTournaments } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, MapPin, Users, Clock, DollarSign, Lock } from 'lucide-react';
import { Tournament, TournamentStatus } from '../backend';
import PaymentModal from '../components/PaymentModal';

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatusBadge({ status }: { status: TournamentStatus }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    [TournamentStatus.upcoming]: { label: 'Upcoming', bg: 'oklch(0.65 0.22 45 / 0.15)', color: 'oklch(0.65 0.22 45)' },
    [TournamentStatus.ongoing]: { label: 'Live', bg: 'oklch(0.55 0.18 145 / 0.15)', color: 'oklch(0.65 0.18 145)' },
    [TournamentStatus.closed]: { label: 'Closed', bg: 'oklch(0.18 0 0)', color: 'oklch(0.45 0.02 60)' },
    [TournamentStatus.completed]: { label: 'Completed', bg: 'oklch(0.18 0 0)', color: 'oklch(0.45 0.02 60)' },
  };
  const { label, bg, color } = config[status] || config[TournamentStatus.upcoming];
  return (
    <span
      className="px-2 py-0.5 font-saira text-xs tracking-wider uppercase rounded-sm"
      style={{ background: bg, border: `1px solid ${color}`, color }}
    >
      {label}
    </span>
  );
}

export default function TournamentsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: tournaments, isLoading } = useGetAllTournaments();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const handleRegisterClick = (tournament: Tournament) => {
    if (!isAuthenticated) {
      navigate({ to: '/player/login' });
      return;
    }
    setSelectedTournament(tournament);
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'oklch(0.10 0 0)' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-block mb-3 px-3 py-1 font-saira text-xs tracking-widest uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
            BGMI Tournaments
          </div>
          <h1 className="font-orbitron text-3xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
            ACTIVE TOURNAMENTS
          </h1>
          <p className="font-rajdhani text-base mt-2" style={{ color: 'oklch(0.55 0.02 60)' }}>
            Register, pay entry fee, and compete for glory.
          </p>
        </div>

        {/* Auth Banner */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.08)', border: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
            <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.75 0.02 60)' }}>
              Login or register to participate in tournaments.
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: '/player/login' })}
                className="font-saira text-xs tracking-wider uppercase"
                style={{ borderColor: 'oklch(0.65 0.22 45)', color: 'oklch(0.65 0.22 45)' }}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: '/player' })}
                className="font-saira text-xs tracking-wider uppercase"
                style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
              >
                Register
              </Button>
            </div>
          </div>
        )}

        {/* Tournament Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : !tournaments || tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: 'oklch(0.30 0.02 50)' }} />
            <h3 className="font-orbitron text-xl font-bold mb-2" style={{ color: 'oklch(0.55 0.02 60)' }}>
              No Tournaments Yet
            </h3>
            <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>
              Check back soon for upcoming tournaments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(tournament => {
              const isFull = Number(tournament.filledSlots) >= Number(tournament.totalSlots);
              const isUpcoming = tournament.status === TournamentStatus.upcoming;
              const canRegister = isUpcoming && !isFull;

              return (
                <div
                  key={tournament.id}
                  className="flex flex-col clip-angular-sm"
                  style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b" style={{ borderColor: 'oklch(0.22 0.02 50)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-orbitron text-sm font-bold leading-tight" style={{ color: 'oklch(0.90 0.01 80)' }}>
                        {tournament.name}
                      </h3>
                      <StatusBadge status={tournament.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.45 0.02 60)' }} />
                      <p className="font-rajdhani text-xs" style={{ color: 'oklch(0.50 0.02 60)' }}>
                        {formatDate(tournament.dateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-saira text-xs tracking-wider uppercase mb-1" style={{ color: 'oklch(0.45 0.02 60)' }}>Entry Fee</p>
                        <p className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.65 0.22 45)' }}>
                          ₹{tournament.entryFee.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-saira text-xs tracking-wider uppercase mb-1" style={{ color: 'oklch(0.45 0.02 60)' }}>Prize Pool</p>
                        <p className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>
                          ₹{tournament.prizePool.toString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.55 0.02 60)' }} />
                        <span className="font-rajdhani text-sm" style={{ color: 'oklch(0.70 0.01 80)' }}>{tournament.map}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.55 0.02 60)' }} />
                        <span className="font-rajdhani text-sm" style={{ color: 'oklch(0.70 0.01 80)' }}>
                          {tournament.filledSlots.toString()} / {tournament.totalSlots.toString()} slots filled
                        </span>
                      </div>
                    </div>

                    {/* Slot Progress */}
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.20 0 0)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (Number(tournament.filledSlots) / Number(tournament.totalSlots)) * 100)}%`,
                            background: isFull ? 'oklch(0.55 0.22 25)' : 'oklch(0.65 0.22 45)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Room details locked notice */}
                    <div className="mt-4 flex items-center gap-2 p-2 rounded-sm" style={{ background: 'oklch(0.16 0 0)' }}>
                      <Lock className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.45 0.02 60)' }} />
                      <p className="font-saira text-xs" style={{ color: 'oklch(0.45 0.02 60)' }}>
                        Room ID & Password unlocked after approval
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 pt-0">
                    <Button
                      onClick={() => handleRegisterClick(tournament)}
                      disabled={!canRegister}
                      className="w-full font-saira tracking-widest uppercase text-xs font-bold clip-angular-sm"
                      style={canRegister
                        ? { background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }
                        : { background: 'oklch(0.18 0 0)', color: 'oklch(0.40 0.02 60)', cursor: 'not-allowed' }
                      }
                    >
                      {isFull ? 'Slots Full' : !isUpcoming ? tournament.status.toString().toUpperCase() : 'Register Now'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedTournament && (
        <PaymentModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
}
