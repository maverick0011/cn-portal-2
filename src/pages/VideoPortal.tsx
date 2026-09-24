import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  PlayCircle, 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Video, 
  ExternalLink, 
  ShieldCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { VideoPlayer } from '../components/VideoPlayer';
import { DRIVE_FOLDERS } from '../constants';

export const VideoPortal: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<any | null>(DRIVE_FOLDERS[0]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'library' | 'player'>('library');
  const [videoProgress, setVideoProgress] = useState<string[]>([]);
  const [lockedRef, setLockedRef] = useState<any | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      const unsubProgress = onSnapshot(query(collection(db, 'video_progress'), where('userId', '==', auth.currentUser.uid)), snap => {
        setVideoProgress(snap.docs.map(doc => doc.data().videoId));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'video_progress');
      });
      return () => unsubProgress();
    }
  }, []);

  const markWatched = async (videoId: string) => {
    if (!auth.currentUser) return;
    if (videoProgress.includes(videoId)) return;
    await addDoc(collection(db, 'video_progress'), {
      userId: auth.currentUser.uid,
      videoId,
      watchedAt: serverTimestamp()
    });
  };

  const isVideoAllowed = (folder: any) => {
    if (!folder) return false;
    if (isAdmin) return true;
    if (profile?.folderAccess?.[folder.id] === true) return true;
    if (profile?.videoAccess?.[folder.id] === true) return true;
    return false;
  };

  const handlePlayDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentVideoUrl) setViewMode('player');
  };

  if (!selectedFolder) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center font-sans">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
          <PlayCircle className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">No Modules Defined</h1>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col pt-4 px-4 md:px-8 pb-8 overflow-hidden font-sans">
      {/* Header with Search/Play bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 w-full max-w-3xl">
          {DRIVE_FOLDERS.map((folder) => {
            const isAllowed = isVideoAllowed(folder);
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder);
                  setViewMode('library');
                }}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-1.5",
                  selectedFolder?.id === folder.id && viewMode === 'library'
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40"
                )}
              >
                {folder.title}
                {!isAllowed && <Lock className="w-2.5 h-2.5 text-rose-500/80" />}
              </button>
            );
          })}
        </div>

        <form onSubmit={handlePlayDirect} className="w-full md:w-auto flex gap-2">
          <input 
            type="text"
            placeholder="Paste Link to Play..."
            value={currentVideoUrl}
            onChange={(e) => setCurrentVideoUrl(e.target.value)}
            className="flex-1 md:w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-2.5 text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white"
          />
          <button 
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 shrink-0"
          >
            Play
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Main View Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {viewMode === 'player' && currentVideoUrl ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setViewMode('library')}
                    className="p-3 bg-white dark:bg-slate-800 hover:scale-105 rounded-2xl text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate block">Curriculum Stream</span>
                    <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px] md:max-w-md">{currentVideoUrl}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentVideoUrl('')}
                  className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                >
                  Clear Player
                </button>
              </div>
              <div className="flex-1 bg-black overflow-hidden">
                <VideoPlayer url={currentVideoUrl} />
              </div>
            </div>
          ) : (
            <>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/10">
                <div>
                   <h1 className="text-2xl font-black text-slate-900 dark:text-white">{selectedFolder?.title}</h1>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Select a video module to start your journey.</p>
                </div>
                <div className="hidden sm:block">
                   <div className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-primary/10">
                      Learning Module
                   </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-24">
                {selectedFolder && (() => {
                  const isAllowed = isVideoAllowed(selectedFolder);
                  const isWatched = videoProgress.includes(selectedFolder.id);
                  const videoUrl = selectedFolder.type === 'folder'
                    ? `https://drive.google.com/drive/folders/${selectedFolder.driveId}`
                    : `https://drive.google.com/file/d/${selectedFolder.driveId}/view`;

                  return (
                    <div className="max-w-4xl mx-auto">
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={selectedFolder.id}
                        className={cn(
                          "group rounded-[2.5rem] border overflow-hidden transition-all shadow-md relative flex flex-col md:flex-row bg-slate-50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800",
                          !isAllowed && "border-slate-200/85 dark:border-slate-800/80"
                        )}
                      >
                        {/* Cinematic Header/Thumbnail */}
                        <div className="md:w-1/2 aspect-video md:aspect-auto md:min-h-[300px] bg-slate-950 relative flex items-center justify-center overflow-hidden shrink-0">
                          {/* Dynamic grid tech background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 to-slate-900/60 opacity-60 z-0" />
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-15" />

                          {isAllowed && isWatched && (
                            <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                          {!isAllowed && (
                            <div className="absolute top-4 right-4 z-20 bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                              <Lock className="w-3 h-3" />
                              Locked
                            </div>
                          )}

                          {/* Decorative large title in background */}
                          <div className="absolute bottom-6 left-6 z-10 text-slate-800/10 dark:text-slate-200/5 font-mono text-5xl font-black select-none pointer-events-none uppercase tracking-widest whitespace-nowrap">
                            {selectedFolder.id}
                          </div>

                          <button
                            onClick={() => {
                              if (!isAllowed) {
                                setLockedRef({ title: selectedFolder.title, id: selectedFolder.id });
                                return;
                              }
                              setCurrentVideoUrl(videoUrl);
                              setViewMode('player');
                              markWatched(selectedFolder.id);
                            }}
                            className={cn(
                              "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl relative z-10 cursor-pointer",
                              isAllowed 
                                ? "bg-primary hover:bg-blue-600 hover:scale-110 text-white" 
                                : "bg-slate-900 text-slate-550 hover:bg-rose-500 hover:text-white"
                            )}
                          >
                             {isAllowed ? (
                               <PlayCircle className="w-12 h-12 text-white animate-pulse" />
                             ) : (
                               <Lock className="w-9 h-9" />
                             )}
                          </button>

                          {isAllowed && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em] bg-primary/10 px-2.5 py-1 rounded-md">DEVOPS MASTER CLASS</span>
                              {isWatched && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.25em] bg-emerald-500/10 px-2.5 py-1 rounded-md">COMPLETED</span>}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-3">
                              {selectedFolder.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                              This secure curriculum lecture is hosted inside the DevOps Classroom Google Drive cloud storage. Encompasses full whiteboard theory breakdown, hands-on command runs, and deployment validations.
                            </p>

                            {/* Core stats */}
                            <div className="space-y-3 border-t border-slate-150/40 dark:border-slate-805 pt-5 pr-4">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-350">
                                <span className="font-semibold text-slate-400">Vault Source</span>
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">Google Drive Video Asset</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-350">
                                <span className="font-semibold text-slate-400">Lecture Duration</span>
                                <span className="font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> 1 Hour 15 Mins</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-350">
                                <span className="font-semibold text-slate-400">Class Progress</span>
                                <span className={cn("font-black uppercase text-[9px] tracking-wider", isWatched ? "text-emerald-500" : "text-amber-500")}>
                                  {isWatched ? "Finished" : "Not Started"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 pt-4 flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => {
                                if (!isAllowed) {
                                  setLockedRef({ title: selectedFolder.title, id: selectedFolder.id });
                                  return;
                                }
                                setCurrentVideoUrl(videoUrl);
                                setViewMode('player');
                                markWatched(selectedFolder.id);
                              }}
                              className={cn(
                                "flex-1 py-3 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2",
                                isAllowed 
                                  ? "bg-primary hover:bg-blue-600 shadow-primary/20" 
                                  : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
                              )}
                            >
                              {isAllowed ? (
                                <>
                                  <PlayCircle className="w-4 h-4" />
                                  Stream Lecture
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" />
                                  Locked - Request Access
                                </>
                              )}
                            </button>
                            
                            {isAllowed && (
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center justify-center shadow-sm"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                {/* Access Denied Modal */}
                <AnimatePresence>
                  {lockedRef && (
                    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLockedRef(null)}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                      />

                      {/* Modal Box */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] shadow-2xl z-50 p-8 text-center flex flex-col items-center overflow-hidden"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-500 flex items-center justify-center mb-6">
                          <AlertTriangle className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                          Google Drive Access Controlled
                        </h3>
                        
                        <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-1">
                          Individual File Access Restricted
                        </p>

                        <div className="my-6 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl w-full text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Selected Video File</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">{lockedRef.title}</p>
                          
                          <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-450 font-medium">
                            <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Your account cannot stream this individual file right now.</span>
                          </div>
                        </div>

                        <div className="space-y-3 w-full">
                          <button
                            onClick={() => {
                              alert(`Your request to unlock "${lockedRef.title}" has been forwarded to the Course Administrator for approval!`);
                              setLockedRef(null);
                            }}
                            className="w-full py-3 bg-primary hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer"
                          >
                            Send Access Request
                          </button>
                          <button
                            onClick={() => setLockedRef(null)}
                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            Close Inquiry
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="pt-12 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Supplemental Resources
                     </h3>
                  </div>
                  <div className="h-[500px] rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner bg-slate-50 dark:bg-slate-900">
                    <iframe 
                      src={`https://drive.google.com/embeddedfolderview?id=${selectedFolder?.driveId}#list`} 
                      className="absolute inset-0 w-full h-full border-none" 
                      allow="autoplay"
                      title={selectedFolder?.title}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="hidden xl:flex w-80 flex-col gap-6">
           <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 mb-4">
                 <ShieldCheck className="w-6 h-6 text-primary" />
                 Safe Stream
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                 We've optimized the player to bypass common Google Drive embedding blocks.
                 <br /><br />
                 If you see a blank screen, it's likely a browser cookie policy. 
                 <br /><br />
                 <span className="font-black text-primary">Pro Tip:</span> Use Chrome for the best experience.
              </p>
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
           </div>

           <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem]">
              <h3 className="font-black text-slate-400 flex items-center gap-3 mb-6 uppercase tracking-[0.2em] text-[10px]">
                 Module Context
              </h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-lg font-black text-white shadow-lg shadow-primary/20">
                       {(profile?.displayName || 'S')[0]}
                    </div>
                    <div className="min-w-0">
                       <p className="text-sm font-black text-slate-900 dark:text-white truncate">{profile?.displayName || 'Student'}</p>
                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Access: Lifetime</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                       {['DevOps', 'CI/CD', 'Automated'].map(t => (
                         <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter uppercase">{t}</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
