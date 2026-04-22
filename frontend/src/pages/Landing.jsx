import { useNavigate } from 'react-router-dom';
import { wasteTypes } from '../data/dumperBins';
import './landing.css';

const features = [
  { icon: '🤖', title: 'AI Chat Assistant', desc: 'Ask anything about waste disposal — segregation rules, e-waste steps, composting, medical waste — all answered instantly.', tag: 'Try now →', path: '/chat', bg: '#e8f5ee' },
  { icon: '📍', title: 'Recycling Center Locator', desc: 'Find certified recycling centers, e-waste collection points, and hazardous waste drop-offs near you on an interactive map.', tag: 'Find centers →', path: '/map', bg: '#eff6ff' },
  { icon: '🗂️', title: 'Waste Segregation Rules', desc: 'Clear category-wise rules for dry, wet, hazardous, e-waste, and medical waste based on your municipal guidelines.', tag: 'Ask the AI →', path: '/chat', bg: '#fffbeb' },
  { icon: '💻', title: 'E-Waste Disposal Guide', desc: 'Step-by-step procedures for disposing of electronics, batteries, bulbs, and other e-waste responsibly and legally.', tag: 'Learn more →', path: '/chat', bg: '#faf5ff' },
  { icon: '🌿', title: 'Composting Guide', desc: 'Convert wet kitchen waste into nutrient-rich compost. Instructions for home and apartment composting setups.', tag: 'Start composting →', path: '/chat', bg: '#f0fdfa' },
  { icon: '🚛', title: 'Collection Schedules', desc: 'Check your municipal collection timings, special drives for bulk waste, and hazardous waste pickup events.', tag: 'View schedule →', path: '/map', bg: '#fef2f2' },
];

const stats = [
  { value: '7+', label: 'Waste categories covered' },
  { value: '50+', label: 'Recycling centers mapped' },
  { value: '24/7', label: 'AI assistant available' },
  { value: '100%', label: 'Free for all citizens' },
];

export default function Landing() {
  const navigate = useNavigate();

  // ✅ New helper: Protects routes by checking for user_id
  const handleProtectedAction = (path, state = {}) => {
    if (!localStorage.getItem("user_id")) {
      alert("Please sign in to access this feature!");
      navigate('/login');
    } else {
      navigate(path, { state });
    }
  };

  // ✅ Updated to use protected logic
  const goToChat = (query) => {
    handleProtectedAction('/chat', { initialQuery: query });
  };

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-Powered Waste Guide • Free for Everyone.
          </div>
          <h1>Dispose.<br />Recycle <br/><em>Repeat.</em></h1>
          <p>
            Your intelligent guide to waste segregation, recycling procedures,
            e-waste disposal, and finding nearby collection centers — all in one place.
          </p>
          <div className="hero-actions">
            {/* ✅ Updated onClick */}
            <button className="btn-primary" onClick={() => handleProtectedAction('/chat')}>
              🤖 Ask AI Assistant
            </button>
            <button className="btn-outline" onClick={() => handleProtectedAction('/map')}>
              📍 Find Centers
            </button>
          </div>
        </div>

        <div className="hero-visual">
          {[
            { emoji: '♻️', label: 'DRY', cls: 'blue' },
            { emoji: '🌿', label: 'WET', cls: 'green' },
            { emoji: '⚠️', label: 'HAZARD', cls: 'red' },
            { emoji: '💻', label: 'E-WASTE', cls: 'purple' },
          ].map((bin, i) => (
            <div className="bin" key={bin.label} style={{ animationDelay: `${i * 0.6}s` }}>
              <div className={`bin-body bin-${bin.cls}`}>{bin.emoji}</div>
              <div className="bin-label">{bin.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS TYPES */}
      <section className="waste-types-section">
        <div className="section-label">Quick access</div>
        <div className="types-row">
          {wasteTypes.map(t => (
            <button key={t.title} className="type-pill" onClick={() => goToChat(t.query)}>
              <span className="type-emoji">{t.emoji}</span>
              <div>
                <div className="type-title">{t.title}</div>
                <div className="type-desc">{t.desc}</div>
              </div>
            </button>
          ))}
          {/* ✅ Updated onClick */}
          <button className="type-pill" onClick={() => handleProtectedAction('/map')}>
            <span className="type-emoji">🗓️</span>
            <div>
              <div className="type-title">Collection Schedule</div>
              <div className="type-desc">Municipal pickup times</div>
            </div>
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-label">What EcoGuide offers</div>
        <div className="section-title">Everything you need for proper waste management</div>
        <div className="features-grid">
          {features.map(f => (
            /* ✅ Updated onClick */
            <div className="feature-card" key={f.title} onClick={() => handleProtectedAction(f.path)}>
              <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feature-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        {stats.map(s => (
          <div className="stat" key={s.label}>
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}