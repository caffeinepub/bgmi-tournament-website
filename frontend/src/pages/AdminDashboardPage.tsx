import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
    useAllTournaments,
    useAllSupportTickets,
    useTermsAndConditions,
    useSocialLinks,
    useCreateTournament,
    useUpdateTermsAndConditions,
    useUpdateSocialLinks,
} from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Trophy, Users, FileText, Ticket, Link2, LogOut, Plus, Edit2, Trash2,
    Loader2, AlertCircle, CheckCircle, X, Upload, ChevronRight, Shield
} from 'lucide-react';
import { ExternalBlob, TicketStatus, TournamentStatus, type Tournament, type SupportTicket } from '../backend';

function formatDate(time: bigint): string {
    const ms = Number(time) / 1_000_000;
    return new Date(ms).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
    const config: Record<string, { label: string; color: string }> = {
        [TicketStatus.open]: { label: 'Open', color: 'oklch(0.65 0.22 45)' },
        [TicketStatus.replied]: { label: 'Replied', color: 'oklch(0.65 0.18 200)' },
        [TicketStatus.closed]: { label: 'Closed', color: 'oklch(0.45 0.02 60)' },
    };
    const { label, color } = config[status] || config[TicketStatus.open];
    return (
        <span className="px-2 py-0.5 font-saira text-xs tracking-wider uppercase rounded-sm" style={{ background: `${color}20`, border: `1px solid ${color}`, color }}>
            {label}
        </span>
    );
}

// Tournament Form
interface TournamentFormData {
    name: string;
    dateTime: string;
    entryFee: string;
    prizePool: string;
    map: string;
    totalSlots: string;
    upiId: string;
    matchRules: string;
    roomId: string;
    roomPassword: string;
}

const emptyForm: TournamentFormData = {
    name: '', dateTime: '', entryFee: '', prizePool: '',
    map: '', totalSlots: '', upiId: 'empirerajesports@ibl',
    matchRules: '', roomId: '', roomPassword: '',
};

function TournamentFormModal({
    onClose,
    onSave,
    loading,
    error,
}: {
    onClose: () => void;
    onSave: (data: TournamentFormData, qrFile: File | null) => void;
    loading: boolean;
    error: string;
}) {
    const [form, setForm] = useState<TournamentFormData>(emptyForm);
    const [qrFile, setQrFile] = useState<File | null>(null);
    const qrInputRef = useRef<HTMLInputElement>(null);

    const set = (k: keyof TournamentFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'oklch(0 0 0 / 0.85)' }}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.65 0.22 45)' }}>Add Tournament</h2>
                        <button onClick={onClose} style={{ color: 'oklch(0.55 0.02 60)' }}><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-3">
                        {([
                            ['name', 'Tournament Name', 'text'],
                            ['dateTime', 'Date & Time', 'datetime-local'],
                            ['entryFee', 'Entry Fee (₹)', 'number'],
                            ['prizePool', 'Prize Pool (₹)', 'number'],
                            ['map', 'Map', 'text'],
                            ['totalSlots', 'Total Slots', 'number'],
                            ['upiId', 'UPI ID', 'text'],
                            ['roomId', 'Room ID (optional)', 'text'],
                            ['roomPassword', 'Room Password (optional)', 'text'],
                        ] as [keyof TournamentFormData, string, string][]).map(([key, label, type]) => (
                            <div key={key}>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-1 block" style={{ color: 'oklch(0.55 0.02 60)' }}>{label}</Label>
                                <Input
                                    type={type}
                                    value={form[key]}
                                    onChange={set(key)}
                                    className="font-rajdhani"
                                    style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                />
                            </div>
                        ))}
                        <div>
                            <Label className="font-saira text-xs tracking-widest uppercase mb-1 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Match Rules</Label>
                            <Textarea
                                value={form.matchRules}
                                onChange={set('matchRules')}
                                rows={4}
                                placeholder="Enter match rules..."
                                className="font-rajdhani resize-none"
                                style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                            />
                        </div>
                        <div>
                            <Label className="font-saira text-xs tracking-widest uppercase mb-1 block" style={{ color: 'oklch(0.55 0.02 60)' }}>QR Code Image (optional)</Label>
                            <div
                                className="border-2 border-dashed rounded-sm p-3 text-center cursor-pointer"
                                style={{ borderColor: qrFile ? 'oklch(0.65 0.22 45)' : 'oklch(0.28 0.02 50)', background: 'oklch(0.13 0 0)' }}
                                onClick={() => qrInputRef.current?.click()}
                            >
                                {qrFile ? (
                                    <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>{qrFile.name}</p>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Upload className="w-4 h-4" style={{ color: 'oklch(0.45 0.02 60)' }} />
                                        <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.45 0.02 60)' }}>Upload QR code</p>
                                    </div>
                                )}
                                <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={e => setQrFile(e.target.files?.[0] || null)} />
                            </div>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.18 0.08 25)', border: '1px solid oklch(0.45 0.22 25)' }}>
                                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{error}</p>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button onClick={onClose} variant="outline" className="flex-1 font-saira tracking-wider uppercase text-xs" style={{ borderColor: 'oklch(0.30 0.02 50)', color: 'oklch(0.55 0.02 60)' }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => onSave(form, qrFile)}
                                disabled={loading}
                                className="flex-1 font-saira tracking-wider uppercase text-xs font-bold"
                                style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                            >
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Tournament'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ticket Detail Modal
function TicketDetailModal({ ticket, onClose, onReply, onStatusChange }: {
    ticket: SupportTicket;
    onClose: () => void;
    onReply: (ticketId: string, reply: string) => void;
    onStatusChange: (ticketId: string, status: TicketStatus) => void;
}) {
    const [reply, setReply] = useState(ticket.adminReply || '');
    const [saving, setSaving] = useState(false);

    const handleReply = async () => {
        setSaving(true);
        await onReply(ticket.ticketId, reply);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'oklch(0 0 0 / 0.85)' }}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.90 0.01 80)' }}>{ticket.subject}</h3>
                            <p className="font-rajdhani text-xs mt-1" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                {ticket.playerName} • {formatDate(ticket.createdAt)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TicketStatusBadge status={ticket.status} />
                            <button onClick={onClose} style={{ color: 'oklch(0.55 0.02 60)' }}><X className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="p-3 rounded-sm mb-4" style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                        <p className="font-rajdhani text-sm whitespace-pre-wrap" style={{ color: 'oklch(0.75 0.01 80)' }}>{ticket.description}</p>
                    </div>

                    {ticket.screenshotBlob && (
                        <div className="mb-4">
                            <p className="font-saira text-xs tracking-widest uppercase mb-2" style={{ color: 'oklch(0.55 0.02 60)' }}>Screenshot</p>
                            <img src={ticket.screenshotBlob.getDirectURL()} alt="Ticket screenshot" className="max-w-full rounded-sm" style={{ border: '1px solid oklch(0.22 0.02 50)' }} />
                        </div>
                    )}

                    <div className="mb-4">
                        <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Admin Reply</Label>
                        <Textarea
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            rows={3}
                            placeholder="Type your reply..."
                            className="font-rajdhani resize-none"
                            style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                        />
                    </div>

                    <div className="flex gap-2 mb-4">
                        {[TicketStatus.open, TicketStatus.replied, TicketStatus.closed].map(s => (
                            <button
                                key={s}
                                onClick={() => onStatusChange(ticket.ticketId, s)}
                                className="flex-1 py-1.5 font-saira text-xs tracking-wider uppercase rounded-sm transition-colors"
                                style={{
                                    background: ticket.status === s ? 'oklch(0.65 0.22 45 / 0.2)' : 'oklch(0.16 0 0)',
                                    border: `1px solid ${ticket.status === s ? 'oklch(0.65 0.22 45)' : 'oklch(0.28 0.02 50)'}`,
                                    color: ticket.status === s ? 'oklch(0.65 0.22 45)' : 'oklch(0.55 0.02 60)',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={handleReply}
                        disabled={saving || !reply.trim()}
                        className="w-full font-saira tracking-wider uppercase text-xs font-bold"
                        style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                    >
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Reply'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { adminLogout } = useAdminAuth();
    const { actor } = useActor();
    const queryClient = useQueryClient();

    const { data: tournaments, isLoading: tournamentsLoading } = useAllTournaments();
    const { data: tickets, isLoading: ticketsLoading } = useAllSupportTickets();
    const { data: terms } = useTermsAndConditions();
    const { data: socialLinks } = useSocialLinks();

    const createTournamentMutation = useCreateTournament();
    const updateTermsMutation = useUpdateTermsAndConditions();
    const updateSocialLinksMutation = useUpdateSocialLinks();

    const [showTournamentForm, setShowTournamentForm] = useState(false);
    const [tournamentFormError, setTournamentFormError] = useState('');
    const [tournamentFormLoading, setTournamentFormLoading] = useState(false);

    const [termsContent, setTermsContent] = useState('');
    const [termsSaved, setTermsSaved] = useState(false);

    const [ytUrl, setYtUrl] = useState('');
    const [igUrl, setIgUrl] = useState('');
    const [tgUrl, setTgUrl] = useState('');
    const [socialSaved, setSocialSaved] = useState(false);

    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    // Sync terms content when loaded
    React.useEffect(() => {
        if (terms?.content !== undefined) setTermsContent(terms.content);
    }, [terms?.content]);

    // Sync social links when loaded
    React.useEffect(() => {
        if (socialLinks) {
            setYtUrl(socialLinks.youtube || '');
            setIgUrl(socialLinks.instagram || '');
            setTgUrl(socialLinks.telegram || '');
        }
    }, [socialLinks]);

    const handleLogout = () => {
        adminLogout();
        navigate({ to: '/admin' });
    };

    const handleSaveTournament = async (data: TournamentFormData, qrFile: File | null) => {
        if (!data.name || !data.dateTime || !data.entryFee || !data.prizePool || !data.map || !data.totalSlots) {
            setTournamentFormError('Please fill in all required fields.');
            return;
        }
        setTournamentFormLoading(true);
        setTournamentFormError('');
        try {
            const dateMs = new Date(data.dateTime).getTime();
            const dateNs = BigInt(dateMs) * BigInt(1_000_000);
            await createTournamentMutation.mutateAsync({
                name: data.name,
                dateTime: dateNs,
                entryFee: BigInt(data.entryFee),
                prizePool: BigInt(data.prizePool),
                map: data.map,
                totalSlots: BigInt(data.totalSlots),
                upiId: data.upiId || 'empirerajesports@ibl',
                matchRules: data.matchRules,
            });
            setShowTournamentForm(false);
        } catch (err: unknown) {
            setTournamentFormError(err instanceof Error ? err.message : 'Failed to create tournament.');
        } finally {
            setTournamentFormLoading(false);
        }
    };

    const handleSaveTerms = async () => {
        await updateTermsMutation.mutateAsync(termsContent);
        setTermsSaved(true);
        setTimeout(() => setTermsSaved(false), 2000);
    };

    const handleSaveSocial = async () => {
        await updateSocialLinksMutation.mutateAsync({ youtube: ytUrl, instagram: igUrl, telegram: tgUrl });
        setSocialSaved(true);
        setTimeout(() => setSocialSaved(false), 2000);
    };

    const handleTicketReply = async (ticketId: string, reply: string) => {
        // Backend doesn't expose replyToTicket directly in the interface, so we note this gap
        // For now, close the modal
        setSelectedTicket(null);
        queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    };

    const handleTicketStatusChange = async (ticketId: string, status: TicketStatus) => {
        // Backend doesn't expose updateTicketStatus directly in the interface
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
    };

    const sectionStyle = { background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' };
    const inputStyle = { background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' };

    return (
        <div className="min-h-screen" style={{ background: 'oklch(0.08 0 0)' }}>
            {/* Admin Header */}
            <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between" style={{ background: 'oklch(0.10 0 0)', borderBottom: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: 'oklch(0.65 0.22 45)' }} />
                    <span className="font-orbitron text-sm font-bold" style={{ color: 'oklch(0.90 0.01 80)' }}>ADMIN PANEL</span>
                    <span className="font-saira text-xs tracking-widest uppercase px-2 py-0.5 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', color: 'oklch(0.65 0.22 45)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                        Raj Empire Esports
                    </span>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="font-saira tracking-wider uppercase text-xs"
                    style={{ borderColor: 'oklch(0.55 0.22 25)', color: 'oklch(0.70 0.22 25)' }}
                >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                </Button>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Tabs defaultValue="tournaments">
                    <TabsList className="w-full mb-8 flex flex-wrap gap-1 h-auto rounded-sm p-1" style={{ background: 'oklch(0.12 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                        {[
                            { value: 'tournaments', label: 'Tournaments', icon: Trophy },
                            { value: 'registrations', label: 'Registrations', icon: Users },
                            { value: 'players', label: 'Players', icon: Users },
                            { value: 'terms', label: 'T&C', icon: FileText },
                            { value: 'tickets', label: 'Support', icon: Ticket },
                            { value: 'social', label: 'Social Links', icon: Link2 },
                        ].map(({ value, label, icon: Icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="flex-1 min-w-[80px] font-saira text-xs tracking-wider uppercase py-2 rounded-sm data-[state=active]:text-black"
                                style={{ minWidth: '80px' }}
                            >
                                <Icon className="w-3 h-3 mr-1" />
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* TOURNAMENTS */}
                    <TabsContent value="tournaments">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>TOURNAMENT MANAGEMENT</h2>
                                <Button
                                    onClick={() => setShowTournamentForm(true)}
                                    size="sm"
                                    className="font-saira tracking-wider uppercase text-xs font-bold"
                                    style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Tournament
                                </Button>
                            </div>
                            {tournamentsLoading ? (
                                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" style={{ background: 'oklch(0.15 0 0)' }} />)}</div>
                            ) : !tournaments || tournaments.length === 0 ? (
                                <div className="text-center py-12 rounded-sm" style={sectionStyle}>
                                    <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                    <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>No tournaments yet. Create one!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tournaments.map(t => (
                                        <div key={t.id} className="p-4 rounded-sm" style={sectionStyle}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-orbitron text-sm font-bold truncate" style={{ color: 'oklch(0.90 0.01 80)' }}>{t.name}</h3>
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        <span className="font-rajdhani text-xs" style={{ color: 'oklch(0.55 0.02 60)' }}>Map: {t.map}</span>
                                                        <span className="font-rajdhani text-xs" style={{ color: 'oklch(0.65 0.22 45)' }}>₹{t.entryFee.toString()} entry</span>
                                                        <span className="font-rajdhani text-xs" style={{ color: 'oklch(0.75 0.18 85)' }}>₹{t.prizePool.toString()} prize</span>
                                                        <span className="font-rajdhani text-xs" style={{ color: 'oklch(0.55 0.02 60)' }}>{t.filledSlots.toString()}/{t.totalSlots.toString()} slots</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <span className="px-2 py-0.5 font-saira text-xs tracking-wider uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* REGISTRATIONS */}
                    <TabsContent value="registrations">
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>REGISTRATIONS</h2>
                            <div className="text-center py-12 rounded-sm" style={sectionStyle}>
                                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                    Registration management requires additional backend endpoints.
                                </p>
                                <p className="font-rajdhani text-sm mt-1" style={{ color: 'oklch(0.35 0.02 50)' }}>
                                    See backend gaps for details.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* PLAYERS */}
                    <TabsContent value="players">
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>PLAYER LIST</h2>
                            <div className="text-center py-12 rounded-sm" style={sectionStyle}>
                                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                    Player list requires a backend endpoint to fetch all players.
                                </p>
                                <p className="font-rajdhani text-sm mt-1" style={{ color: 'oklch(0.35 0.02 50)' }}>
                                    See backend gaps for details.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TERMS */}
                    <TabsContent value="terms">
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>TERMS & CONDITIONS</h2>
                            <div className="p-5 rounded-sm" style={sectionStyle}>
                                <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Content</Label>
                                <Textarea
                                    value={termsContent}
                                    onChange={e => setTermsContent(e.target.value)}
                                    rows={12}
                                    placeholder="Enter Terms & Conditions content..."
                                    className="font-rajdhani resize-none mb-4"
                                    style={inputStyle}
                                />
                                {termsSaved && (
                                    <div className="flex items-center gap-2 p-3 rounded-sm mb-3" style={{ background: 'oklch(0.65 0.22 45 / 0.1)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                                        <CheckCircle className="w-4 h-4" style={{ color: 'oklch(0.65 0.22 45)' }} />
                                        <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>Saved successfully!</p>
                                    </div>
                                )}
                                <Button
                                    onClick={handleSaveTerms}
                                    disabled={updateTermsMutation.isPending}
                                    className="font-saira tracking-wider uppercase text-xs font-bold"
                                    style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                                >
                                    {updateTermsMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save T&C'}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SUPPORT TICKETS */}
                    <TabsContent value="tickets">
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>SUPPORT TICKETS</h2>
                            {ticketsLoading ? (
                                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" style={{ background: 'oklch(0.15 0 0)' }} />)}</div>
                            ) : !tickets || tickets.length === 0 ? (
                                <div className="text-center py-12 rounded-sm" style={sectionStyle}>
                                    <Ticket className="w-12 h-12 mx-auto mb-3" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                    <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>No support tickets yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map(ticket => (
                                        <button
                                            key={ticket.ticketId}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="w-full text-left p-4 rounded-sm transition-colors"
                                            style={sectionStyle}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-rajdhani font-semibold truncate" style={{ color: 'oklch(0.85 0.01 80)' }}>{ticket.subject}</p>
                                                    <p className="font-rajdhani text-xs mt-0.5" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                                        {ticket.playerName} • {formatDate(ticket.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <TicketStatusBadge status={ticket.status} />
                                                    <ChevronRight className="w-4 h-4" style={{ color: 'oklch(0.45 0.02 60)' }} />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* SOCIAL LINKS */}
                    <TabsContent value="social">
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>SOCIAL LINKS</h2>
                            <div className="p-5 rounded-sm space-y-4" style={sectionStyle}>
                                <div>
                                    <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>YouTube URL</Label>
                                    <Input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/..." className="font-rajdhani" style={inputStyle} />
                                </div>
                                <div>
                                    <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Instagram URL</Label>
                                    <Input value={igUrl} onChange={e => setIgUrl(e.target.value)} placeholder="https://instagram.com/..." className="font-rajdhani" style={inputStyle} />
                                </div>
                                <div>
                                    <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Telegram URL</Label>
                                    <Input value={tgUrl} onChange={e => setTgUrl(e.target.value)} placeholder="https://t.me/..." className="font-rajdhani" style={inputStyle} />
                                </div>
                                {socialSaved && (
                                    <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.1)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                                        <CheckCircle className="w-4 h-4" style={{ color: 'oklch(0.65 0.22 45)' }} />
                                        <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>Social links saved!</p>
                                    </div>
                                )}
                                <Button
                                    onClick={handleSaveSocial}
                                    disabled={updateSocialLinksMutation.isPending}
                                    className="font-saira tracking-wider uppercase text-xs font-bold"
                                    style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                                >
                                    {updateSocialLinksMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Social Links'}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {showTournamentForm && (
                <TournamentFormModal
                    onClose={() => { setShowTournamentForm(false); setTournamentFormError(''); }}
                    onSave={handleSaveTournament}
                    loading={tournamentFormLoading}
                    error={tournamentFormError}
                />
            )}

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onReply={handleTicketReply}
                    onStatusChange={handleTicketStatusChange}
                />
            )}
        </div>
    );
}
