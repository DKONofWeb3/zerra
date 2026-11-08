import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import "./home.css";

// New homepage (Figma 587:337 desktop / 587:391 mobile). The profile card is the
// design's showcase sample, not a real account.

const SIGNIN = "/login?mode=signin";
const SIGNUP = "/login?mode=signup";

/** The 3D badge panel. The art is cut from one sprite sheet, positioned exactly as in the design. */
function BadgeArt() {
  return (
    <div className="hm-art" aria-hidden>
      <div className="hm-sp hm-sp1"><img src="/home/sprite.png" alt="" /></div>
      <div className="hm-sp hm-sp2"><img src="/home/sprite.png" alt="" /></div>
      <div className="hm-g1"><img src="/home/glow-a.svg" alt="" /></div>
      <div className="hm-g1"><img src="/home/glow-a.svg" alt="" /></div>
      <div className="hm-sp4"><div><img src="/home/sprite.png" alt="" /></div></div>
      <div className="hm-g2"><img src="/home/glow-b.svg" alt="" /></div>
      <div className="hm-g3"><img src="/home/glow-c.svg" alt="" /></div>
    </div>
  );
}

function Profile() {
  return (
    <>
      <div className="hm-who">
        <img className="hm-who__avatar" src="/home/avatar.png" alt="" />
        <div>
          <div className="hm-who__name">John Doe <img src="/home/verified.svg" alt="" /></div>
          <div className="hm-who__handle">@johndoe</div>
        </div>
      </div>
      <dl className="hm-metrics">
        <div><dt>Main Metric:</dt><dd>94.9</dd></div>
        <div><dt>Daily Streak:</dt><dd>21 Days</dd></div>
        <div><dt>Signal Rate</dt><dd>Top 1%</dd></div>
      </dl>
    </>
  );
}

export default function HomePage() {
  usePageTitle("Zerra · View your importance on CT");
  const [menu, setMenu] = useState(false);

  return (
    <div className="hm">
      <div className="hm-bg" aria-hidden />
      <div className="hm-shape" aria-hidden><img src="/home/sprite.png" alt="" /></div>

      <header className="hm-head">
        <Link to="/" className="hm-brand" aria-label="Zerra">
          <img src="/dash/logo.png" alt="" />
          <span>Zerra</span>
        </Link>

        <nav className="hm-toggle" aria-label="Primary">
          <Link to="/" className="is-on">Home</Link>
          <Link to={SIGNIN}>Login</Link>
        </nav>

        <button type="button" className="hm-burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <img src="/home/burger.svg" alt="" />
        </button>
        {menu && (
          <div className="hm-menu" role="menu">
            <Link role="menuitem" to={SIGNIN}>Log in</Link>
            <Link role="menuitem" to={SIGNUP}>Start your journey</Link>
          </div>
        )}
      </header>

      {/* Desktop card */}
      <aside className="hm-card hm-card--desk">
        <div className="hm-panel"><BadgeArt /></div>
        <Profile />
        <Link to={SIGNIN} className="hm-btn hm-btn--ghost">Log in</Link>
        <Link to={SIGNUP} className="hm-btn hm-btn--solid">Start your journey</Link>
      </aside>

      <section className="hm-copy">
        <h1>VIEW YOUR<br />IMPORTANCE<br />ON CT</h1>
        <p>Creator Discipline Engine</p>
        <div className="hm-cta">
          <Link to={SIGNIN} className="hm-cta__ghost">Log in</Link>
          <Link to={SIGNUP} className="hm-cta__solid">Start your journey</Link>
        </div>
      </section>

      {/* Mobile card */}
      <aside className="hm-card hm-card--mob">
        <div className="hm-panel"><BadgeArt /></div>
        <div className="hm-mob__info"><Profile /></div>
      </aside>
    </div>
  );
}
