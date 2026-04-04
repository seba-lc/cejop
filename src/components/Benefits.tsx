"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const benefits = [
  {
    number: "01",
    title: "Entendé cómo funciona el Estado desde adentro",
    description:
      "Módulos con referentes reales del sistema público: funcionarios, legisladores, jueces, periodistas, empresarios.",
  },
  {
    number: "02",
    title: "Conocé cara a cara a quienes toman las decisiones",
    description:
      "Conectate con actores estratégicos de la provincia y construí vínculos que van más allá del programa.",
  },
  {
    number: "03",
    title: "Debatí, simulá y analizá casos reales",
    description:
      "Simulaciones, visitas institucionales y casos reales. No solo escuchás: hacés, debatís y analizás.",
  },
  {
    number: "04",
    title: "Encontrate con jóvenes que piensan distinto",
    description:
      "Universitarios, militantes, independientes, organizaciones sociales. La diversidad es parte del programa.",
  },
  {
    number: "05",
    title: "Formá tu propia mirada, sin dogmas",
    description:
      "Herramientas para analizar la realidad política y social desde múltiples perspectivas.",
  },
  {
    number: "06",
    title: "Conectate con una red que va más allá de Tucumán",
    description:
      "Formá parte de una red con proyección nacional que se conecta con experiencias similares en otras provincias.",
  },
];

export default function Benefits() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="beneficios"
      ref={ref}
      className="section-pad bg-cejop-bg overflow-hidden"
      aria-labelledby="benefits-title"
    >
      <div className="section-container">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue mb-6 border-l-2 border-cejop-blue pl-3"
          >
            Por qué sumarte
          </motion.span>
          <motion.h2
            id="benefits-title"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-cejop-dark max-w-2xl"
          >
            Con qué vas a contar.
          </motion.h2>
        </div>

        {/* Benefits list */}
        <div className="space-y-0">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.number}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
              className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 py-8 border-t border-cejop-blue/15 hover:border-cejop-blue transition-colors duration-300"
            >
              {/* Number */}
              <span className="font-montserrat font-black text-4xl text-cejop-blue/30 group-hover:text-cejop-blue transition-colors duration-300 w-14 shrink-0 leading-none">
                {benefit.number}
              </span>

              {/* Title */}
              <h3 className="font-montserrat font-bold text-xl sm:text-2xl md:text-3xl text-cejop-blue group-hover:text-cejop-dark transition-colors duration-300 flex-1 leading-snug uppercase">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="font-source text-sm text-gray-500 max-w-xs md:max-w-sm leading-relaxed md:text-right">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
