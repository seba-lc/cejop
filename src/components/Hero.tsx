"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

const heroWords = [
    { word: "ENTENDÉ", desc: "Cómo funciona realmente el Estado, la política y las instituciones." },
    { word: "CONECTÁ", desc: "Con jóvenes de trayectorias diversas y referentes del sistema público." },
    { word: "PARTICIPÁ", desc: "En espacios de formación, simulaciones y experiencias institucionales." },
    { word: "TRANSFORMÁ", desc: "Tu mirada sobre la realidad política y social de la provincia." },
];

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });
    const videoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
    const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

    const handleScroll = () => {
        const next = document.querySelector("#problema");
        if (next) next.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col overflow-hidden bg-cejop-dark"
            aria-label="Sección principal CEJOP Tucumán"
        >
            {/* Video background */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ opacity: videoOpacity }}
            >
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    aria-hidden="true"
                    onCanPlayThrough={(e) => {
                        // This can be used to signal the parent that video is ready
                        const event = new CustomEvent("video-ready");
                        window.dispatchEvent(event);
                    }}
                >
                    <source
                        src="https://storage.googleapis.com/marketar_bucket/cejop/video_landing.mp4"
                        type="video/mp4"
                    />
                </video>
                {/* Monochrome high-contrast overlay */}
                <div className="absolute inset-0 bg-black/50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col justify-center flex-1 section-container pt-28 pb-32 md:pt-36 md:pb-40"
                style={{ y: textY }}
            >
                {/* Tag */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mb-8"
                >
                    <span className="inline-block font-encode text-xs font-semibold tracking-[0.4em] uppercase text-white/90 border border-white/20 px-4 py-1.5 backdrop-blur-sm bg-white/5">
                        Tucumán · 2025 · Formación Política
                    </span>
                </motion.div>

                {/* Big words stacked */}
                <div className="flex flex-col gap-6 md:gap-10">
                    {heroWords.map((item, i) => (
                        <motion.div
                            key={item.word}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className={`flex flex-col md:flex-row md:items-end gap-2 md:gap-6 ${i % 2 === 0 ? "" : "md:pl-16 lg:pl-32"
                                }`}
                        >
                            <span className="font-montserrat font-black text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] uppercase leading-none tracking-tight text-white drop-shadow-2xl">
                                {item.word}
                            </span>
                            <span className="font-source text-sm md:text-base text-white/70 md:mb-2 max-w-xs leading-relaxed">
                                {item.desc}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 1 }}
                    className="mt-12 flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={() => {
                            const el = document.querySelector("#inscripcion");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="btn-primary-bw text-sm px-8 py-4"
                        aria-label="Inscribite al programa CEJOP Tucumán"
                    >
                        Quiero ser parte
                    </button>
                    <button
                        onClick={() => {
                            const el = document.querySelector("#programa");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="btn-outline-bw text-sm px-8 py-4"
                        aria-label="Conocé el programa de CEJOP"
                    >
                        Conocé el programa
                    </button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    onClick={handleScroll}
                    className="mt-16 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors self-start"
                    aria-label="Desplazarse hacia abajo"
                >
                    <span className="font-encode text-xs tracking-[0.3em] uppercase">Explorá</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </motion.button>
            </motion.div>
        </section>
    );
}
