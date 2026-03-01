import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAllTournaments, useAllSupportTickets, useCreateSupportTicket } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Trophy, Ticket, Upload, Loader2, AlertCircle, ChevronRight, X, Key } from 'lucide-react';
import { ExternalBlob, TicketStatus, type SupportTicket } from '../backend';

function formatDate(time: bigint): string {
    const ms = Number(time) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
    const config = {
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

function TicketDetail({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'oklch(0 0 0 / 0.8)' }}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto clip-angular" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.90 0.01 80)' }}>{ticket.subject}</h3>
                            <p className="font-rajdhani text-xs mt-1" style={{ color: 'oklch(0.45 0.02 60)' }}>{formatDate(ticket.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TicketStatusBadge status={ticket.status} />
                            <button onClick={onClose} style={{ color: 'oklch(0.55 0.02 60)' }}>
                                <X className="w-5 h-5" />
                            </button>
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
                    {ticket.adminReply && (
                        <div className="p-3 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.08)', border: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
                            <p className="font-saira text-xs tracking-widest uppercase mb-2" style={{ color: 'oklch(0.65 0.22 45)' }}>Admin Reply</p>
                            <p className="font-rajdhani text-sm whitespace-pre-wrap" style={{ color: 'oklch(0.80 0.01 80)' }}>{ticket.adminReply}</p>
                            {ticket.repliedAt && (
                                <p className="font-rajdhani text-xs mt-2" style={{ color: 'oklch(0.45 0.02 60)' }}>{formatDate(ticket.repliedAt)}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { player } = useAuth();
    const { data: tournaments, isLoading: tournamentsLoading } = useAllTournaments();
    const { data: allTickets, isLoading: ticketsLoading } = useAllSupportTickets();
    const createTicketMutation = useCreateSupportTicket();

    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');
    const [ticketScreenshot, setTicketScreenshot] = useState<File | null>(null);
    const [ticketError, setTicketError] = useState('');
    const [ticketSuccess, setTicketSuccess] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter tickets for this player
    const myTickets = allTickets?.filter(t => t.playerId === player?.mobile || t.playerName === player?.displayName) || [];

    const handleCreateTicket = async () => {
        if (!ticketSubject.trim()) { setTicketError('Please enter a subject.'); return; }
        if (!ticketDescription.trim()) { setTicketError('Please enter a description.'); return; }
        setTicketError('');
        try {
            let screenshotBlob: ExternalBlob | null = null;
            if (ticketScreenshot) {
                const bytes = new Uint8Array(await ticketScreenshot.arrayBuffer());
                screenshotBlob = ExternalBlob.fromBytes(bytes);
            }
            await createTicketMutation.mutateAsync({
                playerId: player?.mobile || '',
                playerName: player?.displayName || '',
                subject: ticketSubject.trim(),
                description: ticketDescription.trim(),
                screenshotBlob,
            });
            setTicketSubject('');
            setTicketDescription('');
            setTicketScreenshot(null);
            setTicketSuccess(true);
            setTimeout(() => setTicketSuccess(false), 3000);
        } catch (err: unknown) {
            setTicketError('Failed to create ticket. Please try again.');
        }
    };

    return (
        <div className="min-h-screen px-4 py-12" style={{ background: 'oklch(0.10 0 0)' }}>
            <div className="container mx-auto max-w-4xl">
                {/* Profile Header */}
                <div className="mb-8 p-6 clip-angular" style={{ background: 'linear-gradient(135deg, oklch(0.13 0 0), oklch(0.15 0.01 50))', border: '1px solid oklch(0.65 0.22 45 / 0.3)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                            <User className="w-8 h-8" style={{ color: 'oklch(0.65 0.22 45)' }} />
                        </div>
                        <div>
                            <h1 className="font-orbitron text-xl font-black" style={{ color: 'oklch(0.90 0.01 80)' }}>
                                {player?.displayName || player?.mobile}
                            </h1>
                            {player?.bgmiPlayerId && (
                                <p className="font-saira text-sm tracking-wider" style={{ color: 'oklch(0.65 0.22 45)' }}>
                                    BGMI ID: {player.bgmiPlayerId}
                                </p>
                            )}
                            <p className="font-rajdhani text-xs" style={{ color: 'oklch(0.45 0.02 60)' }}>
                                Mobile: {player?.mobile}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="tournaments">
                    <TabsList className="w-full mb-6 rounded-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                        <TabsTrigger value="tournaments" className="flex-1 font-saira text-xs tracking-widest uppercase data-[state=active]:text-black" style={{ '--tw-ring-color': 'oklch(0.65 0.22 45)' } as React.CSSProperties}>
                            <Trophy className="w-4 h-4 mr-2" />
                            Tournaments
                        </TabsTrigger>
                        <TabsTrigger value="support" className="flex-1 font-saira text-xs tracking-widest uppercase data-[state=active]:text-black">
                            <Ticket className="w-4 h-4 mr-2" />
                            Support
                        </TabsTrigger>
                    </TabsList>

                    {/* Tournaments Tab */}
                    <TabsContent value="tournaments">
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-base font-bold" style={{ color: 'oklch(0.75 0.18 85)' }}>MY REGISTRATIONS</h2>
                            {tournamentsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <Skeleton key={i} className="h-24" style={{ background: 'oklch(0.15 0 0)' }} />)}
                                </div>
                            ) : !tournaments || tournaments.length === 0 ? (
                                <div className="text-center py-12 p-6 rounded-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                                    <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                    <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>No tournament registrations yet.</p>
                                    <p className="font-rajdhani text-sm mt-1" style={{ color: 'oklch(0.35 0.02 50)' }}>Browse tournaments and register to compete!</p>
                                </div>
                            ) : (
                                tournaments.map((t) => (
                                    <div key={t.id} className="p-4 rounded-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h3 className="font-orbitron text-sm font-bold" style={{ color: 'oklch(0.90 0.01 80)' }}>{t.name}</h3>
                                            <span className="shrink-0 px-2 py-0.5 font-saira text-xs tracking-wider uppercase rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.15)', border: '1px solid oklch(0.65 0.22 45 / 0.4)', color: 'oklch(0.65 0.22 45)' }}>
                                                Pending
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Map: </span>
                                                <span className="font-rajdhani" style={{ color: 'oklch(0.75 0.01 80)' }}>{t.map}</span>
                                            </div>
                                            <div>
                                                <span className="font-saira text-xs tracking-wider uppercase" style={{ color: 'oklch(0.45 0.02 60)' }}>Prize: </span>
                                                <span className="font-rajdhani font-semibold" style={{ color: 'oklch(0.75 0.18 85)' }}>₹{t.prizePool.toString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Support Tab */}
                    <TabsContent value="support">
                        <div className="space-y-6">
                            {/* Create Ticket Form */}
                            <div className="p-5 rounded-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                                <h2 className="font-orbitron text-base font-bold mb-4" style={{ color: 'oklch(0.75 0.18 85)' }}>CREATE SUPPORT TICKET</h2>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Subject</Label>
                                        <Input
                                            placeholder="Brief description of your issue"
                                            value={ticketSubject}
                                            onChange={(e) => setTicketSubject(e.target.value)}
                                            className="font-rajdhani"
                                            style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Description</Label>
                                        <Textarea
                                            placeholder="Describe your issue in detail..."
                                            value={ticketDescription}
                                            onChange={(e) => setTicketDescription(e.target.value)}
                                            rows={4}
                                            className="font-rajdhani resize-none"
                                            style={{ background: 'oklch(0.16 0 0)', border: '1px solid oklch(0.28 0.02 50)', color: 'oklch(0.90 0.01 80)' }}
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-saira text-xs tracking-widest uppercase mb-2 block" style={{ color: 'oklch(0.55 0.02 60)' }}>Screenshot (Optional)</Label>
                                        <div
                                            className="border-2 border-dashed rounded-sm p-3 text-center cursor-pointer"
                                            style={{ borderColor: ticketScreenshot ? 'oklch(0.65 0.22 45)' : 'oklch(0.28 0.02 50)', background: 'oklch(0.13 0 0)' }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {ticketScreenshot ? (
                                                <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>{ticketScreenshot.name}</p>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Upload className="w-4 h-4" style={{ color: 'oklch(0.45 0.02 60)' }} />
                                                    <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.45 0.02 60)' }}>Click to upload screenshot</p>
                                                </div>
                                            )}
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setTicketScreenshot(e.target.files?.[0] || null)} />
                                        </div>
                                    </div>
                                    {ticketError && (
                                        <div className="flex items-center gap-2 p-3 rounded-sm" style={{ background: 'oklch(0.18 0.08 25)', border: '1px solid oklch(0.45 0.22 25)' }}>
                                            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.70 0.22 25)' }} />
                                            <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.80 0.10 25)' }}>{ticketError}</p>
                                        </div>
                                    )}
                                    {ticketSuccess && (
                                        <div className="p-3 rounded-sm" style={{ background: 'oklch(0.65 0.22 45 / 0.1)', border: '1px solid oklch(0.65 0.22 45 / 0.4)' }}>
                                            <p className="font-rajdhani text-sm" style={{ color: 'oklch(0.65 0.22 45)' }}>✓ Ticket submitted successfully!</p>
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleCreateTicket}
                                        disabled={createTicketMutation.isPending}
                                        className="w-full font-saira tracking-widest uppercase font-bold"
                                        style={{ background: 'oklch(0.65 0.22 45)', color: 'oklch(0.08 0 0)' }}
                                    >
                                        {createTicketMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Ticket'}
                                    </Button>
                                </div>
                            </div>

                            {/* Ticket List */}
                            <div>
                                <h2 className="font-orbitron text-base font-bold mb-4" style={{ color: 'oklch(0.75 0.18 85)' }}>MY TICKETS</h2>
                                {ticketsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2].map(i => <Skeleton key={i} className="h-16" style={{ background: 'oklch(0.15 0 0)' }} />)}
                                    </div>
                                ) : myTickets.length === 0 ? (
                                    <div className="text-center py-8 rounded-sm" style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}>
                                        <Ticket className="w-10 h-10 mx-auto mb-2" style={{ color: 'oklch(0.30 0.02 50)' }} />
                                        <p className="font-rajdhani" style={{ color: 'oklch(0.45 0.02 60)' }}>No support tickets yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myTickets.map((ticket) => (
                                            <button
                                                key={ticket.ticketId}
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="w-full text-left p-4 rounded-sm transition-colors hover:border-orange-DEFAULT"
                                                style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.22 0.02 50)' }}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-rajdhani font-semibold truncate" style={{ color: 'oklch(0.85 0.01 80)' }}>{ticket.subject}</p>
                                                        <p className="font-rajdhani text-xs mt-0.5" style={{ color: 'oklch(0.45 0.02 60)' }}>{formatDate(ticket.createdAt)}</p>
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
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {selectedTicket && (
                <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
            )}
        </div>
    );
}
