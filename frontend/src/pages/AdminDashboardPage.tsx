import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  useGetAllTournaments,
  useGetAllRegistrations,
  useGetRegistrationsForTournament,
  useGetAllPlayers,
  useGetAllSupportTickets,
  useGetTermsAndConditions,
  useGetSocialLinks,
  useCreateTournament,
  useUpdateTournamentStatus,
  useUpdateTournamentQrCode,
  useUpdateTournamentRoomDetails,
  useUpdateRegistrationStatus,
  useUpdateTermsAndConditions,
  useUpdateSocialLinks,
  useReplyToSupportTicket,
  useCloseSupportTicket,
} from '../hooks/useQueries';
import { TournamentStatus, RegistrationStatus, Tournament, TournamentRegistration, SupportTicket, Player, TicketStatus } from '../backend';
import { ExternalBlob } from '../backend';
import {
  Trophy, Users, ClipboardList, FileText, MessageSquare, Link2,
  LogOut, Menu, X, Plus, Eye, Check, XCircle, Loader2,
  ChevronDown, ChevronUp, Shield, Send, RefreshCw, Upload
} from 'lucide-react';

type AdminTab = 'tournaments' | 'registrations' | 'players' | 'terms' | 'support' | 'social';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('tournaments');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/admin' });
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { id: 'registrations', label: 'Registrations', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'players', label: 'Players', icon: <Users className="w-4 h-4" /> },
    { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="w-4 h-4" /> },
    { id: 'support', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'social', label: 'Social Links', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-brand-darker flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-dark border-r border-brand-red/20 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 p-5 border-b border-brand-red/20">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-orbitron font-bold text-white text-xs block truncate">ADMIN PANEL</span>
            <span className="text-gray-500 text-xs block truncate">Raj Empire Esports</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-brand-red/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-brand-dark border-b border-brand-red/20 px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-orbitron font-bold text-white text-base sm:text-lg">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-gray-500 text-xs">Admin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {activeTab === 'tournaments' && <TournamentsTab />}
          {activeTab === 'registrations' && <RegistrationsTab />}
          {activeTab === 'players' && <PlayersTab />}
          {activeTab === 'terms' && <TermsTab />}
          {activeTab === 'support' && <SupportTab />}
          {activeTab === 'social' && <SocialTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const map: Record<TournamentStatus, { label: string; cls: string }> = {
    [TournamentStatus.upcoming]: { label: 'Upcoming', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    [TournamentStatus.ongoing]: { label: 'Live', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    [TournamentStatus.closed]: { label: 'Closed', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    [TournamentStatus.completed]: { label: 'Completed', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  };
  const s = map[status] || map[TournamentStatus.upcoming];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function RegStatusBadge({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, { label: string; cls: string }> = {
    [RegistrationStatus.pending]: { label: 'Pending', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    [RegistrationStatus.approved]: { label: 'Approved', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    [RegistrationStatus.rejected]: { label: 'Rejected', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const s = map[status] || map[RegistrationStatus.pending];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Tournaments Tab ───────────────────────────────────────────────────────────
function TournamentsTab() {
  const { data: tournaments = [], isLoading, refetch } = useGetAllTournaments();
  const createTournament = useCreateTournament();
  const updateStatus = useUpdateTournamentStatus();
  const updateRoom = useUpdateTournamentRoomDetails();
  const updateQr = useUpdateTournamentQrCode();

  const [showForm, setShowForm] = useState(false);
  const [tournamentType, setTournamentType] = useState<'daily' | 'mega'>('daily');
  const [form, setForm] = useState({
    name: '', entryFee: '', prizePool: '', map: 'Erangel',
    totalSlots: '100', upiId: '', matchRules: '', squadSize: 'Squad',
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState<Record<string, { roomId: string; roomPassword: string }>>({});
  const qrRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Tournament name is required'); return; }
    if (!form.entryFee || isNaN(Number(form.entryFee))) { setFormError('Valid entry fee is required'); return; }
    try {
      const tournamentId = await createTournament.mutateAsync({
        name: tournamentType === 'mega' ? `[MEGA] ${form.name}` : form.name,
        dateTime: BigInt(Date.now()) * BigInt(1_000_000),
        entryFee: BigInt(form.entryFee),
        prizePool: BigInt(form.prizePool || '0'),
        map: tournamentType === 'mega' ? form.squadSize : form.map,
        totalSlots: BigInt(form.totalSlots || '100'),
        upiId: form.upiId,
        matchRules: form.matchRules,
      });

      const fileToUpload = tournamentType === 'daily' ? qrFile : posterFile;
      if (fileToUpload && tournamentId) {
        const bytes = new Uint8Array(await fileToUpload.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        await updateQr.mutateAsync({ tournamentId, qrCodeBlob: blob });
      }

      setShowForm(false);
      setForm({ name: '', entryFee: '', prizePool: '', map: 'Erangel', totalSlots: '100', upiId: '', matchRules: '', squadSize: 'Squad' });
      setQrFile(null);
      setPosterFile(null);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create tournament');
    }
  };

  const handleRoomUpdate = async (tournamentId: string) => {
    const r = roomForm[tournamentId];
    if (!r?.roomId || !r?.roomPassword) return;
    try {
      await updateRoom.mutateAsync({ tournamentId, roomId: r.roomId, roomPassword: r.roomPassword });
    } catch (err: any) {
      alert(err?.message || 'Failed to update room');
    }
  };

  const handleQrUpload = async (tournamentId: string, file: File) => {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await updateQr.mutateAsync({ tournamentId, qrCodeBlob: blob });
    } catch (err: any) {
      alert(err?.message || 'Failed to upload QR');
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-white text-base">Manage Tournaments</h2>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-red to-brand-orange text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Tournament
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-brand-dark border border-brand-red/20 rounded-xl p-5">
          {/* Type Toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setTournamentType('daily')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                tournamentType === 'daily'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Daily Tournament
            </button>
            <button
              type="button"
              onClick={() => setTournamentType('mega')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                tournamentType === 'mega'
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Mega Tournament
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {tournamentType === 'daily' ? (
              /* Daily Tournament Fields */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Tournament Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. BGMI Squad Battle" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Entry Fee (₹)</label>
                  <input type="number" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} placeholder="100" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Prize Pool (₹)</label>
                  <input type="number" value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })} placeholder="1000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Map</label>
                  <input type="text" value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })} placeholder="Erangel" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Total Slots</label>
                  <input type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: e.target.value })} placeholder="100" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>UPI ID</label>
                  <input type="text" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} placeholder="yourname@upi" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Squad Size</label>
                  <select value={form.squadSize} onChange={(e) => setForm({ ...form, squadSize: e.target.value })} className={inputCls}>
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Match Rules</label>
                  <textarea value={form.matchRules} onChange={(e) => setForm({ ...form, matchRules: e.target.value })} placeholder="Enter match rules..." rows={3} className={`${inputCls} resize-none`} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>QR Code Image</label>
                  <div
                    onClick={() => qrRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-brand-red/50 transition-all"
                  >
                    {qrFile ? (
                      <p className="text-green-400 text-sm">{qrFile.name}</p>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <p className="text-gray-500 text-sm">Click to upload QR code</p>
                      </div>
                    )}
                  </div>
                  <input ref={qrRef} type="file" accept="image/*" className="hidden" onChange={(e) => setQrFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            ) : (
              /* Mega Tournament Fields — only poster, entry fee, squad size */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Entry Fee (₹)</label>
                  <input type="number" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} placeholder="500" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Squad Size</label>
                  <select value={form.squadSize} onChange={(e) => setForm({ ...form, squadSize: e.target.value })} className={inputCls}>
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Total Slots</label>
                  <input type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: e.target.value })} placeholder="100" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>UPI ID</label>
                  <input type="text" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} placeholder="yourname@upi" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Tournament Poster</label>
                  <div
                    onClick={() => posterRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-brand-red/50 transition-all"
                  >
                    {posterFile ? (
                      <div>
                        <img
                          src={URL.createObjectURL(posterFile)}
                          alt="Poster preview"
                          className="max-h-40 mx-auto rounded-lg object-contain mb-2"
                        />
                        <p className="text-green-400 text-sm">{posterFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload tournament poster</p>
                        <p className="text-gray-600 text-xs mt-1">PNG, JPG recommended</p>
                      </div>
                    )}
                  </div>
                  <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPosterFile(file);
                    if (file) setForm({ ...form, name: file.name.replace(/\.[^/.]+$/, '') });
                  }} />
                </div>
              </div>
            )}

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createTournament.isPending || updateQr.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {(createTournament.isPending || updateQr.isPending) ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Create</>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournament List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No tournaments yet. Create one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-brand-dark border border-brand-red/20 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-orbitron font-bold text-white text-sm truncate">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.map} • ₹{t.entryFee.toString()} entry • {t.filledSlots.toString()}/{t.totalSlots.toString()} slots</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <TournamentStatusBadge status={t.status} />
                  {expandedId === t.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </div>

              {expandedId === t.id && (
                <div className="border-t border-white/10 p-4 space-y-4 bg-white/2">
                  {/* Status */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {([TournamentStatus.upcoming, TournamentStatus.ongoing, TournamentStatus.closed, TournamentStatus.completed] as TournamentStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus.mutate({ tournamentId: t.id, status: s })}
                          disabled={updateStatus.isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                            t.status === s
                              ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Room Details</p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        placeholder="Room ID"
                        value={roomForm[t.id]?.roomId ?? t.roomId ?? ''}
                        onChange={(e) => setRoomForm((rf) => ({ ...rf, [t.id]: { ...rf[t.id], roomId: e.target.value } }))}
                        className="flex-1 min-w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-red/60"
                      />
                      <input
                        type="text"
                        placeholder="Room Password"
                        value={roomForm[t.id]?.roomPassword ?? t.roomPassword ?? ''}
                        onChange={(e) => setRoomForm((rf) => ({ ...rf, [t.id]: { ...rf[t.id], roomPassword: e.target.value } }))}
                        className="flex-1 min-w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-red/60"
                      />
                      <button
                        onClick={() => handleRoomUpdate(t.id)}
                        disabled={updateRoom.isPending}
                        className="px-4 py-2 bg-gradient-to-r from-brand-red to-brand-orange text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        {updateRoom.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">QR Code / Poster</p>
                    <div className="flex items-center gap-3">
                      {t.qrCodeBlob && (
                        <img src={t.qrCodeBlob.getDirectURL()} alt="QR" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-brand-red/40 text-brand-orange text-sm font-medium rounded-lg cursor-pointer hover:bg-brand-red/5 transition-colors">
                        <Upload className="w-4 h-4" />
                        {t.qrCodeBlob ? 'Replace' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleQrUpload(t.id, e.target.files[0])}
                        />
                      </label>
                    </div>
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

// ─── Registrations Tab ────────────────────────────────────────────────────────
function RegistrationsTab() {
  const { data: tournaments = [] } = useGetAllTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const { data: registrations = [], isLoading } = useGetRegistrationsForTournament(selectedTournamentId);
  const updateStatus = useUpdateRegistrationStatus();
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <h2 className="font-orbitron font-bold text-white text-base">Registrations</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Tournament</label>
        <select
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
          className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-red/60 transition-all text-sm"
        >
          <option value="">-- Select a tournament --</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {!selectedTournamentId ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select a tournament to view registrations</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No registrations for this tournament</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div key={reg.registrationId} className="bg-brand-dark border border-brand-red/20 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">Player: {reg.playerId}</p>
                  <p className="text-gray-500 text-xs mt-0.5">ID: {reg.registrationId}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RegStatusBadge status={reg.status} />
                  <button
                    onClick={() => setViewScreenshot(reg.paymentScreenshotBlob.getDirectURL())}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-lg transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Screenshot
                  </button>
                  {reg.status === RegistrationStatus.pending && (
                    <>
                      <button
                        onClick={() => updateStatus.mutate({ registrationId: reg.registrationId, status: RegistrationStatus.approved })}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs rounded-lg transition-all disabled:opacity-60"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ registrationId: reg.registrationId, status: RegistrationStatus.rejected })}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-all disabled:opacity-60"
                      >
                        <XCircle className="w-3.5 h-3.5" />
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

      {/* Screenshot Modal */}
      {viewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setViewScreenshot(null)}>
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewScreenshot(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={viewScreenshot} alt="Payment Screenshot" className="w-full rounded-xl border border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Players Tab ──────────────────────────────────────────────────────────────
function PlayersTab() {
  const { data: players = [], isLoading } = useGetAllPlayers();

  return (
    <div className="space-y-5">
      <h2 className="font-orbitron font-bold text-white text-base">Players ({players.length})</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No players registered yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player, i) => (
            <div key={i} className="bg-brand-dark border border-brand-red/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{player.displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{player.displayName}</p>
                <p className="text-gray-500 text-xs">Mobile: {player.mobile} • BGMI ID: {player.bgmiPlayerId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Terms Tab ────────────────────────────────────────────────────────────────
function TermsTab() {
  const { data: terms } = useGetTermsAndConditions();
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
      alert(err?.message || 'Failed to save');
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-orbitron font-bold text-white text-base">Terms & Conditions</h2>
      <div className="bg-brand-dark border border-brand-red/20 rounded-xl p-5">
        <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          placeholder="Enter terms and conditions content..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm resize-none font-mono"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={updateTerms.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {updateTerms.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────
function SupportTab() {
  const { data: tickets = [], isLoading } = useGetAllSupportTickets();
  const replyMutation = useReplyToSupportTicket();
  const closeMutation = useCloseSupportTicket();
  const [replyForm, setReplyForm] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleReply = async (ticketId: string) => {
    const reply = replyForm[ticketId];
    if (!reply?.trim()) return;
    try {
      await replyMutation.mutateAsync({ ticketId, reply });
      setReplyForm((f) => ({ ...f, [ticketId]: '' }));
    } catch (err: any) {
      alert(err?.message || 'Failed to send reply');
    }
  };

  const ticketStatusColor: Record<TicketStatus, string> = {
    [TicketStatus.open]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [TicketStatus.replied]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [TicketStatus.closed]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="space-y-5">
      <h2 className="font-orbitron font-bold text-white text-base">Support Tickets ({tickets.length})</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No support tickets yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.ticketId} className="bg-brand-dark border border-brand-red/20 rounded-xl overflow-hidden">
              <div
                className="flex items-start justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === ticket.ticketId ? null : ticket.ticketId)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm">{ticket.subject}</p>
                  <p className="text-gray-500 text-xs mt-0.5">By: {ticket.playerName}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ticketStatusColor[ticket.status]}`}>
                    {ticket.status}
                  </span>
                  {expandedId === ticket.ticketId ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </div>

              {expandedId === ticket.ticketId && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  <p className="text-gray-300 text-sm">{ticket.description}</p>
                  {ticket.adminReply && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-xs text-green-400 font-medium mb-1">Admin Reply:</p>
                      <p className="text-gray-300 text-sm">{ticket.adminReply}</p>
                    </div>
                  )}
                  {ticket.status !== TicketStatus.closed && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyForm[ticket.ticketId] || ''}
                        onChange={(e) => setReplyForm((f) => ({ ...f, [ticket.ticketId]: e.target.value }))}
                        placeholder="Type your reply..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-red/60"
                      />
                      <button
                        onClick={() => handleReply(ticket.ticketId)}
                        disabled={replyMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-red to-brand-orange text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => closeMutation.mutate(ticket.ticketId)}
                        disabled={closeMutation.isPending}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs rounded-lg transition-all disabled:opacity-60"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Social Tab ───────────────────────────────────────────────────────────────
function SocialTab() {
  const { data: socialLinks } = useGetSocialLinks();
  const updateSocial = useUpdateSocialLinks();
  const [form, setForm] = useState({ youtube: '', instagram: '', telegram: '' });
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (socialLinks) {
      setForm({
        youtube: socialLinks.youtube || '',
        instagram: socialLinks.instagram || '',
        telegram: socialLinks.telegram || '',
      });
    }
  }, [socialLinks]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSocial.mutateAsync(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save');
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red/60 transition-all text-sm';

  return (
    <div className="space-y-5">
      <h2 className="font-orbitron font-bold text-white text-base">Social Links</h2>
      <div className="bg-brand-dark border border-brand-red/20 rounded-xl p-5 max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">YouTube URL</label>
            <input
              type="url"
              value={form.youtube}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              placeholder="https://youtube.com/@channel"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Instagram URL</label>
            <input
              type="url"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="https://instagram.com/username"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Telegram URL</label>
            <input
              type="url"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              placeholder="https://t.me/channel"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={updateSocial.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-red to-brand-orange text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {updateSocial.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              'Save Social Links'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
