"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { trackScrollSection } from "@/lib/analytics";
import imgGrupo from "@/assets/social-grupo-dialogo.jpg";
import imgMarra from "@/assets/social-marra-clase.jpg";
import imgPresentacion from "@/assets/social-presentacion-cejop.jpg";

const stats = [
  { num: "+100", label: "jóvenes formados en BA" },
  { num: "+30", label: "referentes convocados" },
  { num: "9", label: "meses de programa" },
  { num: "2026", label: "primera edición Tucumán" },
];

const photos = [
  { src: imgGrupo, alt: "Jóvenes dialogando con referentes políticos en CEJOP Buenos Aires", aspect: "aspect-[4/3]" },
  { src: imgMarra, alt: "Ramiro Marra en clase de Poder Legislativo — CEJOP", aspect: "aspect-[4/5]" },
  { src: imgPresentacion, alt: "Presentación en encuentro CEJOP con banner institucional", aspect: "aspect-[4/3]" },
];

export default function SocialProof() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => { if (inView) trackScrollSection("social-proof"); }, [inView]);

  return (
    <section
      id="legitimidad"
      ref={ref}
      className="section-pad bg-cejop-dark text-white overflow-hidden"
      aria-labelledby="social-proof-title"
    >
      <div className="section-container">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3"
          >
            Quiénes estamos detrás
          </motion.span>

          <motion.h2
            id="social-proof-title"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl"
          >
            Una experiencia con respaldo real y proyección federal.
          </motion.h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Left: Copy + stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="font-source text-white/70 text-base leading-relaxed mb-10">
              CEJOP Tucumán nace a partir de una experiencia desarrollada en
              Buenos Aires que reunió a jóvenes con referentes de la política,
              la gestión pública, el periodismo y el sector productivo. Hoy ese
              modelo se adapta al territorio provincial, conectando a Tucumán
              con una red más amplia de formación y debate político.
            </p>

            <div className="grid grid-cols-2 gap-px bg-white/10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.num}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="bg-cejop-dark p-6"
                >
                  <p className="font-montserrat font-black text-3xl md:text-4xl text-cejop-blue-light mb-1">
                    {stat.num}
                  </p>
                  <p className="font-source text-xs text-white/50 leading-snug">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Photo grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 gap-2"
          >
            {/* Main photo — spans full width */}
            <div className="col-span-2 relative aspect-[16/9] overflow-hidden">
              <Image
                src={photos[0].src}
                alt={photos[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
            {/* Two smaller photos */}
            {photos.slice(1).map((photo, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
