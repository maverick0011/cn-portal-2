import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Bell, CheckCircle, Trash2, Calendar, Video, FileText, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'video' | 'reference' | 'assessment' | 'prep' | 'meeting' | 'general';
  createdAt: string;
  readBy: string[];
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, []);

  const markAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    const unread = notifications.filter(n => !n.readBy.includes(user.uid));
    
    unread.forEach(n => {
      const ref = doc(db, 'notifications', n.id);
      batch.update(ref, {
        readBy: [...n.readBy, user.uid]
      });
    });

    await batch.commit();
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'reference': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'assessment': return <FileText className="w-5 h-5 text-amber-500" />;
      case 'prep': return <CheckCircle className="w-5 h-5 text-rose-500" />;
      case 'meeting': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary fill-current" />
            Notifications
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Stay updated with the latest DevOps curriculum additions.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Mark All Read
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-20 rounded-3xl text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No notifications yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((n, idx) => {
                const isUnread = user && !n.readBy.includes(user.uid);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "p-6 rounded-3xl border transition-all flex gap-6 group",
                      isUnread 
                        ? "bg-white dark:bg-slate-900 border-primary/20 shadow-lg shadow-primary/5" 
                        : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                      isUnread 
                        ? "bg-white dark:bg-slate-800 border-primary/10 shadow-sm" 
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                    )}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className={cn(
                          "font-black text-sm leading-none",
                          isUnread ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {n.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm font-medium leading-relaxed",
                        isUnread ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                      )}>
                        {n.message}
                      </p>
                      {isUnread && (
                        <div className="pt-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
