import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, AlertTriangle, Award, Plus, ArrowRight, TrendingUp, Bot } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { StatCard } from '../../components/ui/Card';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function RestaurantDashboard() {
  const { stats, loading } = useDashboard();
  const { profile } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="gradient-text">{profile?.name || 'Restaurant'}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">Here's your food donation overview.</p>
          </div>
          <Link to="/restaurant/donate"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2.5 rounded-xl transition-all btn-glow text-sm">
            <Plus className="w-4 h-4" /> New Donation
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          <div className="col-span-2 lg:col-span-1 xl:col-span-2">
            <StatCard icon={<Package className="w-5 h-5" />} label="Total Donations" value={stats?.total ?? 0} color="blue" />
          </div>
          <div className="col-span-2 lg:col-span-1 xl:col-span-2">
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={stats?.completed ?? 0} color="green" />
          </div>
          <div className="col-span-2 lg:col-span-1 xl:col-span-2">
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Meals Donated" value={stats?.totalServings ?? 0} color="purple" />
          </div>
          <div className="col-span-2 lg:col-span-1 xl:col-span-2">
            <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats?.pending ?? 0} color="yellow" />
          </div>
          <div className="col-span-2 lg:col-span-1 xl:col-span-2">
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Expired" value={stats?.expired ?? 0} color="red" />
          </div>
          <div className="col-span-2 lg:col-span-1 xl:col-span-2">
            <StatCard icon={<Award className="w-5 h-5" />} label="Certificates" value={stats?.certificates ?? 0} color="green" />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'New Donation', href: '/restaurant/donate', icon: Plus, color: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40', iconColor: 'text-green-400' },
              { label: 'History', href: '/restaurant/history', icon: Package, color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40', iconColor: 'text-blue-400' },
              { label: 'Certificates', href: '/restaurant/certificates', icon: Award, color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40', iconColor: 'text-purple-400' },
              { label: 'AI Assistant', href: '/ai-chat', icon: Bot, color: 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40', iconColor: 'text-yellow-400' },
            ].map(action => (
              <Link key={action.href} to={action.href}
                className={`glass-card p-5 flex items-center gap-4 border transition-all hover:scale-105 ${action.color}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color.split(' ')[0]}`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <span className="text-white font-medium">{action.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Impact Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-6 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌱</span>
            <h3 className="text-lg font-bold text-white">Your Impact</h3>
          </div>
          <p className="text-slate-300 text-sm">
            You have donated <span className="text-green-400 font-bold">{stats?.totalServings ?? 0} meals</span> that could have been wasted.
            Together we're supporting <span className="text-green-400 font-bold">SDG 2 — Zero Hunger</span> and
            <span className="text-blue-400 font-bold"> SDG 12 — Responsible Consumption</span>.
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
