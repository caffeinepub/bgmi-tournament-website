import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    displayName: string;
    bgmiPlayerId: string;
    mobile: string;
}
export interface TournamentRegistration {
    status: RegistrationStatus;
    paymentScreenshotBlob: ExternalBlob;
    playerId: string;
    registrationId: string;
    tournamentId: string;
}
export interface SupportTicket {
    status: TicketStatus;
    adminReply?: string;
    subject: string;
    playerId: string;
    createdAt: Time;
    description: string;
    ticketId: string;
    repliedAt?: Time;
    playerName: string;
    screenshotBlob?: ExternalBlob;
}
export type Time = bigint;
export interface Player {
    principal: Principal;
    displayName: string;
    bgmiPlayerId: string;
    mobile: string;
}
export interface Tournament {
    id: string;
    map: string;
    status: TournamentStatus;
    qrCodeBlob?: ExternalBlob;
    name: string;
    roomPassword?: string;
    totalSlots: bigint;
    upiId: string;
    entryFee: bigint;
    roomId?: string;
    filledSlots: bigint;
    dateTime: Time;
    matchRules: string;
    prizePool: bigint;
}
export interface SocialLinks {
    instagram: string;
    youtube: string;
    telegram: string;
}
export interface PaymentProof {
    transactionRef: string;
    status: PaymentProofStatus;
    userId: string;
    imageBase64: string;
    timestamp: Time;
    amount: bigint;
    proofId: string;
}
export interface TermsAndConditions {
    content: string;
}
export interface VerifiedUserProfile {
    id: string;
    coinWallet: bigint;
    displayName: string;
    bgmiPlayerId: string;
    mobile: string;
}
export interface WithdrawalRequest {
    status: WithdrawalStatus;
    requestId: string;
    userId: string;
    timestamp: Time;
    upiId: string;
    amount: bigint;
}
export enum PaymentProofStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum TicketStatus {
    closed = "closed",
    open = "open",
    replied = "replied"
}
export enum TournamentStatus {
    closed = "closed",
    upcoming = "upcoming",
    completed = "completed",
    ongoing = "ongoing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalStatus {
    pending = "pending",
    rejected = "rejected",
    processed = "processed"
}
export interface backendInterface {
    addCoins(userId: string, amount: bigint): Promise<void>;
    addPrizeCoins(userId: string, amount: bigint): Promise<void>;
    approvePaymentProof(proofId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    closeSupportTicket(ticketId: string): Promise<void>;
    createSupportTicket(playerName: string, subject: string, description: string, screenshotBlob: ExternalBlob | null): Promise<string>;
    createTournament(name: string, dateTime: Time, entryFee: bigint, prizePool: bigint, map: string, totalSlots: bigint, upiId: string, matchRules: string): Promise<string>;
    deductCoins(userId: string, amount: bigint): Promise<void>;
    distributePrizeCoins(tournamentId: string, winnerUserId: string, prizeAmount: bigint): Promise<void>;
    findUnusedSlots(): Promise<Array<Tournament>>;
    generateOtp(): Promise<string>;
    getAdminPrincipal(): Promise<Principal | null>;
    getAllPaymentProofs(): Promise<Array<PaymentProof>>;
    getAllPlayers(): Promise<Array<Player>>;
    getAllSupportTicketsSorted(): Promise<Array<SupportTicket>>;
    getAllTournaments(): Promise<Array<Tournament>>;
    getAllVerifiedUsers(): Promise<Array<VerifiedUserProfile>>;
    getAllWithdrawalRequests(): Promise<Array<WithdrawalRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDomainName(): Promise<string>;
    getMyPaymentProofs(userId: string): Promise<Array<PaymentProof>>;
    getMyRegistrations(): Promise<Array<TournamentRegistration>>;
    getMySupportTickets(): Promise<Array<SupportTicket>>;
    getMyUserId(): Promise<string | null>;
    getMyWithdrawalRequests(userId: string): Promise<Array<WithdrawalRequest>>;
    getRegistrationsForTournament(tournamentId: string): Promise<Array<TournamentRegistration>>;
    getSocialLinks(): Promise<SocialLinks>;
    getTermsAndConditions(): Promise<TermsAndConditions>;
    getTournamentById(id: string): Promise<Tournament | null>;
    getTournamentsByMap(map: string): Promise<Array<Tournament>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserWalletBalance(userId: string): Promise<bigint>;
    getWalletBalance(userId: string): Promise<bigint>;
    isAdminPrincipal(p: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markWithdrawalRequestProcessed(requestId: string): Promise<void>;
    registerAdminPrincipal(p: Principal): Promise<boolean>;
    registerForTournament(tournamentId: string, playerId: string, paymentScreenshotBlob: ExternalBlob): Promise<string>;
    registerForTournamentWithCoins(tournamentId: string, playerId: string): Promise<string>;
    registerPlayer(mobile: string, bgmiPlayerId: string, displayName: string): Promise<string>;
    rejectPaymentProof(proofId: string): Promise<void>;
    rejectWithdrawalRequest(requestId: string): Promise<void>;
    replyToSupportTicket(ticketId: string, reply: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSupportTicketsByPlayerName(name: string): Promise<Array<SupportTicket>>;
    setDomainName(newName: string): Promise<void>;
    submitPaymentProof(userId: string, amount: bigint, imageBase64: string, transactionRef: string): Promise<string>;
    submitWithdrawalRequest(userId: string, amount: bigint, upiId: string): Promise<string>;
    updateRegistrationStatus(registrationId: string, status: RegistrationStatus): Promise<void>;
    updateSocialLinks(youtube: string, instagram: string, telegram: string): Promise<void>;
    updateTermsAndConditions(content: string): Promise<void>;
    updateTournamentQrCode(tournamentId: string, qrCodeBlob: ExternalBlob): Promise<void>;
    updateTournamentRoomDetails(tournamentId: string, roomId: string, roomPassword: string): Promise<void>;
    updateTournamentStatus(tournamentId: string, status: TournamentStatus): Promise<void>;
    verifyOtp(otp: string): Promise<boolean>;
}
