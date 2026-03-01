import React from 'react';
import { useGetTermsAndConditions } from '../hooks/useQueries';
import { Loader2, FileText } from 'lucide-react';

const FALLBACK_TERMS = `1. Eligibility
All participants must be 13 years or older to participate in Raj Empire Esports Arena tournaments. By registering, you confirm that you meet this age requirement.

2. Registration & Payment
Entry fees are non-refundable once the tournament has started. Players must complete payment and upload a valid screenshot to complete registration. Admin approval is required before participation is confirmed.

3. Fair Play
Any form of cheating, hacking, or unsportsmanlike conduct will result in immediate disqualification and a permanent ban from the platform. All players are expected to maintain fair play at all times.

4. Tournament Rules
Players must join the room using the provided Room ID and Password at least 5 minutes before the match starts. Late entries will not be accommodated. Match results are final and non-negotiable.

5. Prize Distribution
Prize money will be distributed within 24-48 hours after the tournament concludes. Winners must provide valid UPI details for prize transfer. Raj Empire Esports Arena is not responsible for delays caused by incorrect payment information.

6. Privacy Policy
Your personal information (name, mobile number, BGMI Player ID) is collected solely for tournament management purposes and will not be shared with third parties without your consent.

7. Modifications
Raj Empire Esports Arena reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.`;

const HEADING_COLORS = [
  'text-brand-orange',
  'text-cyan-400',
  'text-pink-400',
  'text-yellow-400',
  'text-lime-400',
  'text-purple-400',
  'text-blue-400',
];

function parseTerms(content: string) {
  const lines = content.split('\n').filter((l) => l.trim());
  const sections: { heading: string; body: string[] }[] = [];
  let current: { heading: string; body: string[] } | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: line.trim(), body: [] };
    } else if (current) {
      current.body.push(line.trim());
    }
  }
  if (current) sections.push(current);
  return sections;
}

export default function TermsPage() {
  const { data: terms, isLoading } = useGetTermsAndConditions();
  const content = terms?.content || FALLBACK_TERMS;
  const sections = parseTerms(content);

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Hero */}
      <div
        className="py-12 px-4 sm:px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #C0100A 0%, #E03010 50%, #FF6A00 100%)' }}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-4">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-orbitron font-black text-white text-3xl sm:text-4xl mb-2">
          Terms & Conditions
        </h1>
        <p className="text-white/80 text-sm">Please read these terms carefully before participating</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          </div>
        ) : (
          <div className="bg-brand-dark border border-brand-red/20 rounded-2xl overflow-hidden">
            {/* Rainbow bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-red via-brand-orange to-yellow-400" />
            <div className="p-6 sm:p-8 space-y-7">
              {sections.map((section, i) => (
                <div key={i} className={`border-l-4 pl-4 ${i % 2 === 0 ? 'border-brand-red' : 'border-brand-orange'}`}>
                  <h2 className={`font-orbitron font-bold text-base mb-2 ${HEADING_COLORS[i % HEADING_COLORS.length]}`}>
                    {section.heading}
                  </h2>
                  {section.body.map((para, j) => (
                    <p key={j} className="text-gray-300 text-sm leading-relaxed mb-1.5">
                      {para}
                    </p>
                  ))}
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-gray-400 text-sm">{content}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
