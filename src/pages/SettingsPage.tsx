import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';
import { User, Shield, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (!user) return;

    setIsDeleting(true);
    try {
      // 1. Delete Firestore Data
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 2. Delete Auth User (requires recent login)
      await deleteUser(user);
      
      // 3. Sign out (fallback if deleteUser succeeds but doesn't immediately clear state)
      await signOut(auth);
      
      window.location.href = '/';
    } catch (err: any) {
      console.error('Account deletion failed', err);
      if (err.code === 'auth/requires-recent-login') {
        alert('For security, account deletion requires a recent login. Please sign out and sign in again to delete your account.');
      } else {
        alert('Failed to delete account: ' + err.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          Account Security & Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your CloudNative identity and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="font-bold text-slate-900 mb-2">Profile Overview</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your identity on the CloudNative platform. This information is visible to SMEs during job support sessions.
          </p>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl shadow-inner">
               {(profile?.displayName || user?.email?.split('@')[0])?.[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">{profile?.displayName || 'Student'}</h4>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  Level {profile?.level || 1}
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {profile?.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 pt-8 border-t border-slate-100">
          <h3 className="font-bold text-rose-500 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Irreversible actions. Deleting your account will remove your certifications, progress, and lab access forever.
          </p>
        </div>
        
        <div className="md:col-span-2 pt-8 border-t border-slate-100">
          <div className="bg-rose-50 rounded-3xl border border-rose-100 p-8 space-y-6">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
               </div>
               <div>
                 <h4 className="font-bold text-rose-900">Permanently Delete Account</h4>
                 <p className="text-sm text-rose-700/70 mt-1">
                   This will erase all your progress, XP, level data, and course access across the CloudNative Portal.
                 </p>
               </div>
            </div>

            <div className="space-y-4 pt-4">
               <p className="text-xs font-bold text-rose-900 uppercase tracking-widest">Type <span className="bg-white px-2 py-0.5 rounded italic">DELETE</span> to confirm</p>
               <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                  type="text" 
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE here"
                  className="bg-white border border-rose-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 text-rose-900 flex-1"
                 />
                 <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
                 >
                   {isDeleting ? 'Erasing...' : 'Erase Everything'}
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
