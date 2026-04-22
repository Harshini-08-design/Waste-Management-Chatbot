import './Settings.css';
import { translations, languageNames } from '../../locales/translations';
import { useTheme } from '../../contexts/ThemeContext';

export default function Settings({ isOpen, onClose, language, setLanguage }) {
  const { theme, toggleTheme } = useTheme();
  if (!isOpen) return null;

  const t = translations[language];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{t.settings}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          {/* Theme Section */}
          <div className="settings-section">
            <h3>{theme === 'dark' ? '🌙' : '☀️'} Theme</h3>
            <div className="theme-toggle-large">
              <button 
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={toggleTheme}
              >
                ☀️ Light
              </button>
              <button 
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          {/* Language Section */}
          <div className="settings-section">
            <h3>🌐 {t.language}</h3>
            <div className="language-grid">
              {Object.entries(languageNames).map(([code, name]) => (
                <button
                  key={code}
                  className={`language-btn ${language === code ? 'active' : ''}`}
                  onClick={() => setLanguage(code)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
