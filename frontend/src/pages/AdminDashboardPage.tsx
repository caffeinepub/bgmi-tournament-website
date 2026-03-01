import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  useGetAllTournaments, useCreateTournament, useUpdateTournamentQrCode,
  useUpdateTournamentStatus, useUpdateTournamentRoomDetails,
  useGetAllRegistrations, useUpdateRegistrationStatus,
  useGetAllPlayers, useGetAllSupportTickets, useReplyToSupportTicket, useCloseSupportTicket,
  useGetTermsAndConditions, useUpdateTermsAndConditions,
  useGetSocialLinks, useUpdateSocialLinks
} from '../hooks/useQueries';
import { Tournament, TournamentStatus, RegistrationStatus, ExternalBlob } from '../backend';
import { LogOut, Plus, Loader2, CheckCircle, XCircle, MessageSquare, Users, Trophy, FileText, Link, Settings } from 'lucide-react';

type AdminTab = 'tournaments' | 'registrations' | 'players' | 'tickets' | 'terms' | 'social';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, adminLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('tournaments');

  if (!isAdminAuthenticated) {
    navigate({ to: '/admin' });
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate({ to: '/admin' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/raj-empire-esports-logo.dim_400x120.png" alt="Raj Empire Esports" className="h-10 object-contain" />
            <span className="font-rajdhani font-bold text-primary text-sm uppercase tracking-widest border border-primary/50 px-2 py-0.5">Admin</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 font-rajdhani text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 border-b border-border">
          {([
            { key: 'tournaments', label: 'Tournaments', icon: Trophy },
            { key: 'registrations', label: 'Registrations', icon: CheckCircle },
            { key: 'players', label: 'Players', icon: Users },
            { key: 'tickets', label: 'Support', icon: MessageSquare },
            { key: 'terms', label: 'Terms', icon: FileText },
            { key: 'social', label: 'Social Links', icon: Link },
          ] as { key: AdminTab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 font-rajdhani font-semibold text-sm uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'tournaments' && <TournamentsTab />}
        {activeTab === 'registrations' && <RegistrationsTab />}
        {activeTab === 'players' && <PlayersTab />}
        {activeTab === 'tickets' && <TicketsTab />}
        {activeTab === 'terms' && <TermsTab />}
        {activeTab === 'social' && <SocialTab />}
      </div>
    </div>
  );
}

function TournamentsTab() {
  const { data: tournaments = [], isLoading } = useGetAllTournaments();
  const createTournament = useCreateTournament();
  const updateQr = useUpdateTournamentQrCode();
  const updateStatus = useUpdateTournamentStatus();
  const updateRoom = useUpdateTournamentRoomDetails();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', dateTime: '', entryFee: '', prizePool: '', map: 'Erangel', totalSlots: '100', upiId: '', matchRules: '' });
  const [roomForms, setRoomForms] = useState<Record<string, { roomId: string; roomPassword: string }>>({});
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [qrTournamentId, setQrTournamentId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name || !form.dateTime || !form.entryFee || !form.prizePool || !form.upiId) return;
    const dateMs = new Date(form.dateTime).getTime();
    createTournament.mutate({
      name: form.name,
      dateTime: BigInt(dateMs) * 1_000_000n,
      entryFee: BigInt(form.entryFee),
      prizePool: BigInt(form.prizePool),
      map: form.map,
      totalSlots: BigInt(form.totalSlots),
      upiId: form.upiId,
      matchRules: form.matchRules,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ name: '', dateTime: '', entryFee: '', prizePool: '', map: 'Erangel', totalSlots: '100', upiId: '', matchRules: '' });
      }
    });
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!qrTournamentId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);
    updateQr.mutate({ tournamentId: qrTournamentId, qrCodeBlob: blob });
    setQrTournamentId(null);
  };

  const handleRoomUpdate = (tournamentId: string) => {
    const rf = roomForms[tournamentId];
    if (!rf?.roomId || !rf?.roomPassword) return;
    updateRoom.mutate({ tournamentId, roomId: rf.roomId, roomPassword: rf.roomPassword });
  };

  const statusOptions = [
    { value: TournamentStatus.upcoming, label: 'Upcoming' },
    { value: TournamentStatus.ongoing, label: 'Ongoing' },
    { value: TournamentStatus.closed, label: 'Closed' },
    { value: TournamentStatus.completed, label: 'Completed' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest">Tournament Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground font-rajdhani font-bold px-4 py-2 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Tournament
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border p-6 mb-6">
          <h3 className="font-rajdhani font-bold text-foreground uppercase tracking-wider mb-4">Create Tournament</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Tournament Name', type: 'text', placeholder: 'e.g. Raj Empire Cup #1' },
              { key: 'dateTime', label: 'Date & Time', type: 'datetime-local', placeholder: '' },
              { key: 'entryFee', label: 'Entry Fee (₹)', type: 'number', placeholder: '100' },
              { key: 'prizePool', label: 'Prize Pool (₹)', type: 'number', placeholder: '5000' },
              { key: 'totalSlots', label: 'Total Slots', type: 'number', placeholder: '100' },
              { key: 'upiId', label: 'UPI ID', type: 'text', placeholder: 'yourname@upi' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="font-rajdhani font-semibold text-foreground text-xs uppercase tracking-wider block mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-background border border-border px-3 py-2 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
            ))}
            <div>
              <label className="font-rajdhani font-semibold text-foreground text-xs uppercase tracking-wider block mb-1">Map</label>
              <select
                value={form.map}
                onChange={e => setForm(f => ({ ...f, map: e.target.value }))}
                className="w-full bg-background border border-border px-3 py-2 font-saira text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
              >
                {['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-rajdhani font-semibold text-foreground text-xs uppercase tracking-wider block mb-1">Match Rules</label>
              <textarea
                value={form.matchRules}
                onChange={e => setForm(f => ({ ...f, matchRules: e.target.value }))}
                placeholder="Tournament rules..."
                rows={3}
                className="w-full bg-background border border-border px-3 py-2 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={createTournament.isPending}
              className="bg-primary text-primary-foreground font-rajdhani font-bold px-6 py-2 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createTournament.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="border border-border text-muted-foreground font-rajdhani font-bold px-6 py-2 uppercase tracking-widest text-sm hover:bg-muted/20 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {tournaments.map(t => (
            <div key={t.id} className="bg-card border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-rajdhani font-bold text-foreground text-lg">{t.name}</h3>
                  <p className="font-saira text-xs text-muted-foreground mt-1">
                    {new Date(Number(t.dateTime) / 1_000_000).toLocaleString('en-IN')} · {t.map} · ₹{t.entryFee.toString()} entry · ₹{t.prizePool.toString()} prize
                  </p>
                  <p className="font-saira text-xs text-muted-foreground">
                    Slots: {t.filledSlots.toString()}/{t.totalSlots.toString()} · UPI: {t.upiId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={t.status}
                    onChange={e => updateStatus.mutate({ tournamentId: t.id, status: e.target.value as TournamentStatus })}
                    className="bg-background border border-border px-3 py-1.5 font-rajdhani text-foreground text-xs uppercase tracking-wider focus:outline-none focus:border-primary"
                  >
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button
                    onClick={() => { setQrTournamentId(t.id); qrInputRef.current?.click(); }}
                    className="border border-border text-muted-foreground font-rajdhani text-xs px-3 py-1.5 uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                  >
                    Upload QR
                  </button>
                </div>
              </div>

              {/* Room Details */}
              <div className="border-t border-border pt-4">
                <p className="font-rajdhani font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Room Details</p>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Room ID"
                    value={roomForms[t.id]?.roomId ?? t.roomId ?? ''}
                    onChange={e => setRoomForms(rf => ({ ...rf, [t.id]: { ...rf[t.id], roomId: e.target.value } }))}
                    className="bg-background border border-border px-3 py-2 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm w-40"
                  />
                  <input
                    type="text"
                    placeholder="Room Password"
                    value={roomForms[t.id]?.roomPassword ?? t.roomPassword ?? ''}
                    onChange={e => setRoomForms(rf => ({ ...rf, [t.id]: { ...rf[t.id], roomPassword: e.target.value } }))}
                    className="bg-background border border-border px-3 py-2 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm w-40"
                  />
                  <button
                    onClick={() => handleRoomUpdate(t.id)}
                    disabled={updateRoom.isPending}
                    className="bg-primary text-primary-foreground font-rajdhani font-bold px-4 py-2 uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {updateRoom.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tournaments.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-saira">No tournaments yet. Create one above.</div>
          )}
        </div>
      )}

      <input ref={qrInputRef} type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
    </div>
  );
}

function RegistrationsTab() {
  const { data: allRegistrations = [], isLoading } = useGetAllRegistrations();
  const { data: tournaments = [] } = useGetAllTournaments();
  const updateStatus = useUpdateRegistrationStatus();

  const getTournamentName = (id: string) => tournaments.find(t => t.id === id)?.name || id;

  const getStatusColor = (status: RegistrationStatus) => {
    if (status === RegistrationStatus.approved) return 'text-green-400';
    if (status === RegistrationStatus.rejected) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">Registrations</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : allRegistrations.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-saira">No registrations yet.</div>
      ) : (
        <div className="space-y-3">
          {allRegistrations.map(reg => (
            <div key={reg.registrationId} className="bg-card border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-rajdhani font-bold text-sm uppercase ${getStatusColor(reg.status)}`}>
                      {reg.status}
                    </span>
                    <span className="font-saira text-xs text-muted-foreground">{reg.registrationId}</span>
                  </div>
                  <p className="font-rajdhani font-semibold text-foreground">Tournament: {getTournamentName(reg.tournamentId)}</p>
                  <p className="font-saira text-xs text-muted-foreground mt-1">Player ID: {reg.playerId}</p>
                </div>
                <div className="flex items-center gap-2">
                  {reg.paymentScreenshotBlob && (
                    <a
                      href={reg.paymentScreenshotBlob.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border text-muted-foreground font-rajdhani text-xs px-3 py-1.5 uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                    >
                      View Payment
                    </a>
                  )}
                  {reg.status === RegistrationStatus.pending && (
                    <>
                      <button
                        onClick={() => updateStatus.mutate({ registrationId: reg.registrationId, status: RegistrationStatus.approved })}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1 bg-green-600 text-white font-rajdhani font-bold px-3 py-1.5 uppercase tracking-wider text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ registrationId: reg.registrationId, status: RegistrationStatus.rejected })}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1 bg-red-600 text-white font-rajdhani font-bold px-3 py-1.5 uppercase tracking-wider text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayersTab() {
  const { data: players = [], isLoading } = useGetAllPlayers();

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">
        Players ({players.length})
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : players.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-saira">No players registered yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-rajdhani font-bold text-muted-foreground text-xs uppercase tracking-wider py-3 px-4">#</th>
                <th className="text-left font-rajdhani font-bold text-muted-foreground text-xs uppercase tracking-wider py-3 px-4">Display Name</th>
                <th className="text-left font-rajdhani font-bold text-muted-foreground text-xs uppercase tracking-wider py-3 px-4">BGMI ID</th>
                <th className="text-left font-rajdhani font-bold text-muted-foreground text-xs uppercase tracking-wider py-3 px-4">Mobile</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.principal.toString()} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                  <td className="py-3 px-4 font-saira text-muted-foreground text-sm">{i + 1}</td>
                  <td className="py-3 px-4 font-rajdhani font-semibold text-foreground">{p.displayName}</td>
                  <td className="py-3 px-4 font-saira text-foreground text-sm">{p.bgmiPlayerId}</td>
                  <td className="py-3 px-4 font-saira text-foreground text-sm">{p.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TicketsTab() {
  const { data: tickets = [], isLoading } = useGetAllSupportTickets();
  const replyMutation = useReplyToSupportTicket();
  const closeMutation = useCloseSupportTicket();
  const [replies, setReplies] = useState<Record<string, string>>({});

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">Support Tickets</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-saira">No support tickets yet.</div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.ticketId} className="bg-card border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-rajdhani font-bold text-foreground text-lg">{ticket.subject}</h3>
                  <p className="font-saira text-xs text-muted-foreground">
                    {ticket.playerName} · {new Date(Number(ticket.createdAt) / 1_000_000).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className={`text-xs font-rajdhani font-bold px-2 py-0.5 border uppercase ${
                  ticket.status === 'open' ? 'border-yellow-500/50 text-yellow-400' :
                    ticket.status === 'replied' ? 'border-green-500/50 text-green-400' :
                      'border-border text-muted-foreground'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="font-saira text-sm text-foreground mb-3">{ticket.description}</p>
              {ticket.adminReply && (
                <div className="bg-primary/10 border border-primary/30 p-3 mb-3">
                  <p className="font-rajdhani font-bold text-primary text-xs uppercase tracking-wider mb-1">Admin Reply</p>
                  <p className="font-saira text-sm text-foreground">{ticket.adminReply}</p>
                </div>
              )}
              {ticket.status !== 'closed' && (
                <div className="flex gap-3 mt-3">
                  <textarea
                    value={replies[ticket.ticketId] || ''}
                    onChange={e => setReplies(r => ({ ...r, [ticket.ticketId]: e.target.value }))}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1 bg-background border border-border px-3 py-2 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (!replies[ticket.ticketId]) return;
                        replyMutation.mutate({ ticketId: ticket.ticketId, reply: replies[ticket.ticketId] }, {
                          onSuccess: () => setReplies(r => ({ ...r, [ticket.ticketId]: '' }))
                        });
                      }}
                      disabled={replyMutation.isPending}
                      className="bg-primary text-primary-foreground font-rajdhani font-bold px-4 py-2 uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {replyMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Reply
                    </button>
                    <button
                      onClick={() => closeMutation.mutate(ticket.ticketId)}
                      disabled={closeMutation.isPending}
                      className="border border-border text-muted-foreground font-rajdhani font-bold px-4 py-2 uppercase tracking-widest text-xs hover:bg-muted/20 transition-colors disabled:opacity-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TermsTab() {
  const { data: terms, isLoading } = useGetTermsAndConditions();
  const updateTerms = useUpdateTermsAndConditions();
  const [content, setContent] = useState('');
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (terms && !initialized) {
      setContent(terms.content);
      setInitialized(true);
    }
  }, [terms, initialized]);

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">Terms & Conditions</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border p-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={20}
            placeholder="Enter Terms & Conditions content..."
            className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm resize-none"
          />
          <button
            onClick={() => updateTerms.mutate(content)}
            disabled={updateTerms.isPending}
            className="mt-4 bg-primary text-primary-foreground font-rajdhani font-bold px-8 py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updateTerms.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Terms
          </button>
          {updateTerms.isSuccess && (
            <p className="mt-3 font-saira text-sm text-green-400">Terms saved successfully!</p>
          )}
        </div>
      )}
    </div>
  );
}

function SocialTab() {
  const { data: links, isLoading } = useGetSocialLinks();
  const updateLinks = useUpdateSocialLinks();
  const [form, setForm] = useState({ youtube: '', instagram: '', telegram: '' });
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (links && !initialized) {
      setForm({ youtube: links.youtube, instagram: links.instagram, telegram: links.telegram });
      setInitialized(true);
    }
  }, [links, initialized]);

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-foreground uppercase tracking-widest mb-6">Social Links</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border p-6 max-w-lg">
          <div className="space-y-4">
            {[
              { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@channel' },
              { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/handle' },
              { key: 'telegram', label: 'Telegram URL', placeholder: 'https://t.me/channel' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="font-rajdhani font-semibold text-foreground text-xs uppercase tracking-wider block mb-2">{label}</label>
                <input
                  type="url"
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-background border border-border px-4 py-3 font-saira text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => updateLinks.mutate(form)}
            disabled={updateLinks.isPending}
            className="mt-6 bg-primary text-primary-foreground font-rajdhani font-bold px-8 py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updateLinks.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Links
          </button>
          {updateLinks.isSuccess && (
            <p className="mt-3 font-saira text-sm text-green-400">Social links saved successfully!</p>
          )}
        </div>
      )}
    </div>
  );
}
