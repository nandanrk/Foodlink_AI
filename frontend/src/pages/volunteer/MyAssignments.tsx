import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, RefreshCw, CheckCircle, X, MapPin } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { volunteerAPI } from '../../services/api';
import { VolunteerAssignment } from '../../types';
import { formatDateTime } from '../../lib/utils';

export default function MyAssignments() {
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await volunteerAPI.getAssignments();
      setAssignments(res.data.assignments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (assignmentId: string, action: string, otp?: string) => {
    setActionLoading(assignmentId + action);
    setError('');
    try {
      await volunteerAPI.updateAssignment(assignmentId, { action, otp });
      setOtpInputs(prev => ({ ...prev, [assignmentId]: '' }));
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Action failed. Please check the OTP and try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageLayout title="My Assignments" subtitle="Your pickup and delivery assignments.">
      <div className="flex justify-end mb-4">
        <Button variant="secondary" size="sm" onClick={fetchData} loading={loading}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-40 animate-pulse" />)}
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Truck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No assignments yet. You will be notified when a pickup is assigned.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a, idx) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{a.donations?.food_name || 'Donation'}</h3>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-slate-400 text-sm">
                      {a.donations?.quantity} · {a.donations?.servings} servings
                    </p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3 h-3 text-green-400" />
                      <strong>Pickup:</strong> {a.donations?.pickup_address || a.donations?.restaurants?.address || 'Address not set'}
                    </div>
                    {a.ngos && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        <strong>Deliver to:</strong> {a.ngos.name} — {a.ngos.address}
                      </p>
                    )}
                    <p className="text-slate-600 text-xs mt-0.5">
                      Assigned: {formatDateTime(a.assigned_at)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {a.status === 'assigned' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="w-full"
                          onClick={() => handleAction(a.id, 'accept')}
                          loading={actionLoading === a.id + 'accept'}>
                          Accept Assignment
                        </Button>
                        <Button size="sm" variant="danger"
                          onClick={() => handleAction(a.id, 'reject')}
                          loading={actionLoading === a.id + 'reject'}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {a.status === 'accepted' && (
                      <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <label className="text-xs text-green-400 font-semibold block text-center">
                          🔑 Step 1: Pickup OTP (from Restaurant)
                        </label>
                        <input
                          value={otpInputs[a.id] || ''}
                          onChange={e => setOtpInputs(prev => ({ ...prev, [a.id]: e.target.value }))}
                          placeholder="6-digit Pickup OTP"
                          className="input-dark text-center tracking-widest font-mono text-lg"
                          maxLength={6}
                        />
                        <Button size="sm" className="w-full"
                          onClick={() => handleAction(a.id, 'pickup', otpInputs[a.id])}
                          loading={actionLoading === a.id + 'pickup'}>
                          Confirm Pickup
                        </Button>
                      </div>
                    )}

                    {a.status === 'picked_up' && (
                      <div className="space-y-2 bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
                        <label className="text-xs text-blue-400 font-semibold block text-center">
                          🔑 Step 2: Delivery OTP (from NGO)
                        </label>
                        <input
                          value={otpInputs[a.id] || ''}
                          onChange={e => setOtpInputs(prev => ({ ...prev, [a.id]: e.target.value }))}
                          placeholder="6-digit Delivery OTP"
                          className="input-dark text-center tracking-widest font-mono text-lg"
                          maxLength={6}
                        />
                        <Button size="sm" className="w-full"
                          onClick={() => handleAction(a.id, 'deliver', otpInputs[a.id])}
                          loading={actionLoading === a.id + 'deliver'}>
                          <CheckCircle className="w-4 h-4" /> Confirm Delivery
                        </Button>
                      </div>
                    )}

                    {a.status === 'delivered' && (
                      <span className="text-green-400 text-sm font-semibold flex items-center justify-center gap-1.5 p-2 rounded-xl bg-green-500/10 border border-green-500/30">
                        <CheckCircle className="w-4 h-4" /> Delivered!
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
