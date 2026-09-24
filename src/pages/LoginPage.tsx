import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Logo } from '../components/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(location.state?.isRegister || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Create Firestore Profile
        const userEmail = (user.email || email).toLowerCase().trim();
        const isDefaultAdmin = userEmail === 'mavbharath01@gmail.com' || userEmail === 'admin@cnportal.com';
        
        const newProfile = {
          uid: user.uid,
          email: user.email || email.trim(),
          displayName: displayName.trim() || userEmail.split('@')[0],
          role: isDefaultAdmin ? 'admin' : 'student',
          isApproved: isDefaultAdmin,
          folderAccess: {
            linux: false,
            shell: false,
            jenkins: false,
            aws: false,
            docker: false,
            kubernetes: false,
            terraform: false,
            argocd: false,
          },
          hasVideoAccess: false,
          groups: [],
          createdAt: new Date().toISOString(),
          xp: 0,
          level: 1
        };

        // Write Firestore document immediately
        await setDoc(doc(db, 'users', user.uid), newProfile);

        if (displayName.trim()) {
          try {
            await updateProfile(user, { displayName: displayName.trim() });
          } catch (pErr) {
            console.warn("Could not update auth profile displayName:", pErr);
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/40 p-10 border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        <div className="flex flex-col items-center mb-10">
          <Logo className="mb-6" />
          <h1 className="text-2xl font-bold text-text-main">
            {isRegister ? 'Join CloudNative' : 'CloudNative Portal'}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Secure access to expert DevOps training
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">
              Work Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cloudnative.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-[11px] font-medium bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <span className="shrink-0 w-1 h-1 bg-red-600 rounded-full" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isRegister ? 'Join DevOps Course' : 'Enter Portal'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-text-muted text-xs font-medium">
            {isRegister ? 'Existing student?' : 'New to CloudNative?'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
