import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Tournament, SupportTicket, SocialLinks, TermsAndConditions } from '../backend';
import { ExternalBlob } from '../backend';

export function useAllTournaments() {
    const { actor, isFetching } = useActor();
    return useQuery<Tournament[]>({
        queryKey: ['tournaments'],
        queryFn: async () => {
            if (!actor) return [];
            // Get all tournaments by fetching unused slots + all maps
            // Since backend only has getTournamentsByMap and findUnusedSlots,
            // we use findUnusedSlots to get open ones
            return actor.findUnusedSlots();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useTermsAndConditions() {
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

export function useSocialLinks() {
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

export function useAllSupportTickets() {
    const { actor, isFetching } = useActor();
    return useQuery<SupportTicket[]>({
        queryKey: ['supportTickets'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllSupportTicketsSorted();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGenerateOtp() {
    const { actor } = useActor();
    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not ready');
            return actor.generateOtp();
        },
    });
}

export function useVerifyOtp() {
    const { actor } = useActor();
    return useMutation({
        mutationFn: async (otp: string) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.verifyOtp(otp);
        },
    });
}

export function useRegisterPlayer() {
    const { actor } = useActor();
    return useMutation({
        mutationFn: async ({ mobile, bgmiPlayerId, displayName }: { mobile: string; bgmiPlayerId: string; displayName: string }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.registerPlayer(mobile, bgmiPlayerId, displayName);
        },
    });
}

export function useRegisterForTournament() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ tournamentId, paymentScreenshotBlob }: { tournamentId: string; paymentScreenshotBlob: ExternalBlob }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.registerForTournament(tournamentId, paymentScreenshotBlob);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tournaments'] });
        },
    });
}

export function useCreateSupportTicket() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            playerId, playerName, subject, description, screenshotBlob
        }: {
            playerId: string;
            playerName: string;
            subject: string;
            description: string;
            screenshotBlob: ExternalBlob | null;
        }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.createSupportTicket(playerId, playerName, subject, description, screenshotBlob);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
        },
    });
}

export function useCreateTournament() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            name, dateTime, entryFee, prizePool, map, totalSlots, upiId, matchRules
        }: {
            name: string;
            dateTime: bigint;
            entryFee: bigint;
            prizePool: bigint;
            map: string;
            totalSlots: bigint;
            upiId: string;
            matchRules: string;
        }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.createTournament(name, dateTime, entryFee, prizePool, map, totalSlots, upiId, matchRules);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tournaments'] });
        },
    });
}

export function useUpdateTermsAndConditions() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (content: string) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.updateTermsAndConditions(content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terms'] });
        },
    });
}

export function useUpdateSocialLinks() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ youtube, instagram, telegram }: { youtube: string; instagram: string; telegram: string }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.updateSocialLinks(youtube, instagram, telegram);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
        },
    });
}
