import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import LogoMark from './LogoMark';
import { useBranding } from '../lib/branding';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Boards', to: '/boards' },
  { label: 'Societies', to: '/societies' },
  { label: 'Team', to: '/team' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy', to: '/privacy' },
];

export default function Layout() {
  const { branding } = useBranding();

  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = branding.favicon || '/images/branding/ieee-ras-logo.png';
    }
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.content = branding.favicon || '/images/branding/ieee-ras-logo.png';
    }
    document.title = 'IEEE RAS JSSATEB';
  }, [branding.favicon]);

  return (
    <>
      <header className="topbar">
        <div className="brand-row container">
          <div className="identity-wall" aria-label="Official institutional identities">
            <div className="identity-dock identity-dock--header">
              <div className="identity-mark identity-mark--ras">
                <LogoMark src={branding.officialIdentity.ieeeRas} alt="IEEE Robotics and Automation Society logo" className="logo--small" />
              </div>
              <span className="identity-divider" aria-hidden="true" />
              <div className="identity-mark identity-mark--college">
                <LogoMark src={branding.officialIdentity.jssateb} alt="JSS Academy of Technical Education Bengaluru logo" className="logo--small" />
              </div>
              <span className="identity-divider" aria-hidden="true" />
              <div className="identity-mark identity-mark--ieee">
                <LogoMark src={branding.officialIdentity.ieee} alt="IEEE logo" className="logo--small" />
              </div>
            </div>
            <div className="chapter-wordmark">
              <span>Student Branch</span>
              <strong>IEEE JSSATEB</strong>
            </div>
          </div>
          <nav className="nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/contact#join" className="button button-primary nav-join">Join Us</NavLink>
            <NavLink to="/admin/settings" className="nav-link admin-nav-link">Admin</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>IEEE RAS JSSATEB</h3>
            <p>Student affiliation for robotics, automation, and innovation at JSS Academy of Technical Education, Bengaluru.</p>
            <a className="footer-contact" href="mailto:ieeeras@jssateb.ac.in">ieeeras@jssateb.ac.in</a>
          </div>
          <div className="footer-logos" aria-label="Footer branding">
            <div className="identity-dock identity-dock--footer">
              <div className="identity-mark identity-mark--ras">
                <LogoMark src={branding.officialIdentity.ieeeRas} alt="IEEE RAS logo" className="logo--small" />
              </div>
              <span className="identity-divider" aria-hidden="true" />
              <div className="identity-mark identity-mark--college">
                <LogoMark src={branding.officialIdentity.jssateb} alt="JSSATEB logo" className="logo--small" />
              </div>
              <span className="identity-divider" aria-hidden="true" />
              <div className="identity-mark identity-mark--ieee">
                <LogoMark src={branding.officialIdentity.ieee} alt="IEEE logo" className="logo--small" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
