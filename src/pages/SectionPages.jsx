import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPublishedContent, submitJoinRequest } from '../lib/content';

function PageIntro({ eyebrow, title, description }) {
  return (
    <section className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </section>
  );
}

function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true">RAS</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

function useContent(category) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublishedContent(category)
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  return { items, error, loading };
}

function ContentCards({ category }) {
  const { items, error, loading } = useContent(category);

  if (loading) return <p className="status status-idle">Loading chapter content…</p>;
  if (error) return <p className="status status-error" role="alert">{error}</p>;
  if (!items.length) {
    return <EmptyState title="Content coming soon">The chapter can publish verified {category} updates from the administrator dashboard.</EmptyState>;
  }

  return (
    <div className="mini-grid">
      {items.map((item) => (
        <article className="card content-card" key={item.id}>
          {item.image_url && <img src={item.image_url} alt="" className="content-image" loading="lazy" />}
          {item.role && <p className="eyebrow">{item.role}</p>}
          {item.event_date && <p className="content-date">{new Date(`${item.event_date}T00:00:00`).toLocaleDateString()}</p>}
          <h2>{item.title}</h2>
          {item.summary && <p>{item.summary}</p>}
          {item.body && <p>{item.body}</p>}
        </article>
      ))}
    </div>
  );
}

export function ContentFeed({ category, title }) {
  return (
    <section className="content-feed">
      <h2>{title}</h2>
      <ContentCards category={category} />
    </section>
  );
}

export function BoardsPage() {
  const { items, error, loading } = useContent('boards');
  return (
    <div className="container section">
      <PageIntro
        eyebrow="IEEE JSSATEB"
        title="Chapter boards"
        description="Meet the student leaders and office bearers serving the IEEE community at JSSATEB."
      />
      {loading && <p className="status status-idle">Loading board profiles…</p>}
      {error && <p className="status status-error" role="alert">{error}</p>}
      {!loading && !error && !items.length && <EmptyState title="Board profiles coming soon">Verified board details will appear here when published by an administrator.</EmptyState>}
      {!loading && !error && items.length > 0 && (
        <div className="mini-grid">
          {items.map((item) => (
            <article className="card content-card" key={item.id}>
              {item.image_url && <img src={item.image_url} alt="" className="content-image" loading="lazy" />}
              {item.role && <p className="eyebrow">{item.role}</p>}
              <h2>{item.title}</h2>
              {item.summary && <p>{item.summary}</p>}
              {item.body && <p>{item.body}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function SocietiesPage() {
  const { items, error, loading } = useContent('societies');
  return (
    <div className="container section">
      <PageIntro
        eyebrow="Technical community"
        title="Societies"
        description="Explore the IEEE communities connected with robotics, automation, and engineering at JSSATEB."
      />
      <div className="mini-grid">
        <article className="card society-card">
          <p className="eyebrow">Technical society</p>
          <h2>IEEE Robotics and Automation Society</h2>
          <p>IEEE RAS advances robotics and automation, bringing together people working across research, education, and industry.</p>
        </article>
        <article className="card society-card society-card-accent">
          <p className="eyebrow">Student community</p>
          <h2>IEEE JSSATEB</h2>
          <p>A campus home for IEEE student engagement, technical learning, professional growth, and collaboration.</p>
        </article>
        {items.map((item) => (
          <article className="card society-card" key={item.id}>
            {item.role && <p className="eyebrow">{item.role}</p>}
            <h2>{item.title}</h2>
            {item.summary && <p>{item.summary}</p>}
            {item.body && <p>{item.body}</p>}
          </article>
        ))}
      </div>
      {loading && <p className="status status-idle">Loading society updates…</p>}
      {error && <p className="status status-error" role="alert">{error}</p>}
    </div>
  );
}

export function TeamPage() {
  return (
    <div className="container section">
      <PageIntro
        eyebrow="People behind the community"
        title="Our team"
        description="The students and volunteers who help the IEEE RAS JSSATEB community learn, build, and connect."
      />
      <ContentCards category="team" />
    </div>
  );
}

export function GalleryPage() {
  return (
    <div className="container section">
      <PageIntro
        eyebrow="Moments in the community"
        title="Gallery"
        description="Photos from chapter workshops, projects, events, and student activities."
      />
      <ContentCards category="gallery" />
    </div>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [messageStatus, setMessageStatus] = useState({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessageStatus({ text: '', error: false });
    try {
      await submitJoinRequest(form);
      setForm({ name: '', email: '', message: '' });
      setMessageStatus({ text: 'Thanks. Your message has been sent to the chapter.', error: false });
    } catch (error) {
      setMessageStatus({ text: error.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section">
      <PageIntro
        eyebrow="Get in touch"
        title="Contact IEEE JSSATEB"
        description="Interested in robotics, automation, or becoming part of the IEEE student community at JSSATEB?"
      />
      <div className="two-column">
        <section className="info-card" id="join">
          <h2>Join the community</h2>
          <p>We welcome students interested in technical learning, collaboration, and IEEE RAS activities.</p>
          <p>Email: <a className="text-link" href="mailto:ieeeras@jssateb.ac.in">ieeeras@jssateb.ac.in</a></p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="join-name">Name</label>
            <input id="join-name" name="name" autoComplete="name" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <label htmlFor="join-email">Email</label>
            <input id="join-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <label htmlFor="join-message">Message</label>
            <textarea id="join-message" name="message" required maxLength={5000} rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
            {messageStatus.text && <p className={`status ${messageStatus.error ? 'status-error' : 'status-success'}`} role="status">{messageStatus.text}</p>}
          </form>
        </section>
        <section className="info-card">
          <h2>Explore IEEE RAS JSSATEB</h2>
          <p>Learn about the chapter and its focus on robotics and automation.</p>
          <Link to="/about" className="button button-primary">About the chapter</Link>
        </section>
      </div>
      <p className="status status-idle">Or email us directly at <a className="text-link" href="mailto:ieeeras@jssateb.ac.in">ieeeras@jssateb.ac.in</a>.</p>
    </div>
  );
}
