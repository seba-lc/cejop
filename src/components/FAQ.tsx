"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "¿Necesito experiencia previa en política?",
        a: "No. El programa está pensado para jóvenes que quieren aprender, no para quienes ya saben todo. Lo que valoramos es la curiosidad, el compromiso y las ganas de entender cómo funcionan las cosas.",
    },
    {
        q: "¿Es un espacio partidario?",
        a: "No. CEJOP Tucumán no tiene afiliación partidaria ni ideológica. La pluralidad es una condición estructural del programa: convocamos jóvenes de distintas trayectorias precisamente porque creemos que aprender con otros que piensan distinto es más enriquecedor.",
    },
    {
        q: "¿Tiene costo?",
        a: "El programa es gratuito. Estamos trabajando para garantizar también la accesibilidad en términos de transporte y materiales para jóvenes del interior de la provincia.",
    },
    {
        q: "¿Quiénes son los referentes y docentes?",
        a: "Convocamos a referentes reales del sistema público: funcionarios del ejecutivo y legislativo, jueces, periodistas, empresarios, dirigentes de organizaciones sociales. No es una lista cerrada: se construye junto con cada edición del programa.",
    },
    {
        q: "¿Cómo es el proceso de selección?",
        a: "Vas a completar un formulario de inscripción con datos básicos y una pregunta de motivación. Seleccionamos perfiles diversos para asegurar la heterogeneidad del grupo. La selección no evalúa conocimiento, sino potencial y compromiso.",
    },
    {
        q: "¿Qué compromiso implica participar?",
        a: "El programa tiene encuentros periódicos durante ocho meses (abril–noviembre). Esperamos una participación activa y continua. La asistencia regular es parte del compromiso que asumís al sumarte.",
    },
    {
        q: "¿Puedo participar si no soy de San Miguel de Tucumán?",
        a: "Sí. El programa tiene vocación federal dentro de la provincia y buscamos representar a jóvenes de distintas localidades de Tucumán. Estamos trabajando en soluciones de accesibilidad para quienes viven fuera de la capital.",
    },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.07 }}
            className="border-b border-gray-200 last:border-none"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start justify-between gap-4 py-6 text-left group"
                aria-expanded={open}
                aria-controls={`faq-answer-${index}`}
            >
                <span className="font-montserrat font-semibold text-base md:text-lg text-cejop-dark group-hover:text-cejop-blue transition-colors duration-200">
                    {q}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 mt-0.5 text-cejop-blue"
                >
                    <ChevronDown size={20} aria-hidden="true" />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={`faq-answer-${index}`}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <p className="font-source text-sm md:text-base text-gray-600 leading-relaxed pb-6 pr-8">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQ() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section
            id="faq"
            ref={ref}
            className="section-pad bg-cejop-bg overflow-hidden"
            aria-labelledby="faq-title"
        >
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
                    {/* Left header */}
                    <div className="lg:col-span-2">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue mb-6 border-l-2 border-cejop-blue pl-3"
                        >
                            Todo lo que querés saber
                        </motion.span>

                        <motion.h2
                            id="faq-title"
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-cejop-dark leading-tight mb-6"
                        >
                            Preguntas frecuentes
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="font-source text-base text-gray-600 leading-relaxed"
                        >
                            ¿Todavía tenés dudas? Escribinos a{" "}
                            <a
                                href="mailto:cejoptucuman@gmail.com"
                                className="text-cejop-blue hover:underline font-medium"
                            >
                                cejoptucuman@gmail.com
                            </a>
                            . Contestamos todos los mensajes.
                        </motion.p>
                    </div>

                    {/* Right: Accordion */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {faqs.map((faq, i) => (
                            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
