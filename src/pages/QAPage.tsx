import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  MessageSquare, 
  Send, 
  HelpCircle, 
  ChevronDown, 
  User,
  MessageCircle,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const QAPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQ, setNewQ] = useState('');
  const { profile, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'qa_questions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'qa_questions');
    });
    return () => unsubscribe();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim() || !user) return;
    await addDoc(collection(db, 'qa_questions'), {
      content: newQ,
      userId: user.uid,
      userName: profile?.displayName || user.email?.split('@')[0],
      createdAt: serverTimestamp(),
      replies: [],
      category: selectedCategory === 'All' ? 'General' : selectedCategory
    });
    setNewQ('');
  };

  const categories = ['All', 'DevOps', 'Cloud', 'Docker', 'Kubernetes', 'CI/CD'];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             <MessageSquare className="w-8 h-8 text-primary" />
             Q&A Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Ask questions, share knowledge, grow together.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
        <form onSubmit={handleAsk} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <HelpCircle className="w-5 h-5 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Post a question</span>
          </div>
          <textarea
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="What's on your mind? Be specific to get better answers."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white h-32 resize-none font-medium"
          />
          <div className="flex justify-end">
            {!user?.emailVerified ? (
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-2">
                Verification Required to Post
              </p>
            ) : (
              <button 
                type="submit"
                disabled={!newQ.trim()}
                className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Post Question
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {questions.filter(q => selectedCategory === 'All' || q.category === selectedCategory).map((q) => (
          <motion.div 
            key={q.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary font-black border border-slate-100 dark:border-slate-700 uppercase">
                    {q.userName?.[0] || 'U'}
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{q.userName || 'User'}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {q.createdAt ? new Date(q.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                 </div>
              </div>
              <div className="px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                 <span className="text-[9px] font-black text-primary uppercase tracking-widest">{q.category || 'General'}</span>
              </div>
            </div>
            
            <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-8 pl-1">
              {q.content}
            </p>

            <div className="flex items-center gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
               <button className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] group/btn">
                  <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  {q.replies?.length || 0} Replies
               </button>
               <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400">
                      {i}
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
