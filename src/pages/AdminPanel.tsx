import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Users, Video, Clock, CheckCircle2, XCircle, ShieldCheck, UserCheck, UserMinus, Calendar as CalendarIcon, ExternalLink, BookOpen, ListChecks, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { DRIVE_FOLDERS } from '../constants';

export const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<'sessions' | 'users' | 'approvals' | 'videos' | 'references' | 'assessments' | 'interview'>('sessions');

  useEffect(() => {
    // Sessions listener
    const q = query(collection(db, 'meetings'), orderBy('startTime', 'desc'));
    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Users listener
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Videos listener
    const unsubscribeVideos = onSnapshot(collection(db, 'published_videos'), (snapshot) => {
      setPublishedVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // References listener
    const unsubscribeRefs = onSnapshot(collection(db, 'references'), (snapshot) => {
      setReferences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Assessments listener
    const unsubscribeAssessments = onSnapshot(collection(db, 'assessments'), (snapshot) => {
      setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Interview Prep listener
    const unsubscribeInterview = onSnapshot(collection(db, 'interview_prep'), (snapshot) => {
      setInterviewPrep(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeSessions();
      unsubscribeUsers();
      unsubscribeVideos();
      unsubscribeRefs();
      unsubscribeAssessments();
      unsubscribeInterview();
    };
  }, []);

  const [publishedVideos, setPublishedVideos] = useState<any[]>([]);
  const [references, setReferences] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [interviewPrep, setInterviewPrep] = useState<any[]>([]);

  const [newVideo, setNewVideo] = useState({ title: '', url: '', folderId: DRIVE_FOLDERS[0].id });
  const [newRef, setNewRef] = useState({ title: '', url: '', category: 'topic' });
  const [newAssessment, setNewAssessment] = useState({ title: '', question: '' });
  const [newPrep, setNewPrep] = useState({ title: '', content: '' });

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef.title || !newRef.url) return;
    await addDoc(collection(db, 'references'), { ...newRef, createdAt: new Date().toISOString() });
    setNewRef({ title: '', url: '', category: 'topic' });
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessment.title) return;
    await addDoc(collection(db, 'assessments'), { ...newAssessment, createdAt: new Date().toISOString() });
    setNewAssessment({ title: '', question: '' });
  };

  const handleAddInterviewPrep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrep.title) return;
    await addDoc(collection(db, 'interview_prep'), { ...newPrep, createdAt: new Date().toISOString() });
    setNewPrep({ title: '', content: '' });
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.url) return;
    try {
      const videoId = Date.now().toString();
      await setDoc(doc(db, 'published_videos', videoId), {
        ...newVideo,
        createdAt: new Date().toISOString()
      });
      setNewVideo({ title: '', url: '', folderId: DRIVE_FOLDERS[0].id });
    } catch (err) {
      console.error('Failed to add video', err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('Delete this video?')) {
      await deleteDoc(doc(db, 'published_videos', videoId));
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isApproved: true });
    } catch (err) {
      console.error('Failed to approve user', err);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this pending request?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        console.error('Failed to delete user', err);
      }
    }
  };

  const handleToggleFolderAccess = async (userId: string, folderId: string, currentStatus: boolean | undefined) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        [`folderAccess.${folderId}`]: !currentStatus
      });
    } catch (err) {
      console.error('Failed to toggle folder access', err);
    }
  };

  const pendingUsers = users.filter(u => !u.isApproved && u.role !== 'admin');
  const approvedUsers = users.filter(u => u.isApproved && u.role !== 'admin');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Admin Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage enrollments, content access, and learning sessions.</p>
        </div>
        
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 self-start">
          {[
            { id: 'sessions', label: 'Sessions', icon: CalendarIcon },
            { id: 'videos', label: 'Video Hub', icon: Video },
            { id: 'references', label: 'References', icon: BookOpen },
            { id: 'assessments', label: 'Assessments', icon: ListChecks },
            { id: 'interview', label: 'Interview Prep', icon: Shield },
            { id: 'users', label: 'User Access', icon: Users },
            { id: 'approvals', label: 'Pending', icon: UserCheck, count: pendingUsers.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-bounce">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Publish Video to Module
              </h3>
              <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Video Title</label>
                  <input
                    type="text"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E.g. Intro to Docker"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Drive URL</label>
                  <input
                    type="text"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign to Module</label>
                  <select
                    value={newVideo.folderId}
                    onChange={(e) => setNewVideo({ ...newVideo, folderId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {DRIVE_FOLDERS.map(f => (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-primary text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Publish to Video Hub
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedVideos.map(video => (
                <div key={video.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Video className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1 truncate">{video.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {DRIVE_FOLDERS.find(f => f.id === video.folderId)?.title || 'Unassigned'}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 opacity-60">
                    <Clock className="w-3.5 h-3.5" />
                    Added {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'references' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold mb-4">Add Important Link</h3>
              <form onSubmit={handleAddReference} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  placeholder="Title"
                  value={newRef.title}
                  onChange={(e) => setNewRef({ ...newRef, title: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-4 py-2"
                />
                <input
                  placeholder="URL"
                  value={newRef.url}
                  onChange={(e) => setNewRef({ ...newRef, url: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-4 py-2"
                />
                <select
                  value={newRef.category}
                  onChange={(e) => setNewRef({ ...newRef, category: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-4 py-2"
                >
                  <option value="topic">Topic</option>
                  <option value="tool">Tool</option>
                  <option value="general">General</option>
                </select>
                <button type="submit" className="bg-primary text-white rounded-xl">Add Link</button>
              </form>
            </div>
            <div className="grid gap-4">
              {references.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase mr-2">{r.category}</span>
                    <span className="font-bold">{r.title}</span>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, 'references', r.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'assessments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold mb-4">New Assessment</h3>
              <div className="space-y-4">
                <input
                  placeholder="Title"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-4 py-2"
                />
                <textarea
                  placeholder="Question / Instructions"
                  value={newAssessment.question}
                  onChange={(e) => setNewAssessment({ ...newAssessment, question: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-4 py-2 h-32"
                />
                <button onClick={handleAddAssessment} className="bg-primary text-white px-6 py-2 rounded-xl">Post Assessment</button>
              </div>
            </div>
            <div className="grid gap-4">
              {assessments.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                   <span className="font-bold">{a.title}</span>
                   <button onClick={() => deleteDoc(doc(db, 'assessments', a.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'interview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold mb-4">Post Interview Prep Content</h3>
              <div className="space-y-4">
                <input
                  placeholder="Title"
                  value={newPrep.title}
                  onChange={(e) => setNewPrep({ ...newPrep, title: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-4 py-2"
                />
                <textarea
                  placeholder="Content / Tips / Links"
                  value={newPrep.content}
                  onChange={(e) => setNewPrep({ ...newPrep, content: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-4 py-2 h-32"
                />
                <button onClick={handleAddInterviewPrep} className="bg-primary text-white px-6 py-2 rounded-xl">Publish Content</button>
              </div>
            </div>
            <div className="grid gap-4">
              {interviewPrep.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                   <span className="font-bold">{p.title}</span>
                   <button onClick={() => deleteDoc(doc(db, 'interview_prep', p.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Pending Approvals ({pendingUsers.length})</h2>
              <p className="text-xs text-slate-500 italic">Students cannot access the portal until approved.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUsers.map(u => (
                <div key={u.id} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                      {(u.displayName || u.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{u.displayName || 'New User'}</h4>
                      <p className="text-xs text-slate-500 truncate mb-4">{u.email}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveUser(u.id)}
                          className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectUser(u.id)}
                          className="px-4 bg-slate-50 text-slate-400 py-2 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {pendingUsers.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 italic text-sm">No pending registration requests.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-bold text-slate-900">Student Access Management</h2>
               <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full" /> Active</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-300 rounded-full" /> Revoked</span>
               </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 min-w-[200px]">Student Info</th>
                    {DRIVE_FOLDERS.map(f => (
                      <th key={f.id} className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                        {f.title.split('-')[0]}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Bulk Access</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {approvedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-blue-50">
                            {(u.displayName || u.email[0]).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-900 truncate">{u.displayName || 'Student'}</span>
                            <span className="text-[10px] text-slate-400 truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      {DRIVE_FOLDERS.map(f => {
                        const hasAccess = u.folderAccess?.[f.id];
                        return (
                          <td key={f.id} className="px-4 py-6 text-center">
                            <button
                              onClick={() => handleToggleFolderAccess(u.id, f.id, hasAccess)}
                              className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all mx-auto border-2",
                                hasAccess 
                                  ? "bg-green-500 border-green-500 text-white shadow-sm" 
                                  : "border-slate-200 text-transparent hover:border-primary/40"
                              )}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={async () => {
                              const bulkAccess = DRIVE_FOLDERS.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
                              await updateDoc(doc(db, 'users', u.id), { folderAccess: bulkAccess });
                            }}
                            className="px-2 py-1 bg-blue-50 text-primary text-[9px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-tighter"
                          >
                            Grant All
                          </button>
                          <button 
                            onClick={async () => {
                              await updateDoc(doc(db, 'users', u.id), { folderAccess: {} });
                            }}
                            className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-tighter"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => handleRejectUser(u.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">{meeting.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8">{meeting.description}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(meeting.startTime)}</span>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">
                      {meeting.invitees?.length || 0} Invited
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(meeting.id)}
                    className="text-red-400 hover:text-red-600 text-[11px] font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => window.location.href = '#/calendar'}
              className="group border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-blue-50/20 transition-all min-h-[240px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900 text-sm">Schedule Session</p>
                <p className="text-xs text-slate-400">Add a new meeting to the calendar</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleDelete(id: string) {
    if (window.confirm('Delete this session?')) {
      await deleteDoc(doc(db, 'meetings', id));
    }
  }
};
