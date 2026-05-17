import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  limit
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile,
  ShieldAlert,
  Bell,
  Users,
  MessageSquare,
  CheckCircle,
  RefreshCcw,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  type: 'text' | 'announcement';
}

export const MessagesPage: React.FC = () => {
  const { user, profile, isAdmin, sendVerification, refreshUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'community' | 'announcements' | 'qa'>('community');
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'qa') {
      navigate('/qa');
      return;
    }
    const collName = activeTab === 'announcements' ? 'announcements' : 'community_chat';
    const q = query(collection(db, collName), orderBy('timestamp', 'desc'), limit(200));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs.reverse());
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collName);
    });

    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    if (!user.emailVerified) return;

    const collName = activeTab === 'announcements' ? 'announcements' : 'community_chat';
    
    // Admin only for announcements
    if (activeTab === 'announcements' && !isAdmin) return;

    try {
      await addDoc(collection(db, collName), {
        text: newMessage,
        senderId: user.uid,
        senderName: profile?.displayName || user.email?.split('@')[0],
        timestamp: serverTimestamp(),
        type: activeTab === 'announcements' ? 'announcement' : 'text'
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collName);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl m-4 overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-6">
          <h1 className="text-xl font-black text-slate-900 dark:text-white mb-6">Messages</h1>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('community')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === 'community' ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <Users className="w-5 h-5" />
              <div className="text-left">
                <p className="text-xs font-black">Community Chat</p>
                <p className={cn("text-[10px] font-medium", activeTab === 'community' ? "text-white/70" : "text-slate-400")}>General discussion</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === 'announcements' ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <Bell className="w-5 h-5" />
              <div className="text-left">
                <p className="text-xs font-black">Announcements</p>
                <p className={cn("text-[10px] font-medium", activeTab === 'announcements' ? "text-white/70" : "text-slate-400")}>Official updates</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('qa')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === 'qa' ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <HelpCircle className="w-5 h-5" />
              <div className="text-left">
                <p className="text-xs font-black">Q&A Session</p>
                <p className={cn("text-[10px] font-medium", activeTab === 'qa' ? "text-white/70" : "text-slate-400")}>Expert help hub</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">Admin Notice</p>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-600 font-medium leading-relaxed">
              Maintain professional conduct. Inappropriate messages will lead to account suspension.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {activeTab === 'community' ? <Users className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {activeTab === 'community' ? 'Community Chat' : 'Announcements'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {activeTab === 'community' ? 'Open for all members' : 'Only Admins can post'}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30"
        >
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            const showDate = i === 0 || format(msg.timestamp?.toDate() || new Date(), 'yyyy-MM-dd') !== format(messages[i-1].timestamp?.toDate() || new Date(), 'yyyy-MM-dd');

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-8">
                    <span className="px-4 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {format(msg.timestamp?.toDate() || new Date(), 'MMMM do, yyyy')}
                    </span>
                  </div>
                )}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%] md:max-w-[70%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  {!isMe && (
                    <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-tighter">
                      {msg.senderName}
                    </p>
                  )}
                  <div className={cn(
                    "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                    msg.type === 'announcement' 
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 w-full" 
                      : isMe 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : 'Sending...'}
                  </p>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Input Area */}
        {activeTab === 'announcements' && !isAdmin ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 italic">Only administrators can post to Announcements.</p>
          </div>
        ) : !user?.emailVerified ? (
          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 text-center border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-500 italic flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Please verify your email address to send messages.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      setVerifying(true);
                      await sendVerification();
                      setSent(true);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setVerifying(false);
                    }
                  }}
                  disabled={verifying || sent}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : sent ? <CheckCircle className="w-3 h-3" /> : null}
                  {sent ? 'Email Sent' : 'Send Verification Email'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      setRefreshing(true);
                      await refreshUser();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setRefreshing(false);
                    }
                  }}
                  disabled={refreshing}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                  Check Status
                </button>
              </div>
              <p className="text-[10px] text-amber-600/60 dark:text-amber-500/40 font-medium">
                After clicking the link in your email, click 'Check Status' to enable messaging.
              </p>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={handleSendMessage}
            className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 pl-4 border border-slate-100 dark:border-slate-700 focus-within:border-primary/30 transition-all">
              <button type="button" className="text-slate-400 hover:text-primary transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..." 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2 dark:text-white"
              />
              <button type="button" className="text-slate-400 hover:text-amber-500 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
