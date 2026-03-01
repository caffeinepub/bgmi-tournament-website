module {
  type OldActor = {
    domainName : Text;
    termsAndConditions : {
      content : Text;
    };
    socialLinks : {
      youtube : Text;
      instagram : Text;
      telegram : Text;
    };
  };

  type NewActor = {
    domainName : Text;
    termsAndConditions : {
      content : Text;
    };
    socialLinks : {
      youtube : Text;
      instagram : Text;
      telegram : Text;
    };
    adminPrincipal : ?Principal;
  };

  public func run(old : OldActor) : NewActor {
    { old with adminPrincipal = null };
  };
};
