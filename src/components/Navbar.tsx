"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import brandLogo from "@/assets/cejop_brand_cropped.png";

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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="section-container flex justify-center py-3 transition-all duration-500">
          <div
            className={`pointer-events-auto flex items-center justify-between transition-all duration-500 px-5 sm:px-8 rounded-full border border-transparent w-full ${
              scrolled
                ? "max-w-5xl bg-cejop-dark/80 backdrop-blur-2xl shadow-2xl shadow-black/40 border-white/5 py-2"
                : "bg-transparent py-3"
            }`}
          >
            {/* Logo */}
            <a
              href="#"
              className="flex items-center group shrink-0"
              aria-label="CEJOP Tucumán - Inicio"
            >
              <div
                className={`relative transition-all duration-500 ${
                  scrolled
                    ? "w-28 h-8 sm:w-32 sm:h-9"
                    : "w-36 h-10 sm:w-44 sm:h-12"
                }`}
              >
                <Image
                  src={brandLogo}
                  alt="CEJOP Tucumán"
                  fill
                  sizes="200px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </a>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Navegación principal"
            >
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className={`font-encode text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative group ${
                    scrolled
                      ? "text-white/80 hover:text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-cejop-blue-light transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
              <a
                href="/encuesta"
                className={`btn-primary px-5 py-2 transition-all duration-500 text-[11px]`}
                aria-label="Inscribite al programa CEJOP"
              >
                Inscribite
              </a>
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
            <nav
              className="flex flex-col gap-6 mt-8"
              aria-label="Menú móvil"
            >
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
              <motion.a
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.07 }}
                href="/encuesta"
                className="btn-primary mt-4 self-start"
              >
                Inscribite
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
