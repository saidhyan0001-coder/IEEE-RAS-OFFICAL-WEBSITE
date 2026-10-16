import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <div className="container section">
      <section className="page-header">
        <p className="eyebrow">IEEE JSSATEB</p>
        <h1>Privacy</h1>
        <p className="lead">How this website handles information submitted through its public contact form.</p>
      </section>
      <article className="prose-card">
        <h2>Information you submit</h2>
        <p>If you use the contact form, your name, email address, and message are stored so authorized chapter administrators can respond to your inquiry.</p>
        <h2>Use and access</h2>
        <p>Contact requests are intended for chapter communications and are restricted to authorized administrators. They are stored in the site's PostgreSQL backend. Do not include sensitive personal or financial information in a message.</p>
        <h2>Storage and questions</h2>
        <p>Form submissions are stored securely for authorized chapter administrators to review. For questions, contact <a className="text-link" href="mailto:ieeeras@jssateb.ac.in">ieeeras@jssateb.ac.in</a>.</p>
      </article>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container section not-found">
      <p className="eyebrow">404 · Page not found</p>
      <h1>We couldn't find that page.</h1>
      <p className="lead">The address may have changed, or the page may not be published yet.</p>
      <Link className="button button-primary" to="/">Back to home</Link>
    </div>
  );
}
