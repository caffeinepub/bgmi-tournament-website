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
  Search,
  Check,
  XCircle,
  CreditCard,
  Wallet,
  Gift,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  useGetAllTournaments,
  useCreateTournament,
  useUpdateTournamentStatus,
  useUpdateTournamentRoomDetails,
  useGetRegistrationsForTournament,
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
import type { TournamentStatus } from "../backend";

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
  });
  const [roomForms, setRoomForms] = useState<
    Record<string, { roomId: string; roomPassword: string }>
  >({});
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
                  placeholder="Room ID"
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
                  placeholder="Room Password"
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
                  className="px-3 py-1.5 bg-brand-orange text-white rounded-lg text-xs hover:bg-orange-600"
                >
                  Set Room
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
                  type="number"
                  placeholder="Prize Coins"
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
                      prizeAmount: BigInt(
                        prizeForm[t.id]?.prizeAmount || "0"
                      ),
                    })
                  }
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700"
                >
                  <Gift size={12} />
                  Prize
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
  const { data: tournaments = [] } = useGetAllTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const { data: registrations = [], isLoading } =
    useGetRegistrationsForTournament(selectedTournamentId);
  const updateStatus = useUpdateRegistrationStatus();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Registrations
      </h2>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Select Tournament
        </label>
        <select
          className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full max-w-sm"
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
        >
          <option value="">-- Select --</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedTournamentId ? (
        <div className="text-center text-gray-500 py-12">
          Select a tournament to view registrations
        </div>
      ) : isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No registrations yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-left py-2 px-3">Registration ID</th>
                <th className="text-left py-2 px-3">Player ID</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr
                  key={r.registrationId}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-2 px-3 text-xs text-gray-300 font-mono">
                    {r.registrationId}
                  </td>
                  <td className="py-2 px-3 font-mono text-brand-orange">
                    {r.playerId}
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge status={r.status as string} />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateStatus.mutate({
                            registrationId: r.registrationId,
                            status: "approved",
                          })
                        }
                        className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded hover:bg-green-600/40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateStatus.mutate({
                            registrationId: r.registrationId,
                            status: "rejected",
                          })
                        }
                        className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Players Tab ─────────────────────────────────────────────────────────────

function PlayersTab() {
  const { data: verifiedUsers = [], isLoading } = useGetAllVerifiedUsers();
  const [search, setSearch] = useState("");

  const filtered = verifiedUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.bgmiPlayerId.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.mobile.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-orbitron text-brand-orange">
          Players ({verifiedUsers.length})
        </h2>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search by name, BGMI ID, User ID..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">
          Loading players...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          {verifiedUsers.length === 0
            ? "No players registered yet"
            : "No players match your search"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-left py-2 px-3">User ID</th>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3">BGMI ID</th>
                <th className="text-left py-2 px-3">Mobile</th>
                <th className="text-left py-2 px-3">Coins</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-2 px-3 font-mono text-brand-orange font-bold">
                    {u.id}
                  </td>
                  <td className="py-2 px-3 text-white">{u.displayName}</td>
                  <td className="py-2 px-3 text-gray-300">{u.bgmiPlayerId}</td>
                  <td className="py-2 px-3 text-gray-300">{u.mobile}</td>
                  <td className="py-2 px-3">
                    <span className="text-yellow-400 font-bold">
                      🪙 {u.coinWallet.toString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Payment Proofs Tab ──────────────────────────────────────────────────────

function PaymentProofsTab() {
  const { data: proofs = [], isLoading } = useGetAllPaymentProofs();
  const approve = useApprovePaymentProof();
  const reject = useRejectPaymentProof();
  const [viewImage, setViewImage] = useState<string | null>(null);

  const sorted = [...proofs].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Payment Proofs ({proofs.filter((p) => (p.status as string) === "pending").length}{" "}
        pending)
      </h2>

      {viewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-lg w-full">
            <img
              src={viewImage}
              alt="Payment proof"
              className="w-full rounded-xl"
            />
            <button
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              onClick={() => setViewImage(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No payment proofs submitted yet
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((p) => {
            const imgSrc = p.imageBase64
              ? p.imageBase64.startsWith("data:")
                ? p.imageBase64
                : `data:image/jpeg;base64,${p.imageBase64}`
              : null;
            return (
              <div
                key={p.proofId}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center gap-4"
              >
                {imgSrc && (
                  <button
                    onClick={() => setViewImage(imgSrc)}
                    className="flex-shrink-0"
                  >
                    <img
                      src={imgSrc}
                      alt="proof"
                      className="w-16 h-16 object-cover rounded-lg border border-white/10 hover:opacity-80 transition-opacity"
                    />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-brand-orange font-bold text-sm">
                      {p.userId}
                    </span>
                    <StatusBadge status={p.status as string} />
                  </div>
                  <div className="text-white font-bold">
                    ₹{p.amount.toString()} → 🪙 {p.amount.toString()} Coins
                  </div>
                  <div className="text-xs text-gray-400">
                    Ref: {p.transactionRef}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(p.timestamp)}
                  </div>
                </div>
                {(p.status as string) === "pending" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => approve.mutate(p.proofId)}
                      disabled={approve.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/40 disabled:opacity-50"
                    >
                      <Check size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => reject.mutate(p.proofId)}
                      disabled={reject.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs hover:bg-red-600/40 disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Withdrawals Tab ─────────────────────────────────────────────────────────

function WithdrawalsTab() {
  const { data: requests = [], isLoading } = useGetAllWithdrawalRequests();
  const markProcessed = useMarkWithdrawalProcessed();
  const rejectReq = useRejectWithdrawalRequest();

  const sorted = [...requests].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Withdrawal Requests (
        {requests.filter((r) => (r.status as string) === "pending").length}{" "}
        pending)
      </h2>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No withdrawal requests yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-left py-2 px-3">User ID</th>
                <th className="text-left py-2 px-3">UPI ID</th>
                <th className="text-left py-2 px-3">Amount (Coins)</th>
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr
                  key={r.requestId}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-2 px-3 font-mono text-brand-orange font-bold">
                    {r.userId}
                  </td>
                  <td className="py-2 px-3 text-white">{r.upiId}</td>
                  <td className="py-2 px-3 text-yellow-400 font-bold">
                    🪙 {r.amount.toString()}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-400">
                    {formatDate(r.timestamp)}
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge status={r.status as string} />
                  </td>
                  <td className="py-2 px-3">
                    {(r.status as string) === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => markProcessed.mutate(r.requestId)}
                          disabled={markProcessed.isPending}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded hover:bg-green-600/40 disabled:opacity-50"
                        >
                          <Check size={10} />
                          Processed
                        </button>
                        <button
                          onClick={() => rejectReq.mutate(r.requestId)}
                          disabled={rejectReq.isPending}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 disabled:opacity-50"
                        >
                          <XCircle size={10} />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Terms Tab ───────────────────────────────────────────────────────────────

function TermsTab() {
  const { data: terms } = useGetTermsAndConditions();
  const updateTerms = useUpdateTermsAndConditions();
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);

  React.useEffect(() => {
    if (terms) setContent(terms.content);
  }, [terms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-orbitron text-brand-orange">
          Terms & Conditions
        </h2>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {editing ? (
        <div className="space-y-3">
          <textarea
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-64 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={async () => {
              await updateTerms.mutateAsync(content);
              setEditing(false);
            }}
            disabled={updateTerms.isPending}
            className="px-5 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {updateTerms.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 text-sm text-gray-300 whitespace-pre-wrap min-h-32">
          {content || "No terms set yet."}
        </div>
      )}
    </div>
  );
}

// ─── Support Tab ─────────────────────────────────────────────────────────────

function SupportTab() {
  const { data: tickets = [], isLoading } = useGetAllSupportTickets();
  const reply = useReplyToSupportTicket();
  const close = useCloseSupportTicket();
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    open: "bg-blue-500/20 text-blue-400",
    replied: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Support Tickets (
        {tickets.filter((t) => (t.status as string) === "open").length} open)
      </h2>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No support tickets yet
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.ticketId}
              className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5"
                onClick={() =>
                  setExpandedId(
                    expandedId === t.ticketId ? null : t.ticketId
                  )
                }
              >
                <div>
                  <div className="font-semibold text-white">{t.subject}</div>
                  <div className="text-xs text-gray-400">
                    {t.playerName} · {formatDate(t.createdAt)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[t.status as string] || ""}`}
                >
                  {t.status as string}
                </span>
              </button>

              {expandedId === t.ticketId && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                  <p className="text-sm text-gray-300">{t.description}</p>
                  {t.adminReply && (
                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">
                        Admin Reply
                      </div>
                      <p className="text-sm text-gray-300">{t.adminReply}</p>
                    </div>
                  )}
                  {(t.status as string) !== "closed" && (
                    <div className="flex gap-2">
                      <input
                        placeholder="Type reply..."
                        className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        value={replyTexts[t.ticketId] ?? ""}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({
                            ...prev,
                            [t.ticketId]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() =>
                          reply.mutate({
                            ticketId: t.ticketId,
                            reply: replyTexts[t.ticketId] ?? "",
                          })
                        }
                        disabled={reply.isPending}
                        className="px-3 py-2 bg-brand-orange text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => close.mutate(t.ticketId)}
                        disabled={close.isPending}
                        className="px-3 py-2 bg-gray-600/30 text-gray-300 rounded-lg text-sm hover:bg-gray-600/50 disabled:opacity-50"
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

// ─── Social Tab ──────────────────────────────────────────────────────────────

function SocialTab() {
  const { data: links } = useGetSocialLinks();
  const updateLinks = useUpdateSocialLinks();
  const [form, setForm] = useState({
    youtube: "",
    instagram: "",
    telegram: "",
  });

  React.useEffect(() => {
    if (links) setForm(links);
  }, [links]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Social Links
      </h2>
      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 space-y-4 max-w-md">
        {(["youtube", "instagram", "telegram"] as const).map((key) => (
          <div key={key}>
            <label className="text-xs text-gray-400 mb-1 block capitalize">
              {key}
            </label>
            <input
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={`https://${key}.com/...`}
            />
          </div>
        ))}
        <button
          onClick={() => updateLinks.mutate(form)}
          disabled={updateLinks.isPending}
          className="px-5 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {updateLinks.isPending ? "Saving..." : "Save Links"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    open: "bg-blue-500/20 text-blue-400",
    replied: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
    upcoming: "bg-blue-500/20 text-blue-400",
    ongoing: "bg-green-500/20 text-green-400",
    completed: "bg-purple-500/20 text-purple-400",
    processed: "bg-green-500/20 text-green-400",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[status] || "bg-gray-500/20 text-gray-400"}`}
    >
      {status}
    </span>
  );
}
