"use client";

import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";

const socials = [
    { icon: Instagram, href: "#", label: "Instagram de CEJOP Tucumán" },
    { icon: Twitter, href: "#", label: "Twitter/X de CEJOP Tucumán" },
    { icon: Linkedin, href: "#", label: "LinkedIn de CEJOP Tucumán" },
];

const footerLinks = [
    { label: "El Programa", href: "#programa" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "FAQ", href: "#faq" },
    { label: "Inscripción", href: "#inscripcion" },
];

export default function Footer() {
    const handleLink = (href: string) => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <footer className="bg-[#0d0d1a] text-white" role="contentinfo">
            <div className="section-container py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-14">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-cejop-blue flex items-center justify-center shrink-0">
                                <span className="font-montserrat font-black text-white text-[9px] leading-tight tracking-tighter text-center">
                                    CEJ<br />OP
                                </span>
                            </div>
                            <div>
                                <p className="font-montserrat font-bold text-white text-lg leading-none tracking-tight">
                                    CEJOP
                                </p>
                                <p className="font-encode text-cejop-blue-light text-xs tracking-widest uppercase">
                                    Tucumán
                                </p>
                            </div>
                        </div>
                        <p className="font-source text-sm text-white/50 leading-relaxed max-w-xs">
                            Centro de Estudios para Jóvenes en la Política. Formación política e institucional para jóvenes de 18 a 30 años en Tucumán, Argentina.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-encode font-semibold text-xs tracking-widest uppercase text-white/40 mb-5">
                            Navegación
                        </h3>
                        <nav aria-label="Navegación del pie de página">
                            <ul className="space-y-3">
                                {footerLinks.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            onClick={() => handleLink(link.href)}
                                            className="font-source text-sm text-white/60 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-encode font-semibold text-xs tracking-widest uppercase text-white/40 mb-5">
                            Contacto
                        </h3>
                        <a
                            href="mailto:contacto@cejoptucuman.org"
                            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200 mb-6"
                            aria-label="Enviar email a CEJOP Tucumán"
                        >
                            <Mail size={14} aria-hidden="true" />
                            <span className="font-source">contacto@cejoptucuman.org</span>
                        </a>

                        <div className="flex gap-4">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    whileHover={{ y: -3 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-cejop-blue transition-colors duration-200"
                                >
                                    <Icon size={16} aria-hidden="true" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="font-source text-xs text-white/30">
                        © 2025 CEJOP Tucumán. Todos los derechos reservados.
                    </p>
                    <p className="font-source text-xs text-white/20">
                        Formación política para jóvenes · Tucumán, Argentina
                    </p>
                </div>
            </div>
        </footer>
    );
}
