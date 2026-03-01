import React from 'react';
import { useGetTermsAndConditions } from '../hooks/useQueries';
import { Loader2, FileText } from 'lucide-react';

export default function TermsPage() {
  const { data: terms, isLoading } = useGetTermsAndConditions();

  const defaultContent = `1. Eligibility
Players must be 13 years or older to participate in Raj Empire Esports tournaments. By registering, you confirm that you meet this age requirement.

2. Registration & Payment
All tournament registrations require payment of the entry fee via UPI. Payment screenshots must be submitted as proof. Registrations are confirmed only after admin approval.

3. Fair Play Policy
Any form of cheating, hacking, or unsportsmanlike conduct will result in immediate disqualification and a permanent ban from future tournaments.

4. Prize Distribution
Prize money will be distributed within 48 hours of tournament completion. Winners must provide valid UPI details for prize transfer.

5. Cancellation Policy
Raj Empire Esports reserves the right to cancel or postpone tournaments due to technical issues or insufficient registrations. In such cases, full refunds will be provided.

6. Code of Conduct
Players are expected to maintain respectful behavior towards other participants, admins, and staff. Harassment or abusive language will not be tolerated.

7. Privacy Policy
Your personal information including mobile number and BGMI Player ID is collected solely for tournament management purposes and will not be shared with third parties.

8. Amendments
Raj Empire Esports reserves the right to modify these terms at any time. Continued participation constitutes acceptance of updated terms.`;

  const content = terms?.content || defaultContent;
  const sections = content.split('\n\n').filter(Boolean);

  const headingClasses = [
    'terms-heading-orange',
    'terms-heading-red',
    'terms-heading-amber',
    'terms-heading-crimson',
    'terms-heading-coral',
    'terms-heading-gold',
  ];
  const paraClasses = [
    'terms-para-orange',
    'terms-para-red',
    'terms-para-amber',
    'terms-para-crimson',
    'terms-para-coral',
    'terms-para-gold',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-brand-gradient py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/80">Please read these terms carefully before participating</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-brand-red" />
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-brand-sm overflow-hidden">
            <div className="terms-rainbow-bar" />
            <div className="p-6 md:p-8 space-y-6">
              {sections.map((section, idx) => {
                const lines = section.split('\n');
                const firstLine = lines[0];
                const rest = lines.slice(1).join('\n').trim();
                const isHeading = /^\d+\./.test(firstLine);
                const hClass = headingClasses[idx % headingClasses.length];
                const pClass = paraClasses[idx % paraClasses.length];

                return (
                  <div key={idx} className="space-y-2">
                    {isHeading ? (
                      <h2 className={`font-heading text-xl font-bold ${hClass}`}>{firstLine}</h2>
                    ) : (
                      <p className={`text-sm leading-relaxed ${pClass}`}>{firstLine}</p>
                    )}
                    {rest && (
                      <p className={`text-sm leading-relaxed ${pClass}`}>{rest}</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="terms-rainbow-bar" />
          </div>
        )}
      </div>
    </div>
  );
}
