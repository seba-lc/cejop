"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import brandLogo from "@/assets/cejop_brand_cropped.png";

const VIDEO_URL =
  "https://storage.googleapis.com/marketar_bucket/cejop/video_landing.mp4";

type LookupResult = {
  mail: string;
  inscripto: boolean;
  confirmado: boolean;
  yaAcreditado: boolean;
  tipo: "confirmado" | "inscripto_no_confirmado" | "walk_in";
  nombre: string;
  telefono: string;
};

type ScreenState =
  | { kind: "email" }
  | { kind: "confirm-identity"; data: LookupResult }
  | { kind: "complete-profile"; mail: string }
  | { kind: "success"; tipo: LookupResult["tipo"]; nombre: string; duplicate: boolean };

export default function AcreditacionPage() {
  const [screen, setScreen] = useState<ScreenState>({ kind: "email" });
  const [mail, setMail] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState(VIDEO_URL);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleCaching = async () => {
      if (!("caches" in window)) return;
      try {
        const cache = await caches.open("cejop-media-cache");
        const cached = await cache.match(VIDEO_URL);
        if (cached) {
          const blob = await cached.blob();
          setVideoSrc(URL.createObjectURL(blob));
        } else {
          const res = await fetch(VIDEO_URL);
          if (res.ok) {
            cache.put(VIDEO_URL, res.clone());
            const blob = await res.blob();
            setVideoSrc(URL.createObjectURL(blob));
          }
        }
      } catch {
        // fallback
      }
    };
    handleCaching();
  }, []);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim());

  async function lookupEmail() {
    if (!isValidEmail) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/acreditacion?mail=${encodeURIComponent(mail.trim())}`
      );
      const data: LookupResult = await res.json();
      if (!res.ok) {
        setErrorMsg("Error al buscar el email, intentá de nuevo");
        return;
      }
      if (data.inscripto) {
        setNombre(data.nombre);
        setScreen({ kind: "confirm-identity", data });
      } else {
        setScreen({ kind: "complete-profile", mail: mail.trim().toLowerCase() });
      }
    } catch {
      setErrorMsg("No se pudo conectar, intentá de nuevo");
    } finally {
      setLoading(false);
    }
  }

  async function registerAttendance(params: {
    mail: string;
    nombre?: string;
    telefono?: string;
  }) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/acreditacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error al registrar");
        return;
      }
      setScreen({
        kind: "success",
        tipo: data.tipo,
        nombre: data.nombre || params.nombre || "",
        duplicate: !!data.duplicate,
      });
    } catch {
      setErrorMsg("No se pudo conectar, intentá de nuevo");
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setScreen({ kind: "email" });
    setMail("");
    setNombre("");
    setTelefono("");
    setErrorMsg(null);
  }

  return (
    <main className="relative min-h-[100dvh] flex flex-col bg-cejop-dark overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          key={videoSrc}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          onLoadedData={() => {
            setVideoReady(true);
            videoRef.current?.play().catch(() => {});
          }}
          className="w-full h-full object-cover pointer-events-none"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full max-w-lg mx-auto px-4 sm:px-6 pt-4 pb-0">
        <a href="/" className="inline-block">
          <div className="relative w-48 h-14 sm:w-56 sm:h-16">
            <Image
              src={brandLogo}
              alt="CEJOP Tucumán"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </a>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {!videoReady ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <div className="w-10 h-10 border-2 border-white/15 border-t-cejop-blue-light rounded-full animate-spin" />
                <p className="mt-6 font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-white/40">
                  Cargando
                </p>
              </motion.div>
            ) : screen.kind === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-block font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                  Acreditación · 18/4/2026
                </span>

                <h1 className="font-montserrat font-black text-3xl sm:text-4xl text-white leading-tight mb-3">
                  Bienvenido/a al primer CEJOP
                </h1>
                <p className="font-source text-[15px] text-white/70 leading-relaxed mb-10">
                  Ingresá tu email para acreditarte.
                </p>

                <div>
                  <label
                    htmlFor="mail"
                    className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="mail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValidEmail) lookupEmail();
                    }}
                    placeholder="tu@email.com"
                    className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
                  />
                </div>

                {errorMsg && (
                  <p className="font-source text-xs text-red-400 mt-3">
                    {errorMsg}
                  </p>
                )}

                <button
                  onClick={lookupEmail}
                  disabled={!isValidEmail || loading}
                  className={`w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 mt-8 transition-all duration-300 group ${
                    isValidEmail && !loading
                      ? "bg-white text-cejop-dark hover:bg-white/90"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Buscando..." : "Continuar"}
                  {!loading && (
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </motion.div>
            ) : screen.kind === "confirm-identity" ? (
              <motion.div
                key="confirm-identity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-block font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                  {screen.data.tipo === "confirmado"
                    ? "Estás en la lista"
                    : "Te encontramos"}
                </span>

                <h1 className="font-montserrat font-black text-3xl sm:text-4xl text-white leading-tight mb-4">
                  ¿Sos vos, {screen.data.nombre.split(" ")[0] || "vos"}?
                </h1>

                <div className="bg-white/[0.07] border border-white/10 p-5 mb-8 space-y-2">
                  <p className="font-source text-[15px] text-white/90">
                    <strong className="font-semibold">{screen.data.nombre}</strong>
                  </p>
                  <p className="font-source text-[13px] text-white/50">
                    {screen.data.mail}
                  </p>
                </div>

                {screen.data.yaAcreditado && (
                  <p className="font-source text-[13px] text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                    Ya estás acreditado/a. Pasá nomás.
                  </p>
                )}

                {errorMsg && (
                  <p className="font-source text-xs text-red-400 mb-3">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() =>
                      registerAttendance({
                        mail: screen.data.mail,
                        nombre: screen.data.nombre,
                        telefono: screen.data.telefono,
                      })
                    }
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 bg-white text-cejop-dark hover:bg-white/90 transition-all duration-300 group"
                  >
                    {loading ? "Acreditando..." : "Sí, soy yo"}
                    {!loading && (
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                  <button
                    onClick={resetFlow}
                    disabled={loading}
                    className="w-full font-montserrat font-semibold text-sm text-white/50 hover:text-white transition-colors py-3"
                  >
                    No, usar otro email
                  </button>
                </div>
              </motion.div>
            ) : screen.kind === "complete-profile" ? (
              <motion.div
                key="complete-profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-block font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                  Un paso más
                </span>

                <h1 className="font-montserrat font-black text-3xl sm:text-4xl text-white leading-tight mb-4">
                  Contanos quién sos
                </h1>
                <p className="font-source text-[15px] text-white/70 leading-relaxed mb-8">
                  No te encontramos en la lista de inscriptos, pero está todo
                  bien — te podés acreditar igual.
                </p>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
                    >
                      Nombre y apellido
                      <span className="text-cejop-blue-light ml-1">*</span>
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      autoComplete="name"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="telefono"
                      className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
                    >
                      Teléfono (opcional)
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      inputMode="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="381 ..."
                      className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="font-source text-xs text-red-400 mt-3">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col gap-2 mt-8">
                  <button
                    onClick={() =>
                      registerAttendance({
                        mail: screen.mail,
                        nombre: nombre.trim(),
                        telefono: telefono.trim(),
                      })
                    }
                    disabled={!nombre.trim() || loading}
                    className={`w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 transition-all duration-300 group ${
                      nombre.trim() && !loading
                        ? "bg-white text-cejop-dark hover:bg-white/90"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Acreditando..." : "Acreditarme"}
                    {!loading && (
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                  <button
                    onClick={resetFlow}
                    disabled={loading}
                    className="w-full font-montserrat font-semibold text-sm text-white/50 hover:text-white transition-colors py-3"
                  >
                    Atrás
                  </button>
                </div>
              </motion.div>
            ) : screen.kind === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cejop-blue/20 mb-6">
                  {screen.tipo === "confirmado" ? (
                    <Sparkles size={36} className="text-cejop-blue-light" />
                  ) : (
                    <CheckCircle size={36} className="text-cejop-blue-light" />
                  )}
                </div>

                <h2 className="font-montserrat font-black text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  {screen.duplicate
                    ? "Ya estabas acreditado/a"
                    : screen.tipo === "confirmado"
                      ? `Bienvenido/a, ${screen.nombre.split(" ")[0] || ""}`
                      : screen.tipo === "inscripto_no_confirmado"
                        ? `Gracias por venir, ${screen.nombre.split(" ")[0] || ""}`
                        : `Te sumaste al CEJOP, ${screen.nombre.split(" ")[0] || ""}`}
                </h2>

                <p className="font-source text-[15px] text-white/80 leading-relaxed max-w-sm mx-auto mb-8">
                  {screen.tipo === "confirmado"
                    ? "Estás confirmado/a. Pasá a la sala, el encuentro está por empezar."
                    : screen.tipo === "inscripto_no_confirmado"
                      ? "Pasá a la sala. Gracias por ser parte del primer CEJOP."
                      : "Quedaste registrado/a como parte del primer encuentro. Pasá a la sala."}
                </p>

                <button
                  onClick={resetFlow}
                  className="inline-flex items-center justify-center gap-2 font-montserrat font-semibold text-sm text-white/60 hover:text-white transition-colors py-3 px-6 border border-white/20 hover:border-white/40"
                >
                  Acreditar a otra persona
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
