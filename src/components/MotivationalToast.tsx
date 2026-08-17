import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "¡Sigue así! Cada pequeño paso cuenta.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No te detengas hasta que te sientas orgulloso.",
  "Tu futuro yo te agradecerá por no haberte rendido hoy.",
  "La constancia es la clave del éxito. ¡Tú puedes!",
  "Cree en ti mismo y en todo lo que eres.",
  "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.",
  "No cuentes los días, haz que los días cuenten.",
  "La disciplina es el puente entre las metas y los logros.",
  "Un hábito a la vez, transformando tu vida."
];

interface Props {
  externalQuote?: { text: string; author: string } | null;
}

export const MotivationalToast: React.FC<Props> = ({ externalQuote }) => {
  const [quote, setQuote] = useState<{ text: string, author?: string } | null>(null);

  useEffect(() => {
    // Si tenemos una quote externa, la mostramos inmediatamente (1 vez por sesión)
    if (externalQuote) {
      setTimeout(() => {
        setQuote(externalQuote);
        setTimeout(() => setQuote(null), 10000); // Ocultar después de 10s
      }, 1000);
    }

    // Show a local motivational quote every 2 minutes (120000 ms)
    const intervalId = setInterval(() => {
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote({ text: randomQuote });

      // Hide it automatically after 8 seconds
      setTimeout(() => {
        setQuote((currentQuote) => currentQuote?.text === randomQuote ? null : currentQuote);
      }, 8000);
    }, 120000);

    return () => clearInterval(intervalId);
  }, [externalQuote]);

  return (
    <AnimatePresence>
      {quote && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          className="fixed top-6 right-6 z-[100] bg-white border border-rose-200 text-stone-800 p-4 pr-12 rounded-2xl shadow-xl font-outfit max-w-sm flex items-start gap-3"
        >
          <div className="bg-rose-50 text-rose-500 p-2 rounded-full shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm mb-0.5">Mensaje para ti</p>
            <p className="text-stone-500 text-sm leading-relaxed italic">"{quote.text}"</p>
            {quote.author && <p className="text-stone-400 text-xs mt-1 text-right">— {quote.author}</p>}
          </div>
          <button 
            onClick={() => setQuote(null)}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
