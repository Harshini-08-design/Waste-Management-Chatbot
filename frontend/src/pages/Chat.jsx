import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { api } from '../api/api'; 
import './Chat.css';

const CATEGORIES = [
  { key: 'general',  label: '🗂️ General',    system: 'You are EcoBot, a helpful waste management assistant. Answer questions about waste segregation, recycling, composting, e-waste, medical waste, and hazardous waste disposal clearly and practically. Use bullet points where helpful. Keep answers concise and friendly.' },
  { key: 'ewaste',   label: '💻 E-Waste',    system: 'You are EcoBot specializing in e-waste. Give specific advice on disposing of electronics, phones, batteries, bulbs, and electrical equipment safely and legally in India.' },
  { key: 'medical',  label: '💊 Medical',    system: 'You are EcoBot specializing in medical waste. Advise on safely disposing of medicines, syringes, gloves, bandages, and other medical items from homes in India.' },
  { key: 'hazard',   label: '⚠️ Hazardous', system: 'You are EcoBot specializing in hazardous waste. Help identify and advise on safe disposal of chemicals, paints, pesticides, and other dangerous materials in India.' },
  { key: 'compost',  label: '🌱 Composting', system: 'You are EcoBot specializing in composting. Give step-by-step home composting instructions for kitchen and garden waste, including troubleshooting common issues.' },
];

const WELCOME = {
  role: 'bot',
  text: `Hi! I'm **EcoBot**, your personal waste management guide. I can help you with:

• **Waste segregation rules** — dry, wet, hazardous
• **E-waste & medical waste** disposal procedures
• **Recycling steps** for different materials
• **Composting** instructions at home
• **Municipal collection** schedules

What would you like to know today?`,
  chips: ['How to segregate household waste?', 'E-waste drop-off locations', 'Start composting at home', 'Hazardous waste identification'],
  time: new Date(),
};

function formatTime(date) {
  const d = new Date(date); // Ensure it's a Date object
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderText(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [recentQuestions, setRecentQuestions] = useState([]); 
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null); 
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Updated useEffect to fetch history and only show unique questions in the sidebar
  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("user_id") || 1;
      try {
        const res = await fetch(`http://127.0.0.1:8000/history/${userId}`);
        const historyData = await res.json();
        
        // 1. Format the main chat messages (User + Bot)
        const formattedHistory = historyData.flatMap(item => [
          { role: 'user', text: item.question, time: new Date() },
          { role: 'bot', text: item.answer, time: new Date() }
        ]);

        // 2. Extract unique questions only for the sidebar (newest first)
        const uniqueQs = [...new Set(historyData.map(item => item.question))].slice(0, 5);
        setRecentQuestions(uniqueQs);

        if (formattedHistory.length > 0) {
          setMessages([WELCOME, ...formattedHistory]);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (location.state?.initialQuery) {
      handleSend(location.state.initialQuery);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 const handleSend = async (text) => {
  const q = text || input.trim();
  if (!q || loading) return;

  const userId = localStorage.getItem("user_id") || 1;
  setInput('');
  if (textareaRef.current) textareaRef.current.style.height = 'auto';

  // Add user message to chat immediately
  const userMsg = { role: 'user', text: q, time: new Date() };
  setMessages(prev => [...prev, userMsg]);
  
  // Update sidebar recent questions
  setRecentQuestions(prev => [q, ...prev.filter(item => item !== q)].slice(0, 5));
  
  setLoading(true);

  try {
    const data = await api.sendChat(q, userId);
    // Add bot response to chat
    setMessages(prev => [
      ...prev,
      { role: 'bot', text: data.response, time: new Date() }
    ]);
  } catch (error) {
    console.error("Chat error:", error);
    setMessages(prev => [...prev, {
      role: 'bot',
      text: 'EcoBot is having trouble connecting. Please check your server.',
      time: new Date(),
    }]);
  } finally {
    setLoading(false);
  }
};

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = localStorage.getItem("user_id") || 1;
    const userMsg = { role: 'user', text: `📸 Uploaded image: ${file.name}`, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.analyzeImage(file, userId);
      
      // ✅ Update sidebar with the Image label immediately
      const imgLabel = `📸 Image: ${data.detected}`;
      setRecentQuestions(prev => [imgLabel, ...prev.filter(item => item !== imgLabel)].slice(0, 5));

      setMessages(prev => [
        ...prev,
        { 
          role: 'bot', 
          text: `🔍 **Detected:** ${data.detected}\n\n${data.guideline}`, 
          time: new Date() 
        }
      ]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Failed to analyze image. Ensure the server is running.',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
      e.target.value = null; 
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME]);
    setInput('');
    setLoading(false);
    setRecentQuestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          🆕 New Chat
        </button>
        
        <div className="sidebar-section">
          <div className="sidebar-heading">Recent Questions</div>
          {recentQuestions.length > 0 ? (
            recentQuestions.map((qText, i) => (
              <button key={i} className="history-item" title={qText} onClick={() => handleSend(qText)}>
                {qText}
              </button>
            ))
          ) : (
            <div className="history-item" style={{ opacity: 0.5, cursor: 'default' }}>
              No recent activity
            </div>
          )}
        </div>
      </aside>

      <div className="chat-main">
        <div className="chat-header">
          <div className="agent-avatar">🌿</div>
          <div className="agent-info">
            <h2>EcoBot — Waste Management Assistant</h2>
            <div className="agent-status">Online · Powered by AI</div>
          </div>
          <div className="header-badges">
            <span className="header-badge">♻️ Recycling</span>
            <span className="header-badge">📍 Locator</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role}`}>
              <div className="msg-avatar">{msg.role === 'bot' ? '🌿' : '👤'}</div>
              <div className="msg-body">
                <div
                  className="msg-bubble"
                  dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                />
                {msg.chips && (
                  <div className="suggestion-chips">
                    {msg.chips.map(c => (
                      <button key={c} className="chip" onClick={() => handleSend(c)}>{c}</button>
                    ))}
                  </div>
                )}
                <div className="msg-time">{formatTime(msg.time)}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg msg-bot">
              <div className="msg-avatar">🌿</div>
              <div className="msg-body">
                <div className="msg-bubble">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="category-row">
            <span className="category-label">Category:</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`category-chip ${category.key === cat.key ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="input-row">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleImageUpload}
            />
            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
              📷
            </button>
            
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={input}
              placeholder="Ask about waste disposal..."
              rows={1}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}