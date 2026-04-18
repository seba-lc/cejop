"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trackScrollSection } from "@/lib/analytics";

export default function CTAForm() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => { if (inView) trackScrollSection("cta-final"); }, [inView]);

  return (
    <section
      id="inscripcion"
      ref={ref}
      className="section-pad relative overflow-hidden bg-cejop-dark text-white"
      aria-labelledby="cta-title"
    >
      <div className="section-container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            id="cta-title"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-montserrat font-black text-4xl sm:text-5xl md:text-6xl leading-tight mb-6"
          >
            No necesitás saber todo. Necesitás querer aprender.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-source text-lg text-white/70 leading-relaxed mb-4"
          >
            El programa es gratuito y no requiere conocimiento previo.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-source text-sm text-white/40 leading-relaxed mb-10"
          >
            Completá la encuesta y participá del primer encuentro CEJOP
            Tucumán. La inscripción es para la primera charla — para las
            siguientes hay que anotarse de nuevo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <a
              href="/encuestas_ev1"
              className="inline-flex items-center justify-center gap-3 bg-white text-cejop-dark font-montserrat font-bold text-sm tracking-wide px-10 py-4 transition-all duration-300 group hover:shadow-lg hover:shadow-white/15 hover:translate-y-[-2px]"
              aria-label="Inscribite en la primera charla de CEJOP Tucumán"
            >
              Inscribite en la primera charla
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
