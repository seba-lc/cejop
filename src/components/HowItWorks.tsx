"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { trackScrollSection } from "@/lib/analytics";
import timelineImg from "@/assets/timeline-mesa-cejop.png";

const steps = [
  { month: "Abr", title: "Territorio desde los municipios" },
  { month: "May", title: "La cocina del poder: Ministerio del Interior" },
  { month: "Jun", title: "Economía" },
  { month: "Jul", title: "Poder judicial" },
  { month: "Ago", title: "Poder legislativo" },
  { month: "Sep", title: "Urbanización y política social" },
  { month: "Oct", title: "Medios y opinión pública" },
  { month: "Nov", title: "Juventudes y trabajo" },
  { month: "Dic", title: "Empresas y producción" },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => { if (inView) trackScrollSection("como-funciona"); }, [inView]);

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="section-pad bg-white overflow-hidden"
      aria-labelledby="how-title"
    >
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Header + timeline */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue mb-6 border-l-2 border-cejop-blue pl-3"
            >
              El Programa
            </motion.span>

            <motion.h2
              id="how-title"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-cejop-dark leading-tight mb-4"
            >
              Formación política desde y para Tucumán.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-source text-base text-gray-600 leading-relaxed mb-12"
            >
              Programa anual (abril–diciembre). No es solo charlas: es una
              experiencia formativa que mezcla profundidad, práctica y
              comunidad.
            </motion.p>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-5 top-0 bottom-0 w-px bg-gray-200"
                aria-hidden="true"
              />

              <div className="space-y-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.month}
                    initial={{ opacity: 0, x: -30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                    className="flex gap-5 relative"
                  >
                    {/* Dot */}
                    <div className="relative z-10 shrink-0">
                      <div className="w-10 h-10 bg-cejop-blue flex items-center justify-center">
                        <span className="font-montserrat font-bold text-white text-[10px] leading-tight text-center">
                          {step.month}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-2">
                      <h3 className="font-montserrat font-bold text-sm text-cejop-dark">
                        {step.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="font-source text-xs text-gray-400 mt-8 italic">
              El cronograma es orientativo. El orden de los encuentros y las
              fechas pueden ajustarse según la dinámica del programa y la
              disponibilidad de los expositores.
            </p>
          </div>

          {/* Right: Image + callout */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:max-w-none">
              <Image
                src={timelineImg}
                alt="Mesa de trabajo — formación política CEJOP"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
