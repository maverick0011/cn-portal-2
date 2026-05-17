import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { BookOpen, ExternalLink, Hash, Tag, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const ReferencesPage: React.FC = () => {
  const [refs, setRefs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'references'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRefs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'references');
    });
    return unsubscribe;
  }, []);

  const categories = ['All', 'topic', 'tool', 'general'];
  const [filter, setFilter] = useState('All');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
           <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Cloud-Native Library</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Curated documentation, whitepapers, and tool references.</p>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
              filter === cat 
                ? "bg-primary text-white border-primary shadow-lg" 
                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {refs.filter(r => filter === 'All' || r.category === filter).map((r) => (
          <motion.div 
            key={r.id}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col hover:border-primary/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
               </div>
               <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary px-3 py-1 rounded-full">{r.category}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 line-clamp-2">{r.title}</h3>
            <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
               <span className="text-[10px] font-bold text-slate-400 uppercase">External Source</span>
               <a 
                 href={r.url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary hover:text-white transition-all text-slate-400"
               >
                 <ExternalLink className="w-4 h-4" />
               </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
