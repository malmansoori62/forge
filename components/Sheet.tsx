'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Sheet({
  open, onClose, title, children
}: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed z-50 inset-x-0 bottom-0 mx-auto max-w-md bg-forge-coal rounded-t-2xl border-t border-forge-stone max-h-[85vh] flex flex-col safe-bottom"
          >
            <div className="flex items-center justify-between p-4 border-b border-forge-stone">
              <h3 className="text-base font-semibold">{title}</h3>
              <button onClick={onClose} className="p-1 -m-1 text-forge-ash hover:text-forge-bone">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-3">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
