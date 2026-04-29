import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Cpu, Network, Clock, Play, HelpCircle, ChevronRight, HardDrive } from 'lucide-react';

interface FileSystemItem {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, FileSystemItem>;
}

const INITIAL_FS: Record<string, FileSystemItem> = {
  'home': {
    name: 'home',
    type: 'dir',
    children: {
      'student': {
        name: 'student',
        type: 'dir',
        children: {
          'welcome.txt': { name: 'welcome.txt', type: 'file', content: 'Welcome to the CN Portal Linux Lab.\nPractice your commands here.' },
          'projects': { name: 'projects', type: 'dir', children: {} },
          'notes.md': { name: 'notes.md', type: 'file', content: '# Lab Notes\n1. Learn Docker\n2. Master K8s' }
        }
      }
    }
  },
  'etc': {
    name: 'etc',
    type: 'dir',
    children: {
      'hosts': { name: 'hosts', type: 'file', content: '127.0.0.1 localhost\n192.168.1.1 gateway' }
    }
  }
};

export const TerminalLab: React.FC = () => {
  const [history, setHistory] = useState<{ type: 'input' | 'output'; text: string; cmd?: string }[]>([
    { type: 'output', text: 'Cloud Native Portal - Virtual Lab v1.0.4' },
    { type: 'output', text: 'Login successful. Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState(['home', 'student']);
  const [fs, setFs] = useState(INITIAL_FS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const getDir = (path: string[]) => {
    let current: any = { children: fs };
    for (const p of path) {
      current = current.children[p];
    }
    return current;
  };

  const handleCommand = (cmdStr: string) => {
    const parts = cmdStr.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setHistory(prev => [...prev, { type: 'input', text: `${currentPath.join('/')} $ ${cmdStr}`, cmd: command }]);

    switch (command) {
      case 'help':
        setHistory(prev => [...prev, { type: 'output', text: 'Available commands: ls, cd, mkdir, cat, clear, whoami, date, echo, pwd, help' }]);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'whoami':
        setHistory(prev => [...prev, { type: 'output', text: 'student' }]);
        break;
      case 'date':
        setHistory(prev => [...prev, { type: 'output', text: new Date().toString() }]);
        break;
      case 'pwd':
        setHistory(prev => [...prev, { type: 'output', text: '/' + currentPath.join('/') }]);
        break;
      case 'echo':
        setHistory(prev => [...prev, { type: 'output', text: args.join(' ') }]);
        break;
      case 'ls':
        const dir = getDir(currentPath);
        const files = Object.keys(dir.children).join('  ');
        setHistory(prev => [...prev, { type: 'output', text: files || '(empty directory)' }]);
        break;
      case 'cd':
        if (!args[0] || args[0] === '~') {
          setCurrentPath(['home', 'student']);
        } else if (args[0] === '..') {
          if (currentPath.length > 0) {
            setCurrentPath(prev => prev.slice(0, -1));
          }
        } else if (args[0] === '/') {
          setCurrentPath([]);
        } else {
          const currentDir = getDir(currentPath);
          if (currentDir.children[args[0]] && currentDir.children[args[0]].type === 'dir') {
            setCurrentPath(prev => [...prev, args[0]]);
          } else {
            setHistory(prev => [...prev, { type: 'output', text: `cd: no such directory: ${args[0]}` }]);
          }
        }
        break;
      case 'cat':
        if (!args[0]) {
          setHistory(prev => [...prev, { type: 'output', text: 'usage: cat [file]' }]);
        } else {
          const cDir = getDir(currentPath);
          const file = cDir.children[args[0]];
          if (file && file.type === 'file') {
            setHistory(prev => [...prev, { type: 'output', text: file.content || '' }]);
          } else {
            setHistory(prev => [...prev, { type: 'output', text: `cat: ${args[0]}: No such file` }]);
          }
        }
        break;
      case 'mkdir':
        if (!args[0]) {
          setHistory(prev => [...prev, { type: 'output', text: 'usage: mkdir [directory_name]' }]);
        } else {
          const target = args[0];
          setFs(prev => {
            const newFs = { ...prev };
            let current: any = { children: newFs };
            for (const p of currentPath) {
              current = current.children[p];
            }
            current.children[target] = { name: target, type: 'dir', children: {} };
            return newFs;
          });
        }
        break;
      case '':
        break;
      default:
        setHistory(prev => [...prev, { type: 'output', text: `command not found: ${command}` }]);
    }
  };

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col p-4 md:p-8 gap-6 overflow-hidden">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="text-primary w-6 h-6" />
            Terminal Lab
          </h1>
          <p className="text-xs text-slate-500 font-medium">Safe Linux simulation environment for curriculum practice</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2 text-[10px] font-bold">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            SYSTEM ONLINE
          </div>
          <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 text-[10px] font-bold">
            <Cpu className="w-3.5 h-3.5" />
            VIRTUALIZED
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Terminal Window */}
        <div 
          className="flex-1 bg-[#1a1b1e] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] z-10 opacity-30" />
          
          <div className="bg-[#2c2e33] px-4 py-2 flex items-center gap-2 border-b border-slate-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <div className="flex-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">bash — student@cn-portal — 80x24</div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 p-6 font-mono text-sm overflow-y-auto scrollbar-hide space-y-1 relative z-0"
          >
            {history.map((line, i) => (
              <div key={i} className={`${line.type === 'input' ? 'text-blue-400' : 'text-slate-300'} leading-relaxed whitespace-pre-wrap`}>
                {line.text}
              </div>
            ))}
            
            <div className="flex items-center gap-2 text-blue-400">
              <span className="shrink-0">{currentPath.join('/')} $</span>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCommand(input);
                    setInput('');
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-slate-200 caret-primary"
              />
            </div>
          </div>
        </div>

        {/* Lab Info Sidebar */}
        <div className="hidden lg:flex w-80 flex-col gap-4">
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <HelpCircle className="w-4 h-4 text-primary" />
                 Quick Start Guide
              </h3>
              <div className="space-y-4">
                 <div className="flex gap-3">
                    <div className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 h-fit">ls</div>
                    <p className="text-[11px] text-slate-500 leading-normal">List files in the current folder.</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 h-fit">cd</div>
                    <p className="text-[11px] text-slate-500 leading-normal">Change directory (e.g. cd projects).</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 h-fit">cat</div>
                    <p className="text-[11px] text-slate-500 leading-normal">Read file contents (e.g. cat welcome.txt).</p>
                 </div>
              </div>
           </div>

           <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex-1">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Shield className="w-4 h-4" />
                 Lab Objectives
              </h3>
              <div className="space-y-4">
                 <div className="flex items-start gap-3 opacity-100">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                    <p className="text-xs text-primary/80 font-medium leading-relaxed">Locate the "welcome.txt" file in your home directory.</p>
                 </div>
                 <div className="flex items-start gap-3 opacity-50">
                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-300" />
                    <p className="text-xs text-slate-500 leading-relaxed">Create a new folder named "learning" using mkdir.</p>
                 </div>
                 <div className="flex items-start gap-3 opacity-50">
                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-300" />
                    <p className="text-xs text-slate-500 leading-relaxed">Experiment with the virtual file system.</p>
                 </div>
              </div>
              
              <div className="mt-auto pt-6">
                 <div className="p-4 bg-white/50 backdrop-blur rounded-2xl border border-primary/20">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-bold text-primary">SESSION PROGRESS</span>
                       <span className="text-[10px] font-mono text-primary">33%</span>
                    </div>
                    <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-1/3" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
