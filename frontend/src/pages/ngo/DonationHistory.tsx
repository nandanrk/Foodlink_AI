import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, RefreshCw, Key } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { donationAPI } from '../../services/api';
import { Donation } from '../../types';
import { formatDateTime } from '../../lib/utils';

export default function NGODonationHistory() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await donationAPI.getAll();
      setDonations(res.data.donations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <PageLayout title="Donation History" subtitle="All food donations received by your NGO.">
      <div className="flex justify-end mb-4">
        <Button variant="secondary" size="sm" onClick={fetchData} loading={loading}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-20 animate-pulse" />)}
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No donation history yet. Accept donations to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {donations.map((d, idx) => {
            const assignment = Array.isArray(d.volunteer_assignments)
              ? d.volunteer_assignments[0]
              : d.volunteer_assignments;
            const deliveryOtp = assignment?.otp;

            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white">{d.food_name}</h3>
                    <p className="text-slate-400 text-sm">{d.quantity} · {d.servings} servings · {d.food_type}</p>
                    <p className="text-slate-500 text-xs mt-1">{formatDateTime(d.created_at)}</p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <StatusBadge status={d.status} />

                    {/* Display Delivery OTP for NGO to share with Volunteer upon delivery */}
                    {d.status === 'picked_up' && deliveryOtp && (
                      <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" />
                        <span>Delivery OTP: <strong>{deliveryOtp}</strong></span>
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
