import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  Map, 
  Lock, 
  CheckCircle2, 
  Play, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { DRIVE_FOLDERS } from '../constants';

export const LearningPathsPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [videoProgress, setVideoProgress] = useState<string[]>([]);
  const [publishedVideos, setPublishedVideos] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch user's video progress
    const qProgress = query(collection(db, 'video_progress'), where('userId', '==', user.uid));
    const unsubProgress = onSnapshot(qProgress, (snap) => {
      setVideoProgress(snap.docs.map(doc => doc.data().videoId));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'video_progress');
    });

    // Fetch all published videos to calculate module progress
    const unsubVideos = onSnapshot(collection(db, 'published_videos'), (snap) => {
      setPublishedVideos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'published_videos');
    });

    return () => {
      unsubProgress();
      unsubVideos();
    };
  }, [user]);

  const modules = DRIVE_FOLDERS.map(folder => {
    const hasAccess = isAdmin || profile?.folderAccess?.[folder.id];
    const moduleVideos = publishedVideos.filter(v => v.folderId === folder.id);
    const watchedVideos = moduleVideos.filter(v => videoProgress.includes(v.id));
    
    const progress = moduleVideos.length > 0 
      ? Math.round((watchedVideos.length / moduleVideos.length) * 100) 
      : 0;

    return {
      ...folder,
      hasAccess,
      progress,
      videoCount: moduleVideos.length,
      watchedCount: watchedVideos.length,
      estimatedTime: moduleVideos.length * 45 // 45m average
    };
  });

  const totalProgress = Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                 <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                    <Map className="w-6 h-6 text-primary" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Your Journey</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">Smart Learning Path</h1>
              <p className="text-slate-400 max-w-md font-medium">
                Our dynamic algorithm has tailored this path based on your assigned curriculum and progress.
              </p>
           </div>
           
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] flex flex-col items-center min-w-[200px]">
              <div className="relative w-24 h-24 mb-4">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <circle 
                      className="text-primary stroke-current transition-all duration-1000" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * totalProgress) / 100}
                    />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black">{totalProgress}%</span>
                 </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Completion</p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <TrendingUp className="absolute bottom-4 right-4 w-60 h-60 text-white/5 opacity-50 pointer-events-none" />
      </div>

      {/* Hero Banner for Continue */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-4 rounded-3xl">
        <Play className="w-10 h-10 text-primary fill-current" />
        <div className="flex-1 text-center sm:text-left">
           <h3 className="font-bold text-slate-900 dark:text-white">Continue where you left off</h3>
           <p className="text-xs text-slate-500 font-medium">Docker Mastery: Section 4 — Multi-stage Builds</p>
        </div>
        <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
           Continue Learning
        </button>
      </div>

      {/* Path Layout */}
      <div className="space-y-6 relative">
        {/* Vertical line connecting modules (hidden on mobile) */}
        <div className="hidden md:block absolute left-10 top-20 bottom-20 w-1 bg-slate-100 dark:bg-slate-800 -z-10" />

        {modules.map((m, idx) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={cn(
              "group relative pl-0 md:pl-24 transition-all",
              !m.hasAccess && "opacity-60 grayscale-[0.5]"
            )}
          >
            {/* Step Marker */}
            <div className={cn(
              "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 rounded-3xl items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl transition-all z-10",
              m.progress === 100 ? "bg-emerald-500 scale-110" : m.hasAccess ? "bg-primary" : "bg-slate-200"
            )}>
              {m.progress === 100 ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : m.hasAccess ? (
                <span className="text-2xl font-black text-white">{idx + 1}</span>
              ) : (
                <Lock className="w-8 h-8 text-slate-400" />
              )}
            </div>

            {/* Module Card */}
            <div className={cn(
               "bg-white dark:bg-slate-900 border-2 rounded-[2rem] p-8 shadow-sm transition-all flex flex-col md:flex-row items-center gap-8 group-hover:border-primary/30",
               m.hasAccess ? "border-slate-50 dark:border-slate-800" : "border-slate-100 dark:border-slate-800/50 bg-slate-50/50"
            )}>
               <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white">{m.title}</h2>
                     {m.progress === 100 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full flex items-center gap-2">
                           <Award className="w-3.5 h-3.5 text-emerald-600" />
                           <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">Completed</span>
                        </div>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-primary" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Videos</p>
                           <p className="text-xs font-bold dark:text-white">{m.watchedCount} / {m.videoCount}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</p>
                           <p className="text-xs font-bold dark:text-white">{Math.max(0, m.estimatedTime - (m.watchedCount * 45))}m</p>
                        </div>
                     </div>
                  </div>

                  {/* Progress Bar Label */}
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Module Health</span>
                     <span className="text-xs font-black text-primary">{m.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.progress}%` }}
                        className={cn(
                          "h-full animate-pulse-slow transition-all duration-1000",
                          m.progress === 100 ? "bg-emerald-500" : "bg-primary"
                        )}
                     />
                  </div>
               </div>

               <div className="shrink-0 w-full md:w-auto">
                  {m.hasAccess ? (
                     <button 
                       onClick={() => window.location.href = '#/videos'}
                       className="w-full bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                     >
                        View Module
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  ) : (
                     <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        Locked
                     </div>
                  )}
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
