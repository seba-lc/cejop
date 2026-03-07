"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const WORK_OPTIONS = [
    "Solo estudio",
    "Solo trabajo",
    "Estudio y trabajo",
    "Ninguna de las anteriores",
];

export default function CTAForm() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        nombre: "",
        edad: "",
        email: "",
        localidad: "",
        actividad: "",
        motivacion: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section
            id="inscripcion"
            ref={ref}
            className="section-pad relative overflow-hidden bg-white"
            aria-labelledby="cta-title"
        >
            {/* Background accent */}
            <div
                className="absolute inset-0 bg-cejop-blue opacity-[0.03] z-0"
                aria-hidden="true"
            />
            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left: Copy */}
                    <div className="lg:pt-8">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className="inline-block font-encode text-xs font-semibold tracking-[0.3em] uppercase text-cejop-blue mb-6 border-l-2 border-cejop-blue pl-3"
                        >
                            El primer paso
                        </motion.span>

                        <motion.h2
                            id="cta-title"
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-montserrat font-black text-4xl sm:text-5xl md:text-6xl text-cejop-dark leading-tight mb-6"
                        >
                            No necesitás saber todo. Necesitás querer aprender.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="font-source text-lg text-gray-600 leading-relaxed mb-10"
                        >
                            Completá el formulario y empezá el proceso. Revisamos todos los perfiles y te avisamos en breve.
                        </motion.p>

                        {/* Highlights */}
                        <motion.ul
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="space-y-3"
                            aria-label="Características del programa"
                        >
                            {[
                                "Gratuito y sin requisitos de conocimiento previo",
                                "Selección por perfil diverso, no por mérito académico",
                                "Programa anual de abril a noviembre",
                                "Una cohorte limitada de 40 jóvenes",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <CheckCircle
                                        size={18}
                                        className="text-cejop-blue mt-0.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span className="font-source text-sm text-gray-600">{item}</span>
                                </li>
                            ))}
                        </motion.ul>
                    </div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-cejop-dark text-white p-10 flex flex-col items-center text-center"
                            >
                                <CheckCircle size={48} className="text-cejop-blue-light mb-4" />
                                <h3 className="font-montserrat font-black text-2xl mb-3">
                                    ¡Tu inscripción fue recibida!
                                </h3>
                                <p className="font-source text-white/70 text-base leading-relaxed">
                                    Gracias por querer ser parte de CEJOP Tucumán. Revisamos tu perfil y te contactamos a la brevedad.
                                </p>
                            </motion.div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-cejop-dark text-white p-8 md:p-10 space-y-5"
                                aria-label="Formulario de inscripción CEJOP Tucumán"
                                noValidate
                            >
                                <h3 className="font-montserrat font-bold text-xl mb-2">
                                    Inscribirme al programa
                                </h3>

                                {/* Nombre */}
                                <div>
                                    <label
                                        htmlFor="nombre"
                                        className="block font-encode text-xs tracking-widest uppercase text-white/50 mb-2"
                                    >
                                        Nombre completo *
                                    </label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        required
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Tu nombre y apellido"
                                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 font-source text-sm focus:outline-none focus:border-cejop-blue-light transition-colors"
                                    />
                                </div>

                                {/* Edad + Localidad */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="edad"
                                            className="block font-encode text-xs tracking-widest uppercase text-white/50 mb-2"
                                        >
                                            Edad *
                                        </label>
                                        <input
                                            id="edad"
                                            name="edad"
                                            type="number"
                                            min={18}
                                            max={30}
                                            required
                                            value={form.edad}
                                            onChange={handleChange}
                                            placeholder="18–30"
                                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 font-source text-sm focus:outline-none focus:border-cejop-blue-light transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="localidad"
                                            className="block font-encode text-xs tracking-widest uppercase text-white/50 mb-2"
                                        >
                                            Localidad *
                                        </label>
                                        <input
                                            id="localidad"
                                            name="localidad"
                                            type="text"
                                            required
                                            value={form.localidad}
                                            onChange={handleChange}
                                            placeholder="Ciudad o municipio"
                                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 font-source text-sm focus:outline-none focus:border-cejop-blue-light transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block font-encode text-xs tracking-widest uppercase text-white/50 mb-2"
                                    >
                                        Email *
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="tu@email.com"
                                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 font-source text-sm focus:outline-none focus:border-cejop-blue-light transition-colors"
                                    />
                                </div>

                                {/* Actividad */}
                                <div>
                                    <label
                                        htmlFor="actividad"
                                        className="block font-encode text-xs tracking-widest uppercase text-white/50 mb-2"
                                    >
                                        ¿Estudiás o trabajás? *
                                    </label>
                                    <select
                                        id="actividad"
                                        name="actividad"
                                        required
                                        value={form.actividad}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 font-source text-sm focus:outline-none focus:border-cejop-blue-light transition-colors appearance-none"
                                    >
                                        <option value="" disabled className="text-cejop-dark">
                                            Seleccioná una opción
                                        </option>
                                        {WORK_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt} className="text-cejop-dark">
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Motivación */}
                                <div>
                                    <label
                                        htmlFor="motivacion"
                                        className="block font-encode text-xs tracking-widest uppercase text-white/50 mb-2"
                                    >
                                        ¿Por qué querés participar?
                                    </label>
                                    <textarea
                                        id="motivacion"
                                        name="motivacion"
                                        rows={3}
                                        value={form.motivacion}
                                        onChange={handleChange}
                                        placeholder="Contanos brevemente..."
                                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 font-source text-sm focus:outline-none focus:border-cejop-blue-light transition-colors resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-3 bg-cejop-blue hover:bg-cejop-blue-variant text-white font-montserrat font-bold text-sm tracking-wide py-4 transition-colors duration-300 group"
                                    aria-label="Enviar formulario de inscripción"
                                >
                                    Quiero ser parte
                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </button>

                                <p className="font-source text-xs text-white/30 leading-relaxed text-center pt-1">
                                    La inscripción no garantiza el ingreso. Seleccionamos perfiles diversos para enriquecer la experiencia de todos.
                                </p>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
