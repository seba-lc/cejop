"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
    { label: "El Programa", href: "#programa" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleLink = (href: string) => {
        setMenuOpen(false);
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                        ? "bg-cejop-dark/95 backdrop-blur-md shadow-xl shadow-black/20"
                        : "bg-transparent"
                    }`}
            >
                <div className="section-container">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <a
                            href="#"
                            className="flex items-center gap-3 group"
                            aria-label="CEJOP Tucumán - Inicio"
                        >
                            <div className="w-9 h-9 bg-cejop-blue flex items-center justify-center transition-transform group-hover:scale-105">
                                <span className="font-montserrat font-black text-white text-xs leading-none tracking-tighter">
                                    CEJ
                                    <br />
                                    OP
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <span className="font-montserrat font-bold text-white text-lg leading-tight tracking-tight">
                                    CEJOP
                                </span>
                                <span className="block font-encode text-cejop-blue-light text-xs tracking-widest uppercase">
                                    Tucumán
                                </span>
                            </div>
                        </a>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
                            {navLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleLink(link.href)}
                                    className="font-encode text-sm font-medium text-white/80 hover:text-white tracking-wide uppercase transition-colors duration-200 relative group"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-cejop-blue-light transition-all duration-300 group-hover:w-full" />
                                </button>
                            ))}
                            <button
                                onClick={() => handleLink("#inscripcion")}
                                className="btn-primary text-xs px-5 py-2.5"
                                aria-label="Inscribite al programa CEJOP"
                            >
                                Sumate
                            </button>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden text-white p-2 hover:text-cejop-blue-light transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-40 bg-cejop-dark flex flex-col pt-20 px-6 md:hidden"
                    >
                        <nav className="flex flex-col gap-6 mt-8" aria-label="Menú móvil">
                            {navLinks.map((link, i) => (
                                <motion.button
                                    key={link.href}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    onClick={() => handleLink(link.href)}
                                    className="font-montserrat font-bold text-2xl text-white text-left hover:text-cejop-blue-light transition-colors"
                                >
                                    {link.label}
                                </motion.button>
                            ))}
                            <motion.button
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: navLinks.length * 0.07 }}
                                onClick={() => handleLink("#inscripcion")}
                                className="btn-primary mt-4 self-start"
                            >
                                Sumate al programa
                            </motion.button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
