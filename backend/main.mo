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
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent domain name state
  var domainName : Text = "Raj-Empire-Esports";

  // User profile type required by the frontend
  type UserProfile = {
    displayName : Text;
    mobile : Text;
    bgmiPlayerId : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  // Domain Name functions
  // Public query - open to everyone including guests
  public query func getDomainName() : async Text {
    domainName;
  };

  // Setter is admin-only
  public shared ({ caller }) func setDomainName(newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the domain name");
    };
    domainName := newName;
  };

  // Player functions
  // Only authenticated users (not guests) can register as a player
  public shared ({ caller }) func registerPlayer(mobile : Text, bgmiPlayerId : Text, displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as a player");
    };
    if (players.containsKey(caller)) { Runtime.trap("Player already exists!") };
    let player : Player = {
      principal = caller;
      mobile;
      bgmiPlayerId;
      displayName;
    };
    players.add(caller, player);
  };

  // Tournament functions - admin only
  public shared ({ caller }) func createTournament(name : Text, dateTime : Time.Time, entryFee : Nat, prizePool : Nat, map : Text, totalSlots : Nat, upiId : Text, matchRules : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tournaments");
    };
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

  // TournamentRegistration functions - authenticated users only
  public shared ({ caller }) func registerForTournament(tournamentId : Text, paymentScreenshotBlob : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register for tournaments");
    };
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

  // Terms and Conditions - public read, admin-only write
  public query func getTermsAndConditions() : async TermsAndConditions {
    termsAndConditions;
  };

  public shared ({ caller }) func updateTermsAndConditions(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update terms and conditions");
    };
    termsAndConditions := { content };
  };

  // Social Links - public read, admin-only write
  public query func getSocialLinks() : async SocialLinks {
    socialLinks;
  };

  public shared ({ caller }) func updateSocialLinks(youtube : Text, instagram : Text, telegram : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update social links");
    };
    socialLinks := {
      youtube;
      instagram;
      telegram;
    };
  };

  // Support Ticket - authenticated users only
  public shared ({ caller }) func createSupportTicket(playerName : Text, subject : Text, description : Text, screenshotBlob : ?Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create support tickets");
    };
    let playerId = caller.toText();
    let ticketId = "ticket_" # playerId # "_" # Time.now().toText();
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

  // Admin reply to support ticket
  public shared ({ caller }) func replyToSupportTicket(ticketId : Text, reply : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reply to support tickets");
    };
    switch (supportTickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket : SupportTicket = {
          ticket with
          adminReply = ?reply;
          repliedAt = ?Time.now();
          status = #replied;
        };
        supportTickets.add(ticketId, updatedTicket);
      };
    };
  };

  // Close support ticket - admin only
  public shared ({ caller }) func closeSupportTicket(ticketId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can close support tickets");
    };
    switch (supportTickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket : SupportTicket = {
          ticket with
          status = #closed;
        };
        supportTickets.add(ticketId, updatedTicket);
      };
    };
  };

  // OTP Generation - no authorization check; anonymous/unauthenticated callers allowed
  // so that new players can register and existing players can log in
  public shared ({ caller }) func generateOtp() : async Text {
    let otp = "1234";
    let otpEntry : OtpEntry = {
      otp;
      timestamp = Time.now();
    };
    otps.add(caller, otpEntry);
    otp;
  };

  // OTP Verification - no authorization check; anonymous/unauthenticated callers allowed
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

  // Find unused slots in tournaments - admin only
  public query ({ caller }) func findUnusedSlots() : async [Tournament] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view unused slots");
    };
    tournaments.values().toArray().filter(func(t) { t.filledSlots < t.totalSlots });
  };

  // Search support tickets by player name - admin only
  public query ({ caller }) func searchSupportTicketsByPlayerName(name : Text) : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search support tickets");
    };
    supportTickets.values().toArray().filter(func(ticket) { ticket.playerName.contains(#text name) });
  };

  // Get all support tickets sorted by createdAt - admin only
  public query ({ caller }) func getAllSupportTicketsSorted() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all support tickets");
    };
    supportTickets.values().toArray();
  };

  // Get tournaments by map - public, anyone can view
  public query func getTournamentsByMap(map : Text) : async [Tournament] {
    tournaments.values().toArray().filter(func(t) { t.map == map });
  };

  // Get all tournaments - public, anyone can view
  public query func getAllTournaments() : async [Tournament] {
    tournaments.values().toArray();
  };

  // Get tournament by id - public, anyone can view
  public query func getTournamentById(id : Text) : async ?Tournament {
    tournaments.get(id);
  };

  // Update tournament room details - admin only
  public shared ({ caller }) func updateTournamentRoomDetails(tournamentId : Text, roomId : Text, roomPassword : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tournament room details");
    };
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let updatedTournament : Tournament = {
          tournament with
          roomId = ?roomId;
          roomPassword = ?roomPassword;
        };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };

  // Update tournament status - admin only
  public shared ({ caller }) func updateTournamentStatus(tournamentId : Text, status : TournamentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tournament status");
    };
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let updatedTournament : Tournament = {
          tournament with
          status;
        };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };

  // Approve or reject a registration - admin only
  public shared ({ caller }) func updateRegistrationStatus(registrationId : Text, status : RegistrationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update registration status");
    };
    switch (registrations.get(registrationId)) {
      case (null) { Runtime.trap("Registration not found") };
      case (?registration) {
        let updatedRegistration : TournamentRegistration = {
          registration with
          status;
        };
        registrations.add(registrationId, updatedRegistration);
      };
    };
  };

  // Get all registrations for a tournament - admin only
  public query ({ caller }) func getRegistrationsForTournament(tournamentId : Text) : async [TournamentRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrations.values().toArray().filter(func(r) { r.tournamentId == tournamentId });
  };

  // Get caller's own registrations - authenticated users only
  public query ({ caller }) func getMyRegistrations() : async [TournamentRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their registrations");
    };
    let callerText = caller.toText();
    registrations.values().toArray().filter(func(r) { r.playerId == callerText });
  };

  // Get caller's own support tickets - authenticated users only
  public query ({ caller }) func getMySupportTickets() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their support tickets");
    };
    let callerText = caller.toText();
    supportTickets.values().toArray().filter(func(ticket) { ticket.playerId == callerText });
  };

  // Get all players - admin only
  public query ({ caller }) func getAllPlayers() : async [Player] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all players");
    };
    players.values().toArray();
  };

  // Update tournament QR code - admin only
  public shared ({ caller }) func updateTournamentQrCode(tournamentId : Text, qrCodeBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tournament QR codes");
    };
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let updatedTournament : Tournament = {
          tournament with
          qrCodeBlob = ?qrCodeBlob;
        };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };
};
