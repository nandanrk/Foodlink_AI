import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { StatCard } from '../../components/ui/Card';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function VolunteerDashboard() {
  const { stats, loading } = useDashboard();
  const { profile } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <PageLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Hello, <span className="gradient-text">{profile?.name || 'Volunteer'}</span> 🚴
            </h1>
            <p className="text-slate-400 mt-1">Your delivery impact at a glance.</p>
          </div>
          <Link to="/volunteer/assignments"
            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
            View Assignments <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Truck className="w-5 h-5" />} label="Total Assigned" value={stats?.total ?? 0} color="purple" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={stats?.completed ?? 0} color="green" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Active" value={stats?.active ?? 0} color="yellow" />
          <StatCard icon={<Truck className="w-5 h-5" />} label="Meals Delivered" value={stats?.mealsDelivered ?? 0} color="blue" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-6 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-violet-500/5">
          <h3 className="text-lg font-bold text-white mb-2">🌟 Your Impact</h3>
          <p className="text-slate-300 text-sm">
            You have delivered <span className="text-purple-400 font-bold">{stats?.mealsDelivered ?? 0} meals</span> to people in need.
            You are a hero in the fight against food waste and hunger!
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
