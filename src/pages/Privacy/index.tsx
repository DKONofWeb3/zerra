import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  usePageTitle("Privacy Policy · Zerra");

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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "rgb(100 104 116)", marginBottom: 48 }}>
          Last updated: June 1, 2026
        </p>

        <div style={{ fontSize: 15, lineHeight: 1.8, color: "rgb(180 184 196)" }}>

          <Section title="1. Introduction">
            Zerra ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at zerra.pro.
          </Section>

          <Section title="2. Information We Collect">
            We collect information you provide directly to us, including: name, email address, and profile information when you create an account. We also collect data from connected social media accounts (such as TikTok) including profile information, post metrics, engagement data, and follower counts — only with your explicit authorization.
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect to: (a) provide, maintain, and improve the Platform; (b) process campaign participation and calculate earnings; (c) display your analytics and performance data; (d) communicate with you about the Platform; (e) detect and prevent fraudulent activity.
          </Section>

          <Section title="4. TikTok Data">
            When you connect your TikTok account, we access data permitted by TikTok's Login Kit, including your profile information, video list, and engagement statistics. We use this data solely to provide analytics features within Zerra. We do not sell or share your TikTok data with third parties. You can disconnect your TikTok account at any time through Settings → Connected Accounts.
          </Section>

          <Section title="5. Data Storage and Security">
            Your data is stored securely using industry-standard encryption. We use Supabase for database storage and authentication. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Section>

          <Section title="6. Data Sharing">
            We do not sell your personal information. We may share your information with: (a) service providers who assist in operating the Platform; (b) campaign sponsors, only the analytics data relevant to their campaigns and only in aggregated or anonymized form unless you explicitly consent to more; (c) law enforcement when required by law.
          </Section>

          <Section title="7. Your Rights">
            You have the right to: (a) access the personal information we hold about you; (b) correct inaccurate data; (c) request deletion of your data; (d) disconnect any connected social accounts; (e) export your data. To exercise these rights, contact us at privacy@zerra.pro or use the account deletion option in Settings.
          </Section>

          <Section title="8. Cookies">
            We use essential cookies to maintain your session and authentication state. We do not use advertising or tracking cookies.
          </Section>

          <Section title="9. Children's Privacy">
            The Platform is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information, we will delete it.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Platform. Your continued use of the Platform after changes constitutes acceptance of the updated Policy.
          </Section>

          <Section title="11. Contact Us">
            If you have questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@zerra.pro" style={{ color: "rgb(74 125 255)", textDecoration: "none" }}>privacy@zerra.pro</a>.
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