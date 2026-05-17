import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  Users, 
  Layers, 
  Cpu,
  Briefcase,
  Map,
  Clock,
  Terminal,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const roleRates = [
    {
      role: 'DevOps Engineer',
      india: '₹1,500 - ₹5,000',
      us: '$80 - $150',
      icon: Cpu,
      color: 'blue'
    },
    {
      role: 'DevSecOps Engineer',
      india: '₹2,000 - ₹6,000',
      us: '$100 - $180',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      role: 'SRE Specialist',
      india: '₹2,000 - ₹7,000',
      us: '$110 - $200',
      icon: Zap,
      color: 'amber'
    },
    {
      role: 'Platform Engineer',
      india: '₹2,500 - ₹8,000',
      us: '$120 - $220',
      icon: Layers,
      color: 'indigo'
    }
  ];

  const roadmapSteps = [
    { step: '01', title: 'Linux & Fundamentals', desc: 'Master the command line and core networking.' },
    { step: '02', title: 'Docker & Containers', desc: 'Containerize and orchestrate with industry standards.' },
    { step: '03', title: 'Kubernetes Mastery', desc: 'Ship production-ready clusters at scale.' },
    { step: '04', title: 'Infrastructure as Code', desc: 'Terraform and Ansible for absolute automation.' },
    { step: '05', title: 'CI/CD Pipelines', desc: 'Build zero-downtime deployment workflows.' },
    { step: '06', title: 'Monitoring & SRE', desc: 'Prometheus, Grafana, and reliability patterns.' }
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 font-sans selection:bg-primary/20">
      {/* Dynamic Header - Simplified for Splash feel */}
      <nav className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-primary uppercase">CloudNative</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/job-support" className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Job Support</Link>
            <Link to="/login" className="bg-primary text-white px-8 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero: Split Layout (Facebook style login/brand separation feel) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="text-left lg:pr-20">
          <h1 className="text-primary font-black text-5xl md:text-6xl tracking-tight mb-6">
            CloudNative
          </h1>
          <p className="text-slate-800 dark:text-slate-200 text-2xl md:text-[28px] font-medium leading-tight max-w-xl">
             The ultimate platform for modern engineers. Master <span className="text-primary">DevOps</span>, <span className="text-primary">SRE</span>, and <span className="text-primary">Platform Engineering</span> with batte-tested SME guidance.
          </p>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 max-w-[400px] mx-auto lg:ml-auto"
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <input 
                type="text" 
                placeholder="Email address or phone number" 
                className="w-full h-[52px] px-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
               />
               <input 
                type="password" 
                placeholder="Password" 
                className="w-full h-[52px] px-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
               />
               <Link 
                to="/login"
                className="w-full h-[48px] bg-primary text-white rounded-md font-black text-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
               >
                 Log In
               </Link>
               <div className="text-center">
                  <a href="#" className="text-primary text-sm hover:underline">Forgotten password?</a>
               </div>
               <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-6" />
               <div className="text-center pt-2">
                  <Link 
                    to="/login"
                    className="inline-flex items-center h-[48px] px-8 bg-[#42b72a] text-white rounded-md font-bold text-lg hover:bg-[#36a420] transition-colors"
                  >
                    Create new account
                  </Link>
               </div>
            </form>
          </motion.div>
          <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-bold">Create a Page</span> for a celebrity, brand or business.
          </p>
        </div>
      </section>

      {/* Role Rates Section (PUBLIC) */}
      <section id="rates" className="py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
             Global <span className="text-primary">Market Rates</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">What top SMEs earn per hour in 2024</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {roleRates.map((role, i) => (
             <motion.div
               key={role.role}
               whileHover={{ y: -10 }}
               className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group"
             >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner",
                  role.color === 'blue' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" :
                  role.color === 'emerald' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" :
                  role.color === 'amber' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20" :
                  "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20"
                )}>
                   <role.icon className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">{role.role}</h4>
                
                <div className="space-y-4">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">INDIA (HR)</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{role.india}</p>
                   </div>
                   <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">US (HR)</p>
                      <p className="text-xl font-black text-primary">{role.us}</p>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Roadmap Section (PUBLIC) */}
      <section id="roadmap" className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                The <span className="text-primary italic">CloudNative</span> Roadmap.
              </h2>
              <p className="text-slate-500 font-medium max-w-xl">From core Linux fundamentals to site reliability engineering. Our curriculum covers every pillar required to hit 200k+ compensation.</p>
            </div>
            <div className="hidden md:block">
              <Link to="/login" className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs group">
                 Jump to Step 01
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
            {roadmapSteps.map((step, i) => (
              <div key={step.step} className="group relative">
                <div className="flex items-start gap-6">
                   <div className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors uppercase leading-none select-none">
                      {step.step}
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter group-hover:text-primary transition-colors">{step.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{step.desc}</p>
                   </div>
                </div>
                {i < roadmapSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-6 top-8 text-slate-200 dark:text-slate-800">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Support Callout (PUBLIC) */}
      <section className="py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                 <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    <Terminal className="w-12 h-12 text-primary opacity-50" />
                 </div>
                 <div className="aspect-square bg-primary rounded-[2.5rem] flex items-center justify-center text-white scale-110 shadow-2xl shadow-primary/40 relative z-10">
                    <Briefcase className="w-14 h-14" />
                 </div>
                 <div className="aspect-square bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/10 mt-4">
                    <Users className="w-12 h-12 text-white opacity-30" />
                 </div>
                 <div className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-slate-200 dark:border-slate-800 mt-4">
                    <Globe className="w-12 h-12 text-emerald-500 opacity-50" />
                 </div>
              </div>
           </div>
           <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 mb-6 font-black uppercase tracking-widest text-[10px]">
                 Enterprise Support
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-tight">
                Get <span className="text-primary italic">Live SME Support</span> For Your Role.
              </h2>
              <p className="text-slate-500 font-medium mb-10 text-lg leading-relaxed">
                Stuck on a production issue? Need help with complex Terraform modules or Kubernetes debugging? Our SMEs provide 1:1 job support to ensure your project delivery never stalls.
              </p>
              <Link to="/job-support" className="inline-flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                 View Support Plans
                 <ChevronRight className="w-5 h-5" />
              </Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                 <ShieldCheck className="text-white w-6 h-6" />
               </div>
               <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase">CloudNative</span>
            </div>
            
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <Link to="/job-support" className="hover:text-primary transition-colors text-center">Job Support</Link>
               <Link to="/login" className="hover:text-primary transition-colors text-center">Curriculum</Link>
               <a href="#" className="hover:text-primary transition-colors text-center">Privacy</a>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">&copy; 2024 CloudNative. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
};
