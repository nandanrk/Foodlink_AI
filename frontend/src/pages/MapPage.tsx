import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import L from 'leaflet';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import { mapsAPI } from '../services/api';

// Fix Leaflet icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (emoji: string, color: string) =>
  L.divIcon({
    html: `<div style="background:${color};padding:6px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;width:34px;height:34px;box-shadow:0 0 10px ${color}80">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    className: '',
  });

const ngoIcon = createIcon('🤝', '#3b82f6');
const volunteerIcon = createIcon('🚴', '#a855f7');

export default function MapPage() {
  const [ngos, setNGOs] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bangalore, India

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [ngoRes, volRes] = await Promise.all([
        mapsAPI.getNearbyNGOs({ lat: defaultCenter[0], lon: defaultCenter[1], radius: 100 }),
        mapsAPI.getNearbyVolunteers({ lat: defaultCenter[0], lon: defaultCenter[1], radius: 100 }),
      ]);
      setNGOs(ngoRes.data.ngos || []);
      setVolunteers(volRes.data.volunteers || []);
    } catch (err) {
      console.error('Map data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMapData(); }, []);

  return (
    <PageLayout title="Live Map" subtitle="Real-time locations of NGOs and volunteers on the platform.">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-blue-400">🤝 NGOs ({ngos.length})</span>
          <span className="flex items-center gap-1.5 text-purple-400">🚴 Volunteers ({volunteers.length})</span>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchMapData} loading={loading}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{ height: '60vh' }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {ngos.filter(ngo => ngo.latitude && ngo.longitude).map(ngo => (
            <Marker key={ngo.id} position={[ngo.latitude, ngo.longitude]} icon={ngoIcon}>
              <Popup>
                <div className="text-sm">
                  <strong>{ngo.name}</strong><br />
                  {ngo.address}<br />
                  {ngo.distance != null && (
                    <span className="text-blue-600">{ngo.distance.toFixed(1)} km away</span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {volunteers.filter(v => v.latitude && v.longitude).map(v => (
            <Marker key={v.id} position={[v.latitude, v.longitude]} icon={volunteerIcon}>
              <Popup>
                <div className="text-sm">
                  <strong>{v.name}</strong><br />
                  Vehicle: {v.vehicle_type}<br />
                  {v.availability ? '✅ Available' : '🔴 Busy'}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>

      <div className="mt-4 glass-card p-4 flex flex-wrap gap-6 text-sm text-slate-400">
        <span>Click any marker to see details.</span>
        <span className="text-slate-500">Map data: © OpenStreetMap contributors</span>
      </div>
    </PageLayout>
  );
}
