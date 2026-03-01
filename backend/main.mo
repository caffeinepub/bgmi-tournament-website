import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var domainName : Text = "Raj-Empire-Esports";
  var nextUserId : Nat = 1;

  type UserProfile = {
    displayName : Text;
    mobile : Text;
    bgmiPlayerId : Text;
  };

  type VerifiedUserProfile = {
    id : Text;
    displayName : Text;
    mobile : Text;
    bgmiPlayerId : Text;
    coinWallet : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  // Maps userId (REE-xxx) -> VerifiedUserProfile
  let verifiedUsers = Map.empty<Text, VerifiedUserProfile>();
  // Maps Principal -> userId (REE-xxx) for ownership verification
  let principalToUserId = Map.empty<Principal, Text>();

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

  let players = Map.empty<Principal, Player>();

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

  let tournaments = Map.empty<Text, Tournament>();

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

  let registrations = Map.empty<Text, TournamentRegistration>();

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

  let supportTickets = Map.empty<Text, SupportTicket>();

  type OtpEntry = {
    otp : Text;
    timestamp : Time.Time;
  };

  let otps = Map.empty<Principal, OtpEntry>();

  type TermsAndConditions = {
    content : Text;
  };

  var termsAndConditions : TermsAndConditions = { content = "" };

  type SocialLinks = {
    youtube : Text;
    instagram : Text;
    telegram : Text;
  };

  var socialLinks : SocialLinks = {
    youtube = "";
    instagram = "";
    telegram = "";
  };

  var adminPrincipal : ?Principal = null;

  // Helper: verify that the caller owns the given userId
  func callerOwnsUserId(caller : Principal, userId : Text) : Bool {
    switch (principalToUserId.get(caller)) {
      case (null) { false };
      case (?id) { id == userId };
    };
  };

  public shared ({ caller }) func registerAdminPrincipal(p : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can register an admin principal");
    };
    if (adminPrincipal == null) {
      adminPrincipal := ?p;
      true;
    } else {
      false;
    };
  };

  public query func getAdminPrincipal() : async ?Principal {
    adminPrincipal;
  };

  public query func isAdminPrincipal(p : Principal) : async Bool {
    switch (adminPrincipal) {
      case (null) { false };
      case (?adminP) { adminP == p };
    };
  };

  public query func getDomainName() : async Text {
    domainName;
  };

  public shared ({ caller }) func setDomainName(newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the domain name");
    };
    domainName := newName;
  };

  public shared ({ caller }) func registerPlayer(mobile : Text, bgmiPlayerId : Text, displayName : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as a player");
    };
    // Prevent duplicate registration
    switch (principalToUserId.get(caller)) {
      case (?existingId) { return existingId };
      case (null) {};
    };
    let idNum = nextUserId;
    nextUserId += 1;
    let paddedNum = if (idNum < 10) { "00" # idNum.toText() }
    else if (idNum < 100) { "0" # idNum.toText() }
    else { idNum.toText() };
    let playerId = "REE-" # paddedNum;

    let player : Player = {
      principal = caller;
      mobile;
      bgmiPlayerId;
      displayName;
    };
    players.add(caller, player);

    let verifiedUser : VerifiedUserProfile = {
      id = playerId;
      displayName;
      mobile;
      bgmiPlayerId;
      coinWallet = 0;
    };
    verifiedUsers.add(playerId, verifiedUser);
    principalToUserId.add(caller, playerId);
    playerId;
  };

  // Query wallet balance: caller must own the userId or be admin
  public query ({ caller }) func getWalletBalance(userId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get wallet balance");
    };
    if (not callerOwnsUserId(caller, userId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own wallet balance");
    };
    switch (verifiedUsers.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user.coinWallet };
    };
  };

  // Admin-only: add coins to a user's wallet (e.g. after approving payment proof)
  public shared ({ caller }) func addCoins(userId : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add coins");
    };
    switch (verifiedUsers.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = {
          user with
          coinWallet = user.coinWallet + amount;
        };
        verifiedUsers.add(userId, updatedUser);
      };
    };
  };

  // Admin-only: deduct coins from a user's wallet (privileged operation)
  public shared ({ caller }) func deductCoins(userId : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can deduct coins");
    };
    switch (verifiedUsers.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.coinWallet < amount) {
          Runtime.trap("Insufficient coins");
        } else {
          let updatedUser = {
            user with
            coinWallet = user.coinWallet - amount;
          };
          verifiedUsers.add(userId, updatedUser);
        };
      };
    };
  };

  // Admin-only: add prize coins to a winner's wallet
  public shared ({ caller }) func addPrizeCoins(userId : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add prize coins");
    };
    switch (verifiedUsers.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = {
          user with
          coinWallet = user.coinWallet + amount;
        };
        verifiedUsers.add(userId, updatedUser);
      };
    };
  };

  // Admin-only: distribute prize coins to a tournament winner
  public shared ({ caller }) func distributePrizeCoins(tournamentId : Text, winnerUserId : Text, prizeAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can distribute prize coins");
    };
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?_tournament) {
        switch (verifiedUsers.get(winnerUserId)) {
          case (null) { Runtime.trap("Winner user not found") };
          case (?user) {
            let updatedUser = {
              user with
              coinWallet = user.coinWallet + prizeAmount;
            };
            verifiedUsers.add(winnerUserId, updatedUser);
          };
        };
      };
    };
  };

  type PaymentProof = {
    proofId : Text;
    userId : Text;
    amount : Nat;
    imageBase64 : Text;
    transactionRef : Text;
    timestamp : Time.Time;
    status : PaymentProofStatus;
  };

  type PaymentProofStatus = {
    #pending;
    #approved;
    #rejected;
  };

  let paymentProofs = Map.empty<Text, PaymentProof>();

  // Authenticated user submits payment proof for their own userId
  public shared ({ caller }) func submitPaymentProof(userId : Text, amount : Nat, imageBase64 : Text, transactionRef : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit payment proofs");
    };
    if (not callerOwnsUserId(caller, userId)) {
      Runtime.trap("Unauthorized: Can only submit payment proof for your own account");
    };
    let proofId = "proof_" # userId # "_" # Time.now().toText();
    let proof : PaymentProof = {
      proofId;
      userId;
      amount;
      imageBase64;
      transactionRef;
      timestamp = Time.now();
      status = #pending;
    };
    paymentProofs.add(proofId, proof);
    proofId;
  };

  // Admin approves payment proof and adds coins
  public shared ({ caller }) func approvePaymentProof(proofId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can approve payment proofs");
    };
    switch (paymentProofs.get(proofId)) {
      case (null) { Runtime.trap("Payment proof not found") };
      case (?proof) {
        if (proof.status != #pending) {
          Runtime.trap("Payment proof is not in pending status");
        };
        let updatedProof = { proof with status = #approved };
        paymentProofs.add(proofId, updatedProof);
        // Add coins equal to the Rs. amount (1 Rs. = 1 Coin)
        switch (verifiedUsers.get(proof.userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser = {
              user with
              coinWallet = user.coinWallet + proof.amount;
            };
            verifiedUsers.add(proof.userId, updatedUser);
          };
        };
      };
    };
  };

  // Admin rejects payment proof
  public shared ({ caller }) func rejectPaymentProof(proofId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can reject payment proofs");
    };
    switch (paymentProofs.get(proofId)) {
      case (null) { Runtime.trap("Payment proof not found") };
      case (?proof) {
        if (proof.status != #pending) {
          Runtime.trap("Payment proof is not in pending status");
        };
        let updatedProof = { proof with status = #rejected };
        paymentProofs.add(proofId, updatedProof);
      };
    };
  };

  // Admin views all payment proofs
  public query ({ caller }) func getAllPaymentProofs() : async [PaymentProof] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all payment proofs");
    };
    paymentProofs.values().toArray();
  };

  // User views their own payment proofs
  public query ({ caller }) func getMyPaymentProofs(userId : Text) : async [PaymentProof] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payment proofs");
    };
    if (not callerOwnsUserId(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own payment proofs");
    };
    paymentProofs.values().toArray().filter(func(p) { p.userId == userId });
  };

  type WithdrawalRequest = {
    requestId : Text;
    userId : Text;
    amount : Nat;
    upiId : Text;
    status : WithdrawalStatus;
    timestamp : Time.Time;
  };

  type WithdrawalStatus = {
    #pending;
    #processed;
    #rejected;
  };

  let withdrawalRequests = Map.empty<Text, WithdrawalRequest>();

  // User submits withdrawal request for their own userId; coins deducted immediately
  public shared ({ caller }) func submitWithdrawalRequest(userId : Text, amount : Nat, upiId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit withdrawal requests");
    };
    if (not callerOwnsUserId(caller, userId)) {
      Runtime.trap("Unauthorized: Can only submit withdrawal requests for your own account");
    };
    switch (verifiedUsers.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.coinWallet < amount) {
          Runtime.trap("Insufficient coins");
        } else {
          let updatedUser = {
            user with
            coinWallet = user.coinWallet - amount;
          };
          verifiedUsers.add(userId, updatedUser);

          let requestId = "withdrawal_" # userId # "_" # Time.now().toText();
          let request : WithdrawalRequest = {
            requestId;
            userId;
            amount;
            upiId;
            status = #pending;
            timestamp = Time.now();
          };
          withdrawalRequests.add(requestId, request);
          requestId;
        };
      };
    };
  };

  public shared ({ caller }) func markWithdrawalRequestProcessed(requestId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can process withdrawal requests");
    };
    switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        let updatedRequest = {
          request with
          status = #processed;
        };
        withdrawalRequests.add(requestId, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawalRequest(requestId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can reject withdrawal requests");
    };
    switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Withdrawal request is not in pending status");
        };
        let updatedRequest = {
          request with
          status = #rejected;
        };
        withdrawalRequests.add(requestId, updatedRequest);
        // Refund coins on rejection
        switch (verifiedUsers.get(request.userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser = {
              user with
              coinWallet = user.coinWallet + request.amount;
            };
            verifiedUsers.add(request.userId, updatedUser);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllWithdrawalRequests() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view withdrawal requests");
    };
    withdrawalRequests.values().toArray();
  };

  // User views their own withdrawal requests
  public query ({ caller }) func getMyWithdrawalRequests(userId : Text) : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view withdrawal requests");
    };
    if (not callerOwnsUserId(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own withdrawal requests");
    };
    withdrawalRequests.values().toArray().filter(func(r) { r.userId == userId });
  };

  public shared ({ caller }) func createTournament(name : Text, dateTime : Time.Time, entryFee : Nat, prizePool : Nat, map : Text, totalSlots : Nat, upiId : Text, matchRules : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tournaments");
    };
    let id = "tournament_" # name # "_" # entryFee.toText() # "_" # Time.now().toText();
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

  // Register for tournament with payment screenshot blob; deducts entry fee coins from player's wallet
  public shared ({ caller }) func registerForTournament(tournamentId : Text, playerId : Text, paymentScreenshotBlob : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register for tournaments");
    };
    if (not callerOwnsUserId(caller, playerId)) {
      Runtime.trap("Unauthorized: Can only register for tournaments using your own player ID");
    };
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        if (tournament.filledSlots >= tournament.totalSlots) {
          Runtime.trap("Tournament is full");
        };
        switch (verifiedUsers.get(playerId)) {
          case (null) { Runtime.trap("Player not found") };
          case (?player) {
            if (player.coinWallet < tournament.entryFee) {
              Runtime.trap("Insufficient coins to register");
            } else {
              let updatedPlayer = {
                player with
                coinWallet = player.coinWallet - tournament.entryFee;
              };
              verifiedUsers.add(playerId, updatedPlayer);

              let registrationId = "reg_" # playerId # "_" # tournamentId;
              let registration : TournamentRegistration = {
                registrationId;
                tournamentId;
                playerId;
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
      };
    };
  };

  // Register for tournament using only coins (no payment screenshot)
  public shared ({ caller }) func registerForTournamentWithCoins(tournamentId : Text, playerId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register for tournaments");
    };
    if (not callerOwnsUserId(caller, playerId)) {
      Runtime.trap("Unauthorized: Can only register for tournaments using your own player ID");
    };
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        if (tournament.filledSlots >= tournament.totalSlots) {
          Runtime.trap("Tournament is full");
        };
        switch (verifiedUsers.get(playerId)) {
          case (null) { Runtime.trap("Player not found") };
          case (?player) {
            if (player.coinWallet < tournament.entryFee) {
              Runtime.trap("Insufficient coins to register");
            } else {
              let updatedPlayer = {
                player with
                coinWallet = player.coinWallet - tournament.entryFee;
              };
              verifiedUsers.add(playerId, updatedPlayer);

              let registrationId = "reg_" # playerId # "_" # tournamentId;
              let registration : TournamentRegistration = {
                registrationId;
                tournamentId;
                playerId;
                paymentScreenshotBlob = "";
                status = #approved;
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
      };
    };
  };

  public query func getTermsAndConditions() : async TermsAndConditions {
    termsAndConditions;
  };

  public shared ({ caller }) func updateTermsAndConditions(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update terms and conditions");
    };
    termsAndConditions := { content };
  };

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

  // OTP generation requires authenticated user
  public shared ({ caller }) func generateOtp() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can generate OTPs");
    };
    let otp = "1234";
    let otpEntry : OtpEntry = {
      otp;
      timestamp = Time.now();
    };
    otps.add(caller, otpEntry);
    otp;
  };

  // OTP verification requires authenticated user
  public shared ({ caller }) func verifyOtp(otp : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify OTPs");
    };
    switch (otps.get(caller)) {
      case (null) { false };
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

  public query ({ caller }) func findUnusedSlots() : async [Tournament] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view unused slots");
    };
    tournaments.values().toArray().filter(func(t) { t.filledSlots < t.totalSlots });
  };

  public query ({ caller }) func searchSupportTicketsByPlayerName(name : Text) : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search support tickets");
    };
    supportTickets.values().toArray().filter(func(ticket) { ticket.playerName.contains(#text name) });
  };

  public query ({ caller }) func getAllSupportTicketsSorted() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all support tickets");
    };
    supportTickets.values().toArray();
  };

  public query ({ caller }) func getTournamentsByMap(map : Text) : async [Tournament] {
    // Public query filtered by map; no auth required
    tournaments.values().toArray().filter(func(t) { t.map == map });
  };

  public query func getAllTournaments() : async [Tournament] {
    tournaments.values().toArray();
  };

  public query func getTournamentById(id : Text) : async ?Tournament {
    tournaments.get(id);
  };

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

  public query ({ caller }) func getRegistrationsForTournament(tournamentId : Text) : async [TournamentRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrations.values().toArray().filter(func(r) { r.tournamentId == tournamentId });
  };

  public query ({ caller }) func getMyRegistrations() : async [TournamentRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their registrations");
    };
    // Match by the caller's userId (REE-xxx) rather than raw principal text
    switch (principalToUserId.get(caller)) {
      case (null) { [] };
      case (?userId) {
        registrations.values().toArray().filter(func(r) { r.playerId == userId });
      };
    };
  };

  public query ({ caller }) func getMySupportTickets() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their support tickets");
    };
    let callerText = caller.toText();
    supportTickets.values().toArray().filter(func(ticket) { ticket.playerId == callerText });
  };

  public query ({ caller }) func getAllPlayers() : async [Player] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all players");
    };
    players.values().toArray();
  };

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

  public query ({ caller }) func getAllVerifiedUsers() : async [VerifiedUserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all verified users");
    };
    verifiedUsers.values().toArray();
  };

  // Query wallet balance by userId: caller must own the userId or be admin
  public query ({ caller }) func getUserWalletBalance(userId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get wallet balance");
    };
    if (not callerOwnsUserId(caller, userId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own wallet balance");
    };
    switch (verifiedUsers.get(userId)) {
      case (null) { 0 };
      case (?user) { user.coinWallet };
    };
  };

  // Get the userId (REE-xxx) for the calling principal
  public query ({ caller }) func getMyUserId() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their user ID");
    };
    principalToUserId.get(caller);
  };
};
