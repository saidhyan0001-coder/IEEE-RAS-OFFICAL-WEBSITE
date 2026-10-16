import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import { BoardsPage, ContactPage, GalleryPage, SocietiesPage, TeamPage } from './pages/SectionPages';
import { NotFoundPage, PrivacyPage } from './pages/UtilityPages';
import AuthCallbackPage from './pages/AuthCallbackPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/societies" element={<SocietiesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
