"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import brandLogo from "@/assets/cejop_brand_cropped.png";

const VIDEO_URL =
  "https://storage.googleapis.com/marketar_bucket/cejop/video_landing.mp4";

const NEXT_TOPICS = [
  { id: "interior", label: "Ministerio del Interior" },
  { id: "economia", label: "Economía" },
  { id: "judicial", label: "Poder Judicial" },
  { id: "legislativo", label: "Poder Legislativo" },
  { id: "urbanizacion", label: "Urbanización y política social" },
  { id: "medios", label: "Medios y opinión pública" },
  { id: "juventudes", label: "Juventudes y trabajo" },
  { id: "empresas", label: "Empresas y producción" },
];

type FormData = {
  mail: string;
  nps: number | null;
  teLlevas: string;
  mejorarias: string;
  proximoTemas: string[];
  proximoOtro: string;
  recomendaria: "si" | "talvez" | "no" | null;
  origenPolitico: string;
};

const initialForm: FormData = {
  mail: "",
  nps: null,
  teLlevas: "",
  mejorarias: "",
  proximoTemas: [],
  proximoOtro: "",
  recomendaria: null,
  origenPolitico: "",
};

const steps = [
  { id: "intro", title: "", subtitle: "" },
  { id: "mail", title: "Dejanos tu email", subtitle: "Para quedar conectados" },
  {
    id: "nps",
    title: "¿Cómo calificarías el encuentro?",
    subtitle: "Del 1 al 10 — tu honestidad mueve esto",
  },
  {
    id: "llevas",
    title: "¿Qué te llevás?",
    subtitle: "Una frase, una idea, lo que haya quedado",
  },
  {
    id: "mejorar",
    title: "¿Qué podríamos mejorar?",
    subtitle: "Concreto — así el próximo encuentro es mejor",
  },
  {
    id: "proximo",
    title: "¿Sobre qué querés el próximo?",
    subtitle: "Elegí los temas que más te interesen",
  },
  {
    id: "recomendar",
    title: "¿Recomendarías el CEJOP?",
    subtitle: "A alguien de tu círculo",
  },
  {
    id: "origen",
    title: "¿De qué espacio venís?",
    subtitle: "Partido, agrupación, organización — o individual",
  },
];

const COOKIE_NAME = "cejop_feedback_e1_done";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

export default function FeedbackE1Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [videoSrc, setVideoSrc] = useState(VIDEO_URL);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const cookie = getCookie(COOKIE_NAME);
    if (cookie) setAlreadyDone(true);
  }, []);

  // Safety: no dejar al usuario esperando más de 5s si el video no llega
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
        // fallback to direct URL
      }
    };
    handleCaching();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleTopic = (id: string) => {
    setForm((prev) => ({
      ...prev,
      proximoTemas: prev.proximoTemas.includes(id)
        ? prev.proximoTemas.filter((t) => t !== id)
        : [...prev.proximoTemas, id],
    }));
  };

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail.trim());
      case 2:
        return form.nps !== null;
      case 3:
        return form.teLlevas.trim().length > 0;
      case 4:
        return true; // opcional
      case 5:
        return (
          form.proximoTemas.length > 0 || form.proximoOtro.trim().length > 0
        );
      case 6:
        return form.recomendaria !== null;
      case 7:
        return true; // opcional
      default:
        return false;
    }
  };

  const next = () => {
    if (!canAdvance()) return;
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      mail: form.mail.trim().toLowerCase(),
      nps: form.nps,
      teLlevas: form.teLlevas.trim(),
      mejorarias: form.mejorarias.trim(),
      proximoTemas: form.proximoTemas,
      proximoOtro: form.proximoOtro.trim(),
      recomendaria: form.recomendaria,
      origenPolitico: form.origenPolitico.trim(),
      encuentro: "e1",
    };

    try {
      const res = await fetch("/api/feedback-e1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        setDuplicateMessage(data.message);
        setCookie(COOKIE_NAME, form.mail.trim(), 90);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar");
      }

      setCookie(COOKIE_NAME, form.mail.trim(), 90);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Error al enviar el feedback. Intentá de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isIntro = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const formSteps = steps.length - 1;
  const progress = isIntro ? 0 : (currentStep / formSteps) * 100;

  return (
    <main className="relative min-h-[100dvh] flex flex-col bg-cejop-dark overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoReady(true)}
          className="w-full h-full object-cover"
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
            {alreadyDone || duplicateMessage ? (
              <motion.div
                key="already-done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle
                  size={56}
                  className="text-cejop-blue-light mx-auto mb-6"
                />
                <h2 className="font-montserrat font-black text-2xl sm:text-3xl text-white mb-4">
                  Ya recibimos tu feedback
                </h2>
                <p className="font-source text-white/80 text-base leading-relaxed max-w-sm mx-auto mb-4">
                  {duplicateMessage ||
                    "Tu respuesta sobre el primer encuentro ya quedó registrada. Gracias por compartirla."}
                </p>
                <p className="font-source text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                  Nos vemos en el próximo encuentro.
                </p>
              </motion.div>
            ) : !videoReady ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <div
                  className="w-10 h-10 border-2 border-white/15 border-t-cejop-blue-light rounded-full animate-spin"
                  aria-label="Cargando"
                />
                <p className="mt-6 font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-white/40">
                  Cargando
                </p>
              </motion.div>
            ) : submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle
                  size={56}
                  className="text-cejop-blue-light mx-auto mb-6"
                />
                <h2 className="font-montserrat font-black text-2xl sm:text-3xl text-white mb-4">
                  Gracias por responder
                </h2>
                <p className="font-source text-white/80 text-base leading-relaxed max-w-sm mx-auto mb-6">
                  Tu feedback nos ayuda a construir el próximo encuentro.
                  Quedás conectado con el CEJOP.
                </p>
                <a
                  href="https://www.instagram.com/cejoptucuman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="Seguinos en Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {isIntro ? (
                  /* ── Intro ── */
                  <div>
                    <span className="inline-block font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                      Primer encuentro · CEJOP Tucumán
                    </span>

                    <h1 className="font-montserrat font-black text-3xl sm:text-4xl text-white leading-tight mb-6">
                      Contanos cómo lo viviste
                    </h1>

                    <div className="space-y-5 mb-10">
                      <div className="border-l-2 border-white/20 pl-4">
                        <p className="font-source text-[15px] text-white/80 leading-relaxed">
                          Estuviste en la Mesa Panel de Intendentes. Tu
                          opinión define cómo armamos los próximos encuentros
                          del año.
                        </p>
                      </div>

                      <div className="border-l-2 border-cejop-blue pl-4">
                        <p className="font-source text-[15px] text-white/80 leading-relaxed">
                          Son{" "}
                          <strong className="text-white">
                            6 preguntas, menos de 2 minutos
                          </strong>
                          . Sin vueltas. Tu respuesta queda registrada de
                          forma confidencial.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={next}
                      className="w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 bg-white text-cejop-dark hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 transition-all duration-300 group"
                    >
                      Empezar
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                ) : (
                  /* ── Form steps ── */
                  <>
                    {/* Step indicator */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light">
                          Paso {currentStep} de {formSteps}
                        </span>
                        <span className="font-source text-xs text-white/40">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-cejop-blue-light"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-white leading-tight mb-1">
                      {steps[currentStep].title}
                    </h1>
                    <p className="font-source text-sm text-white/50 mb-8">
                      {steps[currentStep].subtitle}
                    </p>

                    <div className="space-y-4">
                      {/* Step 1: Email */}
                      {currentStep === 1 && (
                        <Field
                          label="Email"
                          name="mail"
                          type="email"
                          inputMode="email"
                          value={form.mail}
                          onChange={handleChange}
                          placeholder="tu@email.com"
                          required
                        />
                      )}

                      {/* Step 2: NPS */}
                      {currentStep === 2 && (
                        <div>
                          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(
                              (n) => (
                                <button
                                  key={n}
                                  onClick={() =>
                                    setForm({ ...form, nps: n })
                                  }
                                  className={`aspect-square flex items-center justify-center font-montserrat font-bold text-base transition-all duration-200 border ${
                                    form.nps === n
                                      ? "bg-cejop-blue border-cejop-blue text-white shadow-lg shadow-cejop-blue/30"
                                      : "bg-white/[0.04] border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                  }`}
                                >
                                  {n}
                                </button>
                              )
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 font-source text-[11px] text-white/30">
                            <span>Muy malo</span>
                            <span>Excelente</span>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Qué te llevás */}
                      {currentStep === 3 && (
                        <TextArea
                          label="¿Qué te llevás del encuentro?"
                          name="teLlevas"
                          value={form.teLlevas}
                          onChange={handleChange}
                          placeholder="Una idea, una frase, una reflexión..."
                          rows={4}
                          required
                        />
                      )}

                      {/* Step 4: Qué mejorarías */}
                      {currentStep === 4 && (
                        <>
                          <TextArea
                            label="¿Qué podríamos mejorar para el próximo?"
                            name="mejorarias"
                            value={form.mejorarias}
                            onChange={handleChange}
                            placeholder="Opcional — todo input cuenta"
                            rows={4}
                          />
                          <p className="font-source text-xs text-white/40 leading-relaxed pt-2">
                            Este campo es opcional. Si todo estuvo bien, podés
                            avanzar.
                          </p>
                        </>
                      )}

                      {/* Step 5: Próximo tema */}
                      {currentStep === 5 && (
                        <div className="space-y-3">
                          <p className="font-source text-[13px] text-white/60 leading-relaxed -mt-2 mb-2">
                            Podés elegir más de uno.
                          </p>
                          <div className="space-y-1.5">
                            {NEXT_TOPICS.map((t) => {
                              const selected = form.proximoTemas.includes(
                                t.id
                              );
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => toggleTopic(t.id)}
                                  className={`w-full text-left px-4 py-3 border transition-all duration-200 flex items-center justify-between ${
                                    selected
                                      ? "border-cejop-blue bg-cejop-blue/15 text-white"
                                      : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/20"
                                  }`}
                                >
                                  <span className="font-source text-[14px]">
                                    {t.label}
                                  </span>
                                  {selected && (
                                    <CheckCircle
                                      size={16}
                                      className="text-cejop-blue-light shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2">
                            <TextArea
                              label="Otro tema (opcional)"
                              name="proximoOtro"
                              value={form.proximoOtro}
                              onChange={handleChange}
                              placeholder="¿Hay algo más que te gustaría tratar?"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 6: Recomendaría */}
                      {currentStep === 6 && (
                        <div className="space-y-2">
                          {[
                            {
                              id: "si",
                              label: "Sí, lo recomendaría",
                            },
                            {
                              id: "talvez",
                              label: "Tal vez",
                            },
                            {
                              id: "no",
                              label: "No, por ahora no",
                            },
                          ].map((opt) => {
                            const selected = form.recomendaria === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    recomendaria:
                                      opt.id as FormData["recomendaria"],
                                  })
                                }
                                className={`w-full text-left px-4 py-4 border transition-all duration-200 flex items-center justify-between ${
                                  selected
                                    ? "border-cejop-blue bg-cejop-blue/15 text-white"
                                    : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/20"
                                }`}
                              >
                                <span className="font-montserrat font-semibold text-[14px]">
                                  {opt.label}
                                </span>
                                {selected && (
                                  <CheckCircle
                                    size={16}
                                    className="text-cejop-blue-light shrink-0"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Step 7: Origen político */}
                      {currentStep === 7 && (
                        <>
                          <Field
                            label="Espacio, partido u organización"
                            name="origenPolitico"
                            value={form.origenPolitico}
                            onChange={handleChange}
                            placeholder='Ej: UCR, Juventud Peronista, MNR, "individual"...'
                          />
                          <p className="font-source text-xs text-white/40 leading-relaxed pt-2">
                            Campo opcional. Si venís de forma individual o no
                            militás en ningún espacio, podés escribir
                            &ldquo;individual&rdquo; o dejarlo en blanco. La
                            pluralidad es el corazón del CEJOP.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-3 mt-10">
                      <button
                        onClick={prev}
                        className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white/60 hover:text-white transition-colors py-3 px-4"
                      >
                        <ArrowLeft size={16} />
                        Atrás
                      </button>
                      <button
                        onClick={isLastStep ? handleSubmit : next}
                        disabled={!canAdvance() || submitting}
                        className={`flex-1 flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 transition-all duration-300 group ${
                          canAdvance() && !submitting
                            ? "bg-white text-cejop-dark hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
                            : "bg-white/10 text-white/30 cursor-not-allowed"
                        }`}
                      >
                        {submitting
                          ? "Enviando..."
                          : isLastStep
                            ? "Enviar feedback"
                            : "Siguiente"}
                        {!submitting && (
                          <ArrowRight
                            size={16}
                            className={`transition-transform ${canAdvance() ? "group-hover:translate-x-1" : ""}`}
                          />
                        )}
                      </button>
                    </div>
                    {submitError && (
                      <p className="font-source text-xs text-red-400 text-center mt-3">
                        {submitError}
                      </p>
                    )}

                    {/* Step dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                      {steps.slice(1).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i + 1 === currentStep
                              ? "w-6 bg-cejop-blue-light"
                              : i + 1 < currentStep
                                ? "w-1.5 bg-white/40"
                                : "w-1.5 bg-white/15"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

// --- Reusable field components ---

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  pattern,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  pattern?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
      >
        {label}
        {required && <span className="text-cejop-blue-light ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        pattern={pattern}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all rounded-none"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 2,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-encode text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-2"
      >
        {label}
        {required && <span className="text-cejop-blue-light ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3.5 font-source text-[15px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all resize-none rounded-none"
      />
    </div>
  );
}
