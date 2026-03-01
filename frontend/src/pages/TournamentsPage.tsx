import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trophy, Calendar, Users, DollarSign, Map, Lock, Clock, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { useGetAllTournaments } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import { Tournament } from '../backend';
import PaymentModal from '../components/PaymentModal';

export default function TournamentsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: tournaments, isLoading } = useGetAllTournaments();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = tournaments?.filter(t =>
    filterStatus === 'all' ? true : t.status === filterStatus
  ) ?? [];

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    upcoming: {
      label: 'Upcoming',
      color: 'bg-amber-100 text-amber-800 border border-amber-200',
      icon: <Clock size={12} />,
    },
    ongoing: {
      label: 'Live',
      color: 'bg-green-100 text-green-800 border border-green-200',
      icon: <Zap size={12} />,
    },
    closed: {
      label: 'Closed',
      color: 'bg-gray-100 text-gray-600 border border-gray-200',
      icon: <XCircle size={12} />,
    },
    completed: {
      label: 'Completed',
      color: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: <CheckCircle size={12} />,
    },
  };

  function formatDate(ts: bigint) {
    return new Date(Number(ts) / 1_000_000).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-brand-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
            BGMI Tournaments
          </h1>
          <p className="text-white/80 text-lg">
            Register, compete, and win real prizes!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'upcoming', 'ongoing', 'closed', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                filterStatus === status
                  ? 'bg-brand-gradient text-white shadow-brand'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status === 'all' ? 'All Tournaments' : status}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-brand-red" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Trophy size={60} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">No Tournaments Found</h3>
            <p className="text-muted-foreground">Check back soon for upcoming tournaments!</p>
          </div>
        )}

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tournament) => {
            const status = statusConfig[tournament.status] ?? statusConfig.upcoming;
            const slotsLeft = Number(tournament.totalSlots) - Number(tournament.filledSlots);
            const canRegister = tournament.status === 'upcoming' || tournament.status === 'ongoing';

            return (
              <div
                key={tournament.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-brand transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Card Header */}
                <div className="bg-brand-gradient p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-xl font-bold text-white leading-tight flex-1 mr-2">
                      {tournament.name}
                    </h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-brand-red flex-shrink-0" />
                      <div>
                        <div className="text-muted-foreground text-xs">Entry Fee</div>
                        <div className="font-semibold text-foreground">₹{tournament.entryFee.toString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy size={16} className="text-brand-orange flex-shrink-0" />
                      <div>
                        <div className="text-muted-foreground text-xs">Prize Pool</div>
                        <div className="font-semibold text-foreground">₹{tournament.prizePool.toString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-brand-red flex-shrink-0" />
                      <div>
                        <div className="text-muted-foreground text-xs">Slots Left</div>
                        <div className={`font-semibold ${slotsLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                          {slotsLeft} / {tournament.totalSlots.toString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Map size={16} className="text-brand-orange flex-shrink-0" />
                      <div>
                        <div className="text-muted-foreground text-xs">Map</div>
                        <div className="font-semibold text-foreground">{tournament.map}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1 border-t border-border">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span>{formatDate(tournament.dateTime)}</span>
                  </div>

                  {tournament.matchRules && (
                    <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 rounded-lg p-2">
                      {tournament.matchRules}
                    </p>
                  )}

                  {/* Register Button */}
                  {canRegister && (
                    <div className="pt-2">
                      {isAuthenticated ? (
                        <button
                          onClick={() => setSelectedTournament(tournament)}
                          disabled={slotsLeft === 0}
                          className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {slotsLeft === 0 ? 'Slots Full' : 'Register Now'}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate({ to: '/player/login' })}
                          className="w-full py-3 rounded-xl border-2 border-brand-red text-brand-red font-bold text-sm hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Lock size={14} />
                          Login to Register
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
