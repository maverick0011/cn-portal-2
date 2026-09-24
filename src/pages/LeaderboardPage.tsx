import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Target } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, snap => {
       setStudents(snap.docs.filter(d => d.data().role !== 'admin').map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20"
        >
           <Trophy className="w-10 h-10 text-amber-500" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Community Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Consistent learning is the bridge between goals and accomplishment."</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-12">
        {/* 2nd Place */}
        {students[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center order-2 md:order-1"
          >
            <div className="relative mb-4 group">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-xl">
                 {students[1].photoURL ? <img src={students[1].photoURL} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-slate-400">{students[1].displayName?.[0] || 'S'}</span>}
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-600 shadow-lg border-2 border-white dark:border-slate-900">#2</div>
            </div>
            <div className="h-40 w-32 bg-slate-50 dark:bg-slate-800/50 rounded-t-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center pt-8 text-center px-4">
               <p className="text-sm font-black text-slate-900 dark:text-white truncate w-full">{students[1].displayName || 'Student'}</p>
               <p className="text-xs font-bold text-primary mt-1">{students[1].xp || 0} XP</p>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {students[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center order-1 md:order-2 scale-110"
          >
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-amber-400 rounded-[2.5rem] blur-xl opacity-30 animate-pulse" />
              <div className="w-28 h-28 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center overflow-hidden border-4 border-amber-400 shadow-2xl relative">
                 {students[0].photoURL ? <img src={students[0].photoURL} className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-amber-500">{students[0].displayName?.[0] || 'S'}</span>}
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-3xl flex items-center justify-center font-black text-white shadow-xl border-4 border-white dark:border-slate-900 animate-bounce">
                👑
              </div>
            </div>
            <div className="h-56 w-40 bg-white dark:bg-slate-800 rounded-t-[2.5rem] border-x border-t border-amber-100 dark:border-amber-900/50 flex flex-col items-center pt-10 text-center px-4 shadow-2xl">
               <p className="text-base font-black text-slate-900 dark:text-white truncate w-full">{students[0].displayName || 'Student'}</p>
               <p className="text-sm font-black text-amber-600 mt-1">{students[0].xp || 0} XP</p>
               <div className="mt-4 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-800/50 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-500 fill-current" />
                  <span className="text-[9px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">Unstoppable</span>
               </div>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {students[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center order-3"
          >
            <div className="relative mb-4 group">
              <div className="w-20 h-20 rounded-[2rem] bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center overflow-hidden border-4 border-orange-100 dark:border-orange-800 shadow-xl">
                 {students[2].photoURL ? <img src={students[2].photoURL} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-orange-400">{students[2].displayName?.[0] || 'S'}</span>}
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center font-black text-orange-600 shadow-lg border-2 border-white dark:border-slate-900">#3</div>
            </div>
            <div className="h-32 w-32 bg-slate-50 dark:bg-slate-800/50 rounded-t-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center pt-6 text-center px-4">
               <p className="text-sm font-black text-slate-900 dark:text-white truncate w-full">{students[2].displayName || 'Student'}</p>
               <p className="text-xs font-bold text-primary mt-1">{students[2].xp || 0} XP</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* The Rest of the List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <h3 className="text-lg font-black dark:text-white">Full Standings</h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Learners</span>
              </div>
           </div>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          <AnimatePresence>
            {students.slice(3).map((s, idx) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
                className="p-6 flex items-center gap-6 group transition-all"
              >
                 <div className="w-10 text-sm font-black text-slate-300 group-hover:text-primary transition-colors">#{idx + 4}</div>
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary font-black overflow-hidden group-hover:scale-105 transition-transform">
                    {s.photoURL ? <img src={s.photoURL} className="w-full h-full object-cover" /> : (s.displayName?.[0] || 'S')}
                 </div>
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{s.displayName || s.email.split('@')[0]}</h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Target className="w-3 h-3 text-slate-300" />
                          Curriculum: 85%
                       </span>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{s.xp || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total XP</p>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
