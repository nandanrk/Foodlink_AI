import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, MapPin, Package, Check } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { ngoAPI } from '../../services/api';
import { Donation } from '../../types';
import { formatDateTime } from '../../lib/utils';

export default function BrowseDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ngoAPI.getNearbyDonations();
      setDonations(res.data.donations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAccept = async (donationId: string) => {
    setAccepting(donationId);
    try {
      await ngoAPI.acceptDonation(donationId);
      setAccepted(prev => [...prev, donationId]);
      setDonations(prev => prev.filter(d => d.id !== donationId));
    } catch (e) {
      console.error(e);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <PageLayout title="Browse Available Donations" subtitle="Food donations available for your NGO to accept.">
      <div className="flex justify-end mb-4">
        <Button variant="secondary" size="sm" onClick={fetchData} loading={loading}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No available donations at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {donations.map((d, idx) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{d.food_name}</h3>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-slate-400 text-sm">{d.quantity} · {d.servings} servings · {d.food_type}</p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      {d.pickup_address || d.restaurants?.address || 'Address not provided'}
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">Listed: {formatDateTime(d.created_at)}</p>
                    {d.ai_description && (
                      <p className="text-slate-400 text-xs mt-2 italic">
                        {d.ai_description.substring(0, 120)}...
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleAccept(d.id)}
                  loading={accepting === d.id}
                  disabled={accepted.includes(d.id)}
                  size="sm"
                >
                  {accepted.includes(d.id) ? (
                    <><Check className="w-4 h-4" /> Accepted</>
                  ) : (
                    'Accept Donation'
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
