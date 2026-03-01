import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, Coins } from "lucide-react";
import type { Tournament } from "../backend";
import {
  useGetMyUserId,
  useGetWalletBalance,
  useRegisterForTournamentWithCoins,
} from "../hooks/useQueries";

interface PaymentModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export default function PaymentModal({
  tournament,
  onClose,
}: PaymentModalProps) {
  const { data: userId } = useGetMyUserId();
  const { data: balance } = useGetWalletBalance(userId ?? null);
  const registerWithCoins = useRegisterForTournamentWithCoins();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const hasBalance =
    balance !== undefined && balance >= tournament.entryFee;
  const balanceAfter =
    balance !== undefined ? balance - tournament.entryFee : BigInt(0);

  const handleJoin = async () => {
    if (!userId) {
      setError("User ID not found. Please complete registration first.");
      return;
    }
    if (!hasBalance) {
      setError(
        `Insufficient coins! You need ${tournament.entryFee.toString()} coins but have ${(balance ?? BigInt(0)).toString()}. Go to Dashboard → Wallet to add coins.`
      );
      return;
    }
    setError("");
    try {
      await registerWithCoins.mutateAsync({
        tournamentId: tournament.id,
        playerId: userId,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.includes("Insufficient")
          ? "Insufficient coins to join this tournament."
          : msg.includes("already")
            ? "You are already registered for this tournament."
            : "Failed to join tournament. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-orbitron font-bold text-white text-base">
              Join Tournament
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">{tournament.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-lg mb-2">
              Successfully Joined!
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              You have joined <strong className="text-white">{tournament.name}</strong>.{" "}
              {tournament.entryFee.toString()} coins have been deducted from your wallet.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Tournament Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Entry Fee</p>
                <p className="text-brand-orange font-bold">
                  🪙 {tournament.entryFee.toString()} Coins
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Prize Pool</p>
                <p className="text-green-400 font-bold">
                  🪙 {tournament.prizePool.toString()} Coins
                </p>
              </div>
            </div>

            {/* Wallet Balance */}
            <div
              className={`rounded-xl p-4 border ${
                hasBalance
                  ? "bg-green-900/20 border-green-500/20"
                  : "bg-red-900/20 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Coins
                  className={`w-4 h-4 ${hasBalance ? "text-green-400" : "text-red-400"}`}
                />
                <span className="text-sm font-semibold text-white">
                  Your Wallet
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Balance</span>
                  <span className="text-yellow-400 font-bold">
                    🪙 {(balance ?? BigInt(0)).toString()} Coins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-red-400 font-bold">
                    - 🪙 {tournament.entryFee.toString()} Coins
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                  <span className="text-gray-400">After Joining</span>
                  <span
                    className={`font-bold ${hasBalance ? "text-green-400" : "text-red-400"}`}
                  >
                    🪙 {hasBalance ? balanceAfter.toString() : "—"} Coins
                  </span>
                </div>
              </div>
            </div>

            {!hasBalance && (
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-xs">
                <strong>Insufficient coins!</strong> Go to{" "}
                <strong>Dashboard → Wallet</strong> to add coins by uploading a
                payment proof.
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleJoin}
                disabled={registerWithCoins.isPending || !hasBalance}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerWithCoins.isPending ? (
                  "Joining..."
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    Pay with Coins
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
