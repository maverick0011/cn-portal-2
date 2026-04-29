import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Calendar as CalendarIcon, Plus, Users, Clock, Trash2, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { cn } from '../lib/utils';

export const CalendarPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    invitees: [] as string[]
  });

  useEffect(() => {
    // Listen for meetings
    const q = query(collection(db, 'meetings'), orderBy('startTime', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // For non-admins, filter to show only those they are invited to
      if (!isAdmin) {
        setMeetings(data.filter((m: any) => m.invitees?.includes(user?.uid) || !m.invitees || m.invitees.length === 0));
      } else {
        setMeetings(data);
      }
    });

    // If admin, get users for invitation list
    if (isAdmin) {
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => {
        unsubscribe();
        unsubUsers();
      };
    }

    return () => unsubscribe();
  }, [isAdmin, user]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'meetings'), {
        ...newMeeting,
        createdBy: user?.uid,
        createdAt: new Date().toISOString()
      });
      setNewMeeting({ title: '', description: '', startTime: '', endTime: '', invitees: [] });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add meeting', err);
    }
  };

  const toggleInvitee = (uid: string) => {
    setNewMeeting(prev => ({
      ...prev,
      invitees: prev.invitees.includes(uid) 
        ? prev.invitees.filter(id => id !== uid)
        : [...prev.invitees, uid]
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Learning Calendar
          </h1>
          <p className="text-sm text-slate-500">Scheduled sessions and cloud-native workshops</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 text-center py-4 border-b border-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{day}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-slate-100">
            {days.map((day, idx) => {
              const dayMeetings = meetings.filter(m => isSameDay(new Date(m.startTime), day));
              const isTodayDate = isToday(day);
              const isSelected = selectedDate && isSameDay(selectedDate, day);
              
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] bg-white p-3 cursor-pointer transition-all hover:bg-blue-50/30",
                    isSelected && "ring-2 ring-primary ring-inset z-10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-sm font-bold",
                      isTodayDate ? "w-7 h-7 flex items-center justify-center bg-primary text-white rounded-full" : "text-slate-600"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayMeetings.length > 0 && (
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 2).map((m, mIdx) => (
                      <div key={mIdx} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 truncate font-medium">
                        {m.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className="text-[10px] text-slate-400 italic">
                        + {dayMeetings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {selectedDate ? format(selectedDate, 'EEEE, MMM do') : 'Select a date'}
            </h3>
            
            <div className="space-y-4">
              {selectedDate && meetings.filter(m => isSameDay(new Date(m.startTime), selectedDate)).map((meeting) => (
                <div key={meeting.id} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase bg-white px-2 py-0.5 rounded-full border border-blue-100">
                        {format(new Date(meeting.startTime), 'p')}
                      </span>
                      {isAdmin && (
                        <button 
                          onClick={async () => await deleteDoc(doc(db, 'meetings', meeting.id))}
                          className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{meeting.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{meeting.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      {meeting.invitees?.length > 0 ? `${meeting.invitees.length} Invited` : 'Public Session'}
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                </div>
              ))}
              
              {selectedDate && meetings.filter(m => isSameDay(new Date(m.startTime), selectedDate)).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 italic">No sessions scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Meeting Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Schedule New Session</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleAddMeeting} className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Meeting Title</label>
                      <input 
                        required
                        value={newMeeting.title}
                        onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Docker Optimization Workshop"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                      <textarea 
                        rows={3}
                        value={newMeeting.description}
                        onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="What's this session about?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Start Time</label>
                        <input 
                          type="datetime-local"
                          required
                          value={newMeeting.startTime}
                          onChange={e => setNewMeeting({...newMeeting, startTime: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">End Time</label>
                        <input 
                          type="datetime-local"
                          required
                          value={newMeeting.endTime}
                          onChange={e => setNewMeeting({...newMeeting, endTime: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col h-full overflow-hidden">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Invite Students (Optional)</label>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white/50">
                        <span className="text-[10px] font-bold text-slate-500">{newMeeting.invitees.length} Selected</span>
                        <button 
                          type="button"
                          onClick={() => setNewMeeting(p => ({...p, invitees: []}))}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[300px]">
                        {allUsers.filter(u => u.role !== 'admin' && u.isApproved).map(u => (
                          <div 
                            key={u.id}
                            onClick={() => toggleInvitee(u.id)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                              newMeeting.invitees.includes(u.id) ? "bg-primary/10 border-primary/20 border" : "hover:bg-white"
                            )}
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-slate-600">{(u.displayName || u.email[0]).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{u.displayName || 'Student'}</p>
                              <p className="text-[9px] text-slate-400 truncate">{u.email}</p>
                            </div>
                            {newMeeting.invitees.includes(u.id) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary text-white px-10 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Create and Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
