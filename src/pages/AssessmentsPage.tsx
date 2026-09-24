import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { ListChecks, Clock, ChevronRight, Play, CheckCircle2, ShieldQuestion } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'assessments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAssessments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assessments');
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             <ListChecks className="w-8 h-8 text-primary" />
             Skill Assessments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Validate your knowledge and earn certificate badges.</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Score</p>
              <p className="text-lg font-black text-primary">82%</p>
           </div>
           <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">12/15</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assessments.map((a, idx) => (
          <motion.div 
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:border-primary/30 transition-all"
          >
            <div className="p-8">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary">
                     <ShieldQuestion className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full border border-amber-100 dark:border-amber-800/30">
                     <span className="text-[9px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">25 Questions</span>
                  </div>
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">{a.title}</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {a.question || "Assessment rules: 1. No external aids allowed. 2. Time limit of 30 minutes. 3. Passing score is 70%."}
               </p>
            </div>
            <div className="mt-auto p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">30 min</span>
               </div>
               <button className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all">
                  <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </motion.div>
        ))}
        {assessments.length === 0 && (
          <div className="col-span-full py-24 text-center">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldQuestion className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-slate-400 italic">No assessments available for your current module level.</p>
          </div>
        )}
      </div>
    </div>
  );
};
