import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Award, CheckCircle2, Lock, Medal, Trophy, Star, ShieldCheck, Sparkles, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { DRIVE_FOLDERS } from '../constants';

export const CertificatesPage: React.FC = () => {
  const { profile } = useAuth();
  const [publishedVideos, setPublishedVideos] = useState<any[]>([]);
  const [videoProgress, setVideoProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeVideos = onSnapshot(collection(db, 'published_videos'), (snapshot) => {
      setPublishedVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'published_videos');
    });

    if (auth.currentUser) {
      const q = query(collection(db, 'video_progress'), where('userId', '==', auth.currentUser.uid));
      const unsubscribeProgress = onSnapshot(q, (snapshot) => {
        setVideoProgress(snapshot.docs.map(doc => doc.data().videoId));
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'video_progress');
        setLoading(false);
      });
      return () => { unsubscribeVideos(); unsubscribeProgress(); };
    }

    return () => unsubscribeVideos();
  }, []);

  const moduleStats = useMemo(() => {
    return DRIVE_FOLDERS.map(folder => {
      const moduleVideos = publishedVideos.filter(v => v.folderId === folder.id);
      const completedVideos = moduleVideos.filter(v => videoProgress.includes(v.id));
      const totalCount = moduleVideos.length;
      const completedCount = completedVideos.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const isCompleted = totalCount > 0 && completedCount === totalCount;

      return {
        ...folder,
        totalCount,
        completedCount,
        percentage,
        isCompleted
      };
    });
  }, [publishedVideos, videoProgress]);

  const completedModules = moduleStats.filter(m => m.isCompleted);
  const inProgressModules = moduleStats.filter(m => !m.isCompleted && m.completedCount > 0);
  const lockedModules = moduleStats.filter(m => m.completedCount === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 rotate-3">
             <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" />
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">My Certifications</h1>
            <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl">
              Showcase your journey and expertise. Complete all modules in a curriculum to unlock your professional badges and certificates.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Earned Badges</p>
                <p className="text-2xl font-black text-white">{completedModules.length}</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">XP Points</p>
                <p className="text-2xl font-black text-amber-400">{profile?.xp || 0}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
              <Medal className="w-5 h-5" />
           </div>
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Unlocked Achievements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {completedModules.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                 <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{module.title} Expert</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">Mastery Level: 100%</p>
                
                <div className="flex gap-2 w-full mt-auto">
                   <button 
                    onClick={() => alert(`Generating Certificate for ${module.title}...`)}
                    className="flex-1 bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                   >
                     <Download className="w-3.5 h-3.5" />
                     Download Certificate
                   </button>
                   <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-primary transition-all border border-slate-100 dark:border-slate-700">
                      <Share2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
          {completedModules.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 font-bold italic">Complete modules in the Course Portal to unlock your first badge!</p>
            </div>
          )}
        </div>
      </section>

      {/* In Progress Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Star className="w-5 h-5" />
           </div>
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">In Progress</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgressModules.map(module => (
            <div key={module.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center text-blue-500 shrink-0">
                 <span className="text-xs font-black">{module.percentage}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{module.title}</h4>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${module.percentage}%` }} />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{module.completedCount} / {module.totalCount} Videos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Locked Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Lock className="w-5 h-5" />
           </div>
           <h2 className="text-xl font-black text-slate-500 uppercase tracking-wider">Locked Curriculums</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {lockedModules.map(module => (
            <div key={module.id} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-6 rounded-3xl text-center group">
               <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-all">
                  <Lock className="w-5 h-5 text-slate-300" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{module.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
