import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate real auth call to our secure backend
    // fetch('/api/auth/login', { ... })
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-background to-cyan-500/5 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Dark branded top section matching logo background */}
          <div className="bg-[#0a1628] flex flex-col items-center justify-center px-8 py-6">
            <img
              src="/logo-1.jpg"
              alt="PraOjas AI"
              className="h-16 w-auto object-contain"
              style={{ maxWidth: '240px' }}
            />
          </div>
          <div className="px-8 pt-6 pb-8">
          <p className="text-sm text-muted-foreground text-center mb-6">Clinical Decision Support System</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="doctor@hospital.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {isLogin ? "Don't have clinical access?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-indigo-500 hover:text-indigo-400 font-semibold"
              >
                {isLogin ? 'Request Access' : 'Sign In'}
              </button>
            </p>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              HIPAA Compliant Secure Login
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
