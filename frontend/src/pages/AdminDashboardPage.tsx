import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Trophy, Users, FileText, MessageSquare, Link, Settings,
  Plus, Check, X, Loader2, LogOut, Shield,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import {
  useGetAllTournaments, useCreateTournament, useUpdateTournamentStatus,
  useUpdateTournamentRoomDetails, useGetRegistrationsForTournament, useUpdateRegistrationStatus,
  useGetAllPlayers, useGetTermsAndConditions, useUpdateTermsAndConditions,
  useGetAllSupportTickets, useReplyToSupportTicket, useCloseSupportTicket,
  useGetSocialLinks, useUpdateSocialLinks, useUpdateTournamentQrCode
} from '../hooks/useQueries';
import { useAdminAuth } from '../context/AdminAuthContext';
import { TournamentStatus, RegistrationStatus } from '../backend';
import { ExternalBlob } from '../backend';

type AdminTab = 'tournaments' | 'registrations' | 'players' | 'terms' | 'tickets' | 'social';

const tabConfig: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'tournaments', label: 'Tournaments', icon: <Trophy size={18} /> },
  { id: 'registrations', label: 'Registrations', icon: <FileText size={18} /> },
  { id: 'players', label: 'Players', icon: <Users size={18} /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={18} /> },
  { id: 'tickets', label: 'Support Tickets', icon: <MessageSquare size={18} /> },
  { id: 'social', label: 'Social Links', icon: <Link size={18} /> },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, adminLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('tournaments');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdminAuthenticated) {
    navigate({ to: '/admin' });
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate({ to: '/admin' });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col shadow-brand-lg flex-shrink-0`}
        style={{ background: 'linear-gradient(180deg, oklch(0.42 0.24 18), oklch(0.52 0.24 22))' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="font-heading font-bold text-white text-sm leading-tight">Admin Panel</div>
                <div className="text-white/60 text-xs">Raj Empire Esports</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-white text-brand-red shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <span className="flex-shrink-0">{tab.icon}</span>
              {sidebarOpen && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/20 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-all text-sm"
          >
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Toggle Sidebar</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-all text-sm"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-brand-gradient px-6 py-4 flex items-center justify-between shadow-brand">
          <h1 className="font-heading text-2xl font-bold text-white">
            {tabConfig.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm hidden sm:block">Admin Dashboard</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'tournaments' && <TournamentsTab />}
          {activeTab === 'registrations' && <RegistrationsTab />}
          {activeTab === 'players' && <PlayersTab />}
          {activeTab === 'terms' && <TermsTab />}
          {activeTab === 'tickets' && <TicketsTab />}
          {activeTab === 'social' && <SocialTab />}
        </div>
      </main>
    </div>
  );
}

// ─── Tournaments Tab ───────────────────────────────────────────────────────────
function TournamentsTab() {
  const { data: tournaments, isLoading, refetch } = useGetAllTournaments();
  const createTournament = useCreateTournament();
  const updateStatus = useUpdateTournamentStatus();
  const updateRoom = useUpdateTournamentRoomDetails();
  const updateQr = useUpdateTournamentQrCode();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', dateTime: '', entryFee: '', prizePool: '',
    map: '', totalSlots: '', upiId: '', matchRules: '',
  });
  const [roomForm, setRoomForm] = useState<Record<string, { roomId: string; roomPassword: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTournament.mutateAsync({
        name: form.name,
        dateTime: BigInt(new Date(form.dateTime).getTime()) * 1_000_000n,
        entryFee: BigInt(form.entryFee),
        prizePool: BigInt(form.prizePool),
        map: form.map,
        totalSlots: BigInt(form.totalSlots),
        upiId: form.upiId,
        matchRules: form.matchRules,
      });
      setShowCreate(false);
      setForm({ name: '', dateTime: '', entryFee: '', prizePool: '', map: '', totalSlots: '', upiId: '', matchRules: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create tournament');
    }
  };

  const handleUpdateRoom = async (tournamentId: string) => {
    const rf = roomForm[tournamentId];
    if (!rf?.roomId || !rf?.roomPassword) return;
    try {
      await updateRoom.mutateAsync({ tournamentId, roomId: rf.roomId, roomPassword: rf.roomPassword });
      alert('Room details updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update room');
    }
  };

  const handleQrUpload = async (tournamentId: string, file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);
    try {
      await updateQr.mutateAsync({ tournamentId, qrCodeBlob: blob });
      alert('QR code updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update QR');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Tournament Management</h2>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-colors">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-brand hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            Create Tournament
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-brand-sm">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">New Tournament</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Tournament Name', type: 'text', placeholder: 'e.g. BGMI Squad Battle' },
              { key: 'dateTime', label: 'Date & Time', type: 'datetime-local', placeholder: '' },
              { key: 'entryFee', label: 'Entry Fee (₹)', type: 'number', placeholder: '100' },
              { key: 'prizePool', label: 'Prize Pool (₹)', type: 'number', placeholder: '1000' },
              { key: 'map', label: 'Map', type: 'text', placeholder: 'Erangel' },
              { key: 'totalSlots', label: 'Total Slots', type: 'number', placeholder: '100' },
              { key: 'upiId', label: 'UPI ID', type: 'text', placeholder: 'yourname@upi' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Match Rules</label>
              <textarea
                value={form.matchRules}
                onChange={e => setForm(f => ({ ...f, matchRules: e.target.value }))}
                placeholder="Enter match rules..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createTournament.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-all disabled:opacity-50"
              >
                {createTournament.isPending ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create</>}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournament List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-brand-red" /></div>
      ) : (
        <div className="space-y-4">
          {tournaments?.map(t => (
            <div key={t.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
                    <Trophy size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-muted-foreground text-xs">{t.map} • ₹{t.entryFee.toString()} entry • {t.filledSlots.toString()}/{t.totalSlots.toString()} slots</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status} />
                  {expandedId === t.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </div>

              {expandedId === t.id && (
                <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {(['upcoming', 'ongoing', 'closed', 'completed'] as TournamentStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus.mutate({ tournamentId: t.id, status: s })}
                          disabled={updateStatus.isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                            t.status === s
                              ? 'bg-brand-gradient text-white shadow-brand-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Room Details</label>
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="text"
                        placeholder="Room ID"
                        value={roomForm[t.id]?.roomId ?? t.roomId ?? ''}
                        onChange={e => setRoomForm(rf => ({ ...rf, [t.id]: { ...rf[t.id], roomId: e.target.value } }))}
                        className="flex-1 min-w-32 px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red"
                      />
                      <input
                        type="text"
                        placeholder="Room Password"
                        value={roomForm[t.id]?.roomPassword ?? t.roomPassword ?? ''}
                        onChange={e => setRoomForm(rf => ({ ...rf, [t.id]: { ...rf[t.id], roomPassword: e.target.value } }))}
                        className="flex-1 min-w-32 px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red"
                      />
                      <button
                        onClick={() => handleUpdateRoom(t.id)}
                        disabled={updateRoom.isPending}
                        className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-brand-sm hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {updateRoom.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Update'}
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">QR Code</label>
                    <div className="flex items-center gap-3">
                      {t.qrCodeBlob && (
                        <img src={t.qrCodeBlob.getDirectURL()} alt="QR" className="w-16 h-16 rounded-lg object-cover border border-border" />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-brand-red/50 text-brand-red text-sm font-medium cursor-pointer hover:bg-brand-red/5 transition-colors">
                        <Plus size={16} />
                        Upload QR
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleQrUpload(t.id, e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!tournaments?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p>No tournaments yet. Create one above!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Registrations Tab ────────────────────────────────────────────────────────
function RegistrationsTab() {
  const { data: tournaments } = useGetAllTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const { data: registrations, isLoading } = useGetRegistrationsForTournament(selectedTournamentId);
  const updateStatus = useUpdateRegistrationStatus();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">Registrations</h2>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Select Tournament</label>
        <select
          value={selectedTournamentId}
          onChange={e => setSelectedTournamentId(e.target.value)}
          className="w-full max-w-sm px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red"
        >
          <option value="">-- Select a tournament --</option>
          {tournaments?.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-brand-red" /></div>}

      {registrations && registrations.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-gradient text-white">
                <th className="px-4 py-3 text-left font-semibold">Player ID</th>
                <th className="px-4 py-3 text-left font-semibold">Payment</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.map(reg => (
                <tr key={reg.registrationId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{reg.playerId.slice(0, 20)}...</td>
                  <td className="px-4 py-3">
                    <a href={reg.paymentScreenshotBlob.getDirectURL()} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline text-xs font-medium">
                      View Screenshot
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <RegistrationStatusBadge status={reg.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus.mutate({ registrationId: reg.registrationId, status: RegistrationStatus.approved })}
                        disabled={updateStatus.isPending || reg.status === RegistrationStatus.approved}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ registrationId: reg.registrationId, status: RegistrationStatus.rejected })}
                        disabled={updateStatus.isPending || reg.status === RegistrationStatus.rejected}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {registrations?.length === 0 && selectedTournamentId && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No registrations for this tournament yet.</p>
        </div>
      )}
    </div>
  );
}

// ─── Players Tab ──────────────────────────────────────────────────────────────
function PlayersTab() {
  const { data: players, isLoading } = useGetAllPlayers();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">
        Player List <span className="text-muted-foreground text-base font-normal">({players?.length ?? 0} players)</span>
      </h2>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-red" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-gradient text-white">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Display Name</th>
                <th className="px-4 py-3 text-left font-semibold">BGMI ID</th>
                <th className="px-4 py-3 text-left font-semibold">Mobile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {players?.map((player, idx) => (
                <tr key={player.principal.toString()} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{player.displayName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{player.bgmiPlayerId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{player.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!players?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>No players registered yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Terms Tab ────────────────────────────────────────────────────────────────
function TermsTab() {
  const { data: terms, isLoading } = useGetTermsAndConditions();
  const updateTerms = useUpdateTermsAndConditions();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (terms?.content) setContent(terms.content);
  }, [terms?.content]);

  const handleSave = async () => {
    try {
      await updateTerms.mutateAsync(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">Terms &amp; Conditions Editor</h2>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-red" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="bg-brand-gradient px-4 py-3">
            <p className="text-white/80 text-sm">Edit the terms and conditions content below</p>
          </div>
          <div className="p-4">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors resize-none font-mono"
              placeholder="Enter terms and conditions..."
            />
            <div className="mt-3 flex gap-3">
              <button
                onClick={handleSave}
                disabled={updateTerms.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updateTerms.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tickets Tab ──────────────────────────────────────────────────────────────
function TicketsTab() {
  const { data: tickets, isLoading } = useGetAllSupportTickets();
  const replyTicket = useReplyToSupportTicket();
  const closeTicket = useCloseSupportTicket();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">
        Support Tickets <span className="text-muted-foreground text-base font-normal">({tickets?.length ?? 0})</span>
      </h2>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-red" /></div>
      ) : (
        <div className="space-y-4">
          {tickets?.map(ticket => (
            <div key={ticket.ticketId} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === ticket.ticketId ? null : ticket.ticketId)}
              >
                <div>
                  <div className="font-semibold text-foreground">{ticket.subject}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {ticket.playerName} • {new Date(Number(ticket.createdAt) / 1_000_000).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  {expandedId === ticket.ticketId ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </div>

              {expandedId === ticket.ticketId && (
                <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                  <p className="text-sm text-foreground">{ticket.description}</p>
                  {ticket.screenshotBlob && (
                    <a href={ticket.screenshotBlob.getDirectURL()} target="_blank" rel="noopener noreferrer" className="text-brand-red text-sm hover:underline">
                      View Screenshot
                    </a>
                  )}
                  {ticket.adminReply && (
                    <div className="bg-brand-gradient/10 border border-brand-red/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-brand-red mb-1">Admin Reply:</p>
                      <p className="text-sm text-foreground">{ticket.adminReply}</p>
                    </div>
                  )}
                  {ticket.status !== 'closed' && (
                    <div className="space-y-2">
                      <textarea
                        value={replyText[ticket.ticketId] ?? ''}
                        onChange={e => setReplyText(r => ({ ...r, [ticket.ticketId]: e.target.value }))}
                        placeholder="Type your reply..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => replyTicket.mutate({ ticketId: ticket.ticketId, reply: replyText[ticket.ticketId] ?? '' })}
                          disabled={replyTicket.isPending || !replyText[ticket.ticketId]}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-brand-sm hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {replyTicket.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => closeTicket.mutate(ticket.ticketId)}
                          disabled={closeTicket.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-colors disabled:opacity-50"
                        >
                          Close Ticket
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!tickets?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p>No support tickets yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Social Tab ───────────────────────────────────────────────────────────────
function SocialTab() {
  const { data: socialLinks, isLoading } = useGetSocialLinks();
  const updateSocial = useUpdateSocialLinks();
  const [form, setForm] = useState({ youtube: '', instagram: '', telegram: '' });
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (socialLinks) setForm({ youtube: socialLinks.youtube, instagram: socialLinks.instagram, telegram: socialLinks.telegram });
  }, [socialLinks]);

  const handleSave = async () => {
    try {
      await updateSocial.mutateAsync(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">Social Links</h2>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-red" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6 max-w-lg space-y-4">
          {[
            { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@channel' },
            { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/handle' },
            { key: 'telegram', label: 'Telegram URL', placeholder: 'https://t.me/channel' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
              <input
                type="url"
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={updateSocial.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-brand hover:opacity-90 transition-all disabled:opacity-50"
          >
            {updateSocial.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : saved ? <><Check size={16} /> Saved!</> : 'Save Links'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helper Badge Components ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-800',
    ongoing: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
