import LogoMark from '../components/LogoMark';
import { useBranding } from '../lib/branding';
import { ContentFeed } from './SectionPages';

export default function AboutPage() {
  const { branding } = useBranding();

  return (
    <div className="container section">
      <section className="page-header">
        <p className="eyebrow">One campus. A world of possibility.</p>
        <h1>Engineering a more intelligent future.</h1>
        <p className="lead">A student community inspired by robotics, powered by curiosity, and connected through IEEE.</p>
      </section>

      <section className="brand-assembly" aria-label="IEEE RAS JSSATEB institutional affiliations">
        <div className="affiliation-mark">
          <div className="affiliation-logo-wrap"><LogoMark src={branding.officialIdentity.ieeeRas} alt="Official IEEE Robotics and Automation Society logo" className="brand-logo brand-logo--ras" /></div>
          <p>Technical society</p>
          <strong>IEEE Robotics and Automation Society</strong>
        </div>
        <div className="affiliation-mark">
          <div className="affiliation-logo-wrap"><LogoMark src={branding.officialIdentity.jssateb} alt="Official JSSATEB college logo" className="brand-logo brand-logo--college" /></div>
          <p>Institution</p>
          <strong>JSS Academy of Technical Education, Bengaluru</strong>
        </div>
        <div className="affiliation-mark">
          <div className="affiliation-logo-wrap"><LogoMark src={branding.officialIdentity.ieee} alt="Official IEEE organization logo" className="brand-logo brand-logo--ieee" /></div>
          <p>Professional organization</p>
          <strong>IEEE</strong>
        </div>
      </section>

      <div className="two-column">
        <div className="about-copy">
          <p className="eyebrow">Our purpose</p>
          <h2>Mission</h2>
          <p>
            IEEE RAS JSSATEB promotes technical excellence, community engagement, and student-centered innovation in
            robotics and automation. The chapter creates opportunities for students to learn through projects,
            competitions, workshops, and collaborative research.
          </p>
          <h2>Affiliation</h2>
          <p>
            The chapter operates within the broader IEEE and IEEE Robotics and Automation Society ecosystem while
            maintaining a close technical relationship with JSS Academy of Technical Education, Bengaluru.
          </p>
        </div>
        <div className="info-card affiliation-summary">
          <p className="eyebrow">Our foundation</p>
          <h2>Local energy. Global community.</h2>
          <ul>
            <li>Institution: JSS Academy of Technical Education, Bengaluru</li>
            <li>Professional society: IEEE</li>
            <li>Technical society: IEEE Robotics and Automation Society</li>
          </ul>
        </div>
      </div>
      <ContentFeed category="about" title="Chapter details" />
    </div>
  );
}
