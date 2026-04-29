import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export const ApprovalPending: React.FC = () => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-200"
      >
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Registration Pending</h1>
        <p className="text-slate-600 mb-8">
          Thank you for joining <span className="font-bold text-primary">CN Portal 2</span>. 
          Your account is currently waiting for administrator approval. 
          You will gain access once an admin validates your profile.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left border border-slate-100">
          <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Approval typically takes 12-24 hours. If you need immediate access, 
            please contact the program coordinator.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Logout and check later
        </button>
      </motion.div>
    </div>
  );
};
