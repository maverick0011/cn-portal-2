import React from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Map, 
  User, 
  LogOut, 
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Calendar as CalendarIcon,
  Sparkles,
  Moon,
  Sun,
  Award,
  FolderOpen,
  Terminal,
  ListChecks,
  Shield,
  BookOpen,
  Briefcase,
  HelpCircle,
  Book
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { cn } from './lib/utils';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { CalendarPage } from './pages/CalendarPage';
import { AttendancePage } from './pages/AttendancePage';
import { TerminalLab } from './pages/TerminalLab';
import { ApprovalPending } from './pages/ApprovalPending';
import { MessagesPage } from './pages/MessagesPage';
import { LearningPathsPage } from './pages/LearningPathsPage';
import { VideoPortal } from './pages/VideoPortal';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { QAPage } from './pages/QAPage';
import { ReferencesPage } from './pages/ReferencesPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { JobSupportPage } from './pages/JobSupportPage';
import { LandingPage } from './pages/LandingPage';

import { NotificationsPage } from './pages/NotificationsPage';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
      <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
    </div>
    <div className="flex flex-col">
       <span className="font-black text-xl tracking-tighter leading-none text-primary transition-colors duration-300">CloudNative</span>
    </div>
  </div>
);

const SessionTimer = () => {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    const loginTime = localStorage.getItem('loginTime') || Date.now().toString();
    if (!localStorage.getItem('loginTime')) localStorage.setItem('loginTime', loginTime);
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - parseInt(loginTime)) / 1000);
      setSeconds(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <div className="fixed bottom-4 right-4 z-[60] bg-slate-900/80 backdrop-blur px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
       <div className="flex flex-col">
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Active Session</span>
        <span className="text-xs font-mono text-emerald-400 font-bold">{formatTime(seconds)}</span>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <Sparkles className="w-10 h-10 text-primary animate-pulse" />
    </div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
    <p className="text-slate-500 mt-2 max-w-md">
      Our team is currently finalizing the <span className="text-primary font-bold">{title}</span> module for the CloudNative curriculum. Stay tuned for expert-led content!
    </p>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (!isAdmin && profile && !profile.isApproved && location.pathname !== '/approval-pending') {
    return <Navigate to="/approval-pending" />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
};

const Navigation = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(() => document.body.classList.contains('dark'));
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const count = snap.docs.filter(d => !d.data().readBy.includes(user.uid)).length;
      setUnreadCount(count);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });
  }, [user]);

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    document.body.classList.toggle('dark', newVal);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // Do not show navigation on public pages or when user is not authenticated
  const publicPaths = ['/', '/login', '/job-support', '/approval-pending'];
  const isPublicPath = publicPaths.includes(location.pathname);
  
  if (!user || isPublicPath) return null;
  if (!isAdmin && !profile?.isApproved) return null;

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, role: 'student' },
    { to: '/learning-paths', label: 'Learning Path', icon: Map, role: 'student' },
    { to: '/videos', label: 'My Courses', icon: FolderOpen, role: 'student' },
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon, role: 'student' },
    { to: '/qa', label: 'Q&A Hub', icon: HelpCircle, role: 'student' },
    { to: '/messages', label: 'Messages', icon: MessageSquare, role: 'student' },
    { to: '/notifications', label: 'Notifications', icon: Bell, role: 'student', badge: true },
    { to: '/leaderboard', label: 'Leaderboard', icon: Sparkles, role: 'student' },
    { to: '/certificates', label: 'Certificates', icon: Award, role: 'student' },
    { to: '/job-support', label: 'Job Support', icon: Briefcase, role: 'student' },
    { to: '/references', label: 'References', icon: Book, role: 'student' },
    { to: '/settings', label: 'Settings', icon: Settings, role: 'student' },
    { to: '/admin', label: 'Admin Panel', icon: ShieldCheck, role: 'admin' },
  ];

  const isPending = !isAdmin && profile && !profile.isApproved;

  return (
    <>
      {!user.emailVerified && !isPending && (
        <div className="fixed top-0 left-0 md:left-64 right-0 z-[110] bg-amber-600 text-white p-2.5 px-6 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <p className="text-xs font-bold">Verify your email to unlock all features.</p>
          </div>
          <Link to="/messages" className="px-3 py-1 bg-white text-amber-600 rounded-lg text-[10px] font-black uppercase hover:bg-white/90 transition-all shrink-0">
            Verify Now
          </Link>
        </div>
      )}
      {!isPending && (
        <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-sidebar text-white/70 flex flex-col z-[100] transition-all">
      <div className="p-6 mb-4">
        <Logo className="md:flex hidden text-white" />
        <div className="md:hidden flex justify-center">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">C</div>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-1 overflow-y-auto pt-4 scrollbar-hide">
        {links.map((link) => {
          if (link.role === 'admin' && !isAdmin) return null;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-sm font-bold relative ${
                isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-inherit'}`} />
              <span className="hidden md:block transition-all">{link.label}</span>
              {link.badge && unreadCount > 0 && (
                <span className="absolute right-3 top-3 w-4 h-4 bg-rose-500 text-[8px] font-black flex items-center justify-center rounded-full text-white ring-2 ring-sidebar">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-white/5 space-y-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          <span className="hidden md:block">{isDark ? 'Light' : 'Dark'} Mode</span>
        </button>

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-primary/20">
              {(profile?.displayName || user.email?.split('@')[0])?.[0].toUpperCase()}
           </div>
           <div className="hidden md:block overflow-hidden">
             <p className="text-xs font-black text-white truncate leading-tight">{profile?.displayName || user.email?.split('@')[0]}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAdmin ? 'Admin' : 'Student'}</p>
           </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all text-xs font-black uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </nav>
      )}
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const AppContent = () => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const publicPaths = ['/', '/login', '/job-support', '/approval-pending'];
  const isPublicPath = publicPaths.includes(location.pathname);
  const showSidebar = user && (profile?.isApproved || isAdmin) && !isPublicPath;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <Navigation />
      <main className={cn(
        "min-h-screen relative transition-all duration-300",
        showSidebar ? "pl-20 md:pl-64" : "pl-0"
      )}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              user ? (
                (profile?.isApproved || isAdmin) ? <Navigate to="/dashboard" replace /> : <Navigate to="/approval-pending" replace />
              ) : <LandingPage />
            } 
          />
          <Route 
            path="/login" 
            element={
              user ? (
                (profile?.isApproved || isAdmin) ? <Navigate to="/dashboard" replace /> : <Navigate to="/approval-pending" replace />
              ) : <LoginPage />
            } 
          />
          <Route path="/job-support" element={<JobSupportPage />} />
          <Route path="/approval-pending" element={user ? <ApprovalPending /> : <Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute><VideoPortal /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/terminal-lab" element={<ProtectedRoute><TerminalLab /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
          <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrepPage /></ProtectedRoute>} />
          <Route path="/references" element={<ProtectedRoute><ReferencesPage /></ProtectedRoute>} />
          <Route path="/learning-paths" element={<ProtectedRoute><LearningPathsPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/qa" element={<ProtectedRoute><QAPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PlaceholderPage title="Account Settings" /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showSidebar && <SessionTimer />}
    </div>
  );
}
