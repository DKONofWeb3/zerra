import { Link, NavLink, useLocation } from "react-router-dom";
import { PRIMARY_NAV, isNavActive } from "./navItems";
import { HeaderActions } from "./HeaderActions";
import "./topnav.css";

/** Desktop top bar from the Bloom design: logo, centred nav, bell + avatar. */
export function TopNav() {
  const { pathname } = useLocation();

  return (
    <header className="topnav">
      <Link to="/dashboard" className="topnav__logo" aria-label="Zerra">
        <img src="/dash/logo.png" alt="" />
      </Link>

      <nav className="topnav__links">
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(item.to, pathname);
          return (
            <NavLink key={item.to} to={item.to} className={active ? "topnav__item is-active" : "topnav__item"}>
              {item.label}
              {active && <i className="topnav__bar" aria-hidden />}
            </NavLink>
          );
        })}
      </nav>

      <HeaderActions size={48} />
    </header>
  );
}
