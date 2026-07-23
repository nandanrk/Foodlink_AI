import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, TrendingUp, Users, Search, ArrowRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { StatCard } from '../../components/ui/Card';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function NGODashboard() {
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
              Welcome, <span className="gradient-text">{profile?.name || 'NGO'}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">Track your food distribution impact.</p>
          </div>
          <Link to="/ngo/browse"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
            <Search className="w-4 h-4" /> Browse Donations
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Package className="w-5 h-5" />} label="Total Accepted" value={stats?.total ?? 0} color="blue" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={stats?.completed ?? 0} color="green" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Meals Received" value={stats?.mealsReceived ?? 0} color="purple" />
          <StatCard icon={<Users className="w-5 h-5" />} label="Active" value={stats?.active ?? 0} color="yellow" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Browse Available Donations', href: '/ngo/browse', icon: Search, color: 'bg-blue-500/10 border-blue-500/20', iconColor: 'text-blue-400' },
              { label: 'Donation History', href: '/ngo/history', icon: Package, color: 'bg-green-500/10 border-green-500/20', iconColor: 'text-green-400' },
            ].map(a => (
              <Link key={a.href} to={a.href}
                className={`glass-card p-5 flex items-center gap-4 border transition-all hover:scale-105 ${a.color}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color.split(' ')[0]}`}>
                  <a.icon className={`w-5 h-5 ${a.iconColor}`} />
                </div>
                <span className="text-white font-medium">{a.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-6 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/5">
          <h3 className="text-lg font-bold text-white mb-2">🤝 Community Impact</h3>
          <p className="text-slate-300 text-sm">
            Your NGO has received <span className="text-blue-400 font-bold">{stats?.mealsReceived ?? 0} meals</span> through FoodLink AI,
            directly fighting food insecurity and supporting <span className="text-green-400 font-bold">SDG 2 — Zero Hunger</span>.
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
