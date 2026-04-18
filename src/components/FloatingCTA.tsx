"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolledPastHero =
        window.scrollY > window.innerHeight * 0.8;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 80;

      // Se muestra si pasó el hero y no llegó al fondo.
      // Al volver a scrollear arriba, reaparece.
      setVisible(scrolledPastHero && !atBottom);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden pb-[max(env(safe-area-inset-bottom),12px)]"
        >
          <a
            href="/encuesta"
            className="block w-full py-3.5 bg-cejop-blue text-white font-montserrat font-bold text-sm tracking-wide text-center shadow-lg shadow-cejop-blue/30 active:scale-[0.98] transition-transform"
            aria-label="Inscribite en la primera charla de CEJOP Tucumán"
          >
            Inscribite en la primera charla
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
