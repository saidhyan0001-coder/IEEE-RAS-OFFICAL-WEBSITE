import { Link } from 'react-router-dom';

export default function AuthCallbackPage() {
  return (
    <div className="container section admin-shell">
      <div className="admin-login-card">
        <p className="eyebrow">IEEE JSSATEB administrator access</p>
        <h1>Administrator sign-in</h1>
        <p>This site uses its own administrator login. Email verification links are not used.</p>
        <Link className="button button-primary" to="/admin/settings">Continue to admin sign-in</Link>
      </div>
    </div>
  );
}
