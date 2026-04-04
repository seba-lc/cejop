"use client";

import { motion } from "framer-motion";
import { Instagram, Mail } from "lucide-react";
import Image from "next/image";
import brandLogo from "@/assets/cejop_brand_cropped.png";

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/cejoptucuman", label: "Instagram de CEJOP Tucumán", handle: "@cejoptucuman" },
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
    if (href.startsWith("http")) {
      window.open(href, "_blank");
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0d0d1a] text-white" role="contentinfo">
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-14">
          {/* Brand */}
          <div>
            <div className="mb-5">
              <div className="relative w-36 h-10">
                <Image
                  src={brandLogo}
                  alt="CEJOP Tucumán"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="font-source text-sm text-white/50 leading-relaxed max-w-xs">
              Centro de Jóvenes Políticos. Formación política e institucional
              para jóvenes de 18 a 30 años en Tucumán, Argentina.
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
              href="mailto:cejoptucuman@gmail.com"
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200 mb-6"
              aria-label="Enviar email a CEJOP Tucumán"
            >
              <Mail size={14} aria-hidden="true" />
              <span className="font-source">cejoptucuman@gmail.com</span>
            </a>

            <div className="mb-8">
              {socials.map(({ icon: Icon, href, label, handle }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  <Icon size={14} aria-hidden="true" />
                  <span className="font-source">{handle}</span>
                </a>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-source text-xs text-white/30">
            © 2026 CEJOP Tucumán. Todos los derechos reservados.
          </p>
          <p className="font-source text-xs text-white/20">
            Formación política para jóvenes · Tucumán, Argentina
          </p>
        </div>
      </div>
    </footer>
  );
}
