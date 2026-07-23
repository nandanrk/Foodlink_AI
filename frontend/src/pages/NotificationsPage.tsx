import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';
import { timeAgo } from '../lib/utils';

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <PageLayout
      title="Notifications"
      subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      <div className="max-w-2xl mx-auto">
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="glass-card h-20 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No notifications yet. They will appear here when you receive updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div
                  className={`glass-card p-4 flex items-start gap-4 transition-all cursor-pointer ${
                    !n.read ? 'border-green-500/30 bg-green-500/5' : 'opacity-70'
                  }`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !n.read ? 'bg-green-500/20' : 'bg-white/5'
                  }`}>
                    <Bell className={`w-4 h-4 ${!n.read ? 'text-green-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                      {n.title}
                    </p>
                    <p className="text-slate-400 text-sm mt-0.5">{n.message}</p>
                    <p className="text-slate-600 text-xs mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-1.5 pulse-green" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
