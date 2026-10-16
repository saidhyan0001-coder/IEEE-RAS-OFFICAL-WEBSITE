import { Link } from 'react-router-dom';
import LogoMark from '../components/LogoMark';
import { useBranding } from '../lib/branding';
import { ContentFeed } from './SectionPages';

export default function HomePage() {
  const { branding } = useBranding();

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker"><span className="hero-kicker-dot" /> IEEE RAS · JSSATEB</p>
            <h1>Ideas in motion.<br /><span>Robotics in action.</span></h1>
            <p className="lead">A community of curious minds building the next generation of intelligent machines, automation, and real-world solutions.</p>
            <div className="hero-actions">
              <Link to="/societies" className="button button-primary">Explore our community <span aria-hidden="true">↗</span></Link>
              <Link to="/contact#join" className="hero-text-link">Get involved <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="hero-visual" aria-label="IEEE RAS JSSATEB institutional identity">
            <div className="orbit orbit--outer" />
            <div className="orbit orbit--inner" />
            <div className="hero-visual-center">
              <LogoMark src={branding.officialIdentity.ieeeRas} alt="IEEE Robotics and Automation Society logo" className="hero-ras-logo" />
            </div>
            <span className="orbit-label orbit-label--one">ROBOTICS</span>
            <span className="orbit-label orbit-label--two">AUTOMATION</span>
            <span className="orbit-node orbit-node--one" />
            <span className="orbit-node orbit-node--two" />
          </div>
        </div>
      </section>

      <section className="identity-ribbon">
        <div className="container identity-ribbon-inner">
          <div className="identity-ribbon-copy">
            <span>Our community</span>
            <strong>Connected by IEEE. Rooted at JSSATEB.</strong>
          </div>
          <div className="identity-dock identity-dock--hero" aria-label="IEEE RAS, JSSATEB, and IEEE logos">
            <div className="identity-mark identity-mark--ras"><LogoMark src={branding.officialIdentity.ieeeRas} alt="IEEE Robotics and Automation Society logo" className="logo--small" /></div>
            <span className="identity-divider" aria-hidden="true" />
            <div className="identity-mark identity-mark--college"><LogoMark src={branding.officialIdentity.jssateb} alt="JSS Academy of Technical Education Bengaluru logo" className="logo--small" /></div>
            <span className="identity-divider" aria-hidden="true" />
            <div className="identity-mark identity-mark--ieee"><LogoMark src={branding.officialIdentity.ieee} alt="IEEE logo" className="logo--small" /></div>
          </div>
        </div>
      </section>

      <section className="section container community-section">
        <div className="section-heading">
          <p className="eyebrow">Curiosity meets engineering</p>
          <h2>Built by people who love to make things move.</h2>
          <p>From a first circuit to a fully autonomous system, there is room here to learn, experiment, and build together.</p>
        </div>
        <div className="mini-grid">
          <article className="card feature-card feature-card--burgundy">
            <span className="feature-index">01</span>
            <span className="feature-symbol" aria-hidden="true">⌘</span>
            <h2>Research & Projects</h2>
            <p>Turn ideas into prototypes through collaborative exploration of intelligent systems and robotics.</p>
          </article>
          <article className="card feature-card feature-card--purple">
            <span className="feature-index">02</span>
            <span className="feature-symbol" aria-hidden="true">↗</span>
            <h2>Events & Workshops</h2>
            <p>Build practical skills and discover fresh perspectives through hands-on learning and shared experiences.</p>
          </article>
          <article className="card feature-card feature-card--gray">
            <span className="feature-index">03</span>
            <span className="feature-symbol" aria-hidden="true">◎</span>
            <h2>Student Leadership</h2>
            <p>Grow your confidence, find your people, and help shape a more inventive campus community.</p>
          </article>
        </div>
      </section>
      <section className="section container home-updates">
        <ContentFeed category="events" title="Events and workshops" />
        <ContentFeed category="announcements" title="Chapter announcements" />
      </section>
    </>
  );
}
