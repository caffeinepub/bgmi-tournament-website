import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useGetAllTournaments, useGetMyRegistrations } from '../hooks/useQueries';
import { Tournament, TournamentRegistration, TournamentStatus, RegistrationStatus } from '../backend';
import { Trophy, User, Clock, MapPin, Users, DollarSign, Lock, Unlock, LogOut, Loader2 } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

type Tab = 'tournaments' | 'myregistrations' | 'profile';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { player, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('tournaments');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const { data: tournaments = [], isLoading: tournamentsLoading } = useGetAllTournaments();
  const { data: myRegistrations = [], isLoading: regsLoading } = useGetMyRegistrations();

  if (!isAuthenticated) {
    navigate({ to: '/player/login' });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const map = {
      [RegistrationStatus.pending]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      [RegistrationStatus.approved]: 'bg-green-500/20 text-green-400 border-green-500/50',
      [RegistrationStatus.rejected]: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return map[status] || map[RegistrationStatus.pending];
  };

  const getTournamentStatusBadge = (status: TournamentStatus) => {
    const map: Record<string, string> = {
      upcoming: 'bg-primary/20 text-primary border-primary/50',
      ongoing: 'bg-green-500/20 text-green-400 border-green-500/50',
      closed: 'bg-muted text-muted-foreground border-border',
      completed: 'bg-muted text-muted-foreground border-border',
    };
    return map[status] || map['upcoming'];
  };

  const isRegistered = (tournamentId: string) =>
    myRegistrations.some(r => r.tournamentId === tournamentId);

  const getMyRegistration = (tournamentId: string) =>
    myRegistrations.find(r => r.tournamentId === tournamentId);

  const canRegister = (t: Tournament) =>
    t.status === TournamentStatus.upcoming &&
    Number(t.filledSlots) < Number(t.totalSlots) &&
    !isRegistered(t.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate({ to: '/' })}>
            <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-12 object-contain" />
          </button>
          <div className="flex items-center gap-4">
            <span className="font-rajdhani text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="text-primary font-bold">{player?.displayName}</span>
            </span>
            <button onClick={handleLogout} className="flex items-center gap-2 font-rajdhani text-sm text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {([
            { key: 'tournaments', label: 'Tournaments', icon: Trophy },
            { key: 'myregistrations', label: 'My Registrations', icon: Clock },
            { key: 'profile', label: 'Profile', icon: User },
          ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 font-rajdhani font-semibold text-sm uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div>
            <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">Active Tournaments</h2>
            {tournamentsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-saira">
                No tournaments available right now. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map(t => {
                  const reg = getMyRegistration(t.id);
                  return (
                    <div key={t.id} className="bg-card border border-border hover:border-primary/50 transition-colors flex flex-col">
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-rajdhani font-bold text-foreground text-lg leading-tight">{t.name}</h3>
                          <span className={`text-xs font-rajdhani font-bold px-2 py-0.5 border uppercase ${getTournamentStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs font-saira text-muted-foreground">Entry Fee</p>
                              <p className="font-rajdhani font-bold text-foreground text-sm">₹{t.entryFee.toString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs font-saira text-muted-foreground">Prize Pool</p>
                              <p className="font-rajdhani font-bold text-foreground text-sm">₹{t.prizePool.toString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs font-saira text-muted-foreground">Slots</p>
                              <p className="font-rajdhani font-bold text-foreground text-sm">{t.filledSlots.toString()}/{t.totalSlots.toString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs font-saira text-muted-foreground">Map</p>
                              <p className="font-rajdhani font-bold text-foreground text-sm">{t.map}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="font-saira text-xs text-muted-foreground">
                            {new Date(Number(t.dateTime) / 1_000_000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>

                        {/* Room details for approved registrations */}
                        {reg?.status === RegistrationStatus.approved && (
                          <div className="bg-green-500/10 border border-green-500/30 p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Unlock className="w-4 h-4 text-green-400" />
                              <span className="font-rajdhani font-bold text-green-400 text-sm uppercase">Room Details</span>
                            </div>
                            {t.roomId ? (
                              <div className="space-y-1">
                                <p className="font-saira text-sm text-foreground">Room ID: <span className="font-bold text-primary">{t.roomId}</span></p>
                                <p className="font-saira text-sm text-foreground">Password: <span className="font-bold text-primary">{t.roomPassword}</span></p>
                              </div>
                            ) : (
                              <p className="font-saira text-xs text-muted-foreground">Room details will be shared before the match.</p>
                            )}
                          </div>
                        )}

                        {reg && reg.status !== RegistrationStatus.approved && (
                          <div className="flex items-center gap-2 mb-4">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-saira text-xs text-muted-foreground">Room details visible after approval</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 pt-0">
                        {reg ? (
                          <div className={`text-center py-2 font-rajdhani font-bold text-sm uppercase tracking-wider border ${getStatusBadge(reg.status)}`}>
                            {reg.status === RegistrationStatus.pending ? '⏳ Pending Approval' :
                              reg.status === RegistrationStatus.approved ? '✅ Registered' : '❌ Rejected'}
                          </div>
                        ) : (
                          <button
                            onClick={() => canRegister(t) && setSelectedTournament(t)}
                            disabled={!canRegister(t)}
                            className="w-full bg-primary text-primary-foreground font-rajdhani font-bold py-2.5 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                          >
                            {Number(t.filledSlots) >= Number(t.totalSlots) ? 'Full' :
                              t.status !== TournamentStatus.upcoming ? t.status.toString().toUpperCase() : 'Register Now'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* My Registrations Tab */}
        {activeTab === 'myregistrations' && (
          <div>
            <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">My Registrations</h2>
            {regsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : myRegistrations.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-saira">
                You haven't registered for any tournaments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myRegistrations.map(reg => {
                  const tournament = tournaments.find(t => t.id === reg.tournamentId);
                  return (
                    <div key={reg.registrationId} className="bg-card border border-border p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-rajdhani font-bold text-foreground text-lg">
                            {tournament?.name || reg.tournamentId}
                          </h3>
                          <p className="font-saira text-xs text-muted-foreground mt-1">
                            Registration ID: {reg.registrationId}
                          </p>
                        </div>
                        <span className={`text-xs font-rajdhani font-bold px-3 py-1 border uppercase ${getStatusBadge(reg.status)}`}>
                          {reg.status}
                        </span>
                      </div>
                      {reg.status === RegistrationStatus.approved && tournament && (
                        <div className="mt-4 bg-green-500/10 border border-green-500/30 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Unlock className="w-4 h-4 text-green-400" />
                            <span className="font-rajdhani font-bold text-green-400 text-sm uppercase">Room Details</span>
                          </div>
                          {tournament.roomId ? (
                            <div className="space-y-1">
                              <p className="font-saira text-sm text-foreground">Room ID: <span className="font-bold text-primary">{tournament.roomId}</span></p>
                              <p className="font-saira text-sm text-foreground">Password: <span className="font-bold text-primary">{tournament.roomPassword}</span></p>
                            </div>
                          ) : (
                            <p className="font-saira text-xs text-muted-foreground">Room details will be shared before the match.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">My Profile</h2>
            <div className="bg-card border border-border p-6 max-w-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-rajdhani font-bold text-foreground text-xl">{player?.displayName}</h3>
                  <p className="font-saira text-sm text-muted-foreground">BGMI Player</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <p className="font-rajdhani text-xs text-muted-foreground uppercase tracking-wider mb-1">Mobile Number</p>
                  <p className="font-saira text-foreground">+91 {player?.mobile}</p>
                </div>
                <div className="border-b border-border pb-4">
                  <p className="font-rajdhani text-xs text-muted-foreground uppercase tracking-wider mb-1">Display Name</p>
                  <p className="font-saira text-foreground">{player?.displayName}</p>
                </div>
                <div>
                  <p className="font-rajdhani text-xs text-muted-foreground uppercase tracking-wider mb-1">BGMI Player ID</p>
                  <p className="font-saira text-foreground">{player?.bgmiPlayerId || 'Not set'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-6 w-full border border-destructive text-destructive font-rajdhani font-bold py-2.5 uppercase tracking-widest hover:bg-destructive/10 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </main>

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
