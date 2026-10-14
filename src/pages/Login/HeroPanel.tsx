import { InstagramGlyph, TikTokGlyph, XGlyph, YouTubeGlyph } from "./AuthIcons";

export default function HeroPanel() {
  return (
    <section className="hero" aria-label="About Zerra">
      <a className="hero__brand" href="/">
        <img src="/login-bg/z-logo.png" alt="" />
        Zerra
      </a>

      <div className="hero__stage" aria-hidden="true">
        <svg className="hero__orbit" viewBox="0 0 400 400" fill="none" stroke="currentColor">
          <circle cx="200" cy="200" r="196" strokeWidth="1" strokeDasharray="2 7" />
          <circle cx="200" cy="200" r="140" strokeWidth="1" />
        </svg>
        <div className="hero__z-wrap">
          <div className="hero__z" />
        </div>
        <span className="tile tile--a"><TikTokGlyph /></span>
        <span className="tile tile--b"><XGlyph /></span>
        <span className="tile tile--c"><InstagramGlyph /></span>
        <span className="tile tile--d"><YouTubeGlyph /></span>
      </div>

      <div className="hero__copy">
        <h1>The #1 Creator Operating System</h1>
        <p>Access your earnings, points, rewards and projects anytime, anywhere, and keep everything flowing in one place.</p>
      </div>
    </section>
  );
}
