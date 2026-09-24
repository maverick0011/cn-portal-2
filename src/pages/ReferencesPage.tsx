import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  Terminal, 
  FileCode, 
  GitBranch, 
  Cpu, 
  Layers, 
  Box, 
  Cloud, 
  Compass, 
  Zap, 
  Award, 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Search, 
  Check, 
  Loader2,
  Calendar,
  Layers2,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Topic definition interface
interface TopicTile {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  themeColor: string; // Tailwind color name like 'emerald', 'sky' etc.
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  accentClass: string;
}

const DEV_OPS_TILES: TopicTile[] = [
  { 
    id: 'linux', 
    title: 'Linux', 
    icon: Terminal, 
    themeColor: 'slate',
    bgClass: 'bg-slate-50/50 dark:bg-slate-900/50',
    borderClass: 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700',
    textClass: 'text-slate-800 dark:text-slate-200',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    accentClass: 'text-slate-600 dark:text-slate-400'
  },
  { 
    id: 'shell', 
    title: 'Shell scripting', 
    icon: FileCode, 
    themeColor: 'emerald',
    bgClass: 'bg-emerald-50/20 dark:bg-emerald-950/10',
    borderClass: 'border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800',
    textClass: 'text-emerald-900 dark:text-emerald-300',
    badgeClass: 'bg-emerald-50 text-emerald-750 dark:bg-emerald-950/50 dark:text-emerald-400',
    accentClass: 'text-emerald-600 dark:text-emerald-450'
  },
  { 
    id: 'git', 
    title: 'Git', 
    icon: GitBranch, 
    themeColor: 'orange',
    bgClass: 'bg-orange-50/20 dark:bg-orange-950/10',
    borderClass: 'border-orange-150 dark:border-orange-900/40 hover:border-orange-300 dark:hover:border-orange-800',
    textClass: 'text-orange-900 dark:text-orange-300',
    badgeClass: 'bg-orange-50 text-orange-750 dark:bg-orange-950/50 dark:text-orange-400',
    accentClass: 'text-orange-600 dark:text-orange-450'
  },
  { 
    id: 'jenkins', 
    title: 'Jenkins', 
    icon: Layers2, 
    themeColor: 'rose',
    bgClass: 'bg-rose-50/20 dark:bg-rose-950/10',
    borderClass: 'border-rose-150 dark:border-rose-900/40 hover:border-rose-350 dark:hover:border-rose-800',
    textClass: 'text-rose-900 dark:text-rose-300',
    badgeClass: 'bg-rose-50 text-rose-750 dark:bg-rose-950/50 dark:text-rose-400',
    accentClass: 'text-rose-600 dark:text-rose-450'
  },
  { 
    id: 'aws', 
    title: 'AWS', 
    icon: Cpu, 
    themeColor: 'amber',
    bgClass: 'bg-amber-50/20 dark:bg-amber-950/10',
    borderClass: 'border-amber-150 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-800',
    textClass: 'text-amber-900 dark:text-amber-300',
    badgeClass: 'bg-amber-50 text-amber-750 dark:bg-amber-950/50 dark:text-amber-400',
    accentClass: 'text-amber-600 dark:text-amber-450'
  },
  { 
    id: 'docker', 
    title: 'Docker', 
    icon: Box, 
    themeColor: 'sky',
    bgClass: 'bg-sky-50/20 dark:bg-sky-950/10',
    borderClass: 'border-sky-150 dark:border-sky-900/40 hover:border-sky-300 dark:hover:border-sky-800',
    textClass: 'text-sky-900 dark:text-sky-300',
    badgeClass: 'bg-sky-50 text-sky-750 dark:bg-sky-950/50 dark:text-sky-400',
    accentClass: 'text-sky-600 dark:text-sky-450'
  },
  { 
    id: 'kubernetes', 
    title: 'Kubernates', 
    icon: Layers, 
    themeColor: 'blue',
    bgClass: 'bg-blue-50/20 dark:bg-blue-950/10',
    borderClass: 'border-blue-150 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800',
    textClass: 'text-blue-900 dark:text-blue-300',
    badgeClass: 'bg-blue-50 text-blue-750 dark:bg-blue-950/50 dark:text-blue-400',
    accentClass: 'text-blue-600 dark:text-blue-450'
  },
  { 
    id: 'terraform', 
    title: 'Terraform', 
    icon: Cloud, 
    themeColor: 'violet',
    bgClass: 'bg-violet-50/20 dark:bg-violet-950/10',
    borderClass: 'border-violet-150 dark:border-violet-900/40 hover:border-violet-300 dark:hover:border-violet-800',
    textClass: 'text-violet-900 dark:text-violet-300',
    badgeClass: 'bg-violet-50 text-violet-750 dark:bg-violet-950/50 dark:text-violet-400',
    accentClass: 'text-violet-600 dark:text-violet-450'
  },
  { 
    id: 'argocd', 
    title: 'ArgoCd', 
    icon: Compass, 
    themeColor: 'cyan',
    bgClass: 'bg-cyan-50/20 dark:bg-cyan-950/10',
    borderClass: 'border-cyan-150 dark:border-cyan-900/40 hover:border-cyan-300 dark:hover:border-cyan-800',
    textClass: 'text-cyan-900 dark:text-cyan-300',
    badgeClass: 'bg-cyan-50 text-cyan-750 dark:bg-cyan-950/50 dark:text-cyan-400',
    accentClass: 'text-cyan-600 dark:text-cyan-450'
  },
  { 
    id: 'github_actions', 
    title: 'GitHub Action', 
    icon: Zap, 
    themeColor: 'indigo',
    bgClass: 'bg-indigo-50/20 dark:bg-indigo-950/10',
    borderClass: 'border-indigo-150 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-800',
    textClass: 'text-indigo-900 dark:text-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-750 dark:bg-indigo-950/50 dark:text-indigo-400',
    accentClass: 'text-indigo-600 dark:text-indigo-450'
  },
  { 
    id: 'interview', 
    title: 'Interview Resource', 
    icon: Award, 
    themeColor: 'teal',
    bgClass: 'bg-teal-50/20 dark:bg-teal-950/10',
    borderClass: 'border-teal-150 dark:border-teal-900/40 hover:border-teal-300 dark:hover:border-teal-800',
    textClass: 'text-teal-900 dark:text-teal-300',
    badgeClass: 'bg-teal-50 text-teal-750 dark:bg-teal-950/50 dark:text-teal-400',
    accentClass: 'text-teal-600 dark:text-teal-450'
  }
];

interface ReferenceDoc {
  id: string;
  title: string;
  url: string;
  toolId: string;
  category: string;
  batch: string;
  createdAt: string;
}

export const ReferencesPage: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const [references, setReferences] = useState<ReferenceDoc[]>([]);
  const [activeBatchFilter, setActiveBatchFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Track open state for add forms per tile
  const [openAddFormId, setOpenAddFormId] = useState<string | null>(null);
  
  // Quick-add form states
  const [newTitle, setNewTitle] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newBatch, setNewBatch] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch references
  useEffect(() => {
    const q = query(collection(db, 'references'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReferenceDoc[];
      setReferences(docsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'references');
    });

    return unsubscribe;
  }, []);

  const handleAddDirectRef = async (tileId: string) => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'references'), {
        title: newTitle.trim(),
        url: newUrl.trim(),
        toolId: tileId,
        category: newUrl.trim() ? 'link' : 'note',
        batch: newBatch,
        createdAt: new Date().toISOString()
      });
      
      // Reset form & close
      setNewTitle('');
      setNewUrl('');
      setNewBatch('All');
      setOpenAddFormId(null);
    } catch (error) {
      console.error("Error publishing reference", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRef = async (refId: string) => {
    if (window.confirm("Are you sure you want to delete this reference?")) {
      try {
        await deleteDoc(doc(db, 'references', refId));
      } catch (error) {
        console.error("Error deleting reference", error);
      }
    }
  };

  const batches = ['All', 'Batch 1', 'Batch 2', 'Batch 3'];

  // Match colors for simple category tags
  const getBatchBadgeStyle = (batch: string) => {
    switch (batch) {
      case 'Batch 1':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Batch 2':
        return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';
      case 'Batch 3':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-lg">Shared Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">References & Notes Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Access, save, and review curated lectures, shared URLs, configuration notes, and topic resources.
          </p>
        </div>

        {/* Global Controls: Search & Batch Selectors */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-56 text-slate-700 dark:text-slate-250"
            />
          </div>

          {/* Batch Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-250/30">
            {batches.map((b) => (
              <button
                key={b}
                onClick={() => setActiveBatchFilter(b)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  activeBatchFilter === b
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                    : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                {b === 'All' ? 'All Batches' : b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of 11 beautiful interactive tile boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEV_OPS_TILES.map((tile) => {
          const TileIcon = tile.icon;
          
          // Filter references belonging to this tile, matching search and batch filter
          const tileRefs = references.filter(r => {
            const matchesTile = r.toolId === tile.id;
            const matchesBatch = activeBatchFilter === 'All' || r.batch === activeBatchFilter || r.batch === 'All';
            const matchesSearch = !searchQuery.trim() || 
              r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (r.url && r.url.toLowerCase().includes(searchQuery.toLowerCase()));
            
            return matchesTile && matchesBatch && matchesSearch;
          });

          const isFormOpen = openAddFormId === tile.id;

          return (
            <motion.div
              layout
              key={tile.id}
              className={cn(
                "bg-white dark:bg-slate-900 border rounded-[2rem] p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden",
                tile.borderClass,
                isFormOpen ? "ring-2 ring-primary/10 border-primary/20" : ""
              )}
            >
              <div>
                {/* Tile Box Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tile.bgClass)}>
                      <TileIcon className={cn("w-5 h-5", tile.accentClass)} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base tracking-tight">{tile.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tileRefs.length} Resources</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (isFormOpen) {
                          setOpenAddFormId(null);
                        } else {
                          setOpenAddFormId(tile.id);
                          setNewTitle('');
                          setNewUrl('');
                          setNewBatch('All');
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        isFormOpen 
                          ? "bg-slate-100 text-slate-600 dark:bg-slate-800" 
                          : "bg-primary/5 text-primary hover:bg-primary/10"
                      )}
                      title="Add resource to this tile"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* References List Container */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {tileRefs.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-6 text-center">
                      No notes or links published yet.
                    </p>
                  ) : (
                    tileRefs.map((r) => {
                      const isClickable = !!r.url && r.url.trim().startsWith('http');
                      return (
                        <div 
                          key={r.id} 
                          className="group/item flex items-start justify-between gap-2 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-all border border-slate-200/40 dark:border-slate-800/60"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center flex-wrap gap-1.5">
                              {r.batch && (
                                <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md", getBatchBadgeStyle(r.batch))}>
                                  {r.batch}
                                </span>
                              )}
                              <span className="text-[8px] text-slate-400 font-bold">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Shared'}
                              </span>
                            </div>

                            {isClickable ? (
                              <a 
                                href={r.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-bold text-slate-700 dark:text-slate-200 text-xs hover:text-primary hover:underline flex items-center gap-1 leading-snug break-words"
                              >
                                <span>{r.title}</span>
                                <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-60 group-hover/item:opacity-100 group-hover/item:text-primary transition-all" />
                              </a>
                            ) : (
                              <div className="space-y-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs leading-relaxed break-words whitespace-pre-wrap">
                                  {r.title}
                                </p>
                                {r.url && (
                                  <p className="text-[10px] text-slate-450 dark:text-slate-450 font-mono break-all bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200/30">
                                    {r.url}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRef(r.id)}
                              className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded transition-all shrink-0"
                              title="Delete reference"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Inline Add Form directly inside the tile box */}
              <AnimatePresence>
                {isFormOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-slate-150 dark:border-slate-800 space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Title / Note Text</label>
                      <textarea
                        rows={2}
                        placeholder="E.g. Hands-on Docker Lab Task"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-750 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Reference Link (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-750 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Batch Target</label>
                        <select
                          value={newBatch}
                          onChange={(e) => setNewBatch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="All">All Batches</option>
                          <option value="Batch 1">Batch 1</option>
                          <option value="Batch 2">Batch 2</option>
                          <option value="Batch 3">Batch 3</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          disabled={isSubmitting || !newTitle.trim()}
                          onClick={() => handleAddDirectRef(tile.id)}
                          className="bg-primary hover:bg-blue-600 disabled:bg-slate-200 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Publish'
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
