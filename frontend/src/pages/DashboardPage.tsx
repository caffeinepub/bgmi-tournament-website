import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Trophy,
  User,
  Wallet,
  ArrowDownCircle,
  MessageSquare,
  LogOut,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  useGetAllTournaments,
  useGetMyRegistrations,
  useGetCallerUserProfile,
  useGetMyUserId,
  useGetWalletBalance,
  useGetMyPaymentProofs,
  useSubmitPaymentProof,
  useGetMyWithdrawalRequests,
  useSubmitWithdrawalRequest,
  useGetMySupportTickets,
  useCreateSupportTicket,
  useRegisterForTournamentWithCoins,
} from "../hooks/useQueries";
import type { Tournament } from "../backend";

const NAV_ITEMS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "tournaments", label: "Tournaments", icon: Trophy },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "withdraw", label: "Withdraw", icon: ArrowDownCircle },
  { key: "support", label: "Support", icon: MessageSquare },
];

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN");
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userId } = useGetMyUserId();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-brand-darker text-white">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={20} className="text-gray-400" />
        </button>
        <span className="font-orbitron text-brand-orange text-sm font-bold">
          Player Dashboard
        </span>
        <button onClick={handleLogout}>
          <LogOut size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 h-screen z-50 md:z-auto w-60 bg-[#111] border-r border-white/10 flex flex-col transition-transform duration-300 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <div className="font-orbitron text-sm font-bold text-brand-orange">
                PLAYER PANEL
              </div>
              <div className="text-xs text-gray-400 truncate max-w-[140px]">
                {userProfile?.displayName || "Loading..."}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400"
            >
              <X size={16} />
            </button>
          </div>

          {userId && (
            <div className="px-4 py-2 border-b border-white/10">
              <div className="text-xs text-gray-500">User ID</div>
              <div className="font-mono text-brand-orange font-bold text-sm">
                {userId}
              </div>
            </div>
          )}

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSidebarOpen(false);
                }}
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

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 min-h-screen overflow-y-auto">
          {activeTab === "profile" && <ProfileTab userId={userId ?? null} />}
          {activeTab === "tournaments" && (
            <TournamentsTab userId={userId ?? null} />
          )}
          {activeTab === "wallet" && <WalletTab userId={userId ?? null} />}
          {activeTab === "withdraw" && (
            <WithdrawTab userId={userId ?? null} />
          )}
          {activeTab === "support" && <SupportTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ userId }: { userId: string | null }) {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { data: balance } = useGetWalletBalance(userId);
  const [copied, setCopied] = useState(false);

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 py-12">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        My Profile
      </h2>

      {userId && (
        <div className="bg-gradient-to-r from-brand-orange/20 to-brand-red/20 border border-brand-orange/30 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Player ID</div>
          <div className="flex items-center gap-3">
            <span className="font-orbitron text-2xl font-bold text-brand-orange">
              {userId}
            </span>
            <button
              onClick={copyUserId}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {copied ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 space-y-4">
        <ProfileField label="Display Name" value={userProfile?.displayName} />
        <ProfileField
          label="BGMI Player ID"
          value={userProfile?.bgmiPlayerId}
        />
        <ProfileField label="Mobile" value={userProfile?.mobile} />
        <ProfileField
          label="Coin Balance"
          value={
            balance !== undefined
              ? `🪙 ${balance.toString()} Coins`
              : "—"
          }
          highlight
        />
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div
        className={`text-sm font-semibold ${highlight ? "text-yellow-400" : "text-white"}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Tournaments Tab ──────────────────────────────────────────────────────────

function TournamentsTab({ userId }: { userId: string | null }) {
  const { data: tournaments = [], isLoading } = useGetAllTournaments();
  const { data: myRegistrations = [] } = useGetMyRegistrations();
  const { data: balance } = useGetWalletBalance(userId);
  const registerWithCoins = useRegisterForTournamentWithCoins();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registeredIds = new Set(myRegistrations.map((r) => r.tournamentId));

  const handleJoin = async (tournament: Tournament) => {
    if (!userId) {
      setErrorMsg("User ID not found. Please complete registration.");
      return;
    }
    const bal = balance ?? BigInt(0);
    if (bal < tournament.entryFee) {
      setErrorMsg(
        `Insufficient coins! You need ${tournament.entryFee.toString()} coins but have ${bal.toString()}. Please add coins in the Wallet section.`
      );
      return;
    }
    setJoiningId(tournament.id);
    setErrorMsg(null);
    try {
      await registerWithCoins.mutateAsync({
        tournamentId: tournament.id,
        playerId: userId,
      });
      setSuccessMsg(
        `Successfully joined ${tournament.name}! ${tournament.entryFee.toString()} coins deducted.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg.includes("Insufficient")
          ? "Insufficient coins to join this tournament."
          : "Failed to join tournament. Please try again."
      );
    } finally {
      setJoiningId(null);
    }
  };

  const statusColors: Record<string, string> = {
    upcoming: "text-blue-400",
    ongoing: "text-green-400",
    closed: "text-gray-400",
    completed: "text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-orbitron text-brand-orange">
          Tournaments
        </h2>
        {balance !== undefined && (
          <div className="text-sm text-yellow-400 font-semibold">
            🪙 {balance.toString()} Coins
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">
          Loading tournaments...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No tournaments available
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tournaments.map((t) => {
            const isRegistered = registeredIds.has(t.id);
            const isJoining = joiningId === t.id;
            const canJoin =
              (t.status as string) === "upcoming" ||
              (t.status as string) === "ongoing";
            const hasBalance = (balance ?? BigInt(0)) >= t.entryFee;

            return (
              <div
                key={t.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white">{t.name}</h3>
                  <span
                    className={`text-xs font-semibold ${statusColors[t.status as string] || "text-gray-400"}`}
                  >
                    {t.status as string}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-[#222] rounded p-2">
                    <div className="text-gray-400">Entry Fee</div>
                    <div className="text-brand-orange font-bold">
                      🪙 {t.entryFee.toString()}
                    </div>
                  </div>
                  <div className="bg-[#222] rounded p-2">
                    <div className="text-gray-400">Prize Pool</div>
                    <div className="text-green-400 font-bold">
                      🪙 {t.prizePool.toString()}
                    </div>
                  </div>
                  <div className="bg-[#222] rounded p-2">
                    <div className="text-gray-400">Map</div>
                    <div className="text-white font-bold">{t.map}</div>
                  </div>
                  <div className="bg-[#222] rounded p-2">
                    <div className="text-gray-400">Slots</div>
                    <div className="text-white font-bold">
                      {t.filledSlots.toString()}/{t.totalSlots.toString()}
                    </div>
                  </div>
                </div>
                {t.roomId && (
                  <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-2 mb-3 text-xs">
                    <span className="text-gray-400">Room: </span>
                    <span className="text-white font-mono">{t.roomId}</span>
                    {t.roomPassword && (
                      <>
                        <span className="text-gray-400 ml-2">Pass: </span>
                        <span className="text-white font-mono">
                          {t.roomPassword}
                        </span>
                      </>
                    )}
                  </div>
                )}
                {isRegistered ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <CheckCircle size={14} />
                    Registered
                  </div>
                ) : canJoin ? (
                  <button
                    onClick={() => handleJoin(t)}
                    disabled={isJoining || !hasBalance}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      hasBalance
                        ? "bg-brand-orange text-white hover:bg-orange-600"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    } disabled:opacity-60`}
                  >
                    {isJoining
                      ? "Joining..."
                      : hasBalance
                        ? `Join (🪙 ${t.entryFee.toString()})`
                        : "Insufficient Coins"}
                  </button>
                ) : (
                  <div className="text-gray-500 text-sm text-center py-1">
                    Registration closed
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

// ─── Wallet Tab ───────────────────────────────────────────────────────────────

function WalletTab({ userId }: { userId: string | null }) {
  const { data: balance, isLoading: balanceLoading } =
    useGetWalletBalance(userId);
  const { data: proofs = [], isLoading: proofsLoading } =
    useGetMyPaymentProofs(userId);
  const submitProof = useSubmitPaymentProof();

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMsg("User ID not found.");
      return;
    }
    if (!imageFile) {
      setErrorMsg("Please upload a payment screenshot.");
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = (ev.target?.result as string) ?? "";
        await submitProof.mutateAsync({
          userId,
          amount: BigInt(amount),
          imageBase64: base64,
          transactionRef,
        });
        setSuccessMsg(
          "Payment proof submitted! Admin will review and add coins."
        );
        setShowForm(false);
        setAmount("");
        setTransactionRef("");
        setImageFile(null);
        setImagePreview(null);
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch {
        setErrorMsg("Failed to submit payment proof. Please try again.");
      }
    };
    reader.readAsDataURL(imageFile);
  };

  const sorted = [...proofs].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Coin Wallet
      </h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-6">
        <div className="text-sm text-gray-400 mb-1">Current Balance</div>
        {balanceLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <div className="text-4xl font-orbitron font-bold text-yellow-400">
            🪙 {balance?.toString() ?? "0"}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">Rs.1 = 1 Coin</div>
      </div>

      {successMsg && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <XCircle size={16} />
          {errorMsg}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
      >
        <Upload size={16} />
        Add Coins (Upload Payment Proof)
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 space-y-4"
        >
          <h3 className="font-semibold text-white">Submit Payment Proof</h3>
          <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-3 text-xs text-gray-300">
            <strong className="text-brand-orange">How to add coins:</strong>
            <br />
            1. Pay via UPI/PhonePe/GPay to admin's UPI ID
            <br />
            2. Take a screenshot of the payment
            <br />
            3. Fill in the amount and transaction reference
            <br />
            4. Upload the screenshot below
            <br />
            Admin will verify and add coins to your wallet.
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Amount (Rs.)
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Transaction Reference / UTR Number
            </label>
            <input
              required
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. 123456789012"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Payment Screenshot
            </label>
            <input
              type="file"
              accept="image/*"
              required
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-brand-orange file:text-white file:text-xs"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg border border-white/10"
              />
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitProof.isPending}
              className="px-5 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {submitProof.isPending ? "Submitting..." : "Submit Proof"}
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

      <div>
        <h3 className="font-semibold text-white mb-3">Payment History</h3>
        {proofsLoading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="text-gray-500 text-sm">No payment proofs yet</div>
        ) : (
          <div className="space-y-2">
            {sorted.map((p) => (
              <div
                key={p.proofId}
                className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-semibold text-sm">
                    ₹{p.amount.toString()} → 🪙 {p.amount.toString()} Coins
                  </div>
                  <div className="text-xs text-gray-400">
                    Ref: {p.transactionRef}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(p.timestamp)}
                  </div>
                </div>
                <ProofStatusBadge status={p.status as string} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Withdraw Tab ─────────────────────────────────────────────────────────────

function WithdrawTab({ userId }: { userId: string | null }) {
  const { data: balance } = useGetWalletBalance(userId);
  const { data: requests = [], isLoading } = useGetMyWithdrawalRequests(userId);
  const submitWithdrawal = useSubmitWithdrawalRequest();

  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMsg("User ID not found.");
      return;
    }
    const amtNum = BigInt(amount || "0");
    const bal = balance ?? BigInt(0);
    if (amtNum > bal) {
      setErrorMsg(
        `Insufficient coins. You have ${bal.toString()} coins but requested ${amtNum.toString()}.`
      );
      return;
    }
    if (amtNum < BigInt(10)) {
      setErrorMsg("Minimum withdrawal is 10 coins.");
      return;
    }
    setErrorMsg(null);
    try {
      await submitWithdrawal.mutateAsync({ userId, amount: amtNum, upiId });
      setSuccessMsg(
        `Withdrawal request of 🪙 ${amtNum.toString()} coins submitted! Admin will process it soon.`
      );
      setUpiId("");
      setAmount("");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg.includes("Insufficient")
          ? "Insufficient coins for withdrawal."
          : "Failed to submit withdrawal request."
      );
    }
  };

  const sorted = [...requests].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold font-orbitron text-brand-orange">
        Withdraw Coins
      </h2>

      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
        <div className="text-xs text-gray-400 mb-1">Available Balance</div>
        <div className="text-2xl font-bold text-yellow-400">
          🪙 {balance?.toString() ?? "0"} Coins
        </div>
        <div className="text-xs text-gray-500">1 Coin = Rs.1</div>
      </div>

      {successMsg && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <XCircle size={16} />
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 space-y-4"
      >
        <h3 className="font-semibold text-white">New Withdrawal Request</h3>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">UPI ID</label>
          <input
            required
            className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Amount (Coins) — Min: 10
          </label>
          <input
            type="number"
            min="10"
            required
            className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
          />
          {amount && balance !== undefined && (
            <div
              className={`text-xs mt-1 ${BigInt(amount || "0") > balance ? "text-red-400" : "text-green-400"}`}
            >
              {BigInt(amount || "0") > balance
                ? `Insufficient! You only have ${balance.toString()} coins`
                : `✓ You have enough coins`}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={
            submitWithdrawal.isPending ||
            !amount ||
            !upiId ||
            (balance !== undefined && BigInt(amount || "0") > balance)
          }
          className="px-5 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitWithdrawal.isPending ? "Submitting..." : "Request Withdrawal"}
        </button>
      </form>

      <div>
        <h3 className="font-semibold text-white mb-3">Withdrawal History</h3>
        {isLoading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No withdrawal requests yet
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((r) => (
              <div
                key={r.requestId}
                className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-semibold text-sm">
                    🪙 {r.amount.toString()} Coins → {r.upiId}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(r.timestamp)}
                  </div>
                </div>
                <ProofStatusBadge status={r.status as string} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────

function SupportTab() {
  const { data: tickets = [], isLoading } = useGetMySupportTickets();
  const createTicket = useCreateSupportTicket();
  const { data: userProfile } = useGetCallerUserProfile();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createTicket.mutateAsync({
        playerName: userProfile?.displayName ?? "Player",
        subject,
        description,
      });
      setSuccessMsg("Support ticket submitted! Admin will reply soon.");
      setSubject("");
      setDescription("");
      setShowForm(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch {
      setErrorMsg("Failed to submit ticket. Please try again.");
    }
  };

  const sorted = [...tickets].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  const statusColors: Record<string, string> = {
    open: "bg-blue-500/20 text-blue-400",
    replied: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-orbitron text-brand-orange">
          Support Tickets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
        >
          + New Ticket
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <XCircle size={16} />
          {errorMsg}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 space-y-4"
        >
          <h3 className="font-semibold text-white">New Support Ticket</h3>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subject</label>
            <input
              required
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Description
            </label>
            <textarea
              required
              className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="px-5 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
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
        <div className="text-gray-400 text-sm">Loading tickets...</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No support tickets yet. Create one if you need help!
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((t) => (
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
                  <div className="font-semibold text-white text-sm">
                    {t.subject}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(t.createdAt)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[t.status as string] || ""}`}
                >
                  {t.status as string}
                </span>
              </button>
              {expandedId === t.ticketId && (
                <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
                  <p className="text-sm text-gray-300">{t.description}</p>
                  {t.adminReply && (
                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">
                        Admin Reply
                      </div>
                      <p className="text-sm text-gray-300">{t.adminReply}</p>
                      {t.repliedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(t.repliedAt)}
                        </div>
                      )}
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

// ─── Shared ───────────────────────────────────────────────────────────────────

function ProofStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    pending: {
      color: "text-yellow-400",
      icon: <Clock size={12} />,
      label: "Pending",
    },
    approved: {
      color: "text-green-400",
      icon: <CheckCircle size={12} />,
      label: "Approved",
    },
    rejected: {
      color: "text-red-400",
      icon: <XCircle size={12} />,
      label: "Rejected",
    },
    processed: {
      color: "text-green-400",
      icon: <CheckCircle size={12} />,
      label: "Processed",
    },
  };
  const c = config[status] || config["pending"];
  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${c.color}`}>
      {c.icon}
      {c.label}
    </div>
  );
}
