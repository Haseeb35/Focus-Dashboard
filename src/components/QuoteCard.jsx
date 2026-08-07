import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsQuote } from 'react-icons/bs';
import { getRandomQuote } from '../data/quotes';

export default function QuoteCard() {
  const [quote, setQuote] = useState(() => getRandomQuote());

  const newQuote = () => {
    setQuote(null);
    setTimeout(() => setQuote(getRandomQuote()), 150);
  };

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 text-center h-full relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgb(var(--accent)/0.5), transparent 60%)' }}
      />
      <div className="text-3xl floaty">
        <BsQuote className="inline text-[rgb(var(--accent))]" aria-hidden="true" />
      </div>
      <AnimatePresence mode="wait">
        {quote ? (
          <motion.div
            key={quote.text}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="space-y-2 px-2"
          >
            <blockquote className="text-lg font-medium leading-relaxed gradient-text">“{quote.text}”</blockquote>
            <footer className="text-sm text-[rgb(var(--text-secondary))]">— {quote.author}</footer>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button
        onClick={newQuote}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        className="btn btn-ghost mt-1 text-sm"
        aria-label="New quote"
      >
        ✨ New Quote
      </motion.button>
    </div>
  );
}