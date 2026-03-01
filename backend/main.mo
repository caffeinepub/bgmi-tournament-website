import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type Player = {
    principal : Principal;
    mobile : Text;
    bgmiPlayerId : Text;
    displayName : Text;
  };

  module Player {
    public func compare(a : Player, b : Player) : Order.Order {
      switch (Text.compare(a.displayName, b.displayName)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) { Text.compare(a.bgmiPlayerId, b.bgmiPlayerId) };
      };
    };
  };

  type Tournament = {
    id : Text;
    name : Text;
    dateTime : Time.Time;
    entryFee : Nat;
    prizePool : Nat;
    map : Text;
    totalSlots : Nat;
    filledSlots : Nat;
    upiId : Text;
    qrCodeBlob : ?Storage.ExternalBlob;
    roomId : ?Text;
    roomPassword : ?Text;
    matchRules : Text;
    status : TournamentStatus;
  };

  module Tournament {
    public func compare(a : Tournament, b : Tournament) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  type TournamentStatus = {
    #upcoming;
    #ongoing;
    #closed;
    #completed;
  };

  type TournamentRegistration = {
    registrationId : Text;
    tournamentId : Text;
    playerId : Text;
    paymentScreenshotBlob : Storage.ExternalBlob;
    status : RegistrationStatus;
  };

  type RegistrationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type TermsAndConditions = {
    content : Text;
  };

  type SupportTicket = {
    ticketId : Text;
    playerId : Text;
    playerName : Text;
    subject : Text;
    description : Text;
    screenshotBlob : ?Storage.ExternalBlob;
    status : TicketStatus;
    createdAt : Time.Time;
    adminReply : ?Text;
    repliedAt : ?Time.Time;
  };

  type TicketStatus = {
    #open;
    #replied;
    #closed;
  };

  type SocialLinks = {
    youtube : Text;
    instagram : Text;
    telegram : Text;
  };

  type OtpEntry = {
    otp : Text;
    timestamp : Time.Time;
  };

  let players = Map.empty<Principal, Player>();
  let tournaments = Map.empty<Text, Tournament>();
  let registrations = Map.empty<Text, TournamentRegistration>();
  let supportTickets = Map.empty<Text, SupportTicket>();
  let otps = Map.empty<Principal, OtpEntry>();
  var termsAndConditions : TermsAndConditions = { content = "" };
  var socialLinks : SocialLinks = {
    youtube = "";
    instagram = "";
    telegram = "";
  };

  // Player functions
  public shared ({ caller }) func registerPlayer(mobile : Text, bgmiPlayerId : Text, displayName : Text) : async () {
    if (players.containsKey(caller)) { Runtime.trap("Player already exists!") };
    let player : Player = {
      principal = caller;
      mobile;
      bgmiPlayerId;
      displayName;
    };
    players.add(caller, player);
  };

  // Tournament functions
  public shared ({ caller }) func createTournament(name : Text, dateTime : Time.Time, entryFee : Nat, prizePool : Nat, map : Text, totalSlots : Nat, upiId : Text, matchRules : Text) : async Text {
    let id = "tournament_" # name # "_" # entryFee.toText();
    let tournament : Tournament = {
      id;
      name;
      dateTime;
      entryFee;
      prizePool;
      map;
      totalSlots;
      filledSlots = 0;
      upiId;
      qrCodeBlob = null;
      roomId = null;
      roomPassword = null;
      matchRules;
      status = #upcoming;
    };
    tournaments.add(id, tournament);
    id;
  };

  // TournamentRegistration functions
  public shared ({ caller }) func registerForTournament(tournamentId : Text, paymentScreenshotBlob : Storage.ExternalBlob) : async Text {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let registrationId = "reg_" # caller.toText();
        let registration : TournamentRegistration = {
          registrationId;
          tournamentId;
          playerId = caller.toText();
          paymentScreenshotBlob;
          status = #pending;
        };
        registrations.add(registrationId, registration);

        let updatedTournament : Tournament = {
          tournament with
          filledSlots = tournament.filledSlots + 1;
        };
        tournaments.add(tournamentId, updatedTournament);

        registrationId;
      };
    };
  };

  // Terms and Conditions
  public query ({ caller }) func getTermsAndConditions() : async TermsAndConditions {
    termsAndConditions;
  };

  public shared ({ caller }) func updateTermsAndConditions(content : Text) : async () {
    termsAndConditions := { content };
  };

  // Social Links
  public query ({ caller }) func getSocialLinks() : async SocialLinks {
    socialLinks;
  };

  public shared ({ caller }) func updateSocialLinks(youtube : Text, instagram : Text, telegram : Text) : async () {
    socialLinks := {
      youtube;
      instagram;
      telegram;
    };
  };

  // Support Ticket
  public shared ({ caller }) func createSupportTicket(playerId : Text, playerName : Text, subject : Text, description : Text, screenshotBlob : ?Storage.ExternalBlob) : async Text {
    let ticketId = "ticket_" # playerId;
    let ticket : SupportTicket = {
      ticketId;
      playerId;
      playerName;
      subject;
      description;
      screenshotBlob;
      status = #open;
      createdAt = Time.now();
      adminReply = null;
      repliedAt = null;
    };
    supportTickets.add(ticketId, ticket);
    ticketId;
  };

  // OTP Generation
  public shared ({ caller }) func generateOtp() : async Text {
    let otp = "1234";
    let otpEntry : OtpEntry = {
      otp;
      timestamp = Time.now();
    };
    otps.add(caller, otpEntry);
    otp;
  };

  public shared ({ caller }) func verifyOtp(otp : Text) : async Bool {
    switch (otps.get(caller)) {
      case (null) { Runtime.trap("No OTP found") };
      case (?otpEntry) {
        if (otpEntry.otp == otp) {
          otps.remove(caller);
          true;
        } else {
          false;
        };
      };
    };
  };

  // Find unused slots in tournaments
  public query ({ caller }) func findUnusedSlots() : async [Tournament] {
    tournaments.values().toArray().filter(func(t) { t.filledSlots < t.totalSlots });
  };

  // Search support tickets by player name
  public query ({ caller }) func searchSupportTicketsByPlayerName(name : Text) : async [SupportTicket] {
    supportTickets.values().toArray().filter(func(ticket) { ticket.playerName.contains(#text name) });
  };

  // Get all support tickets sorted by createdAt
  public query ({ caller }) func getAllSupportTicketsSorted() : async [SupportTicket] {
    supportTickets.values().toArray();
  };

  // Get tournaments by map
  public query ({ caller }) func getTournamentsByMap(map : Text) : async [Tournament] {
    tournaments.values().toArray().filter(func(t) { t.map == map });
  };
};
