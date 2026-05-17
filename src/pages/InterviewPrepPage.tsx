import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { Shield, CheckCircle2, MessageSquare, ChevronRight, Video, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const InterviewPrepPage: React.FC = () => {
  const [prep, setPrep] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'interview_prep'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPrep(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'interview_prep');
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/20">
                <Shield className="w-6 h-6 text-rose-500" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Career Readiness</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Interview Preparation</h1>
          <p className="text-slate-400 max-w-md font-medium">Expert strategies, technical questionnaires, and mock interview resources to help you land your dream DevOps role.</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white px-2">Core Technical Prep</h2>
          {prep.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary/20 transition-all group"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 whitespace-pre-wrap">{item.content}</p>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Recently</span>
                 <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                    Read More
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Prep Checklist</h3>
              <div className="space-y-4">
                 {[
                   'Review Kubernetes Networking',
                   'Practive Terraform HCL Basics',
                   'Docker Image Optimization',
                   'CI/CD Pipeline Design',
                   'Observability tool stack'
                 ].map((task, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{task}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-primary text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                 <h3 className="text-xl font-black mb-2">Book 1:1 Coaching</h3>
                 <p className="text-blue-100 text-sm font-medium mb-8">Personalized mock interviews with industry experts.</p>
                 <button className="bg-white text-primary px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    Schedule Slot
                 </button>
              </div>
              <Video className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 opacity-50 group-hover:scale-110 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );
};
