import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";

export default function TermsPage() {
  usePageTitle("Terms of Service · Zerra");

  return (
    <div style={{
      minHeight: "100vh",
      background: "rgb(6 8 14)",
      fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
      color: "rgb(245 245 247)",
      padding: "64px 24px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Back */}
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgb(74 125 255)", textDecoration: "none", marginBottom: 48 }}>
          ← Back to Zerra
        </Link>

        {/* Header */}
        <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 12, lineHeight: 1.1 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: "rgb(100 104 116)", marginBottom: 48 }}>
          Last updated: June 1, 2026
        </p>

        <div style={{ fontSize: 15, lineHeight: 1.8, color: "rgb(180 184 196)" }}>

          <Section title="1. Acceptance of Terms">
            By accessing or using Zerra ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
          </Section>

          <Section title="2. Description of Service">
            Zerra is a creator monetization platform that allows content creators to connect their social media accounts, participate in influence campaigns, and earn USDC rewards for creating content that promotes crypto projects and other brands.
          </Section>

          <Section title="3. Eligibility">
            You must be at least 18 years of age to use the Platform. By using the Platform, you represent and warrant that you meet this requirement and that you have the legal capacity to enter into these Terms.
          </Section>

          <Section title="4. Account Registration">
            To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials.
          </Section>

          <Section title="5. Connected Social Accounts">
            The Platform allows you to connect third-party social media accounts such as TikTok and Instagram. By connecting these accounts, you authorize Zerra to access certain data from these platforms in accordance with their respective terms of service and our Privacy Policy. You may disconnect these accounts at any time through your account settings.
          </Section>

          <Section title="6. Campaigns and Earnings">
            Participation in influence campaigns is subject to campaign-specific terms. USDC earnings are credited to your account upon successful campaign completion and verification. Zerra reserves the right to withhold or reverse earnings in cases of fraud, policy violations, or disputes.
          </Section>

          <Section title="7. Prohibited Conduct">
            You agree not to: (a) violate any applicable laws or regulations; (b) submit fraudulent or misleading content; (c) impersonate any person or entity; (d) attempt to manipulate engagement metrics; (e) use the Platform for any unlawful purpose.
          </Section>

          <Section title="8. Intellectual Property">
            All content, trademarks, and intellectual property on the Platform are owned by or licensed to Zerra. You retain ownership of content you create, but grant Zerra a non-exclusive license to use such content in connection with operating the Platform.
          </Section>

          <Section title="9. Disclaimers">
            The Platform is provided "as is" without warranties of any kind. Zerra does not guarantee the availability of campaigns, the amount of earnings, or the continuous availability of the Platform.
          </Section>

          <Section title="10. Limitation of Liability">
            To the maximum extent permitted by law, Zerra shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.
          </Section>

          <Section title="11. Changes to Terms">
            Zerra reserves the right to modify these Terms at any time. We will notify users of significant changes. Continued use of the Platform after changes constitutes acceptance of the new Terms.
          </Section>

          <Section title="12. Contact">
            If you have questions about these Terms, please contact us at <a href="mailto:legal@zerra.pro" style={{ color: "rgb(74 125 255)", textDecoration: "none" }}>legal@zerra.pro</a>.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "rgb(245 245 247)", marginBottom: 10 }}>{title}</h2>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}