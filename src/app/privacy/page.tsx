import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import { Footer } from "@/components/sections";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GovSecure collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | GovSecure",
    description: "How GovSecure collects, uses, and protects your personal data.",
    url: "/privacy",
  },
};

interface LegalSection {
  title: string;
  paragraphs: string[];
}

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who we are",
    paragraphs: [
      "GovSecure provides AI governance tooling for small and mid-sized businesses. This policy explains what personal data we collect when you use GovSecure, how we use it, and the choices you have. For data you submit about your own organisation's AI systems, you remain the controller and we process it on your behalf.",
    ],
  },
  {
    title: "2. Data we collect",
    paragraphs: [
      "Account data: your name, email address, password (stored as a salted hash, never in plain text), and onboarding answers such as your role, the AI tools your business uses, and your governance concerns.",
      "Content you provide: questions you ask Govi, answers to assessment questions, and documents you generate. This may include information about your organisation's systems and processes — please avoid submitting personal data about third parties unless necessary.",
      "Usage and technical data: log and audit events (such as sign-ins and document generation), and the technical metadata needed to operate and secure the Service.",
    ],
  },
  {
    title: "3. How we use your data",
    paragraphs: [
      "We use your data to operate the Service: authenticate you, run risk assessments, generate governance documents, tailor Govi's questions to your role, and provide support.",
      "Your conversations with Govi are sent to our AI model providers to generate responses. We do not sell your personal data, and we do not use your content to train our own models.",
    ],
  },
  {
    title: "4. Legal bases",
    paragraphs: [
      "Where the GDPR applies, we process your data on the basis of contract performance (providing the Service you signed up for), legitimate interests (securing and improving the Service), and consent where required (for example, optional communications).",
    ],
  },
  {
    title: "5. Sharing",
    paragraphs: [
      "We share data only with service providers that help us run GovSecure — such as hosting, database, email delivery, payment processing, and AI model providers — under contracts that restrict their use of your data. We may disclose data where required by law.",
    ],
  },
  {
    title: "6. Retention",
    paragraphs: [
      "We keep your data while your account is active. If you delete your account, we delete or anonymise your personal data within a reasonable period, except where we must retain it to comply with legal obligations.",
    ],
  },
  {
    title: "7. Your rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, export, restrict, or delete your personal data, and to object to certain processing. To exercise any of these rights, contact us at hello@govsecure.ai. You also have the right to lodge a complaint with your supervisory authority.",
    ],
  },
  {
    title: "8. Security",
    paragraphs: [
      "We protect your data with encryption in transit, hashed credentials, access controls, and audit logging. No system is perfectly secure — if we become aware of a breach affecting your data, we will notify you as required by law.",
    ],
  },
  {
    title: "9. Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. If we make material changes we will notify you before they take effect, for example by email or an in-app notice.",
    ],
  },
  {
    title: "10. Contact",
    paragraphs: [
      "Privacy questions or requests? Contact us at hello@govsecure.ai.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="section min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />

          <header className="mb-12">
            <span className="font-mono text-terminal-green text-sm uppercase tracking-wider mb-4 block">
              Legal
            </span>
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-terminal-text mb-4">
              Privacy Policy
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
