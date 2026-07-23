import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, User, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export default function Navbar() {
  const { user, role, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = role === 'restaurant' ? [
    { label: 'Dashboard', href: '/restaurant' },
    { label: 'Donate', href: '/restaurant/donate' },
    { label: 'History', href: '/restaurant/history' },
    { label: 'Certificates', href: '/restaurant/certificates' },
  ] : role === 'ngo' ? [
    { label: 'Dashboard', href: '/ngo' },
    { label: 'Browse', href: '/ngo/browse' },
    { label: 'History', href: '/ngo/history' },
  ] : role === 'volunteer' ? [
    { label: 'Dashboard', href: '/volunteer' },
    { label: 'Assignments', href: '/volunteer/assignments' },
  ] : [];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">
              FL
            </div>
            <span className="font-bold text-white hidden sm:block">
              FoodLink <span className="text-green-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.href
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/map" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/map' ? 'bg-green-500/10 text-green-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>Map</Link>
            <Link to="/ai-chat" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/ai-chat' ? 'bg-green-500/10 text-green-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>AI Chat</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full text-xs font-bold text-black flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm text-slate-300 hidden sm:block max-w-[100px] truncate">
                  {profile?.name || user.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-44 glass-card py-1 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs text-slate-500 capitalize">{role}</p>
                      <p className="text-sm text-white truncate">{profile?.name || user.email}</p>
                    </div>
                    <Link
                      to={`/${role}/profile`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 px-4 py-3 space-y-1"
          >
            {[...navLinks, { label: 'Map', href: '/map' }, { label: 'AI Chat', href: '/ai-chat' }].map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
