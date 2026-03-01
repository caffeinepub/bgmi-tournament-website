import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Tournament, TournamentRegistration, SupportTicket, SocialLinks, TermsAndConditions, Player, RegistrationStatus, TournamentStatus, ExternalBlob } from '../backend';

export function useGetAllTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament[]>({
    queryKey: ['tournaments'],
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
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTournamentById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetMyRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<TournamentRegistration[]>({
    queryKey: ['myRegistrations'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyRegistrations();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterForTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournamentId, paymentScreenshotBlob }: { tournamentId: string; paymentScreenshotBlob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerForTournament(tournamentId, paymentScreenshotBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['myRegistrations'] });
    },
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      dateTime: bigint;
      entryFee: bigint;
      prizePool: bigint;
      map: string;
      totalSlots: bigint;
      upiId: string;
      matchRules: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTournament(data.name, data.dateTime, data.entryFee, data.prizePool, data.map, data.totalSlots, data.upiId, data.matchRules);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useUpdateTournamentQrCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournamentId, qrCodeBlob }: { tournamentId: string; qrCodeBlob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTournamentQrCode(tournamentId, qrCodeBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useUpdateTournamentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournamentId, status }: { tournamentId: string; status: TournamentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTournamentStatus(tournamentId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useUpdateTournamentRoomDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournamentId, roomId, roomPassword }: { tournamentId: string; roomId: string; roomPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTournamentRoomDetails(tournamentId, roomId, roomPassword);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useGetRegistrationsForTournament(tournamentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TournamentRegistration[]>({
    queryKey: ['registrations', tournamentId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRegistrationsForTournament(tournamentId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!tournamentId,
  });
}

export function useGetAllRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<TournamentRegistration[]>({
    queryKey: ['allRegistrations'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Fetch all tournaments first, then get registrations for each
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

export function useUpdateRegistrationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: string; status: RegistrationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRegistrationStatus(registrationId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}

export function useGetAllPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPlayers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSupportTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<SupportTicket[]>({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSupportTicketsSorted();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReplyToSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.replyToSupportTicket(ticketId, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}

export function useCloseSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.closeSupportTicket(ticketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}

export function useGetTermsAndConditions() {
  const { actor, isFetching } = useActor();
  return useQuery<TermsAndConditions>({
    queryKey: ['terms'],
    queryFn: async () => {
      if (!actor) return { content: '' };
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateTermsAndConditions(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}

export function useGetSocialLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<SocialLinks>({
    queryKey: ['socialLinks'],
    queryFn: async () => {
      if (!actor) return { youtube: '', instagram: '', telegram: '' };
      return actor.getSocialLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSocialLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ youtube, instagram, telegram }: { youtube: string; instagram: string; telegram: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSocialLinks(youtube, instagram, telegram);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useGenerateOtp() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateOtp();
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (otp: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyOtp(otp);
    },
  });
}

export function useRegisterPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mobile, bgmiPlayerId, displayName }: { mobile: string; bgmiPlayerId: string; displayName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerPlayer(mobile, bgmiPlayerId, displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPlayers'] });
    },
  });
}

export function useCreateSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ playerName, subject, description, screenshotBlob }: { playerName: string; subject: string; description: string; screenshotBlob: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSupportTicket(playerName, subject, description, screenshotBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}
