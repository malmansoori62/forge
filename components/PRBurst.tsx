'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function PRBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-forge-lime/10 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 30 }} animate={{ y: 0 }}
            className="relative bg-forge-lime text-forge-ink rounded-2xl px-8 py-6 shadow-2xl text-center"
          >
            <Trophy className="w-12 h-12 mx-auto fill-forge-ink" />
            <div className="text-2xl font-black mt-2 tracking-tight">NEW PR!</div>
            <div className="text-sm font-semibold opacity-80">You just beat your best</div>
          </motion.div>
          {/* simple confetti */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-forge-lime"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: -100 - Math.random() * 200,
                opacity: 0
              }}
              transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut' }}
              style={{ left: '50%', top: '50%' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
