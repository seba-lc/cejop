"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote } from "lucide-react";

const stats = [
    { num: "+10", label: "módulos temáticos" },
    { num: "+30", label: "referentes involucrados" },
    { num: "40", label: "jóvenes por cohorte" },
    { num: "8", label: "meses de formación" },
];

const allies = [
    "Universidad Nacional de Tucumán",
    "Poder Legislativo Tucumán",
    "Municipios del NOA",
    "Organizaciones de la Sociedad Civil",
    "Medios de Comunicación Regional",
    "Sector Empresarial Tucumán",
];

export default function SocialProof() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

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

                {/* Two-column asymmetric layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
                    {/* Stats — 2 col */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <p className="font-source text-white/70 text-base leading-relaxed mb-10">
                            CEJOP Tucumán retoma una experiencia desarrollada en Buenos Aires y la adapta al territorio provincial, con foco en las instituciones y actores de la región NOA. No partimos de cero: aprendemos de una trayectoria real.
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
                                    <p className="font-source text-xs text-white/50 leading-snug">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Allies + testimonials — 3 col */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="lg:col-span-3 flex flex-col gap-10"
                    >
                        {/* Allies */}
                        <div>
                            <h3 className="font-encode font-semibold text-xs tracking-widest uppercase text-white/40 mb-5">
                                Instituciones e interlocutores convocados
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {allies.map((ally, i) => (
                                    <motion.div
                                        key={ally}
                                        initial={{ opacity: 0 }}
                                        animate={inView ? { opacity: 1 } : {}}
                                        transition={{ delay: 0.4 + i * 0.08 }}
                                        className="border border-white/10 px-3 py-4 flex items-center justify-center text-center hover:border-cejop-blue transition-colors duration-300"
                                    >
                                        <span className="font-source text-xs text-white/50 leading-snug">{ally}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonial placeholder */}
                        <div className="border border-white/10 p-6 relative">
                            <Quote
                                size={32}
                                className="text-cejop-blue mb-4 opacity-60"
                                aria-hidden="true"
                            />
                            <p className="font-source text-white/40 italic text-base leading-relaxed mb-6">
                                Próximamente: testimonios de lxs participantes de la primera cohorte de CEJOP Tucumán.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10" />
                                <div>
                                    <p className="font-montserrat font-semibold text-white/30 text-sm">
                                        Nombre, apellido
                                    </p>
                                    <p className="font-source text-xs text-white/20">Universidad · Ciudad</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
