import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Users, Video, Clock, CheckCircle2, XCircle, ShieldCheck, UserCheck, UserMinus, Calendar as CalendarIcon, ExternalLink, BookOpen, ListChecks, Shield, Lock, Unlock, Settings, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { DRIVE_FOLDERS } from '../constants';

const TOPIC_TOOLS_LIST = [
  { id: 'linux', title: 'Linux' },
  { id: 'shell', title: 'Shell scripting' },
  { id: 'git', title: 'Git' },
  { id: 'jenkins', title: 'Jenkins' },
  { id: 'aws', title: 'AWS' },
  { id: 'docker', title: 'Docker' },
  { id: 'kubernetes', title: 'Kubernates' },
  { id: 'terraform', title: 'Terraform' },
  { id: 'argocd', title: 'ArgoCd' },
  { id: 'github_actions', title: 'GitHub Action' },
  { id: 'interview', title: 'Interview Resource' }
];

import { createNotification } from '../lib/notifications';

export const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<'sessions' | 'users' | 'approvals' | 'videos' | 'references' | 'assessments' | 'interview'>('sessions');
  const [quickStudentEmail, setQuickStudentEmail] = useState('');
  const [quickStudentName, setQuickStudentName] = useState('');

  useEffect(() => {
    // Sessions listener
    const q = query(collection(db, 'meetings'), orderBy('startTime', 'desc'));
    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'meetings');
    });

    // Users listener
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      console.log('Users Snapshot Updated:', snapshot.docs.length, 'users found');
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingUsers(false);
    }, (error) => {
      console.error('Users Listener Error:', error);
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoadingUsers(false);
    });

    // Videos listener
    const unsubscribeVideos = onSnapshot(collection(db, 'published_videos'), (snapshot) => {
      const snapDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublishedVideos(snapDocs);
      
      // Auto-seeding of Google Drive videos if empty to ensure initial access control lists exist
      if (snapshot.docs.length === 0) {
        const seedVideos = [
          { title: "Linux-1: Linux Basics & Essential Commands", url: "https://drive.google.com/file/d/1-3pjENH85tSH2xrvrVVfvgFPCl4SJGNB/view", folderId: "linux" },
          { title: "Linux-2: User Management & Permissions", url: "https://drive.google.com/file/d/1-3pjENH85tSH2xrvrVVfvgFPCl4SJGNB/view", folderId: "linux" },
          { title: "Shell-1: Intro to Host Automation & Shell Syntax", url: "https://drive.google.com/file/d/15PLjIExt1SpC8K4UCLeQYqrPzcp1p1Mf/view", folderId: "shell" },
          { title: "Git-1: Git Architecture & Repository Workflow", url: "https://drive.google.com/file/d/1rXnyjei2lfdMb75Qo2UR3RnVX2W0rvry/view", folderId: "git" },
          { title: "Jenkins-1: Server Installation & Trigger Rules", url: "https://drive.google.com/file/d/19QbdlxZCKHWWIaCrxcYXn4NmOQFokPV-/view", folderId: "jenkins" },
          { title: "Jenkins-2: Writing Multi-Stage Declarative Pipelines", url: "https://drive.google.com/file/d/19QbdlxZCKHWWIaCrxcYXn4NmOQFokPV-/view", folderId: "jenkins" },
          { title: "Docker-1: Intro to Containerization & Dockerfiles", url: "https://drive.google.com/file/d/1k-ZD0-HDUz4tHAMxmKSonvdOVQVf6TmZ/view", folderId: "docker" },
          { title: "Docker-2: Multi-Container Orchestration with Docker Compose", url: "https://drive.google.com/file/d/1k-ZD0-HDUz4tHAMxmKSonvdOVQVf6TmZ/view", folderId: "docker" },
          { title: "AWS-1: VPC Networking, IGW & Security Routing", url: "https://drive.google.com/file/d/1BJyFURJbI5XEM-7a1VVvAsqxDaqasQWW/view", folderId: "aws" },
          { title: "Kubernetes-1: Setup Control Planes with kubeadm", url: "https://drive.google.com/file/d/18i2OupFp_jePxRMEkf9aCxNJnLvTEZMt/view", folderId: "kubernetes" },
          { title: "ArgoCD-1: GitOps Workflows on Kubernetes Control Loops", url: "https://drive.google.com/file/d/1Ea6nF8jmOqB_ohcYvqr1ZZiEe9K9VFWs/view", folderId: "argocd" }
        ];

        seedVideos.forEach((v, idx) => {
          const videoId = `seed-drive-v${idx}`;
          setDoc(doc(db, 'published_videos', videoId), {
            ...v,
            createdAt: new Date().toISOString()
          }).catch(err => console.error("Error auto-seeding DevOps video:", err));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'published_videos');
    });

    // References listener
    const unsubscribeRefs = onSnapshot(collection(db, 'references'), (snapshot) => {
      setReferences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'references');
    });

    // Assessments listener
    const unsubscribeAssessments = onSnapshot(collection(db, 'assessments'), (snapshot) => {
      setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assessments');
    });

    // Interview Prep listener
    const unsubscribeInterview = onSnapshot(collection(db, 'interview_prep'), (snapshot) => {
      setInterviewPrep(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'interview_prep');
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

  const [selectedUserForVideosId, setSelectedUserForVideosId] = useState<string | null>(null);
  const selectedUserForVideos = users.find(u => u.id === selectedUserForVideosId);

  const [newVideo, setNewVideo] = useState({ title: '', url: '', folderId: DRIVE_FOLDERS[0].id });
  const [newRef, setNewRef] = useState({ title: '', url: '', category: 'topic', toolId: 'general', batch: 'All' });
  const [newAssessment, setNewAssessment] = useState({ title: '', question: '' });
  const [newPrep, setNewPrep] = useState({ title: '', content: '' });

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef.title || !newRef.url) return;
    await addDoc(collection(db, 'references'), { ...newRef, createdAt: new Date().toISOString() });
    await createNotification('New Reference Added', `A new reference "${newRef.title}" has been published.`, 'reference');
    setNewRef({ title: '', url: '', category: 'topic', toolId: 'general', batch: 'All' });
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessment.title) return;
    await addDoc(collection(db, 'assessments'), { ...newAssessment, createdAt: new Date().toISOString() });
    await createNotification('New Assessment Published', `Assessment "${newAssessment.title}" is now available.`, 'assessment');
    setNewAssessment({ title: '', question: '' });
  };

  const handleAddInterviewPrep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrep.title) return;
    await addDoc(collection(db, 'interview_prep'), { ...newPrep, createdAt: new Date().toISOString() });
    await createNotification('Interview Prep Update', `New interview preparation guide: "${newPrep.title}".`, 'prep');
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
      await createNotification('New Course Video', `Watch the latest video: "${newVideo.title}" in the courses portal.`, 'video');
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
      await setDoc(doc(db, 'users', userId), { isApproved: true }, { merge: true });
    } catch (err) {
      console.error('Failed to approve user', err);
    }
  };

  const handleQuickApproveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStudentEmail.trim()) return;
    const cleanEmail = quickStudentEmail.trim().toLowerCase();
    try {
      const existing = users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        await setDoc(doc(db, 'users', existing.id), { isApproved: true }, { merge: true });
        alert(`Student ${cleanEmail} is now approved!`);
      } else {
        const newId = `user_${Date.now()}`;
        await setDoc(doc(db, 'users', newId), {
          uid: newId,
          email: cleanEmail,
          displayName: quickStudentName.trim() || cleanEmail.split('@')[0],
          role: 'student',
          isApproved: true,
          folderAccess: {
            linux: false,
            shell: false,
            jenkins: false,
            aws: false,
            docker: false,
            kubernetes: false,
            terraform: false,
            argocd: false,
          },
          hasVideoAccess: false,
          groups: [],
          createdAt: new Date().toISOString(),
          xp: 0,
          level: 1
        });
        alert(`Student profile pre-registered and approved for ${cleanEmail}!`);
      }
      setQuickStudentEmail('');
      setQuickStudentName('');
    } catch (err: any) {
      alert(`Could not approve student: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, isApproved: boolean) => {
    const message = isApproved 
      ? 'Are you sure you want to PERMANENTLY delete this user? This will remove their profile and their login account. This cannot be undone.' 
      : 'Are you sure you want to delete this pending registration request?';
      
    if (window.confirm(message)) {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Could not retrieve admin token.");

        const response = await fetch('/api/admin/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: userId, adminToken: token })
        });

        const result = await response.json();
        if (result.success) {
          alert('User account and profile deleted successfully.');
        } else {
          throw new Error(result.error || 'Failed to delete user.');
        }
      } catch (err: any) {
        console.error('Failed to delete user', err);
        alert('Error deleting user: ' + err.message);
      }
    }
  };

  const handleGlobalAccess = async (grant: boolean) => {
    const message = grant 
      ? "Grant FULL access to all folders for ALL approved students?" 
      : "Revoke ALL folder access for ALL approved students?";
      
    if (window.confirm(message)) {
      try {
        const bulkAccess = grant 
          ? DRIVE_FOLDERS.reduce((acc, f) => ({ ...acc, [f.id]: true }), {})
          : {};
          
        const promises = approvedUsers.map(u => 
          updateDoc(doc(db, 'users', u.id), { folderAccess: bulkAccess })
        );
        
        await Promise.all(promises);
        alert(`Successfully ${grant ? 'granted' : 'revoked'} access for ${approvedUsers.length} users.`);
      } catch (err: any) {
        alert("Batch update failed: " + err.message);
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

  const handleSetVideoAccess = async (userId: string, videoId: string, status: boolean | null) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        [`videoAccess.${videoId}`]: status
      });
    } catch (err) {
      console.error('Failed to set video access', err);
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
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Database Live Sync Active</p>
          </div>
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
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Active DevOps Module Curriculum
              </h3>
              <p className="text-xs text-slate-500 font-medium whitespace-relaxed leading-relaxed">
                These are the 9 core video lectures hosted on Google Drive. Individual students' access to each of these can be dynamically toggled via the <strong>Manage Access Overrides</strong> popup on the Student Roster list below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DRIVE_FOLDERS.map((folder, index) => (
                <div key={folder.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm group relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                        Module 0{index + 1}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1 line-clamp-2 min-h-[2.5rem] leading-snug">{folder.title}</h4>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                      <span>Module Reference</span>
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8.5px]">{folder.id}</span>
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      <span>Drive Folder ID</span>
                      <span className="font-mono text-slate-500 text-[8px] truncate max-w-[120px]" title={folder.driveId}>{folder.driveId}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'references' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Publish Class Reference / Shared Notes</h3>
              <form onSubmit={handleAddReference} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reference Title</label>
                  <input
                    placeholder="E.g. Kubectl Setup Manual"
                    value={newRef.title}
                    onChange={(e) => setNewRef({ ...newRef, title: e.target.value })}
                    className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL / Link</label>
                  <input
                    placeholder="https://drive.google.com/..."
                    value={newRef.url}
                    onChange={(e) => setNewRef({ ...newRef, url: e.target.value })}
                    className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={newRef.category}
                    onChange={(e) => setNewRef({ ...newRef, category: e.target.value })}
                    className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="topic">Topic</option>
                    <option value="tool">Tool Docs</option>
                    <option value="general">General Notes</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign to Tool</label>
                  <select
                    value={newRef.toolId}
                    onChange={(e) => setNewRef({ ...newRef, toolId: e.target.value })}
                    className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="general">None (General)</option>
                    {TOPIC_TOOLS_LIST.map(f => (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Batch</label>
                  <select
                    value={newRef.batch}
                    onChange={(e) => setNewRef({ ...newRef, batch: e.target.value })}
                    className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="All">All Batches</option>
                    <option value="Batch 1">Batch 1</option>
                    <option value="Batch 2">Batch 2</option>
                    <option value="Batch 3">Batch 3</option>
                  </select>
                </div>
                <div className="md:col-span-5 flex justify-end mt-2">
                  <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-md shadow-primary/10">
                    Publish Reference Link
                  </button>
                </div>
              </form>
            </div>
            
            <div className="grid gap-4">
              {references.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">{r.category || 'topic'}</span>
                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">Tool: {TOPIC_TOOLS_LIST.find(f => f.id === r.toolId)?.title || 'General'}</span>
                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">Batch: {r.batch || 'All'}</span>
                      </div>
                      <span className="font-bold text-slate-800 text-sm mt-1 block">{r.title}</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-primary truncate block max-w-md mt-0.5">{r.url}</a>
                    </div>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, 'references', r.id))} className="text-slate-350 hover:text-red-500 p-2 hover:bg-slate-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
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
            className="space-y-6"
          >
            {/* Quick Approve / Pre-Register by Email */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Quick Approve Student by Email
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                If a student has already registered or contacted you, enter their email below to instantly approve them.
              </p>
              <form onSubmit={handleQuickApproveEmail} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={quickStudentEmail}
                  onChange={(e) => setQuickStudentEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={quickStudentName}
                  onChange={(e) => setQuickStudentName(e.target.value)}
                  className="sm:w-56 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-blue-700 transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  Approve Student
                </button>
              </form>
            </div>

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
                          onClick={() => handleDeleteUser(u.id, false)}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h2 className="text-lg font-bold text-slate-900">Student Access Management</h2>
               <div className="flex items-center gap-3">
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full" /> Active</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-300 rounded-full" /> Revoked</span>
                  </div>
                  <button 
                    onClick={() => handleGlobalAccess(true)}
                    className="px-4 py-2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                  >
                    Grant All (Global)
                  </button>
                  <button 
                    onClick={() => handleGlobalAccess(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-all"
                  >
                    Revoke All (Global)
                  </button>
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
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setSelectedUserForVideosId(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shrink-0"
                            title="Manage individual video access"
                          >
                            <Video className="w-3 px-0 h-3" />
                            Videos
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id, true)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors group/del shrink-0"
                            title="Delete User permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Video Access override modal */}
      <AnimatePresence>
        {selectedUserForVideosId && selectedUserForVideos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForVideosId(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-4xl h-[85vh] bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-blue-50 shrink-0">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      Granular Video Access Control
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-slate-500 mt-0.5">
                      <span className="text-primary font-black uppercase text-[10px] tracking-wider">{selectedUserForVideos.displayName || 'Student'}</span>
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      <span>{selectedUserForVideos.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserForVideosId(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/50 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Close Manager
                </button>
              </div>

              {/* Explanatory banner */}
              <div className="px-8 py-4 bg-blue-50/50 border-b border-blue-100/50 flex gap-3 items-start">
                <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Provide custom overrides for specific courses. By default, <strong>Inherit</strong> is active, matching the student's high-level tool access checked in the main table. Setting a video to <strong>Always Grant</strong> allows individual playback even if the full module is locked, while <strong>Always Restrict</strong> blocks access even if the full module is open.
                </p>
              </div>

              {/* Video Groups list */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {DRIVE_FOLDERS.map((folder) => {
                  const isFolderAllowed = !!selectedUserForVideos.folderAccess?.[folder.id];
                  const overrideStatus = selectedUserForVideos.videoAccess?.[folder.id];

                  return (
                    <div key={folder.id} className="space-y-4 border border-slate-100 rounded-[2rem] p-6 shadow-sm bg-slate-50/20">
                      <div className="flex items-center justify-between border-b border-light-700/50 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-wide">
                            {folder.title}
                          </span>
                          <span className={cn(
                            "px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border",
                            isFolderAllowed 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                              : "bg-slate-100 border-slate-200 text-slate-400"
                          )}>
                            {isFolderAllowed ? "Module Open" : "Module Locked"}
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="mt-1">
                              {overrideStatus === true ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-sm shadow-emerald-500/30" title="Explicitly Granted" />
                              ) : overrideStatus === false ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-50 block shadow-sm shadow-rose-200 border border-rose-500" title="Explicitly Blocked" />
                              ) : (
                                <span className={cn(
                                  "w-2.5 h-2.5 rounded-full block border-2",
                                  isFolderAllowed ? "border-emerald-500 bg-transparent" : "border-slate-300 bg-transparent"
                                )} title="Inherited Status" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-sm font-bold text-slate-800 truncate leading-snug">Google Drive Master Video File</h5>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                Current Access: {' '}
                                {overrideStatus === true ? (
                                  <span className="text-emerald-500 font-bold">Authorized (Explicit)</span>
                                ) : overrideStatus === false ? (
                                  <span className="text-rose-500 font-bold">Blocked (Explicit)</span>
                                ) : isFolderAllowed ? (
                                  <span className="text-emerald-500/70 font-semibold">Authorized (Inherited)</span>
                                ) : (
                                  <span className="text-slate-400 font-semibold">Blocked (Inherited)</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Button group tri-state selector */}
                          <div className="bg-slate-100 p-1 rounded-xl flex self-start md:self-auto shrink-0 border border-slate-200/50">
                            <button
                              type="button"
                              onClick={() => handleSetVideoAccess(selectedUserForVideos.id, folder.id, null)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                overrideStatus === undefined || overrideStatus === null
                                  ? "bg-white text-slate-700 shadow-sm font-bold"
                                  : "text-slate-400 hover:text-slate-600"
                              )}
                            >
                              Inherit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetVideoAccess(selectedUserForVideos.id, folder.id, true)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                overrideStatus === true
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                  : "text-slate-400 hover:text-emerald-600"
                              )}
                            >
                              Grant
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetVideoAccess(selectedUserForVideos.id, folder.id, false)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                overrideStatus === false
                                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                  : "text-slate-400 hover:text-rose-600"
                              )}
                            >
                              Restrict
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Live Firestore Active
                </span>
                <button
                  onClick={() => setSelectedUserForVideosId(null)}
                  className="px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
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
