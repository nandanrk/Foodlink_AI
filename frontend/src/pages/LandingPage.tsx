import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Users, Truck, Brain, MapPin, Shield, Star, ChevronRight, Globe } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Smart algorithms match surplus food with nearby NGOs instantly, minimizing waste and maximizing impact.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: MapPin, title: 'Real-Time Maps', desc: 'Live tracking of donations, volunteer locations, and delivery routes powered by Leaflet & OpenStreetMap.', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Truck, title: 'Automated Logistics', desc: 'Volunteers are auto-assigned, OTP-verified pickups ensure chain of custody, certificates generated automatically.', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { icon: Shield, title: 'Secure & Certified', desc: 'Supabase auth, PDF donation certificates, shelf-life guidance for every donation. Trustworthy at every step.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
];

const stats = [
  { label: 'Meals Saved', value: '12,450+' },
  { label: 'Restaurants', value: '340+' },
  { label: 'NGO Partners', value: '89+' },
  { label: 'Volunteers', value: '620+' },
];

const roles = [
  { role: 'Restaurant', icon: '🍽️', desc: 'Donate surplus food, track impact, receive certificates', color: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/30', href: '/register' },
  { role: 'NGO', icon: '🤝', desc: 'Accept donations, coordinate with volunteers, measure community impact', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30', href: '/register' },
  { role: 'Volunteer', icon: '🚴', desc: 'Pick up and deliver food, earn recognition, fight hunger locally', color: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/30', href: '/register' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-animated">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">FL</div>
            <span className="font-bold text-white">FoodLink <span className="text-green-400">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">Login</Link>
            <Link to="/register" className="bg-green-500 hover:bg-green-400 text-black text-sm font-semibold px-4 py-2 rounded-xl transition-all btn-glow">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="bg-grid absolute inset-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/20 text-green-400 text-sm font-medium mb-8"
          >
            <Leaf className="w-4 h-4" />
            SDG 2 · SDG 12 · AI-Powered
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Connecting
            <span className="gradient-text"> Surplus Food</span>
            <br />with Those Who
            <span className="gradient-text"> Need It Most</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            FoodLink AI automates the complete food donation workflow — from restaurant surplus to NGO delivery — using AI, real-time maps, and intelligent logistics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all btn-glow"
            >
              Start Donating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 glass border border-white/10 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:border-green-500/30 transition-all"
            >
              Sign In <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powered by <span className="gradient-text">Cutting-Edge Technology</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every feature is designed to make food redistribution effortless, transparent, and impactful.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map(f => (
              <motion.div key={f.title} variants={item} className="glass-card p-6 flex gap-4 group hover:border-green-500/30 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${f.bg}`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Choose Your Role</h2>
            <p className="text-slate-400">Join the platform that fits how you want to fight food waste.</p>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {roles.map(r => (
              <motion.div key={r.role} variants={item}>
                <Link to={r.href} className="block">
                  <div className={`glass-card p-8 text-center bg-gradient-to-b ${r.color} border ${r.border} hover:scale-105 transition-all duration-300 group`}>
                    <div className="text-5xl mb-4">{r.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{r.role}</h3>
                    <p className="text-slate-400 text-sm mb-6">{r.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-400 group-hover:gap-2 transition-all">
                      Join as {r.role} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SDG */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Globe className="w-12 h-12 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">Supporting Global Sustainability Goals</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="glass-card p-6 border-green-500/30">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="text-xl font-bold text-green-400 mb-2">SDG 2 — Zero Hunger</h3>
                <p className="text-slate-400 text-sm">End hunger, achieve food security and improved nutrition by efficiently redistributing surplus food to communities in need.</p>
              </div>
              <div className="glass-card p-6 border-blue-500/30">
                <div className="text-4xl mb-3">♻️</div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">SDG 12 — Responsible Consumption</h3>
                <p className="text-slate-400 text-sm">Ensure sustainable consumption and production patterns by eliminating food waste through intelligent redistribution.</p>
              </div>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all btn-glow"
            >
              Join FoodLink AI Today <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold text-xs">FL</div>
            <span className="text-white font-semibold">FoodLink AI</span>
          </div>
          <p className="text-slate-500 text-sm text-center">
            © 2025 FoodLink AI · Reducing Food Waste, Fighting Hunger · Supporting SDG 2 & SDG 12
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm text-slate-500 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="text-sm text-slate-500 hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
