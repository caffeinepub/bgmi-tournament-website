import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldTournament = {
    id : Text;
    name : Text;
    dateTime : Int;
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
    status : {
      #upcoming;
      #ongoing;
      #closed;
      #completed;
    };
  };

  type OldActor = {
    domainName : Text;
    nextUserId : Nat;
    userProfiles : Map.Map<Principal, { displayName : Text; mobile : Text; bgmiPlayerId : Text }>;
    verifiedUsers : Map.Map<Text, { id : Text; displayName : Text; mobile : Text; bgmiPlayerId : Text; coinWallet : Nat }>;
    principalToUserId : Map.Map<Principal, Text>;
    players : Map.Map<Principal, { principal : Principal; mobile : Text; bgmiPlayerId : Text; displayName : Text }>;
    tournaments : Map.Map<Text, OldTournament>;
    registrations : Map.Map<Text, {
      registrationId : Text;
      tournamentId : Text;
      playerId : Text;
      paymentScreenshotBlob : Storage.ExternalBlob;
      status : {
        #pending;
        #approved;
        #rejected;
      };
    }>;
    supportTickets : Map.Map<Text, {
      ticketId : Text;
      playerId : Text;
      playerName : Text;
      subject : Text;
      description : Text;
      screenshotBlob : ?Storage.ExternalBlob;
      status : {
        #open;
        #replied;
        #closed;
      };
      createdAt : Int;
      adminReply : ?Text;
      repliedAt : ?Int;
    }>;
    otps : Map.Map<Principal, {
      otp : Text;
      timestamp : Int;
    }>;
    termsAndConditions : { content : Text };
    socialLinks : {
      youtube : Text;
      instagram : Text;
      telegram : Text;
    };
    adminPrincipal : ?Principal;
  };

  type NewTournament = {
    id : Text;
    name : Text;
    dateTime : Int;
    entryFee : Nat;
    prizePool : Nat;
    map : Text;
    totalSlots : Nat;
    filledSlots : Nat;
    upiId : Text;
    qrCodeBlob : ?Storage.ExternalBlob;
    roomId : ?Text;
    roomPassword : ?Text;
    youtubeUrl : ?Text;
    matchRules : Text;
    status : {
      #upcoming;
      #ongoing;
      #closed;
      #completed;
    };
  };

  type NewActor = {
    domainName : Text;
    nextUserId : Nat;
    userProfiles : Map.Map<Principal, { displayName : Text; mobile : Text; bgmiPlayerId : Text }>;
    verifiedUsers : Map.Map<Text, { id : Text; displayName : Text; mobile : Text; bgmiPlayerId : Text; coinWallet : Nat }>;
    principalToUserId : Map.Map<Principal, Text>;
    players : Map.Map<Principal, { principal : Principal; mobile : Text; bgmiPlayerId : Text; displayName : Text }>;
    tournaments : Map.Map<Text, NewTournament>;
    registrations : Map.Map<Text, {
      registrationId : Text;
      tournamentId : Text;
      playerId : Text;
      paymentScreenshotBlob : Storage.ExternalBlob;
      status : {
        #pending;
        #approved;
        #rejected;
      };
    }>;
    supportTickets : Map.Map<Text, {
      ticketId : Text;
      playerId : Text;
      playerName : Text;
      subject : Text;
      description : Text;
      screenshotBlob : ?Storage.ExternalBlob;
      status : {
        #open;
        #replied;
        #closed;
      };
      createdAt : Int;
      adminReply : ?Text;
      repliedAt : ?Int;
    }>;
    otps : Map.Map<Principal, {
      otp : Text;
      timestamp : Int;
    }>;
    termsAndConditions : { content : Text };
    socialLinks : {
      youtube : Text;
      instagram : Text;
      telegram : Text;
    };
    adminPrincipals : Map.Map<Principal, Bool>;
  };

  public func run(old : OldActor) : NewActor {
    let newTournaments = old.tournaments.map<Text, OldTournament, NewTournament>(
      func(_id, oldTournament) {
        { oldTournament with youtubeUrl = null };
      }
    );

    let adminPrincipals = Map.empty<Principal, Bool>();
    switch (old.adminPrincipal) {
      case (?adminP) {
        adminPrincipals.add(adminP, true);
      };
      case (null) {};
    };

    {
      old with
      tournaments = newTournaments;
      adminPrincipals;
    };
  };
};
