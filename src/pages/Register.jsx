import { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

function FloatingOrbs() {
  const orbs = useMemo(() => [
    { w: 250, h: 250, l: '70%', t: '5%',  color: 'rgba(124,58,237,0.1)' },
    { w: 180, h: 180, l: '5%',  t: '60%', color: 'rgba(6,182,212,0.07)' },
    { w: 130, h: 130, l: '50%', t: '70%', color: 'rgba(245,158,11,0.05)' },
  ], []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => (
        <motion.div key={i} className="absolute rounded-full blur-3xl"
          style={{ width: o.w, height: o.h, left: o.l, top: o.t, background: o.color }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }} />
      ))}
    </div>
  );
}

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-nx-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <FloatingOrbs />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Nexus<span className="text-violet-400">Read</span></span>
          </Link>
        </div>

        <div className="glass-card-static p-8 shadow-2xl shadow-black/50">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-white mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm">Join thousands of readers on NexusRead</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                  required autoComplete="name" placeholder="Your full name" className="nx-input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" placeholder="you@example.com" className="nx-input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className="nx-input pl-10" />
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                  ))}
                  <span className="text-[10px] text-slate-500">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
