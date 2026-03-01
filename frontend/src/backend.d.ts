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
export interface TermsAndConditions {
    content: string;
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
export interface backendInterface {
    createSupportTicket(playerId: string, playerName: string, subject: string, description: string, screenshotBlob: ExternalBlob | null): Promise<string>;
    createTournament(name: string, dateTime: Time, entryFee: bigint, prizePool: bigint, map: string, totalSlots: bigint, upiId: string, matchRules: string): Promise<string>;
    findUnusedSlots(): Promise<Array<Tournament>>;
    generateOtp(): Promise<string>;
    getAllSupportTicketsSorted(): Promise<Array<SupportTicket>>;
    getSocialLinks(): Promise<SocialLinks>;
    getTermsAndConditions(): Promise<TermsAndConditions>;
    getTournamentsByMap(map: string): Promise<Array<Tournament>>;
    registerForTournament(tournamentId: string, paymentScreenshotBlob: ExternalBlob): Promise<string>;
    registerPlayer(mobile: string, bgmiPlayerId: string, displayName: string): Promise<void>;
    searchSupportTicketsByPlayerName(name: string): Promise<Array<SupportTicket>>;
    updateSocialLinks(youtube: string, instagram: string, telegram: string): Promise<void>;
    updateTermsAndConditions(content: string): Promise<void>;
    verifyOtp(otp: string): Promise<boolean>;
}
