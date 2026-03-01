import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTournaments } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import { Tournament, TournamentStatus } from '../backend';
import PaymentModal from '../components/PaymentModal';
import { Trophy, Users, Zap, Loader2, Search } from 'lucide-react';

function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const map = {
    [TournamentStatus.upcoming]: { label: 'Upcoming', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    [TournamentStatus.ongoing]: { label: 'Live 🔴', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    [TournamentStatus.closed]: { label: 'Closed', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    [TournamentStatus.completed]: { label: 'Completed', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  };
  const s = map[status] || map[TournamentStatus.upcoming];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function TournamentsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: tournaments = [], isLoading } = useGetAllTournaments();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TournamentStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = tournaments.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleRegister = (t: Tournament) => {
    if (!isAuthenticated) {
      navigate({ to: '/player/login' });
      return;
    }
    setSelectedTournament(t);
  };

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Hero */}
      <div
        className="py-14 px-4 sm:px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #C0100A 0%, #E03010 50%, #FF6A00 100%)' }}
      >
        <h1 className="font-orbitron font-black text-white text-3xl sm:text-4xl mb-3">
          BGMI Tournaments
        </h1>
        <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
          Browse and register for upcoming BGMI tournaments. Win real cash prizes!
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full bg-brand-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', TournamentStatus.upcoming, TournamentStatus.ongoing, TournamentStatus.completed] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === f
                    ? 'bg-brand-red text-white'
                    : 'bg-brand-dark border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No tournaments found</p>
            <p className="text-sm mt-1">Check back soon for upcoming tournaments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => {
              const slotsLeft = Number(t.totalSlots) - Number(t.filledSlots);
              const isFull = slotsLeft <= 0;
              const canRegister = t.status === TournamentStatus.upcoming || t.status === TournamentStatus.ongoing;
              return (
                <div key={t.id} className="bg-brand-dark border border-brand-red/20 rounded-xl overflow-hidden hover:border-brand-red/50 transition-all">
                  <div className="h-1.5 bg-gradient-to-r from-brand-red to-brand-orange" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="font-orbitron font-bold text-white text-sm leading-tight">{t.name}</h3>
                      <TournamentStatusBadge status={t.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Entry Fee</p>
                        <p className="text-brand-orange font-bold">₹{t.entryFee.toString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Prize Pool</p>
                        <p className="text-green-400 font-bold">₹{t.prizePool.toString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{t.map}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{slotsLeft}/{t.totalSlots.toString()} slots</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegister(t)}
                      disabled={isFull || !canRegister}
                      className="w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-red to-brand-orange text-white hover:opacity-90 shadow-md"
                    >
                      {isFull ? 'Slots Full' : !canRegister ? 'Registration Closed' : 'Register Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTournament && (
        <PaymentModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
}
