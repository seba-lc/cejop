"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Globe, BookOpen, Heart } from "lucide-react";

const values = [
    {
        icon: Users,
        label: "Pluralidad",
        description:
            "No importa de dónde venís ideológicamente. Importa que querés aprender y construir. La diversidad de visiones enriquece la experiencia de todos.",
    },
    {
        icon: Globe,
        label: "Federalismo",
        description:
            "Una formación pensada desde y para Tucumán. Con foco en la realidad provincial, sus instituciones y su gente.",
    },
    {
        icon: BookOpen,
        label: "Formación",
        description:
            "No es información suelta. Es un recorrido estructurado, con profundidad, referentes reales y herramientas concretas para leer la realidad.",
    },
    {
        icon: Heart,
        label: "Comunidad",
        description:
            "El vínculo entre participantes es parte del programa. Una red de jóvenes con perspectivas distintas que se construye desde el primer día.",
    },
];

export default function Solution() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section
            id="programa"
            ref={ref}
            className="section-pad bg-cejop-dark text-white overflow-hidden"
            aria-labelledby="solution-title"
        >
            <div className="section-container">
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3"
                    >
                        La respuesta al vacío
                    </motion.span>

                    <motion.h2
                        id="solution-title"
                        initial={{ opacity: 0, y: 40 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6"
                    >
                        CEJOP Tucumán es el espacio que faltaba.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="font-source text-lg text-white/70 leading-relaxed"
                    >
                        No es una escuela partidaria. No es una ONG subsidiaria de ningún partido. Es una plataforma de formación institucional que te ayuda a leer la política, el Estado, la economía y la sociedad de manera integral. Formación + encuentro + red.
                    </motion.p>
                </div>

                {/* Values grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
                    {values.map((value, i) => {
                        const Icon = value.icon;
                        return (
                            <motion.div
                                key={value.label}
                                initial={{ opacity: 0, y: 40 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                                className="bg-cejop-dark p-8 group hover:bg-cejop-blue transition-colors duration-500"
                            >
                                <div className="mb-6">
                                    <Icon
                                        size={28}
                                        className="text-cejop-blue-light group-hover:text-white transition-colors duration-300"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h3 className="font-montserrat font-bold text-xl mb-3 group-hover:text-white transition-colors">
                                    {value.label}
                                </h3>
                                <p className="font-source text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                                    {value.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
