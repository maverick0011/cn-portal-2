import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, setDoc, where, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  Play, 
  Trophy, 
  Bell, 
  Calendar, 
  Target, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  MessageSquare,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { DRIVE_FOLDERS } from '../constants';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    watchTime: '12.5',
    assignments: 2,
    messages: 3,
    nextSession: '02:14:10'
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [hasAnsweredChallenge, setHasAnsweredChallenge] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [completionStats, setCompletionStats] = useState({ count: 0, rate: 0 });

  useEffect(() => {
    // Top 5 Leaderboard
    const qLeader = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5));
    const unsubLeader = onSnapshot(qLeader, (snap) => {
      setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Recent Notifications
    const qNotif = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(5));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    // Recent Activity (simulated from multiple collections for now)
    const qActivity = query(collection(db, 'activity'), where('userId', '==', user?.uid), orderBy('timestamp', 'desc'), limit(5));
    const unsubActivity = onSnapshot(qActivity, (snap) => {
      setRecentActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activity');
    });

    // Completion Stats (for certificates count and ring)
    let unsubVideos: () => void;
    let unsubProgress: () => void;
    
    if (user) {
      const qVideos = collection(db, 'published_videos');
      const qProgress = query(collection(db, 'video_progress'), where('userId', '==', user.uid));
      
      let videos_local: any[] = [];
      let progress_local: string[] = [];
      
      const updateStats = () => {
        const stats = DRIVE_FOLDERS.map(folder => {
          const moduleVideos = videos_local.filter(v => v.folderId === folder.id);
          const total = moduleVideos.length;
          const watched = moduleVideos.filter(v => progress_local.includes(v.id)).length;
          return total > 0 && watched === total;
        });
        const completedCount = stats.filter(Boolean).length;
        const totalPossible = DRIVE_FOLDERS.length;
        setCompletionStats({ 
          count: completedCount, 
          rate: Math.round((completedCount / totalPossible) * 100) 
        });
      };

      unsubVideos = onSnapshot(qVideos, (snap) => {
        videos_local = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        updateStats();
      });
      unsubProgress = onSnapshot(qProgress, (snap) => {
        progress_local = snap.docs.map(d => d.data().videoId);
        updateStats();
      });
    }

    // Daily Challenge
    const today = format(new Date(), 'yyyy-MM-dd');
    const qChallenge = query(collection(db, 'daily_challenges'), where('date', '==', today));
    const unsubChallenge = onSnapshot(qChallenge, (snap) => {
      if (!snap.empty) {
        setDailyChallenge({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        // Fallback default challenge if none exists for today
        setDailyChallenge({
          question: "Which DevOps principle focuses on frequent, automated code integration?",
          options: ["CI/CD", "Waterfall", "Manual Testing", "Monolithic Design"],
          answer: 0,
          explanation: "CI/CD (Continuous Integration/Continuous Deployment) is the practice of automating the integration of code changes from multiple contributors into a single software project."
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'daily_challenges');
    });

    return () => {
      unsubLeader();
      unsubNotif();
      unsubActivity();
      unsubChallenge();
      unsubVideos?.();
      unsubProgress?.();
    };
  }, [user]);

  const progressData = [
    { name: 'Completed', value: completionStats.rate || 0, color: '#3b82f6' },
    { name: 'Remaining', value: 100 - (completionStats.rate || 0), color: '#e2e8f0' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* 7. QUICK STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Watch Time', value: `${stats.watchTime}h`, sub: 'This week', icon: Clock, color: 'text-blue-500' },
          { label: 'Assignments', value: stats.assignments, sub: 'Pending', icon: Target, color: 'text-amber-500' },
          { label: 'Messages', value: stats.messages, sub: 'Unread', icon: MessageSquare, color: 'text-emerald-500' },
          { label: 'Live Session', value: stats.nextSession, sub: 'Countdown', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]"
          >
            <div className={cn("p-3 rounded-xl bg-slate-50 dark:bg-slate-800", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black dark:text-white">{stat.value}</span>
                <span className="text-[10px] text-slate-400">{stat.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. WELCOME HERO CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-primary rounded-3xl p-8 text-white shadow-xl group"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
                    Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {profile?.displayName || user?.email?.split('@')[0]}!
                  </h1>
                  <p className="text-blue-100 font-medium">
                    {format(new Date(), 'EEEE, MMMM do')}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-3">
                  <Flame className="w-5 h-5 text-amber-400 fill-current" />
                  <span className="font-black">7-day streak</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button className="w-full sm:w-auto bg-white text-primary px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-white/20 transition-all active:scale-95 group">
                  <Play className="w-5 h-5 fill-current" />
                  Resume Learning
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm font-medium text-blue-100">
                  Last: <span className="font-bold border-b border-white/30 truncate max-w-[150px] inline-block">Kubernetes Pod Lifecycle</span>
                </p>
              </div>
            </div>
            {/* Background Accents */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl opacity-50" />
            <Award className="absolute top-1/2 right-10 -translate-y-1/2 w-40 h-40 text-white/5 opacity-20 pointer-events-none rotate-12" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 3. DAILY CHALLENGE WIDGET */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-2 mb-6">
                 <Zap className="w-5 h-5 text-amber-500 fill-current" />
                 <h2 className="font-black text-slate-900 dark:text-white">Daily Challenge</h2>
                 <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">+50 XP</span>
               </div>
               
               <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                 {dailyChallenge?.question}
               </p>

               <div className="space-y-3">
                 {dailyChallenge?.options.map((opt: string, i: number) => (
                   <button
                     key={i}
                     onClick={() => !hasAnsweredChallenge && setHasAnsweredChallenge(true)}
                     className={cn(
                       "w-full p-4 rounded-2xl text-left text-xs font-bold transition-all border",
                       hasAnsweredChallenge 
                         ? i === dailyChallenge.answer 
                           ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                           : "bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-800"
                         : "bg-slate-50 border-slate-100 text-slate-700 hover:border-primary/30 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-800"
                     )}
                   >
                     {opt}
                   </button>
                 ))}
               </div>

               {hasAnsweredChallenge && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10"
                 >
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Explanation</p>
                   <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                     {dailyChallenge?.explanation}
                   </p>
                 </motion.div>
               )}
            </div>

            {/* 6. UPCOMING / RECOMMENDED */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <Bell className="w-5 h-5 text-blue-500 fill-current" />
                 <h2 className="font-black text-slate-900 dark:text-white">Next Up</h2>
               </div>

               <div className="space-y-6">
                 <div className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Recommended</span>
                       <span className="text-[10px] font-bold text-slate-400">45m left</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 group-hover:border-primary/30 transition-all">
                       <h3 className="font-bold text-slate-900 dark:text-white mb-2">Docker Compose for Production</h3>
                       <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: '40%' }} />
                          </div>
                          <Play className="w-4 h-4 text-primary fill-current" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">You might like</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                       {[
                         { title: 'Terraform Basics', icon: BookOpen, color: 'bg-amber-100 text-amber-600' },
                         { title: 'Jenkins CI', icon: Zap, color: 'bg-rose-100 text-rose-600' },
                       ].map((item, i) => (
                         <div key={i} className="min-w-[160px] p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", item.color)}>
                               <item.icon className="w-4 h-4" />
                            </div>
                            <p className="text-[11px] font-black leading-snug dark:text-white">{item.title}</p>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* 5. RECENT ACTIVITY FEED */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
             <div className="flex justify-between items-center mb-8">
               <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                 <Bell className="w-5 h-5 text-primary" />
                 Recent Activity & Notifications
               </h2>
               <Link to="/notifications" className="text-xs font-bold text-primary hover:underline">View All</Link>
             </div>
             <div className="space-y-6">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No recent activity found.</p>
                ) : (
                  notifications.map((notif, i) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'video': return { icon: Play, color: 'text-blue-500' };
                        case 'reference': return { icon: BookOpen, color: 'text-emerald-500' };
                        case 'assessment': return { icon: CheckCircle2, color: 'text-amber-500' };
                        case 'meeting': return { icon: Calendar, color: 'text-purple-500' };
                        default: return { icon: Bell, color: 'text-slate-500' };
                      }
                    };
                    const config = getIcon(notif.type);
                    return (
                      <div key={notif.id} className="flex gap-4">
                        <div className="relative">
                          <div className={cn("w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800", config.color)}>
                            <config.icon className="w-5 h-5" />
                          </div>
                          {i < notifications.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100 dark:bg-slate-800" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>

          {/* JOB SUPPORT PROMO */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl group">
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0">
                   <Briefcase className="w-10 h-10 text-white" />
                </div>
                <div>
                   <h2 className="text-2xl font-black mb-2">On-Job Support Service</h2>
                   <p className="text-blue-100 text-sm font-medium mb-6">Online work support for your on-job roles. Precise options as per your project tasks.</p>
                   <Link to="/job-support" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                      Explore Plans
                      <ChevronRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>
             <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
          </div>

        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 2. PROGRESS OVERVIEW */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
            <h2 className="font-black text-slate-900 dark:text-white mb-6">Overall Progress</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{completionStats.rate}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
               {[
                 { label: 'Enrolled', value: DRIVE_FOLDERS.length, icon: BookOpen },
                 { label: 'Certificates', value: completionStats.count, icon: Award },
               ].map((c, i) => (
                 <div key={i} className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                       <c.icon className="w-5 h-5" />
                    </div>
                    <p className="text-lg font-black dark:text-white">{c.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{c.label}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* 4. LEADERBOARD SNAPSHOT */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
             <div className="flex justify-between items-center mb-8">
               <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                 <Trophy className="w-5 h-5 text-amber-500 fill-current" />
                 Leaderboard
               </h2>
               <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Standings</button>
             </div>
             <div className="space-y-4">
                {leaderboard.map((s, idx) => (
                  <div key={s.id} className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl border transition-all",
                    s.id === user?.uid 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0",
                      idx === 0 ? "bg-amber-100 text-amber-600" : 
                      idx === 1 ? "bg-slate-100 text-slate-600" :
                      idx === 2 ? "bg-orange-100 text-orange-600" : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black overflow-hidden border border-white dark:border-slate-700">
                       {s.photoURL ? <img src={s.photoURL} className="w-full h-full object-cover" /> : (s.displayName?.[0] || 'S')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.displayName || s.email.split('@')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-400">{s.xp || 0} XP</p>
                    </div>
                    {idx === 0 && <span className="text-xs">👑</span>}
                  </div>
                ))}
             </div>
             <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Your current rank: <span className="font-bold text-primary">#12</span>
                </p>
             </div>
          </div>

          {/* Quick Help / Community Link */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group shadow-2xl">
             <div className="relative z-10">
               <h3 className="font-black mb-2">Need Help?</h3>
               <p className="text-xs text-slate-400 font-medium mb-6">Ask the community or check documentation.</p>
               <div className="flex gap-2">
                 <Link to="/references" className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-primary" />
                    References
                 </Link>
                 <Link to="/qa" className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
                    <HelpCircle className="w-3 h-3 text-emerald-400" />
                    Q&A Hub
                 </Link>
               </div>
             </div>
             <MessageSquare className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 opacity-50 group-hover:scale-110 transition-transform" />
          </div>

        </div>
      </div>
    </div>
  );
};

const RatingSystem: React.FC<{ meetingId: string; studentId?: string }> = ({ meetingId, studentId }) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = async (val: number) => {
    if (!studentId) return;
    setRating(val);
    try {
      const path = `meetings/${meetingId}/ratings/${studentId}`;
      await setDoc(doc(db, 'meetings', meetingId, 'ratings', studentId), {
        studentId,
        meetingId,
        rating: val,
        timestamp: new Date().toISOString()
      }, { merge: true });
      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `meetings/${meetingId}/ratings/${studentId}`);
    }
  };

  if (submitted) return <p className="text-sm text-green-600 font-medium italic">Thanks for the feedback!</p>;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            className={cn(
              "text-lg transition-all",
              rating >= star ? "text-accent-devops scale-110" : "text-slate-200 hover:text-amber-200"
            )}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Rate</span>
    </div>
  );
};
