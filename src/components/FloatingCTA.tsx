"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past the hero (roughly 1 viewport height)
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
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
