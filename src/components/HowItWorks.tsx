"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const steps = [
    {
        month: "Abr",
        title: "Selección e inicio",
        description: "Proceso de selección de la cohorte. Equipos de perfiles diversos. Encuentro inaugural.",
    },
    {
        month: "May–Jun",
        title: "Módulos del Estado",
        description: "Política municipal y provincial. Gestión del Estado. Poder ejecutivo. Administración pública.",
    },
    {
        month: "Jul–Ago",
        title: "Instituciones y poderes",
        description: "Poder Legislativo y Judicial. Economía. Urbanismo y territorio. Periodismo y comunicación política.",
    },
    {
        month: "Sep–Oct",
        title: "Sociedad y producción",
        description: "Sector productivo. Organizaciones sociales. Politica social. Experiencias institucionales de campo.",
    },
    {
        month: "Nov",
        title: "Cierre y proyección",
        description: "Simulaciones finales. Presentación de propuestas. Encuentro de egresados y red federal.",
    },
];

export default function HowItWorks() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

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
                            La Escuela CEJOP
                        </motion.span>

                        <motion.h2
                            id="how-title"
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-cejop-dark leading-tight mb-4"
                        >
                            Un año de formación. Experiencia real.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="font-source text-base text-gray-600 leading-relaxed mb-12"
                        >
                            Programa anual (abril–noviembre) con una cohorte limitada de jóvenes. No es solo charlas: es una experiencia formativa que mezcla profundidad, práctica y comunidad.
                        </motion.p>

                        {/* Timeline */}
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true" />

                            <div className="space-y-8">
                                {steps.map((step, i) => (
                                    <motion.div
                                        key={step.month}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={inView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                                        className="flex gap-6 relative"
                                    >
                                        {/* Dot */}
                                        <div className="relative z-10 shrink-0">
                                            <div className="w-10 h-10 bg-cejop-blue flex items-center justify-center">
                                                <span className="font-montserrat font-bold text-white text-xs leading-tight text-center px-0.5">
                                                    {step.month}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="pt-1 pb-4">
                                            <h3 className="font-montserrat font-bold text-base text-cejop-dark mb-1">
                                                {step.title}
                                            </h3>
                                            <p className="font-source text-sm text-gray-500 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
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
                                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
                                alt="Jóvenes participando en un workshop de formación política"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 90vw, 45vw"
                            />
                            {/* Overlay callout */}
                            <div className="absolute bottom-0 left-0 right-0 bg-cejop-dark/90 p-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    {[
                                        { num: "+10", label: "módulos\ntemáticos" },
                                        { num: "+30", label: "referentes\nconvocados" },
                                        { num: "40", label: "jóvenes por\ncohorte" },
                                    ].map((stat) => (
                                        <div key={stat.num} className="flex flex-col">
                                            <span className="font-montserrat font-black text-2xl sm:text-3xl text-cejop-blue-light">
                                                {stat.num}
                                            </span>
                                            <span className="font-source text-xs text-white/60 leading-snug mt-1 whitespace-pre-line">
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
