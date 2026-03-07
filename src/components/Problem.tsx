"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import Image from "next/image";

export default function Problem() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

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
                            La distancia no es apatía. Es la ausencia de espacios serios donde formarse, preguntar y conectar con quienes toman decisiones reales.
                        </motion.p>

                        <motion.p
                            custom={3}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            className="font-source text-lg text-gray-600 leading-relaxed mb-10"
                        >
                            En el interior del país, esa brecha se profundiza. Los circuitos de formación política no llegan, las redes no se construyen, y la distancia entre la juventud y la gestión pública se ensancha.
                        </motion.p>

                        {/* Highlights */}
                        <motion.div
                            custom={4}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                { num: "18–30", label: "años, la generación más alejada de los centros de decisión" },
                                { num: "Tucumán", label: "provincia con escasa oferta de formación política seria y plural" },
                            ].map((item) => (
                                <div
                                    key={item.num}
                                    className="border-t-2 border-cejop-blue pt-4"
                                >
                                    <p className="font-montserrat font-black text-2xl text-cejop-blue mb-1">
                                        {item.num}
                                    </p>
                                    <p className="font-source text-xs text-gray-500 leading-snug">{item.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Image side — intentionally offset */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                        className="relative lg:mt-16"
                    >
                        <div className="relative aspect-[4/5] w-full max-w-md lg:max-w-none">
                            <Image
                                src="https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg"
                                alt="Grupo diverso de jóvenes trabajando juntos en un espacio colaborativo"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 90vw, 45vw"
                                priority
                            />
                            {/* Accent block */}
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cejop-blue z-10 flex items-center justify-center">
                                <p className="font-montserrat font-black text-white text-center text-xs leading-snug px-3">
                                    LA BRECHA<br />EXISTE
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
