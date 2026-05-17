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
  ShieldCheck 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { VideoPlayer } from '../components/VideoPlayer';
import { DRIVE_FOLDERS } from '../constants';

export const VideoPortal: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'library' | 'player'>('library');
  const [publishedVideos, setPublishedVideos] = useState<any[]>([]);
  const [videoProgress, setVideoProgress] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'published_videos'), (snapshot) => {
      setPublishedVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'published_videos');
    });
    
    if (auth.currentUser) {
      const unsubProgress = onSnapshot(query(collection(db, 'video_progress'), where('userId', '==', auth.currentUser.uid)), snap => {
        setVideoProgress(snap.docs.map(doc => doc.data().videoId));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'video_progress');
      });
      return () => { unsub(); unsubProgress(); };
    }
    
    return () => unsub();
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

  const authorizedFolders = useMemo(() => {
    if (isAdmin) return DRIVE_FOLDERS;
    return DRIVE_FOLDERS.filter(folder => profile?.folderAccess?.[folder.id]);
  }, [profile, isAdmin]);

  const moduleVideos = useMemo(() => {
    if (!selectedFolder) return [];
    return publishedVideos.filter(v => v.folderId === selectedFolder.id);
  }, [publishedVideos, selectedFolder]);

  useEffect(() => {
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
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
          <PlayCircle className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">No Folders Available</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">
          You don't have access to any video folders yet. Please contact the administrator to enable your curriculum modules.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col pt-4 px-4 md:px-8 pb-8 overflow-hidden">
      {/* Header with Search/Play bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 w-full max-w-3xl">
          {authorizedFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => {
                setSelectedFolder(folder);
                setViewMode('library');
              }}
              className={cn(
                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                selectedFolder?.id === folder.id && viewMode === 'library'
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40"
              )}
            >
              {folder.title}
            </button>
          ))}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {moduleVideos.map((video, vIdx) => (
                    <motion.div 
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: vIdx * 0.05 }}
                      whileHover={{ y: -8 }}
                      onClick={() => {
                        setCurrentVideoUrl(video.url);
                        setViewMode('player');
                        markWatched(video.id);
                      }}
                      className="group cursor-pointer bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-primary/40 transition-all shadow-sm hover:shadow-xl relative"
                    >
                      <div className="aspect-video bg-slate-200 dark:bg-slate-900 relative flex items-center justify-center">
                        {videoProgress.includes(video.id) && (
                          <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-2xl">
                           <PlayCircle className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-slate-900 dark:text-white text-base mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">{video.title}</h4>
                        <div className="flex items-center justify-between mt-auto">
                           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              <Clock className="w-3.5 h-3.5" />
                              45 Mins
                           </div>
                           <span className="text-[12px] font-black text-primary">0{vIdx + 1}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {moduleVideos.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-200 dark:border-slate-700">
                        <Video className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 italic">No videos published for this module yet.</p>
                    </div>
                  )}
                </div>

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
