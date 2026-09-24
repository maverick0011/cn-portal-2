import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-[2rem] p-6 shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 'bg-primary/5 text-primary'} border ${isDestructive ? 'border-red-100 dark:border-red-900/30' : 'border-primary/10'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors border border-slate-200/50 dark:border-slate-700/50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10' 
                  : 'bg-primary hover:bg-blue-700 shadow-primary/10'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
