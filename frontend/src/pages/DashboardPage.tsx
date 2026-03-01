import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGetAllTournaments, useGetMyRegistrations } from '../hooks/useQueries';
import { Tournament, TournamentRegistration, TournamentStatus, RegistrationStatus } from '../backend';
import PaymentModal from '../components/PaymentModal';
import { Trophy, User, ClipboardList, Gamepad2, Users, Zap, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Tab = 'tournaments' | 'registrations' | 'profile';

function StatusBadge({ status }: { status: RegistrationStatus }) {
  const map = {
    [RegistrationStatus.pending]: { label: 'Pending', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    [RegistrationStatus.approved]: { label: 'Approved', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    [RegistrationStatus.rejected]: { label: 'Rejected', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const s = map[status] || map[RegistrationStatus.pending];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const map = {
    [TournamentStatus.upcoming]: { label: 'Upcoming', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    [TournamentStatus.ongoing]: { label: 'Live', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
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

export default function DashboardPage() {
  const { player } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('tournaments');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TournamentStatus>('all');

  const { data: tournaments = [], isLoading: tournamentsLoading } = useGetAllTournaments();
  const { data: registrations = [], isLoading: regsLoading } = useGetMyRegistrations();

  const filteredTournaments = statusFilter === 'all'
    ? tournaments
    : tournaments.filter((t) => t.status === statusFilter);

  const tabs = [
    { id: 'tournaments' as Tab, label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { id: 'registrations' as Tab, label: 'My Registrations', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'profile' as Tab, label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <div className="bg-brand-dark border-b border-brand-red/20 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-orbitron font-bold text-white text-xl sm:text-2xl">
            Player Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, <span className="text-brand-orange font-medium">{player?.displayName}</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-brand-dark border border-brand-red/20 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {(['all', TournamentStatus.upcoming, TournamentStatus.ongoing, TournamentStatus.completed] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === f
                      ? 'bg-brand-red text-white'
                      : 'bg-brand-dark border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {tournamentsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tournaments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTournaments.map((t) => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    onRegister={() => setSelectedTournament(t)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Registrations Tab */}
        {activeTab === 'registrations' && (
          <div>
            {regsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No registrations yet</p>
                <button
                  onClick={() => setActiveTab('tournaments')}
                  className="mt-3 text-brand-orange hover:text-brand-red transition-colors text-sm"
                >
                  Browse tournaments →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => {
                  const tournament = tournaments.find((t) => t.id === reg.tournamentId);
                  return (
                    <div key={reg.registrationId} className="bg-brand-dark border border-brand-red/20 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-orbitron font-bold text-white text-sm">
                            {tournament?.name || reg.tournamentId}
                          </h3>
                          <p className="text-gray-500 text-xs mt-0.5">ID: {reg.registrationId}</p>
                          {tournament && (
                            <div className="flex gap-3 mt-2 text-xs text-gray-400">
                              <span>Entry: ₹{tournament.entryFee.toString()}</span>
                              <span>Prize: ₹{tournament.prizePool.toString()}</span>
                            </div>
                          )}
                        </div>
                        <StatusBadge status={reg.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-md">
            <div className="bg-brand-dark border border-brand-red/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-orbitron font-bold text-white text-lg">{player?.displayName}</h2>
                  <p className="text-gray-400 text-sm">BGMI Player</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Display Name</p>
                  <p className="text-white font-medium">{player?.displayName}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                  <p className="text-white font-medium">{player?.mobile}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">BGMI Player ID</p>
                  <p className="text-white font-medium">{player?.bgmiPlayerId}</p>
                </div>
              </div>
            </div>
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

function TournamentCard({ tournament, onRegister }: { tournament: Tournament; onRegister: () => void }) {
  const slotsLeft = Number(tournament.totalSlots) - Number(tournament.filledSlots);
  const isFull = slotsLeft <= 0;
  const canRegister = tournament.status === TournamentStatus.upcoming || tournament.status === TournamentStatus.ongoing;

  return (
    <div className="bg-brand-dark border border-brand-red/20 rounded-xl overflow-hidden hover:border-brand-red/50 transition-all group">
      <div className="h-1.5 bg-gradient-to-r from-brand-red to-brand-orange" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-orbitron font-bold text-white text-sm leading-tight">{tournament.name}</h3>
          <TournamentStatusBadge status={tournament.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-xs text-gray-500">Entry Fee</p>
            <p className="text-brand-orange font-bold text-sm">₹{tournament.entryFee.toString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-xs text-gray-500">Prize Pool</p>
            <p className="text-green-400 font-bold text-sm">₹{tournament.prizePool.toString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{tournament.map}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>{slotsLeft} slots left</span>
          </div>
        </div>

        <button
          onClick={onRegister}
          disabled={isFull || !canRegister}
          className="w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-red to-brand-orange text-white hover:opacity-90 shadow-md"
        >
          {isFull ? 'Full' : !canRegister ? 'Closed' : 'Register Now'}
        </button>
      </div>
    </div>
  );
}
