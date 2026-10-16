import { useEffect, useState } from 'react';
import { useBranding, validateImageDimensions, validateUploadedLogo } from '../lib/branding';
import { apiRequest } from '../lib/api';
import {
  createContentEntry,
  deleteContentEntry,
  fetchAdminContent,
  fetchJoinRequests,
  updateJoinRequestStatus,
  updateContentEntry,
  updateContentPublished,
  uploadBrandingAsset,
  uploadPublicImage,
} from '../lib/content';

const contentCategories = [
  ['about', 'Chapter details'],
  ['boards', 'Boards'],
  ['societies', 'Societies'],
  ['team', 'Team'],
  ['gallery', 'Gallery'],
  ['events', 'Events'],
  ['announcements', 'Announcements'],
];

const initialContent = (category = 'about') => ({
  category,
  title: '',
  role: '',
  summary: '',
  body: '',
  eventDate: '',
  published: false,
  image_path: null,
});

export default function AdminSettingsPage() {
  const { branding } = useBranding();
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('ieeeras@jssateb.ac.in');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(() => initialContent());
  const [selectedCategory, setSelectedCategory] = useState('about');
  const [editingId, setEditingId] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [content, setContent] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('admin/session')
      .then(({ user: sessionUser }) => {
        if (active) {
          setUser(sessionUser);
          setAuthorized(Boolean(sessionUser));
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(error.message);
          setStatus('error');
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authorized) return undefined;
    let active = true;
    const loadDashboard = async () => {
      try {
        const [entries, incoming] = await Promise.all([fetchAdminContent(), fetchJoinRequests()]);
        if (active) {
          setContent(entries);
          setRequests(incoming);
        }
      } catch (error) {
        if (active) {
          setMessage(error.message);
          setStatus('error');
        }
      }
    };
    void loadDashboard();
    return () => {
      active = false;
    };
  }, [authorized]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const { user: signedInUser } = await apiRequest('admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setUser(signedInUser);
      setAuthorized(true);
      setPassword('');
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  const handleLogoUpload = async (key, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateUploadedLogo(file);
    if (!validation.valid) {
      setMessage(validation.message);
      setStatus('error');
      event.target.value = '';
      return;
    }

    setBusy(true);
    try {
      await validateImageDimensions(file);
      await uploadBrandingAsset(file, key);
      window.dispatchEvent(new Event('branding:updated'));
      setMessage(`${key} logo uploaded. Branding updates will appear on public pages.`);
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const handleContentSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const imageFile = formElement.elements.image.files?.[0];
    setBusy(true);
    try {
      let imageUrl = removeImage ? null : form.image_path;
      if (imageFile) {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(imageFile.type) || imageFile.size > 2_800_000) {
          throw new Error('Content images must be PNG, JPG, or WebP and 2.8 MB or smaller.');
        }
        await validateImageDimensions(imageFile);
        imageUrl = await uploadPublicImage(imageFile);
      }

      const entry = {
        ...(editingId ? { id: editingId } : {}),
        category: form.category,
        title: form.title.trim(),
        role: form.role.trim(),
        summary: form.summary.trim(),
        body: form.body.trim(),
        event_date: form.eventDate || null,
        image_path: imageUrl,
        published: form.published,
      };
      if (editingId) await updateContentEntry(entry);
      else await createContentEntry(entry);
      setSelectedCategory(form.category);
      setEditingId(null);
      setRemoveImage(false);
      setForm(initialContent(form.category));
      formElement.reset();
      setContent(await fetchAdminContent());
      setMessage(editingId ? 'Content changes saved.' : form.published ? 'Content published.' : 'Content saved as a draft.');
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setEditingId(null);
    setRemoveImage(false);
    setForm(initialContent(category));
    setMessage('');
  };

  const handleEditContent = (entry) => {
    setSelectedCategory(entry.category);
    setEditingId(entry.id);
    setRemoveImage(false);
    setForm({
      category: entry.category,
      title: entry.title,
      role: entry.role || '',
      summary: entry.summary || '',
      body: entry.body || '',
      eventDate: entry.event_date ? String(entry.event_date).slice(0, 10) : '',
      published: entry.published,
      image_path: entry.image_path || entry.image_url || null,
    });
    document.getElementById('content-editor-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRemoveImage(false);
    setForm(initialContent(selectedCategory));
  };

  const handleRequestStatus = async (id, nextStatus) => {
    try {
      await updateJoinRequestStatus(id, nextStatus);
      setRequests(await fetchJoinRequests());
      setMessage('Contact request updated.');
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    }
  };

  const handleContentPublish = async (id, published) => {
    try {
      await updateContentPublished(id, published);
      setContent(await fetchAdminContent());
      setMessage(published ? 'Content published.' : 'Content moved to drafts.');
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    }
  };

  const handleContentDelete = async (id) => {
    if (!window.confirm('Permanently delete this content entry?')) return;
    try {
      await deleteContentEntry(id);
      setContent(await fetchAdminContent());
      if (editingId === id) handleCancelEdit();
      setMessage('Content deleted.');
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('admin/logout', { method: 'POST', body: JSON.stringify({}) });
    } catch (error) {
      setMessage(`Unable to sign out: ${error.message}`);
      setStatus('error');
      return;
    }
    setUser(null);
    setAuthorized(false);
  };

  if (checkingSession || (user && !authorized)) {
    return <div className="container section"><p className="status status-idle">Verifying administrator access…</p></div>;
  }

  if (!authorized) {
    return (
      <div className="container section admin-shell">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <p className="eyebrow">Administrator access required</p>
          <h1>Admin dashboard</h1>
          <p>Sign in with a provisioned administrator account. Public visitors cannot edit site content or branding.</p>
          <label className="field-label" htmlFor="admin-email">Administrator email</label>
          <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label className="field-label" htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <p className="form-hint">Administrator credentials are configured securely for this site. If you need access, contact the site owner.</p>
          {message && <p className={`status status-${status}`} role="alert">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container section admin-shell">
      <div className="admin-header-row">
        <div>
          <p className="eyebrow">Protected workspace</p>
          <h1>Admin dashboard</h1>
          <p>Signed in as {user.email}</p>
        </div>
        <button className="button button-secondary" type="button" onClick={handleLogout}>Sign out</button>
      </div>

      {message && <p className={`status status-${status}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>}

      <section className="admin-panel admin-section">
        <h2>Manage each website tab</h2>
        <p>Select a section to add, edit, publish, unpublish, or remove its public content. Changes appear on the corresponding public page after saving.</p>
        <div className="admin-category-tabs" role="tablist" aria-label="Website sections">
          {contentCategories.map(([value, label]) => {
            const count = content.filter((entry) => entry.category === value).length;
            return (
              <button
                className={`admin-category-tab${selectedCategory === value ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={selectedCategory === value}
                key={value}
                onClick={() => handleSelectCategory(value)}
              >
                {label}<span>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-panel admin-section">
        <h2>Branding and logos</h2>
        <p>Approved PNG, JPG, or WebP files only. Maximum 2 MB and 4096 × 4096 pixels. Original logo appearance is preserved.</p>
        <div className="admin-logo-grid">
          {[
            ['jssateb', 'JSSATEB'],
            ['ieee', 'IEEE'],
            ['ieeeRas', 'IEEE RAS'],
          ].map(([key, label]) => (
            <div className="upload-field" key={key}>
              <label htmlFor={`logo-${key}`}>{label} logo</label>
              <img className="admin-logo-preview" src={branding.officialIdentity[key]} alt={`${label} logo preview`} />
              <input id={`logo-${key}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(event) => handleLogoUpload(key, event)} />
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel admin-section">
        <h2 id="content-editor-title">{editingId ? 'Edit' : 'Add'} {contentCategories.find(([value]) => value === selectedCategory)?.[1]}</h2>
        <form className="content-editor" onSubmit={handleContentSubmit}>
          <label htmlFor="content-category">Section</label>
          <select id="content-category" value={form.category} onChange={(event) => {
            setSelectedCategory(event.target.value);
            setForm({ ...form, category: event.target.value });
          }}>
            {contentCategories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <label htmlFor="content-title">Title</label>
          <input id="content-title" required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <label htmlFor="content-role">Role or subtitle</label>
          <input id="content-role" maxLength={120} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          <label htmlFor="content-summary">Summary</label>
          <textarea id="content-summary" rows={3} maxLength={1000} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
          <label htmlFor="content-body">Details</label>
          <textarea id="content-body" rows={5} maxLength={10000} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
          <label htmlFor="content-event-date">Event date (optional)</label>
          <input id="content-event-date" type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
          <label htmlFor="content-image">Image (optional, PNG/JPG/WebP, up to 2.8 MB)</label>
          <input id="content-image" name="image" type="file" accept="image/png,image/jpeg,image/webp" />
          {form.image_path && !removeImage && (
            <div className="admin-current-image">
              <img src={form.image_path} alt="Current content image" />
              <label className="checkbox-label">
                <input type="checkbox" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} />
                Remove current image
              </label>
            </div>
          )}
          <label className="checkbox-label"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publish immediately</label>
          <div className="admin-form-actions">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Add content'}</button>
            {editingId && <button className="button button-secondary" type="button" onClick={handleCancelEdit} disabled={busy}>Cancel edit</button>}
          </div>
        </form>
      </section>

      <section className="admin-panel admin-section">
        <h2>{contentCategories.find(([value]) => value === selectedCategory)?.[1]} content ({content.filter((entry) => entry.category === selectedCategory).length})</h2>
        {content.filter((entry) => entry.category === selectedCategory).length === 0 ? <p>No content in this section yet. Use the form above to add the first entry.</p> : (
          <ul className="admin-list">
            {content.filter((entry) => entry.category === selectedCategory).map((entry) => (
              <li key={entry.id}>
                <span className="admin-list-entry"><strong>{entry.title}</strong>{entry.summary && <small>{entry.summary}</small>}</span>
                <span className={entry.published ? 'status-pill is-published' : 'status-pill'}>{entry.published ? 'Published' : 'Draft'}</span>
                <button className="button button-secondary compact-button" type="button" onClick={() => handleEditContent(entry)}>Edit</button>
                <button className="button button-secondary compact-button" type="button" onClick={() => handleContentPublish(entry.id, !entry.published)}>
                  {entry.published ? 'Unpublish' : 'Publish'}
                </button>
                <button className="text-button" type="button" onClick={() => handleContentDelete(entry.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel admin-section">
        <h2>Join and contact requests ({requests.length})</h2>
        {requests.length === 0 ? <p>No visitor requests yet.</p> : (
          <div className="request-list">
            {requests.map((request) => (
              <article className="request-card" key={request.id}>
                <p><strong>{request.name}</strong> · <a className="text-link" href={`mailto:${request.email}`}>{request.email}</a></p>
                <p>{request.message}</p>
                <label htmlFor={`request-${request.id}`}>Status</label>
                <select id={`request-${request.id}`} value={request.status} onChange={(event) => handleRequestStatus(request.id, event.target.value)}>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="closed">Closed</option>
                </select>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
