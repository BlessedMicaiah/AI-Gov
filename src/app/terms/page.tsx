import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import { Footer } from "@/components/sections";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of GovSecure — the AI governance platform for SMBs.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | GovSecure",
    description: "The terms that govern your use of GovSecure.",
    url: "/terms",
  },
};

interface LegalSection {
  title: string;
  paragraphs: string[];
}

const SECTIONS: LegalSection[] = [
  {
    title: "1. Acceptance of these terms",
    paragraphs: [
      "By creating an account or using GovSecure (the \"Service\"), you agree to be bound by these Terms of Service. If you are using the Service on behalf of an organisation, you confirm that you have authority to bind that organisation, and \"you\" refers to that organisation.",
    ],
  },
  {
    title: "2. The Service",
    paragraphs: [
      "GovSecure provides AI governance tooling for small and mid-sized businesses, including the Govi AI Advisor, risk assessments, and generated governance artefacts such as policies, DPIAs, threat models, and playbooks.",
      "Outputs produced by the Service — including risk assessments and generated documents — are preliminary, informational starting points. They are not legal advice and do not replace review by qualified governance, privacy, or legal counsel.",
    ],
  },
  {
    title: "3. Your account",
    paragraphs: [
      "You are responsible for safeguarding your account credentials and for all activity that occurs under your account. You must provide accurate registration information and promptly notify us of any unauthorised use of your account.",
    ],
  },
  {
    title: "4. Acceptable use",
    paragraphs: [
      "You agree not to misuse the Service, including by attempting to gain unauthorised access, disrupting its operation, reverse engineering it, or using it to develop a competing product. You must not submit content that is unlawful or that you do not have the right to share.",
    ],
  },
  {
    title: "5. Your content",
    paragraphs: [
      "You retain ownership of the information you submit to the Service and the documents you generate with it. You grant us the limited rights needed to operate the Service — to store, process, and display your content back to you.",
    ],
  },
  {
    title: "6. Subscriptions and billing",
    paragraphs: [
      "Paid plans are billed in advance on a recurring basis and renew automatically until cancelled. You can cancel at any time, in which case your plan remains active until the end of the current billing period. Fees are non-refundable except where required by law.",
    ],
  },
  {
    title: "7. Disclaimers and limitation of liability",
    paragraphs: [
      "The Service is provided \"as is\" without warranties of any kind, express or implied. To the maximum extent permitted by law, GovSecure is not liable for indirect, incidental, special, or consequential damages, or for any loss of profits, data, or business arising from your use of the Service.",
      "Our total liability for any claim arising out of these terms or the Service is limited to the amounts you paid us in the twelve months preceding the claim.",
    ],
  },
  {
    title: "8. Termination",
    paragraphs: [
      "You may stop using the Service and delete your account at any time. We may suspend or terminate access for breach of these terms, with notice where practicable.",
    ],
  },
  {
    title: "9. Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. If we make material changes we will notify you — for example by email or an in-app notice — before the changes take effect. Continued use of the Service after the effective date constitutes acceptance.",
    ],
  },
  {
    title: "10. Contact",
    paragraphs: [
      "Questions about these terms? Contact us at hello@govsecure.ai.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="section min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: "Terms of Service" }]} />

          <header className="mb-12">
            <span className="font-mono text-terminal-green text-sm uppercase tracking-wider mb-4 block">
              Legal
            </span>
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-terminal-text mb-4">
              Terms of Service
            </h1>
            <p className="text-sm font-mono text-terminal-muted">
              Last updated: June 10, 2026
            </p>
          </header>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-mono text-lg font-bold text-terminal-text mb-3">
                  {section.title}
                </h2>
                {section.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-terminal-muted font-sans leading-relaxed mb-3"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
