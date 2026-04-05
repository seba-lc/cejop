"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { trackScrollSection } from "@/lib/analytics";
import Image from "next/image";

export default function Problem() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    useEffect(() => { if (inView) trackScrollSection("problema"); }, [inView]);

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.15, duration: 0.7 },
        }),
    };

    return (
        <section
            id="problema"
            ref={ref}
            className="section-pad bg-white overflow-hidden"
            aria-labelledby="problema-title"
        >
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Text side */}
                    <div className="lg:pr-8">
                        <motion.span
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue mb-6 border-l-2 border-cejop-blue pl-3"
                        >
                            El problema que nos convoca
                        </motion.span>

                        <motion.h2
                            id="problema-title"
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-cejop-dark leading-tight mb-6"
                        >
                            Hay una brecha entre los jóvenes y los espacios donde se toman las decisiones.
                        </motion.h2>

                        <motion.p
                            custom={2}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            className="font-source text-lg text-gray-600 leading-relaxed mb-6"
                        >
                            La distancia no es apatía. Es la ausencia de espacios reales donde preguntar y conectar con quienes toman decisiones.
                        </motion.p>

                        <motion.div
                            custom={3}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            className="space-y-6 mb-10"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cejop-blue shrink-0" />
                                <p className="font-source text-lg text-gray-600 leading-relaxed">
                                    <span className="font-bold text-cejop-dark">18–30:</span> la generación más alejada de los centros de decisión.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cejop-blue shrink-0" />
                                <p className="font-source text-lg text-gray-600 leading-relaxed">
                                    <span className="font-bold text-cejop-dark">Pluralidad:</span> la política necesita más voces, más trayectorias y más debate.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image side — intentionally offset */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                        className="relative lg:mt-16"
                    >
                        <div className="relative aspect-[4/3] w-full max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://storage.googleapis.com/marketar_bucket/cejop/seccion2.jpeg"
                                alt="Formación y debate político"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 90vw, 45vw"
                                priority
                            />
                            {/* Accent overlay bubble */}
                            <div className="absolute top-6 right-6 bg-cejop-dark/80 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 z-10">
                                <p className="font-montserrat font-black text-white text-sm tracking-widest uppercase">
                                    CONECTÁ <span className="text-cejop-blue-light">AHORA</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
