import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'Your Bot' },
  { to: '/map', label: 'Find Centers' },
  { to: '/login', label: 'Account' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Eco<span>Guide</span>
      </Link>

      <div className="nav-links">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <Link to="/login" className="nav-cta">Get Started</Link>
    </nav>
  );
}
