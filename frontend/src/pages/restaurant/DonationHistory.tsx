import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Package, Key } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { donationAPI } from '../../services/api';
import { Donation } from '../../types';
import { formatDateTime } from '../../lib/utils';
import Button from '../../components/ui/Button';

export default function DonationHistory() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await donationAPI.getAll();
      setDonations(res.data.donations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <PageLayout title="Donation History" subtitle="All your food donations and their current status.">
      <div className="flex justify-end mb-4">
        <Button variant="secondary" size="sm" onClick={fetch} loading={loading}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>
      {loading ? (
        <div className="grid gap-4">{[1, 2, 3].map(i => <div key={i} className="glass-card h-24 animate-pulse" />)}</div>
      ) : donations.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No donations yet. Start by creating your first donation.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {donations.map((donation, idx) => {
            const assignment = Array.isArray(donation.volunteer_assignments)
              ? donation.volunteer_assignments[0]
              : donation.volunteer_assignments;
            const pickupOtp = assignment?.otp;

            return (
              <motion.div key={donation.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {donation.image_url ? (
                      <img src={donation.image_url} alt={donation.food_name} className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl">🍽️</div>
                    )}
                    <div>
                      <h3 className="font-bold text-white">{donation.food_name}</h3>
                      <p className="text-slate-400 text-sm">{donation.quantity} · {donation.servings} servings · {donation.food_type}</p>
                      <p className="text-slate-500 text-xs mt-1">{formatDateTime(donation.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <StatusBadge status={donation.status} />

                    {/* Display Pickup OTP when Volunteer is assigned */}
                    {['volunteer_assigned', 'accepted'].includes(donation.status) && pickupOtp && (
                      <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" />
                        <span>Pickup OTP: <strong>{pickupOtp}</strong></span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
