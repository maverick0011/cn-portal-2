import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { AttendancePage } from './pages/AttendancePage';
import { Logo } from './components/Logo';
import { Calendar as CalendarIcon, LayoutDashboard, ShieldCheck, LogOut, User, BarChart3, ListChecks, PlayCircle, BookOpen, MessageSquare, Map, Sparkles, Clock, Video, ExternalLink, Terminal, Shield } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { DRIVE_FOLDERS } from './constants';
import { CalendarPage } from './pages/CalendarPage';
import { ApprovalPending } from './pages/ApprovalPending';
import { VideoPlayer } from './components/VideoPlayer';
import { TerminalLab } from './pages/TerminalLab';
import { motion, AnimatePresence } from 'motion/react';

export const ReferencesPage: React.FC = () => {
  const [refs, setRefs] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    return onSnapshot(collection(db, 'references'), (snap) => {
      setRefs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const filtered = refs.filter(r => filter === 'all' || r.category === filter);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource References</h1>
        <p className="text-slate-500">Curated links and documentation for your learning journey.</p>
      </div>

      <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        {['all', 'topic', 'tool', 'general'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${filter === t ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(r => (
          <motion.a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                {r.category === 'tool' ? <LayoutDashboard className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{r.title}</h3>
            <div className="mt-auto flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                {r.category}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export const InterviewPrepPage: React.FC = () => {
  const [prep, setPrep] = React.useState<any[]>([]);

  React.useEffect(() => {
    return onSnapshot(collection(db, 'interview_prep'), (snap) => {
      setPrep(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Interview Preparation</h1>
        <p className="text-slate-500">Master your technical and behavior interviews with our expert content.</p>
      </div>

      <div className="space-y-6">
        {prep.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h2>
            <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
              {item.content}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Published on {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
        {prep.length === 0 && (
          <div className="text-center py-20 text-slate-400 italic">No interview prep materials posted yet.</div>
        )}
      </div>
    </div>
  );
};

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = React.useState<any[]>([]);
  const [submissions, setSubmissions] = React.useState<Record<string, any>>({});
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [imgUrl, setImgUrl] = React.useState('');

  React.useEffect(() => {
    const unsubA = onSnapshot(collection(db, 'assessments'), (snap) => {
      setAssessments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubS = onSnapshot(query(collection(db, 'submissions'), where('studentId', '==', auth.currentUser?.uid)), (snap) => {
      const s: Record<string, any> = {};
      snap.docs.forEach(doc => {
        s[doc.data().assessmentId] = doc.data();
      });
      setSubmissions(s);
    });

    return () => {
      unsubA();
      unsubS();
    };
  }, []);

  const handleSubmit = async (aId: string) => {
    if (!imgUrl) return;
    try {
      await addDoc(collection(db, 'submissions'), {
        assessmentId: aId,
        studentId: auth.currentUser?.uid,
        studentEmail: auth.currentUser?.email,
        imageUrl: imgUrl,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      setImgUrl('');
      setUploading(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Assessments</h1>
        <p className="text-slate-500">Solve the challenges and upload your work for review.</p>
      </div>

      <div className="grid gap-6">
        {assessments.map(a => {
          const submission = submissions[a.id];
          return (
            <motion.div
              key={a.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{a.title}</h2>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Assessment Challenge</p>
                  </div>
                  {submission ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                       Submit successful!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-primary text-[10px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      OPEN
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 text-slate-600 whitespace-pre-wrap leading-relaxed italic">
                  "{a.question}"
                </div>

                {!submission ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Result Image URL</label>
                       <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder="Paste screenshot URL here..."
                           value={uploading === a.id ? imgUrl : ''}
                           onChange={(e) => {
                             setUploading(a.id);
                             setImgUrl(e.target.value);
                           }}
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                         />
                         <button 
                           onClick={() => handleSubmit(a.id)}
                           className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                         >
                           Submit
                         </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                    <div className="w-12 h-12 rounded-xl border border-emerald-200 overflow-hidden shrink-0">
                      <img src={submission.imageUrl} className="w-full h-full object-cover" alt="Submission" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Work Submitted Successfully</p>
                      <p className="text-[10px] text-emerald-600/60">Awaiting trainer feedback</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Placeholder Pages for new sections
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <Sparkles className="w-10 h-10 text-primary animate-pulse" />
    </div>
    <h1 className="text-2xl font-bold text-text-main">{title}</h1>
    <p className="text-text-muted mt-2 max-w-md">
      Our team is currently finalizing the <span className="text-primary font-bold">{title}</span> module for the CN Portal curriculum. Stay tuned for expert-led content!
    </p>
  </div>
);

const VideoPortal = () => {
  const { profile, isAdmin } = useAuth();
  const [selectedFolder, setSelectedFolder] = React.useState<any | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = React.useState<string>('');
  const [viewMode, setViewMode] = React.useState<'library' | 'player'>('library');
  const [publishedVideos, setPublishedVideos] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'published_videos'), (snapshot) => {
      setPublishedVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const authorizedFolders = React.useMemo(() => {
    if (isAdmin) return DRIVE_FOLDERS;
    return DRIVE_FOLDERS.filter(folder => profile?.folderAccess?.[folder.id]);
  }, [profile, isAdmin]);

  const moduleVideos = React.useMemo(() => {
    if (!selectedFolder) return [];
    return publishedVideos.filter(v => v.folderId === selectedFolder.id);
  }, [publishedVideos, selectedFolder]);

  React.useEffect(() => {
    if (authorizedFolders.length > 0 && !selectedFolder) {
      setSelectedFolder(authorizedFolders[0]);
    }
  }, [authorizedFolders, selectedFolder]);

  const handlePlayDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentVideoUrl) setViewMode('player');
  };

  if (authorizedFolders.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <PlayCircle className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-xl font-bold text-text-main">No Folders Available</h1>
        <p className="text-text-muted mt-2 max-w-sm">
          You don't have access to any video folders yet. Please contact the administrator to enable your curriculum modules.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col pt-4 px-4 md:px-8 pb-8">
      {/* Header with Search/Play bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {authorizedFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => {
                setSelectedFolder(folder);
                setViewMode('library');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFolder?.id === folder.id && viewMode === 'library'
                  ? 'bg-primary text-white border-primary shadow-lg shadow-blue-500/20'
                  : 'bg-white text-text-muted border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {folder.title}
            </button>
          ))}
        </div>

        <form onSubmit={handlePlayDirect} className="w-full md:w-auto flex gap-2">
          <input 
            type="text"
            placeholder="Paste Google Drive Link to Play Inline..."
            value={currentVideoUrl}
            onChange={(e) => setCurrentVideoUrl(e.target.value)}
            className="flex-1 md:w-64 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button 
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shrink-0"
          >
            Play Now
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Main View Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          {viewMode === 'player' && currentVideoUrl ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setViewMode('library')}
                    className="p-2 hover:bg-white rounded-lg text-slate-500"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-900">Playing: {currentVideoUrl.substring(0, 40)}...</span>
                </div>
                <button 
                  onClick={() => setCurrentVideoUrl('')}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Clear Player
                </button>
              </div>
              <div className="flex-1 bg-black">
                <VideoPlayer url={currentVideoUrl} />
              </div>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h1 className="text-xl font-bold text-text-main">{selectedFolder?.title}</h1>
                   <p className="text-xs text-text-muted">Select a video to play inline. All curriculum content plays in the same tab.</p>
                </div>
                <div className="hidden sm:block bg-blue-100 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                   Module Resources
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moduleVideos.map(video => (
                    <motion.div 
                      key={video.id}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        setCurrentVideoUrl(video.url);
                        setViewMode('player');
                      }}
                      className="group cursor-pointer bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-primary/30 transition-all shadow-sm"
                    >
                      <div className="aspect-video bg-slate-200 relative flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-primary transition-colors" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-primary transition-colors">{video.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Curriculum Content
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {moduleVideos.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400 italic">No videos published for this module yet.</p>
                    </div>
                  )}
                </div>

                <div className="mt-12 border-t border-slate-100 pt-8">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-300" />
                    Browse All Files (Advanced)
                  </h3>
                  <div className="h-96 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner">
                    <iframe 
                      src={`https://drive.google.com/embeddedfolderview?id=${selectedFolder?.driveId}#list`} 
                      className="absolute inset-0 w-full h-full border-none" 
                      allow="autoplay"
                      title={selectedFolder?.title}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Note: Files opened from the browse view may trigger new tabs due to Google security policies.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="hidden lg:block w-72 space-y-4">
           <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                 <ShieldCheck className="w-5 h-5" />
                 Inline Protection
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                 Google Drive sometimes forces videos to open in new tabs for security. 
                 <br /><br />
                 <strong>Tip:</strong> Copy the URL from the new tab and paste it into the search bar above to stay within the CN Portal.
              </p>
           </div>

           <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3 uppercase tracking-tighter text-[10px]">
                 Account Context
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-primary border border-slate-200">{(profile?.displayName || 'S')[0]}</div>
                    <div>
                       <p className="text-xs font-bold text-slate-900">{profile?.displayName || 'Student'}</p>
                       <p className="text-[10px] text-slate-500">Access: Approved</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  // Checking for approval
  if (!isAdmin && profile && !profile.isApproved && location.pathname !== '/approval-pending') {
    return <Navigate to="/approval-pending" />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
};

const Navigation = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) return null;
  // Don't show nav if not approved (unless admin)
  if (!isAdmin && profile && !profile.isApproved) return null;

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, role: 'student' },
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon, role: 'student' },
    { to: '/attendance', label: 'Attendance', icon: ListChecks, role: 'student' },
    { to: '/videos', label: 'Videos', icon: PlayCircle, role: 'student' },
    { to: '/assessments', label: 'Assessments', icon: ListChecks, role: 'student' },
    { to: '/terminal-lab', label: 'Terminal Lab', icon: Terminal, role: 'student' },
    { to: '/interview-prep', label: 'Interview Prep', icon: Shield, role: 'student' },
    { to: '/references', label: 'References', icon: BookOpen, role: 'student' },
    { to: '/qa', label: 'Q&A', icon: MessageSquare, role: 'student' },
    { to: '/roadmap', label: 'Career Roadmap', icon: Map, role: 'student' },
    { to: '/mentor', label: 'AI Mentor', icon: Sparkles, role: 'student' },
    { to: '/admin', label: 'Admin Panel', icon: ShieldCheck, role: 'admin' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-20 md:w-60 bg-sidebar text-white/70 flex flex-col z-50 transition-all">
      <div className="p-6 mb-4">
        <Logo className="md:flex hidden text-white" />
        <div className="md:hidden flex justify-center">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">C</div>
        </div>
      </div>

      <div className="flex-1 px-3 space-y-1 overflow-y-auto pt-4">
        {links.map((link) => {
          if (link.role === 'admin' && !isAdmin) return null;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-inherit'}`} />
              <span className="hidden md:block">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
             <User className="w-4 h-4 text-white/50" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user.email?.split('@')[0]}</p>
            <p className="text-[10px] font-bold text-accent-devops uppercase tracking-widest">{isAdmin ? 'Admin' : 'Student'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

const VideoRoute = () => {
  return <VideoPortal />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <main className="md:pl-60 min-h-screen">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/approval-pending" element={<ProtectedRoute><ApprovalPending /></ProtectedRoute>} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={<ProtectedRoute><PlaceholderPage title="Learning Analytics" /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
              <Route path="/videos" element={
                <ProtectedRoute>
                  <VideoRoute />
                </ProtectedRoute>
              } />
              <Route path="/terminal-lab" element={
                <ProtectedRoute>
                  <TerminalLab />
                </ProtectedRoute>
              } />
              <Route path="/assessments" element={
                <ProtectedRoute>
                  <AssessmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/interview-prep" element={
                <ProtectedRoute>
                  <InterviewPrepPage />
                </ProtectedRoute>
              } />
              <Route path="/references" element={
                <ProtectedRoute>
                  <ReferencesPage />
                </ProtectedRoute>
              } />
              <Route path="/qa" element={<ProtectedRoute><PlaceholderPage title="Community Q&A" /></ProtectedRoute>} />
              <Route path="/roadmap" element={<ProtectedRoute><PlaceholderPage title="DevOps Learning Roadmap" /></ProtectedRoute>} />
              <Route path="/mentor" element={<ProtectedRoute><PlaceholderPage title="AI Career Co-pilot" /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
