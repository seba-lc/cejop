"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CalendarDays, Ticket } from "lucide-react";

const LS_KEY = "cejop_encuesta_completada";

export function markEncuestaCompleted() {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, "true");
  }
}

export function isEncuestaCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_KEY) === "true";
}

type ModalType = "cerrada" | "completada" | null;

export default function SurveyGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modal, setModal] = useState<ModalType>(null);
  const encuestaHabilitada = useRef(true);
  const statusFetched = useRef(false);

  // Fetch survey status once
  useEffect(() => {
    fetch("/api/encuesta/status")
      .then((r) => r.json())
      .then((data) => {
        encuestaHabilitada.current = data.habilitada;
        statusFetched.current = true;
      })
      .catch(() => {
        statusFetched.current = true;
      });
  }, []);

  // Intercept clicks to /encuesta
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href='/encuesta']");
      const button = target.closest("[data-encuesta]");

      if (!anchor && !button) return;

      // Check localStorage first
      if (isEncuestaCompleted()) {
        e.preventDefault();
        e.stopPropagation();
        setModal("completada");
        return;
      }

      // Check if surveys are disabled
      if (statusFetched.current && !encuestaHabilitada.current) {
        e.preventDefault();
        e.stopPropagation();
        setModal("cerrada");
        return;
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);

  return (
    <>
      {children}

      <AnimatePresence>
        {modal === "cerrada" && (
          <GateModal onClose={() => setModal(null)}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-cejop-blue/10 flex items-center justify-center mx-auto mb-6">
                <CalendarDays size={28} className="text-cejop-blue" />
              </div>

              <h2 className="font-montserrat text-xl font-bold text-cejop-dark mb-3">
                Las inscripciones se abren pronto
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                El proceso de inscripción para el primer grupo de CEJOP
                Tucumán todavía no está activo. Seguinos en redes para
                enterarte apenas se habilite.
              </p>

              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
                <h3 className="font-montserrat font-semibold text-cejop-dark text-sm">
                  Primer encuentro
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CalendarDays size={16} className="text-cejop-blue flex-shrink-0" />
                  <span>Viernes 18 de abril, 2026</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-cejop-blue flex-shrink-0" />
                  <span>Alcurnia: 25 de mayo 760, SMT</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Ticket size={16} className="text-cejop-blue flex-shrink-0" />
                  <span className="font-semibold text-cejop-dark">
                    Entrada gratuita
                  </span>
                </div>
              </div>

              <a
                href="https://www.instagram.com/cejoptucuman"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-cejop-dark transition-colors"
                aria-label="Seguinos en Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </GateModal>
        )}

        {modal === "completada" && (
          <GateModal onClose={() => setModal(null)}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="font-montserrat text-xl font-bold text-cejop-dark mb-3">
                Tu encuesta ya fue enviada
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-sm mx-auto">
                Gracias por participar. El equipo de CEJOP está evaluando todos
                los perfiles recibidos.
              </p>

              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                Si fuiste seleccionado para el primer encuentro, te vamos a
                contactar por email o WhatsApp antes del 18 de abril.
              </p>
            </div>
          </GateModal>
        )}
      </AnimatePresence>
    </>
  );
}

function GateModal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
