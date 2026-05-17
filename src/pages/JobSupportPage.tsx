import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Clock, Calendar, Layout, ChevronRight, Phone, MessageCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

import { Link } from 'react-router-dom';

export const JobSupportPage: React.FC = () => {
  const plans = [
    {
      title: 'Understanding the Architecture',
      price: 'Custom Session',
      description: 'Deep dive into your project infrastructure and design patterns.',
      features: [
        'Architecture reviews',
        'Design pattern guidance',
        'Scalability consultation',
        'Security best practices'
      ],
      icon: Layout,
      color: 'blue'
    },
    {
      title: 'Pay per Week',
      price: 'Weekly Commitment',
      description: 'Dedicated support for your ongoing project deliverables.',
      features: [
        'Daily task assistance',
        'Code debugging',
        'Environment automation',
        'Deployment support'
      ],
      icon: Calendar,
      color: 'emerald',
      popular: true
    },
    {
      title: 'Monthly Plan',
      price: 'Career Success',
      description: 'Full-spectrum support for long-term growth and stability.',
      features: [
        'Unlimited task support',
        'Career mentorship',
        'Priority availability',
        'Monthly review sessions'
      ],
      icon: Briefcase,
      color: 'primary'
    }
  ];

  const handleRequestCallback = () => {
    window.open('https://forms.gle/vP8j5mR6vY7n9w2s8', '_blank'); // Placeholder Google Form URL
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Public Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tighter text-primary uppercase">CloudNative</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/login" className="bg-primary text-white ml-4 px-8 py-3 rounded-xl hover:shadow-xl hover:shadow-primary/20 transition-all text-center">Login / Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 pt-40 pb-32 px-4 md:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Verified SME Support</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6"
          >
            Job <span className="text-primary">Support</span> Plans
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium"
          >
            Choose the right level of support for your current role and project complexity.
          </motion.p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                "relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border shadow-2xl transition-all group",
                plan.popular ? "border-primary ring-4 ring-primary/10" : "border-slate-100 dark:border-slate-800"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  Recommended
                </div>
              )}

              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110",
                plan.color === 'blue' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" :
                plan.color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                "bg-primary/10 text-primary"
              )}>
                <plan.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{plan.title}</h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6">{plan.price}</p>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-10 leading-relaxed">
                {plan.description}
              </p>

              <div className="space-y-4 mb-10">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleRequestCallback}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                  plan.popular 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-blue-700" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                Choose and Request Callback
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Sections */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-32 space-y-32">
        {/* Call to Action */}
        <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/40">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
           </div>
           
           <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-8 max-w-2xl mx-auto">
             Ready to accelerate your delivery?
           </h2>
           <p className="text-blue-100 text-base mb-12 font-medium">
             Our SMEs are standing by to help you conquer your complex project challenges.
           </p>

           <div className="flex flex-col md:flex-row gap-4 justify-center">
             <button 
              onClick={handleRequestCallback}
              className="bg-white text-primary px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                Get Started
                <ArrowRight className="w-4 h-4" />
             </button>
             <button 
              onClick={handleRequestCallback}
              className="bg-blue-600 text-white border border-white/20 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
             >
                <Phone className="w-4 h-4" />
                Request Callback
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
