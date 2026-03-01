import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Tournament,
  TournamentRegistration,
  Player,
  SupportTicket,
  SocialLinks,
  TermsAndConditions,
  UserProfile,
  VerifiedUserProfile,
  PaymentProof,
  WithdrawalRequest,
  TournamentStatus,
} from "../backend";

// ─── Tournaments ────────────────────────────────────────────────────────────

export function useGetAllTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTournamentById(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament | null>({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTournamentById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      dateTime: bigint;
      entryFee: bigint;
      prizePool: bigint;
      map: string;
      totalSlots: bigint;
      upiId: string;
      matchRules: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTournament(
        params.name,
        params.dateTime,
        params.entryFee,
        params.prizePool,
        params.map,
        params.totalSlots,
        params.upiId,
        params.matchRules
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useUpdateTournamentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tournamentId: string;
      status: TournamentStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTournamentStatus(params.tournamentId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useUpdateTournamentRoomDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tournamentId: string;
      roomId: string;
      roomPassword: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTournamentRoomDetails(
        params.tournamentId,
        params.roomId,
        params.roomPassword
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useUpdateTournamentQrCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tournamentId: string;
      qrCodeBlob: import("../backend").ExternalBlob;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTournamentQrCode(
        params.tournamentId,
        params.qrCodeBlob
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

// ─── Registrations ──────────────────────────────────────────────────────────

export function useGetRegistrationsForTournament(tournamentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TournamentRegistration[]>({
    queryKey: ["registrations", tournamentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegistrationsForTournament(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
  });
}

export function useGetAllRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<TournamentRegistration[]>({
    queryKey: ["allRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const tournaments = await actor.getAllTournaments();
        const allRegs: TournamentRegistration[] = [];
        for (const t of tournaments) {
          const regs = await actor.getRegistrationsForTournament(t.id);
          allRegs.push(...regs);
        }
        return allRegs;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<TournamentRegistration[]>({
    queryKey: ["myRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

// Registration status values as plain strings matching the backend enum values
type RegistrationStatusString = "pending" | "approved" | "rejected";

export function useUpdateRegistrationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      registrationId: string;
      status: RegistrationStatusString;
    }) => {
      if (!actor) throw new Error("Actor not available");
      // The backend accepts the enum value; cast via unknown to satisfy TS
      return actor.updateRegistrationStatus(
        params.registrationId,
        params.status as unknown as import("../backend").backendInterface extends { updateRegistrationStatus: (id: string, s: infer S) => unknown } ? S : never
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["allRegistrations"] });
    },
  });
}

export function useRegisterForTournamentWithCoins() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tournamentId: string; playerId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerForTournamentWithCoins(
        params.tournamentId,
        params.playerId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["myRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

// ─── Players ────────────────────────────────────────────────────────────────

export function useGetAllPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllVerifiedUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<VerifiedUserProfile[]>({
    queryKey: ["verifiedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVerifiedUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mobile: string;
      bgmiPlayerId: string;
      displayName: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerPlayer(
        params.mobile,
        params.bgmiPlayerId,
        params.displayName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedUsers"] });
    },
  });
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── User ID ─────────────────────────────────────────────────────────────────

export function useGetMyUserId() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["myUserId"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyUserId();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export function useGetWalletBalance(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["walletBalance", userId],
    queryFn: async () => {
      if (!actor || !userId) return BigInt(0);
      return actor.getUserWalletBalance(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// ─── Payment Proofs ──────────────────────────────────────────────────────────

export function useGetAllPaymentProofs() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentProof[]>({
    queryKey: ["allPaymentProofs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPaymentProofs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyPaymentProofs(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentProof[]>({
    queryKey: ["myPaymentProofs", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getMyPaymentProofs(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSubmitPaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      amount: bigint;
      imageBase64: string;
      transactionRef: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitPaymentProof(
        params.userId,
        params.amount,
        params.imageBase64,
        params.transactionRef
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["myPaymentProofs", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["allPaymentProofs"] });
      queryClient.invalidateQueries({
        queryKey: ["walletBalance", variables.userId],
      });
    },
  });
}

export function useApprovePaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proofId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approvePaymentProof(proofId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPaymentProofs"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

export function useRejectPaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proofId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectPaymentProof(proofId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPaymentProofs"] });
    },
  });
}

// ─── Withdrawal Requests ─────────────────────────────────────────────────────

export function useGetAllWithdrawalRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<WithdrawalRequest[]>({
    queryKey: ["allWithdrawalRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWithdrawalRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyWithdrawalRequests(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<WithdrawalRequest[]>({
    queryKey: ["myWithdrawalRequests", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getMyWithdrawalRequests(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSubmitWithdrawalRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      amount: bigint;
      upiId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitWithdrawalRequest(
        params.userId,
        params.amount,
        params.upiId
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["myWithdrawalRequests", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["allWithdrawalRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["walletBalance", variables.userId],
      });
    },
  });
}

export function useMarkWithdrawalProcessed() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markWithdrawalRequestProcessed(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWithdrawalRequests"] });
    },
  });
}

export function useRejectWithdrawalRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectWithdrawalRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWithdrawalRequests"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

// ─── Support Tickets ─────────────────────────────────────────────────────────

export function useGetAllSupportTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<SupportTicket[]>({
    queryKey: ["supportTickets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSupportTicketsSorted();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMySupportTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<SupportTicket[]>({
    queryKey: ["mySupportTickets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySupportTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      playerName: string;
      subject: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSupportTicket(
        params.playerName,
        params.subject,
        params.description,
        null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySupportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },
  });
}

export function useReplyToSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { ticketId: string; reply: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.replyToSupportTicket(params.ticketId, params.reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },
  });
}

export function useCloseSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.closeSupportTicket(ticketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },
  });
}

// ─── Social Links ────────────────────────────────────────────────────────────

export function useGetSocialLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<SocialLinks>({
    queryKey: ["socialLinks"],
    queryFn: async () => {
      if (!actor) return { youtube: "", instagram: "", telegram: "" };
      return actor.getSocialLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSocialLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      youtube: string;
      instagram: string;
      telegram: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSocialLinks(
        params.youtube,
        params.instagram,
        params.telegram
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks"] });
    },
  });
}

// ─── Terms & Conditions ──────────────────────────────────────────────────────

export function useGetTermsAndConditions() {
  const { actor, isFetching } = useActor();
  return useQuery<TermsAndConditions>({
    queryKey: ["termsAndConditions"],
    queryFn: async () => {
      if (!actor) return { content: "" };
      return actor.getTermsAndConditions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateTermsAndConditions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTermsAndConditions(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["termsAndConditions"] });
    },
  });
}

// ─── Prize Distribution ──────────────────────────────────────────────────────

export function useDistributePrizeCoins() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tournamentId: string;
      winnerUserId: string;
      prizeAmount: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.distributePrizeCoins(
        params.tournamentId,
        params.winnerUserId,
        params.prizeAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifiedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}
