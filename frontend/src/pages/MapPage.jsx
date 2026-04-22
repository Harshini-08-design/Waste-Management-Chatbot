import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Map.css';
import { dumperBins } from '../data/dumperBins';

const DEFAULT_ZONE = 'All Zones';

function getEmbedUrl(lat, lng) {
  const bboxSize = 0.03;
  const left = lng - bboxSize;
  const right = lng + bboxSize;
  const top = lat + bboxSize;
  const bottom = lat - bboxSize;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default function MapPage() {
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState(DEFAULT_ZONE);
  const [selectedBin, setSelectedBin] = useState(dumperBins[0]);
  const navigate = useNavigate();

  const zones = useMemo(() => {
    const uniqueZones = Array.from(new Set(dumperBins.map((item) => item.zone)));
    return [DEFAULT_ZONE, ...uniqueZones];
  }, []);

  const filteredBins = useMemo(() => {
    const query = search.trim().toLowerCase();
    return dumperBins.filter((bin) => {
      const matchesZone = selectedZone === DEFAULT_ZONE || bin.zone === selectedZone;
      const matchesSearch =
        bin.name.toLowerCase().includes(query) ||
        bin.ward.toLowerCase().includes(query) ||
        bin.circle.toLowerCase().includes(query);
      return matchesZone && (!query || matchesSearch);
    });
  }, [search, selectedZone]);

  const activeBin = selectedBin || filteredBins[0] || { lat: 17.4065, lng: 78.4772 };

  return (
    <div className="map-page">
      <section className="map-panel">
        <div className="panel-header">
          <h2>Waste Collection Map</h2>
          <p>Search local dumper bins by zone, ward, or street name.</p>
        </div>

        <div className="map-search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, ward, or circle"
            aria-label="Search waste collection locations"
          />
        </div>

        <div className="filter-chips">
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              className={`filter-chip ${zone === selectedZone ? 'active' : ''}`}
              onClick={() => setSelectedZone(zone)}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="centers-list">
          {filteredBins.length === 0 ? (
            <div className="no-results">No collection points found. Modify your search or choose a different zone.</div>
          ) : (
            filteredBins.slice(0, 24).map((bin) => (
              <button
                key={bin.id}
                type="button"
                className={`center-card ${activeBin?.id === bin.id ? 'selected' : ''}`}
                onClick={() => setSelectedBin(bin)}
              >
                <div className="center-icon">♻️</div>
                <div className="center-info">
                  <h4>{bin.name}</h4>
                  <div className="center-addr">
                    {bin.ward} · {bin.circle}
                  </div>
                  <div className="center-tags">
                    <span className="ctag">{bin.category}</span>
                    <span className="ctag">{bin.zone}</span>
                  </div>
                  <div className="center-meta">
                    <span className="open-badge open">Open</span>
                    <span className="dist">
                      {bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="map-area">
        <iframe
          title="Location map"
          src={getEmbedUrl(activeBin.lat, activeBin.lng)}
          style={{ width: '100%', height: '100%', border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </section>
    </div>
  );
}
