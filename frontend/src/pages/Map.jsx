import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { centers, filterOptions } from '../data/dumperBins';
import './Map.css';

// Fix default marker icons for webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored marker
function makeIcon(emoji, color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:38px;height:38px;border-radius:50%;
      background:${color};display:flex;align-items:center;
      justify-content:center;font-size:18px;
      border:2.5px solid #fff;
      box-shadow:0 2px 10px rgba(0,0,0,0.25);
      cursor:pointer;
    ">${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
}

const TYPE_COLORS = {
  dry:     '#1a7a4a',
  ewaste:  '#7c3aed',
  hazard:  '#dc2626',
  compost: '#16a34a',
  medical: '#c2410c',
};

function getColor(types) {
  for (const t of ['ewaste', 'hazard', 'medical', 'compost', 'dry']) {
    if (types.includes(t)) return TYPE_COLORS[t];
  }
  return '#1a7a4a';
}

// Pan map to selected center
function MapFly({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 15, { duration: 1 });
  }, [center, map]);
  return null;
}

const TAG_CLASSES = {
  'E-Waste': 'ewaste', 'Batteries': 'ewaste',
  'Hazardous': 'hazard', 'Chemicals': 'hazard',
  'Medical': 'medical', 'Biomedical': 'medical',
  'Compost': 'compost', 'Wet Waste': 'compost',
};

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState(centers[0]);
  const [search, setSearch] = useState('');

  const filtered = centers.filter(c => {
    const matchFilter = activeFilter === 'all' || c.types.includes(activeFilter);
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="map-page">
      {/* Left Panel */}
      <div className="map-panel">
        <div className="panel-header">
          <h2>♻️ Nearby Centers</h2>
          <p>Recycling &amp; waste collection points</p>
          <div className="map-search">
            <input
              type="text"
              placeholder="Search by name or area…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-chips">
            {filterOptions.map(f => (
              <button
                key={f.key}
                className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="centers-list">
          {filtered.length === 0 && (
            <div className="no-results">No centers found. Try a different filter or search term.</div>
          )}
          {filtered.map(c => (
            <div
              key={c.id}
              className={`center-card ${selectedCenter?.id === c.id ? 'selected' : ''}`}
              onClick={() => setSelectedCenter(c)}
            >
              <div className="center-icon" style={{ background: getColor(c.types) + '20' }}>
                {c.icon}
              </div>
              <div className="center-info">
                <h4>{c.name}</h4>
                <p className="center-addr">{c.address}</p>
                <div className="center-tags">
                  {c.tags.map(tag => (
                    <span key={tag} className={`ctag ${TAG_CLASSES[tag] || ''}`}>{tag}</span>
                  ))}
                </div>
                <div className="center-meta">
                  <span className={`open-badge ${c.open ? 'open' : 'closed'}`}>
                    {c.open ? '● Open' : '● Closed'}
                  </span>
                  <span className="dist">📍 {c.distance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="map-area">
        <MapContainer
          center={[17.4065, 78.4772]}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFly center={selectedCenter} />

          {filtered.map(c => (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={makeIcon(c.icon, getColor(c.types))}
              eventHandlers={{ click: () => setSelectedCenter(c) }}
            >
              <Popup>
                <div className="popup-content">
                  <div className="popup-name">{c.name}</div>
                  <div className="popup-addr">{c.address}</div>
                  <div className="popup-row"><span>🕐</span> {c.hours}</div>
                  <div className="popup-row"><span>📍</span> {c.distance} away</div>
                  <div className="popup-row"><span>📞</span> {c.phone}</div>
                  <div className={`popup-status ${c.open ? 'open' : 'closed'}`}>
                    {c.open ? '● Open now' : '● Currently closed'}
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/directions?to=${c.lat},${c.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-btn"
                  >
                    Get Directions →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}