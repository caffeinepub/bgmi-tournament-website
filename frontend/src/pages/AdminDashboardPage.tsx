import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Trophy,
  Users,
  FileText,
  MessageSquare,
  Link,
  ClipboardList,
  LogOut,
  X,
  Menu,
  Check,
  XCircle,
  CreditCard,
  Wallet,
  Youtube,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  useGetAllTournaments,
  useCreateTournament,
  useUpdateTournamentStatus,
  useUpdateTournamentRoomDetails,
  useUpdateTournamentYouTubeUrl,
  useGetAllRegistrations,
  useUpdateRegistrationStatus,
  useGetAllVerifiedUsers,
  useGetAllSupportTickets,
  useReplyToSupportTicket,
  useCloseSupportTicket,
  useGetSocialLinks,
  useUpdateSocialLinks,
  useGetTermsAndConditions,
  useUpdateTermsAndConditions,
  useGetAllPaymentProofs,
  useApprovePaymentProof,
  useRejectPaymentProof,
  useGetAllWithdrawalRequests,
  useMarkWithdrawalProcessed,
  useRejectWithdrawalRequest,
  useDistributePrizeCoins,
} from "../hooks/useQueries";
import { TournamentStatus } from "../backend";

const NAV_ITEMS = [
  { key: "tournaments", label: "Tournaments", icon: Trophy },
  { key: "registrations", label: "Registrations", icon: ClipboardList },
  { key: "players", label: "Players", icon: Users },
  { key: "paymentProofs", label: "Payment Proofs", icon: CreditCard },
  { key: "withdrawals", label: "Withdrawals", icon: Wallet },
  { key: "terms", label: "Terms & Conditions", icon: FileText },
  { key: "support", label: "Support Tickets", icon: MessageSquare },
  { key: "social", label: "Social Links", icon: Link },
];

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN");
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("tournaments");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex h-screen bg-brand-darker text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-0 overflow-hidden"} transition-all duration-300 bg-[#111] border-r border-white/10 flex flex-col flex-shrink-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="font-orbitron text-sm font-bold text-brand-orange">
              ADMIN PANEL
            </div>
            <div className="text-xs text-gray-400">Raj Empire Esports</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === key
                  ? "bg-brand-orange text-white font-semibold"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0d0d0d]">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`text-gray-400 hover:text-white ${sidebarOpen ? "opacity-0 pointer-events-none" : ""}`}
          >
            <Menu size={20} />
          </button>
          <div className="font-orbitron text-brand-orange text-sm font-bold">
            {NAV_ITEMS.find((n) => n.key === activeTab)?.label}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "tournaments" && <TournamentsTab />}
          {activeTab === "registrations" && <RegistrationsTab />}
          {activeTab === "players" && <PlayersTab />}
          {activeTab === "paymentProofs" && <PaymentProofsTab />}
          {activeTab === "withdrawals" && <WithdrawalsTab />}
          {activeTab === "terms" && <TermsTab />}
          {activeTab === "support" && <SupportTab />}
          {activeTab === "social" && <SocialTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Tournaments Tab ─────────────────────────────────────────────────────────

function TournamentsTab() {
  const { data: tournaments = [], isLoading } = useGetAllTournaments();
  const createTournament = useCreateTournament();
  const updateStatus = useUpdateTournamentStatus();
  const updateRoom = useUpdateTournamentRoomDetails();
  const updateYouTube = useUpdateTournamentYouTubeUrl();
  const distributePrize = useDistributePrizeCoins();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dateTime: "",
    entryFee: "",
    prizePool: "",
    map: "Erangel",
    totalSlots: "100",
    upiId: "",
    matchRules: "",
    youtubeUrl: "",
  });
  const [roomForms, setRoomForms] = useState<
    Record<string, { roomId: string; roomPassword: string }>
  >({});
  const [youtubeForms, setYoutubeForms] = useState<Record<string, string>>({});
  const [prizeForm, setPrizeForm] = useState<
    Record<string, { winnerUserId: string; prizeAmount: string }>
  >({});
  const [formError, setFormError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await createTournament.mutateAsync({
        name: form.name,
        dateTime: BigInt(
          new Date(form.dateTime || Date.now()).getTime() * 1_000_000
        ),
        entryFee: BigInt(form.entryFee || "0"),
        prizePool: BigInt(form.prizePool || "0"),
        map: form.map,
        totalSlots: BigInt(form.totalSlots || "100"),
        upiId: form.upiId,
        matchRules: form.matchRules,
        youtubeUrl: form.youtubeUrl.trim() || null,
      });
      setShowForm(false);
      setForm({
        name: "",
        dateTime: "",
        entryFee: "",
        prizePool: "",
        map: "Erangel",
        totalSlots: "100",
        upiId: "",
        matchRules: "",
        youtubeUrl: "",
      });
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create tournament"
      );
    }
  };

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500/20 text-blue-400",
    ongoing: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
    completed: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-orbitron text-brand-orange">
          Tournaments
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          + Create Tournament
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">
              Tournament Name
            </label>
            <input
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.dateTime}
              onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Map</label>
            <select
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.map}
              onChange={(e) => setForm({ ...form, map: e.target.value })}
            >
              {["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"].map(
                (m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Entry Fee (Coins)
            </label>
            <input
              type="number"
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.entryFee}
              onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Prize Pool (Coins)
            </label>
            <input
              type="number"
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.prizePool}
              onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Total Slots
            </label>
            <input
              type="number"
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.totalSlots}
              onChange={(e) =>
                setForm({ ...form, totalSlots: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">UPI ID</label>
            <input
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">
              YouTube URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form.youtubeUrl}
              onChange={(e) =>
                setForm({ ...form, youtubeUrl: e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">
              Match Rules
            </label>
            <textarea
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-20 resize-none"
              value={form.matchRules}
              onChange={(e) =>
                setForm({ ...form, matchRules: e.target.value })
              }
            />
          </div>
          {formError && (
            <div className="col-span-2 text-red-400 text-sm">{formError}</div>
          )}
          <div className="col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={createTournament.isPending}
              className="px-5 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {createTournament.isPending ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">
          Loading tournaments...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No tournaments created yet
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white">{t.name}</h3>
                  <p className="text-xs text-gray-400">
                    {formatDate(t.dateTime)} · {t.map}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[t.status as string] || "bg-gray-500/20 text-gray-400"}`}
                >
                  {t.status as string}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-sm mb-4">
                <div className="bg-[#222] rounded-lg p-2 text-center">
                  <div className="text-brand-orange font-bold">
                    {t.entryFee.toString()}
                  </div>
                  <div className="text-xs text-gray-400">Entry (Coins)</div>
                </div>
                <div className="bg-[#222] rounded-lg p-2 text-center">
                  <div className="text-green-400 font-bold">
                    {t.prizePool.toString()}
                  </div>
                  <div className="text-xs text-gray-400">Prize (Coins)</div>
                </div>
                <div className="bg-[#222] rounded-lg p-2 text-center">
                  <div className="text-white font-bold">
                    {t.filledSlots.toString()}/{t.totalSlots.toString()}
                  </div>
                  <div className="text-xs text-gray-400">Slots</div>
                </div>
                <div className="bg-[#222] rounded-lg p-2 text-center">
                  <div className="text-white font-bold text-xs truncate">
                    {t.roomId || "—"}
                  </div>
                  <div className="text-xs text-gray-400">Room ID</div>
                </div>
              </div>

              {/* Current YouTube URL display */}
              {t.youtubeUrl && (
                <div className="flex items-center gap-2 mb-3 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
                  <Youtube size={14} className="text-red-400 flex-shrink-0" />
                  <a
                    href={t.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-400 hover:text-red-300 truncate"
                  >
                    {t.youtubeUrl}
                  </a>
                </div>
              )}

              {/* Status update */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(
                  ["upcoming", "ongoing", "closed", "completed"] as const
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      updateStatus.mutate({
                        tournamentId: t.id,
                        status: s as TournamentStatus,
                      })
                    }
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      (t.status as string) === s
                        ? "border-brand-orange text-brand-orange"
                        : "border-white/20 text-gray-400 hover:border-white/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Room details */}
              <div className="flex gap-2 mb-3">
                <input
                  placeholder={t.roomId ? `Current: ${t.roomId}` : "Room ID"}
                  className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  value={roomForms[t.id]?.roomId ?? ""}
                  onChange={(e) =>
                    setRoomForms((prev) => ({
                      ...prev,
                      [t.id]: {
                        roomId: e.target.value,
                        roomPassword: prev[t.id]?.roomPassword ?? "",
                      },
                    }))
                  }
                />
                <input
                  placeholder={t.roomPassword ? `Current: ${t.roomPassword}` : "Room Password"}
                  className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  value={roomForms[t.id]?.roomPassword ?? ""}
                  onChange={(e) =>
                    setRoomForms((prev) => ({
                      ...prev,
                      [t.id]: {
                        roomId: prev[t.id]?.roomId ?? "",
                        roomPassword: e.target.value,
                      },
                    }))
                  }
                />
                <button
                  onClick={() =>
                    updateRoom.mutate({
                      tournamentId: t.id,
                      roomId: roomForms[t.id]?.roomId ?? "",
                      roomPassword: roomForms[t.id]?.roomPassword ?? "",
                    })
                  }
                  disabled={updateRoom.isPending}
                  className="px-3 py-1.5 bg-brand-orange text-white rounded-lg text-xs hover:bg-orange-600 disabled:opacity-50"
                >
                  Set Room
                </button>
              </div>

              {/* YouTube URL update */}
              <div className="flex gap-2 mb-3">
                <input
                  placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
                  className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  value={youtubeForms[t.id] ?? ""}
                  onChange={(e) =>
                    setYoutubeForms((prev) => ({
                      ...prev,
                      [t.id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() =>
                    updateYouTube.mutate({
                      tournamentId: t.id,
                      youtubeUrl: youtubeForms[t.id] ?? "",
                    })
                  }
                  disabled={updateYouTube.isPending}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 flex items-center gap-1 disabled:opacity-50"
                >
                  <Youtube size={12} />
                  Set URL
                </button>
              </div>

              {/* Prize distribution */}
              <div className="flex gap-2">
                <input
                  placeholder="Winner User ID (REE-001)"
                  className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  value={prizeForm[t.id]?.winnerUserId ?? ""}
                  onChange={(e) =>
                    setPrizeForm((prev) => ({
                      ...prev,
                      [t.id]: {
                        winnerUserId: e.target.value,
                        prizeAmount: prev[t.id]?.prizeAmount ?? "",
                      },
                    }))
                  }
                />
                <input
                  placeholder="Prize Amount"
                  type="number"
                  className="w-28 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  value={prizeForm[t.id]?.prizeAmount ?? ""}
                  onChange={(e) =>
                    setPrizeForm((prev) => ({
                      ...prev,
                      [t.id]: {
                        winnerUserId: prev[t.id]?.winnerUserId ?? "",
                        prizeAmount: e.target.value,
                      },
                    }))
                  }
                />
                <button
                  onClick={() =>
                    distributePrize.mutate({
                      tournamentId: t.id,
                      winnerUserId: prizeForm[t.id]?.winnerUserId ?? "",
                      prizeAmount: BigInt(prizeForm[t.id]?.prizeAmount || "0"),
                    })
                  }
                  disabled={distributePrize.isPending}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                >
                  Give Prize
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Registrations Tab ───────────────────────────────────────────────────────

function RegistrationsTab() {
  const { data: registrations = [], isLoading } = useGetAllRegistrations();
  const updateStatus = useUpdateRegistrationStatus();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Registrations ({registrations.length})
      </h2>
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading registrations...</div>
      ) : registrations.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No registrations yet</div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div
              key={r.registrationId}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {r.registrationId}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Player: <span className="text-brand-orange">{r.playerId}</span>
                  {" · "}
                  Tournament: <span className="text-gray-300 truncate">{r.tournamentId.slice(0, 30)}...</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    (r.status as string) === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : (r.status as string) === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {r.status as string}
                </span>
                {(r.status as string) === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus.mutate({
                          registrationId: r.registrationId,
                          status: "approved",
                        })
                      }
                      disabled={updateStatus.isPending}
                      className="p-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/40 transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() =>
                        updateStatus.mutate({
                          registrationId: r.registrationId,
                          status: "rejected",
                        })
                      }
                      disabled={updateStatus.isPending}
                      className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Players Tab ─────────────────────────────────────────────────────────────

function PlayersTab() {
  const { data: players = [], isLoading } = useGetAllVerifiedUsers();
  const [search, setSearch] = useState("");

  const filtered = players.filter(
    (p) =>
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.bgmiPlayerId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-orbitron text-brand-orange">
          Players ({players.length})
        </h2>
        <input
          placeholder="Search by name, ID, BGMI ID..."
          className="flex-1 max-w-xs bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading players...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No players found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-white">{p.displayName}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  ID: <span className="text-brand-orange font-mono">{p.id}</span>
                  {" · "}
                  BGMI: <span className="text-gray-300">{p.bgmiPlayerId}</span>
                  {" · "}
                  Mobile: <span className="text-gray-300">{p.mobile}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-sm">
                  🪙 {p.coinWallet.toString()}
                </div>
                <div className="text-xs text-gray-500">Coins</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payment Proofs Tab ───────────────────────────────────────────────────────

function PaymentProofsTab() {
  const { data: proofs = [], isLoading } = useGetAllPaymentProofs();
  const approve = useApprovePaymentProof();
  const reject = useRejectPaymentProof();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Payment Proofs ({proofs.length})
      </h2>
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading payment proofs...</div>
      ) : proofs.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No payment proofs yet</div>
      ) : (
        <div className="space-y-3">
          {[...proofs]
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map((proof) => (
              <div
                key={proof.proofId}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {proof.userId}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          (proof.status as string) === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : (proof.status as string) === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {proof.status as string}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Amount: <span className="text-brand-orange font-bold">₹{proof.amount.toString()}</span>
                      {" · "}
                      Ref: <span className="text-gray-300">{proof.transactionRef || "—"}</span>
                      {" · "}
                      {formatDate(proof.timestamp)}
                    </div>
                    {proof.imageBase64 && (
                      <img
                        src={proof.imageBase64}
                        alt="Payment proof"
                        className="mt-2 max-h-32 rounded-lg border border-white/10 object-contain"
                      />
                    )}
                  </div>
                  {(proof.status as string) === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => approve.mutate(proof.proofId)}
                        disabled={approve.isPending}
                        className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Check size={12} />
                        Approve
                      </button>
                      <button
                        onClick={() => reject.mutate(proof.proofId)}
                        disabled={reject.isPending}
                        className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs hover:bg-red-600/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Withdrawals Tab ──────────────────────────────────────────────────────────

function WithdrawalsTab() {
  const { data: requests = [], isLoading } = useGetAllWithdrawalRequests();
  const markProcessed = useMarkWithdrawalProcessed();
  const rejectRequest = useRejectWithdrawalRequest();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Withdrawal Requests ({requests.length})
      </h2>
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading withdrawal requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No withdrawal requests yet</div>
      ) : (
        <div className="space-y-3">
          {[...requests]
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map((req) => (
              <div
                key={req.requestId}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {req.userId}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        (req.status as string) === "processed"
                          ? "bg-green-500/20 text-green-400"
                          : (req.status as string) === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {req.status as string}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Amount: <span className="text-brand-orange font-bold">🪙 {req.amount.toString()} Coins</span>
                    {" · "}
                    UPI: <span className="text-gray-300">{req.upiId}</span>
                    {" · "}
                    {formatDate(req.timestamp)}
                  </div>
                </div>
                {(req.status as string) === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => markProcessed.mutate(req.requestId)}
                      disabled={markProcessed.isPending}
                      className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Check size={12} />
                      Processed
                    </button>
                    <button
                      onClick={() => rejectRequest.mutate(req.requestId)}
                      disabled={rejectRequest.isPending}
                      className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs hover:bg-red-600/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                )}
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
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (terms?.content) setContent(terms.content);
  }, [terms?.content]);

  const handleSave = async () => {
    try {
      await updateTerms.mutateAsync(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Terms & Conditions
      </h2>
      <textarea
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-80 resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter terms and conditions..."
      />
      <button
        onClick={handleSave}
        disabled={updateTerms.isPending}
        className="px-6 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {updateTerms.isPending ? "Saving..." : saved ? "Saved!" : "Save"}
      </button>
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────

function SupportTab() {
  const { data: tickets = [], isLoading } = useGetAllSupportTickets();
  const replyMutation = useReplyToSupportTicket();
  const closeMutation = useCloseSupportTicket();
  const [replyForms, setReplyForms] = useState<Record<string, string>>({});

  const openCount = tickets.filter((t) => (t.status as string) !== "closed").length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Support Tickets ({openCount} open)
      </h2>
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading support tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No support tickets yet</div>
      ) : (
        <div className="space-y-4">
          {[...tickets]
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
            .map((ticket) => (
              <div
                key={ticket.ticketId}
                className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{ticket.subject}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      From: <span className="text-brand-orange">{ticket.playerName}</span>
                      {" · "}
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                      (ticket.status as string) === "open"
                        ? "bg-blue-500/20 text-blue-400"
                        : (ticket.status as string) === "replied"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {ticket.status as string}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{ticket.description}</p>
                {ticket.adminReply && (
                  <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-3 mb-3">
                    <div className="text-xs text-brand-orange font-semibold mb-1">Admin Reply:</div>
                    <p className="text-sm text-gray-300">{ticket.adminReply}</p>
                  </div>
                )}
                {(ticket.status as string) !== "closed" && (
                  <div className="flex gap-2">
                    <input
                      placeholder="Type a reply..."
                      className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      value={replyForms[ticket.ticketId] ?? ""}
                      onChange={(e) =>
                        setReplyForms((prev) => ({
                          ...prev,
                          [ticket.ticketId]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() =>
                        replyMutation.mutate({
                          ticketId: ticket.ticketId,
                          reply: replyForms[ticket.ticketId] ?? "",
                        })
                      }
                      disabled={replyMutation.isPending}
                      className="px-3 py-1.5 bg-brand-orange text-white rounded-lg text-xs hover:bg-orange-600 disabled:opacity-50"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => closeMutation.mutate(ticket.ticketId)}
                      disabled={closeMutation.isPending}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700 disabled:opacity-50"
                    >
                      Close
                    </button>
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
  const { data: links } = useGetSocialLinks();
  const updateLinks = useUpdateSocialLinks();
  const [form, setForm] = useState({ youtube: "", instagram: "", telegram: "" });
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (links) setForm({ youtube: links.youtube, instagram: links.instagram, telegram: links.telegram });
  }, [links]);

  const handleSave = async () => {
    try {
      await updateLinks.mutateAsync(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Social Links
      </h2>
      <div className="space-y-4">
        {(["youtube", "instagram", "telegram"] as const).map((key) => (
          <div key={key}>
            <label className="text-xs text-gray-400 mb-1 block capitalize">
              {key}
            </label>
            <input
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={`https://${key}.com/...`}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={updateLinks.isPending}
        className="px-6 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {updateLinks.isPending ? "Saving..." : saved ? "Saved!" : "Save Links"}
      </button>
    </div>
  );
}
