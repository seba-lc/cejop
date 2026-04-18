"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles, Clock, Mail, Phone } from "lucide-react";
import Image from "next/image";
import brandLogo from "@/assets/cejop_brand_cropped.png";

const VIDEO_URL =
  "https://storage.googleapis.com/marketar_bucket/cejop/video_landing.mp4";

type AsistenteTipo = "confirmado" | "inscripto_no_confirmado" | "walk_in";

type LookupFound = {
  found: true;
  mail: string;
  inscripto: boolean;
  confirmado: boolean;
  yaAcreditado: boolean;
  tipo: AsistenteTipo;
  nombre: string;
  telefono: string;
};

type LookupNotFound = {
  found: false;
  telefono: string;
  mail: string;
};

type LookupResult = LookupFound | LookupNotFound;

type ScreenState =
  | { kind: "identify" }
  | { kind: "confirm-identity"; data: LookupFound }
  | { kind: "walkin-data"; prefillMail: string; prefillTel: string }
  | {
      kind: "success-acreditado";
      tipo: AsistenteTipo;
      nombre: string;
      duplicate: boolean;
    }
  | { kind: "success-pendiente"; duplicate: boolean };

type IdentifyMethod = "telefono" | "email";

export default function AcreditacionPage() {
  const [screen, setScreen] = useState<ScreenState>({ kind: "identify" });
  const [method, setMethod] = useState<IdentifyMethod>("telefono");
  const [inputValue, setInputValue] = useState("");
  const [nombre, setNombre] = useState("");
  const [mailInput, setMailInput] = useState("");
  const [edadInput, setEdadInput] = useState("");
  const [telInput, setTelInput] = useState("");
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

  const isValidInput =
    method === "telefono"
      ? inputValue.replace(/\D/g, "").length >= 8
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue.trim());

  async function lookup() {
    if (!isValidInput) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const params =
        method === "telefono"
          ? `telefono=${encodeURIComponent(inputValue)}`
          : `mail=${encodeURIComponent(inputValue.trim().toLowerCase())}`;
      const res = await fetch(`/api/acreditacion?${params}`);
      const data: LookupResult = await res.json();
      if (!res.ok) {
        setErrorMsg("Error al buscar, intentá de nuevo");
        return;
      }
      if (data.found) {
        setScreen({ kind: "confirm-identity", data });
      } else {
        // Prefill según qué usamos para identificarse
        const prefillMail =
          method === "email" ? inputValue.trim().toLowerCase() : "";
        const prefillTel = method === "telefono" ? inputValue : "";
        setMailInput(prefillMail);
        setTelInput(prefillTel);
        setScreen({
          kind: "walkin-data",
          prefillMail,
          prefillTel,
        });
      }
    } catch {
      setErrorMsg("No se pudo conectar, intentá de nuevo");
    } finally {
      setLoading(false);
    }
  }

  async function registerInscripto(data: LookupFound) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/acreditacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: data.mail }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Error al registrar");
        return;
      }
      setScreen({
        kind: "success-acreditado",
        tipo: json.tipo,
        nombre: json.nombre || data.nombre,
        duplicate: !!json.duplicate,
      });
    } catch {
      setErrorMsg("No se pudo conectar, intentá de nuevo");
    } finally {
      setLoading(false);
    }
  }

  async function submitWalkin() {
    if (!nombre.trim()) {
      setErrorMsg("Nombre requerido");
      return;
    }
    if (telInput.replace(/\D/g, "").length < 8) {
      setErrorMsg("Teléfono requerido (al menos 8 dígitos)");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/acreditacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          mail: mailInput.trim().toLowerCase(),
          edad: edadInput ? parseInt(edadInput, 10) : null,
          telefono: telInput.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Error al registrar");
        return;
      }
      setScreen({
        kind: "success-pendiente",
        duplicate: !!json.duplicate,
      });
    } catch {
      setErrorMsg("No se pudo conectar, intentá de nuevo");
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setScreen({ kind: "identify" });
    setInputValue("");
    setNombre("");
    setMailInput("");
    setEdadInput("");
    setTelInput("");
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
            ) : screen.kind === "identify" ? (
              <motion.div
                key="identify"
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
                <p className="font-source text-[15px] text-white/70 leading-relaxed mb-8">
                  {method === "telefono"
                    ? "Ingresá tu teléfono para identificarte."
                    : "Ingresá tu email para identificarte."}
                </p>

                {method === "telefono" ? (
                  <div>
                    <label
                      htmlFor="telefono"
                      className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
                    >
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidInput) lookup();
                      }}
                      placeholder="3813030000"
                      className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[17px] tracking-wide focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidInput) lookup();
                      }}
                      placeholder="tu@email.com"
                      className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
                    />
                  </div>
                )}

                {errorMsg && (
                  <p className="font-source text-xs text-red-400 mt-3">
                    {errorMsg}
                  </p>
                )}

                <button
                  onClick={lookup}
                  disabled={!isValidInput || loading}
                  className={`w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 mt-8 transition-all duration-300 group ${
                    isValidInput && !loading
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

                <button
                  onClick={() => {
                    setMethod(method === "telefono" ? "email" : "telefono");
                    setInputValue("");
                    setErrorMsg(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 mt-4 text-white/50 hover:text-white transition-colors py-2 font-source text-[13px]"
                >
                  {method === "telefono" ? (
                    <>
                      <Mail size={14} /> Identificarme con email
                    </>
                  ) : (
                    <>
                      <Phone size={14} /> Identificarme con teléfono
                    </>
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
                  ¿Sos {screen.data.nombre.split(" ")[0] || "vos"}?
                </h1>

                <div className="bg-white/[0.07] border border-white/10 p-5 mb-8 space-y-2">
                  <p className="font-source text-[15px] text-white/90">
                    <strong className="font-semibold">{screen.data.nombre}</strong>
                  </p>
                  {screen.data.mail && (
                    <p className="font-source text-[13px] text-white/50">
                      {screen.data.mail}
                    </p>
                  )}
                  {screen.data.telefono && (
                    <p className="font-source text-[13px] text-white/50">
                      {screen.data.telefono}
                    </p>
                  )}
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
                    onClick={() => registerInscripto(screen.data)}
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
                    No, volver
                  </button>
                </div>
              </motion.div>
            ) : screen.kind === "walkin-data" ? (
              <motion.div
                key="walkin-data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-block font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                  No te encontramos en la lista
                </span>

                <h1 className="font-montserrat font-black text-3xl sm:text-4xl text-white leading-tight mb-3">
                  Dejanos tus datos
                </h1>
                <p className="font-source text-[15px] text-white/70 leading-relaxed mb-8">
                  Un miembro del equipo va a revisar si podemos darte lugar.
                </p>

                <div className="space-y-4">
                  <Field
                    id="nombre"
                    label="Nombre y apellido"
                    required
                    value={nombre}
                    onChange={setNombre}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                  />
                  <Field
                    id="mail"
                    label="Email"
                    type="email"
                    inputMode="email"
                    value={mailInput}
                    onChange={setMailInput}
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      id="edad"
                      label="Edad"
                      type="number"
                      inputMode="numeric"
                      value={edadInput}
                      onChange={setEdadInput}
                      placeholder="18–30"
                    />
                    <Field
                      id="tel"
                      label="Teléfono"
                      required
                      type="tel"
                      inputMode="numeric"
                      value={telInput}
                      onChange={setTelInput}
                      placeholder="3813030000"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="font-source text-xs text-red-400 mt-4">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col gap-2 mt-8">
                  <button
                    onClick={submitWalkin}
                    disabled={!nombre.trim() || loading}
                    className={`w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 transition-all duration-300 group ${
                      nombre.trim() && !loading
                        ? "bg-white text-cejop-dark hover:bg-white/90"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Enviando..." : "Enviar mis datos"}
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
            ) : screen.kind === "success-acreditado" ? (
              <motion.div
                key="success-acreditado"
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
                      : `Gracias por venir, ${screen.nombre.split(" ")[0] || ""}`}
                </h2>

                <p className="font-source text-[15px] text-white/80 leading-relaxed max-w-sm mx-auto mb-8">
                  {screen.tipo === "confirmado"
                    ? "Estás confirmado/a. Pasá a la sala, el encuentro está por empezar."
                    : "Pasá a la sala. Gracias por ser parte del primer CEJOP."}
                </p>

                <button
                  onClick={resetFlow}
                  className="inline-flex items-center justify-center gap-2 font-montserrat font-semibold text-sm text-white/60 hover:text-white transition-colors py-3 px-6 border border-white/20 hover:border-white/40"
                >
                  Acreditar a otra persona
                </button>
              </motion.div>
            ) : screen.kind === "success-pendiente" ? (
              <motion.div
                key="success-pendiente"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-6">
                  <Clock size={36} className="text-yellow-300" />
                </div>

                <h2 className="font-montserrat font-black text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  {screen.duplicate
                    ? "Ya tenemos tus datos"
                    : "Ya recibimos tus datos"}
                </h2>

                <p className="font-source text-[15px] text-white/80 leading-relaxed max-w-sm mx-auto mb-4">
                  Acercate a la mesa del CEJOP. Un miembro del equipo va a
                  revisar tu inscripción y confirmarte en el momento si podés
                  pasar.
                </p>

                <p className="font-source text-[13px] text-white/50 leading-relaxed max-w-sm mx-auto mb-8">
                  No cierres esta pantalla ni te alejes — te responden en un
                  par de minutos.
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

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
      >
        {label}
        {required && <span className="text-cejop-blue-light ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
      />
    </div>
  );
}
