"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import brandLogo from "@/assets/cejop_brand_cropped.png";
import { markEncuestaCompleted, isEncuestaCompleted } from "@/components/SurveyGate";
import {
  trackEncuestaStart,
  trackEncuestaStep,
  trackEncuestaSubmit,
  trackEncuestaDuplicate,
  trackEncuestaBlocked,
} from "@/lib/analytics";

const VIDEO_URL =
  "https://storage.googleapis.com/marketar_bucket/cejop/video_landing.mp4";

// --- Priority topics ---
const PRIORITY_TOPICS = [
  { id: "salud", label: "Salud pública", question: "¿Cómo mejorar el acceso y la calidad del sistema de salud?" },
  { id: "educacion", label: "Educación", question: "¿Qué cambios necesita hoy la educación en Tucumán?" },
  { id: "seguridad", label: "Seguridad", question: "¿Cómo enfrentar la inseguridad de manera efectiva?" },
  { id: "medioambiente", label: "Medio ambiente", question: "¿Cómo proteger el medio ambiente sin frenar el desarrollo?" },
  { id: "economia", label: "Desarrollo económico", question: "¿Qué estrategias impulsan el desarrollo económico real?" },
  { id: "tecnologia", label: "Tecnología", question: "¿Cómo incorporar la tecnología para modernizar la provincia?" },
  { id: "cultura", label: "Cultura", question: "¿Qué lugar debe ocupar la cultura en la agenda pública?" },
  { id: "participacion", label: "Participación ciudadana", question: "¿Cómo fortalecer la participación ciudadana?" },
  { id: "ddhh", label: "Derechos humanos", question: "¿Cómo garantizar y defender los derechos humanos hoy?" },
  { id: "inclusion", label: "Inclusión social", question: "¿Cómo construir una sociedad más inclusiva?" },
  { id: "vulnerabilidad", label: "Sectores vulnerables", question: "¿Cómo mejorar las condiciones de vida de los sectores más vulnerables?" },
  { id: "corrupcion", label: "Transparencia", question: "¿Cómo combatir la corrupción y mejorar la transparencia?" },
  { id: "empleo", label: "Empleo joven", question: "¿Cómo generar más oportunidades para el empleo joven?" },
  { id: "infraestructura", label: "Infraestructura", question: "¿Qué obras de infraestructura son prioritarias?" },
  { id: "vivienda", label: "Vivienda digna", question: "¿Cómo garantizar el acceso a la vivienda digna?" },
  { id: "justicia", label: "Justicia", question: "¿Cómo lograr justicia y reparación real para las víctimas?" },
];

const REQUIRED_PRIORITIES = 3;

const PRIORITY_LABELS = ["Primera prioridad", "Segunda prioridad", "Tercera prioridad"];

type FormData = {
  nombre: string;
  telefono: string;
  mail: string;
  edad: string;
  localidad: string;
  dirigenteTucGustar: string;
  dirigenteTucGustarPorque: string;
  dirigenteArgGustar: string;
  dirigenteArgGustarPorque: string;
  dirigenteTucDisgustar: string;
  dirigenteTucDisgustarPorque: string;
  dirigenteArgDisgustar: string;
  dirigenteArgDisgustarPorque: string;
  otraPreocupacion: string;
};

const initialForm: FormData = {
  nombre: "",
  telefono: "",
  mail: "",
  edad: "",
  localidad: "",
  dirigenteTucGustar: "",
  dirigenteTucGustarPorque: "",
  dirigenteArgGustar: "",
  dirigenteArgGustarPorque: "",
  dirigenteTucDisgustar: "",
  dirigenteTucDisgustarPorque: "",
  dirigenteArgDisgustar: "",
  dirigenteArgDisgustarPorque: "",
  otraPreocupacion: "",
};

// Steps: intro + 6 form steps
const steps = [
  { id: "intro", title: "", subtitle: "" },
  { id: "personal", title: "Tus datos", subtitle: "Información de contacto" },
  {
    id: "gustar",
    title: "Dirigentes que valorás",
    subtitle: "No hay respuestas correctas ni incorrectas",
  },
  {
    id: "disgustar",
    title: "Dirigentes que cuestionás",
    subtitle: "Tu opinión es confidencial",
  },
  {
    id: "prioridades",
    title: "Agenda para Tucumán",
    subtitle: "Elegí las 3 temáticas más urgentes para la provincia",
  },
  {
    id: "profundidad",
    title: "Profundicemos",
    subtitle: "Contanos qué pensás sobre las prioridades que elegiste",
  },
  {
    id: "cierre",
    title: "Una última cosa",
    subtitle: "Si hay algo que no mencionamos, este es el espacio",
  },
];

const COOKIE_NAME = "cejop_encuesta_done";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

export default function EncuestaPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [priorityResponses, setPriorityResponses] = useState<Record<string, string>>({});
  const [videoSrc, setVideoSrc] = useState(VIDEO_URL);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [encuestaCerrada, setEncuestaCerrada] = useState(false);

  // Check cookie + localStorage + survey status on mount
  useEffect(() => {
    const cookie = getCookie(COOKIE_NAME);
    if (cookie || isEncuestaCompleted()) setAlreadyDone(true);

    fetch("/api/encuesta/status")
      .then((r) => r.json())
      .then((data) => {
        if (!data.habilitada) {
          setEncuestaCerrada(true);
          trackEncuestaBlocked();
        }
      })
      .catch(() => {});
  }, []);

  // Video caching
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

  const togglePriority = (topicId: string) => {
    setPriorities((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      }
      if (prev.length >= REQUIRED_PRIORITIES) return prev; // max 3
      return [...prev, topicId];
    });
  };

  const handlePriorityResponse = (topicId: string, value: string) => {
    setPriorityResponses((prev) => ({ ...prev, [topicId]: value }));
  };

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return !!(
          form.nombre.trim() &&
          form.telefono.trim() &&
          form.mail.trim() &&
          form.edad.trim() &&
          form.localidad.trim()
        );
      case 2:
        return !!(
          form.dirigenteTucGustar.trim() && form.dirigenteArgGustar.trim()
        );
      case 3:
        return !!(
          form.dirigenteTucDisgustar.trim() &&
          form.dirigenteArgDisgustar.trim()
        );
      case 4:
        return priorities.length === REQUIRED_PRIORITIES;
      case 5:
        return true; // responses are optional
      case 6:
        return true; // optional
      default:
        return false;
    }
  };

  const next = () => {
    if (!canAdvance()) return;
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      if (currentStep === 0) trackEncuestaStart();
      else trackEncuestaStep(currentStep, steps[currentStep].id);
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
      personal: {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        mail: form.mail.trim(),
        edad: parseInt(form.edad),
        localidad: form.localidad.trim(),
      },
      dirigentes: {
        tucGustar: { nombre: form.dirigenteTucGustar.trim(), porque: form.dirigenteTucGustarPorque.trim() },
        argGustar: { nombre: form.dirigenteArgGustar.trim(), porque: form.dirigenteArgGustarPorque.trim() },
        tucDisgustar: { nombre: form.dirigenteTucDisgustar.trim(), porque: form.dirigenteTucDisgustarPorque.trim() },
        argDisgustar: { nombre: form.dirigenteArgDisgustar.trim(), porque: form.dirigenteArgDisgustarPorque.trim() },
      },
      prioridades: priorities,
      profundidad: Object.fromEntries(
        priorities.map((id) => [id, (priorityResponses[id] || "").trim()])
      ),
      otraPreocupacion: form.otraPreocupacion.trim(),
    };

    try {
      const res = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        trackEncuestaDuplicate();
        setDuplicateMessage(data.message);
        setCookie(COOKIE_NAME, form.mail.trim(), 90);
        markEncuestaCompleted();
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar");
      }

      trackEncuestaSubmit();
      setCookie(COOKIE_NAME, form.mail.trim(), 90);
      markEncuestaCompleted();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al enviar la encuesta. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const isIntro = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const formSteps = steps.length - 1;
  const progress = isIntro ? 0 : (currentStep / formSteps) * 100;

  // Get selected topic objects in priority order
  const selectedTopics = priorities
    .map((id) => PRIORITY_TOPICS.find((t) => t.id === id)!)
    .filter(Boolean);

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
            {encuestaCerrada ? (
              <motion.div
                key="cerrada"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CalendarDays
                  size={56}
                  className="text-cejop-blue-light mx-auto mb-6"
                />
                <h2 className="font-montserrat font-black text-2xl sm:text-3xl text-white mb-4">
                  Las inscripciones se abren pronto
                </h2>
                <p className="font-source text-white/80 text-base leading-relaxed max-w-sm mx-auto mb-6">
                  El proceso de inscripción para el primer grupo de CEJOP
                  Tucumán todavía no está activo. Seguinos en redes para
                  enterarte apenas se habilite.
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-6 text-left space-y-3 max-w-sm mx-auto">
                  <h3 className="font-montserrat font-semibold text-white text-sm">
                    Primer encuentro
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <CalendarDays size={16} className="text-cejop-blue-light flex-shrink-0" />
                    <span>Viernes 18 de abril, 2026</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <MapPin size={16} className="text-cejop-blue-light flex-shrink-0" />
                    <span>Alcurnia: 25 de mayo 760, SMT</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Ticket size={16} className="text-cejop-blue-light flex-shrink-0" />
                    <span className="font-semibold text-white">Entrada gratuita</span>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/cejoptucuman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="Seguinos en Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </motion.div>
            ) : (alreadyDone || duplicateMessage) ? (
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
                  Tu participación ya está registrada
                </h2>
                <p className="font-source text-white/80 text-base leading-relaxed max-w-sm mx-auto mb-4">
                  {duplicateMessage ||
                    "Ya recibimos tu encuesta para este encuentro. No es necesario completarla nuevamente."}
                </p>
                <p className="font-source text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                  Si fuiste seleccionado para participar, te lo vamos a comunicar por email o WhatsApp.
                  Agradecemos tu interés en ser parte de CEJOP Tucumán.
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
                  Tu encuesta fue recibida
                </h2>
                <p className="font-source text-white/80 text-base leading-relaxed max-w-sm mx-auto mb-4">
                  Gracias por tomarte el tiempo de participar. El equipo de
                  CEJOP va a evaluar todos los perfiles recibidos.
                </p>
                <p className="font-source text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                  Te vamos a contactar por email o WhatsApp para confirmarte si
                  quedaste seleccionado para el próximo encuentro.
                </p>
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
                  /* ── Intro screen ── */
                  <div>
                    <span className="inline-block font-encode text-[11px] font-semibold tracking-[0.3em] uppercase text-cejop-blue-light mb-6 border-l-2 border-cejop-blue pl-3">
                      CEJOP Tucumán
                    </span>

                    <h1 className="font-montserrat font-black text-3xl sm:text-4xl text-white leading-tight mb-6">
                      Encuesta de participación
                    </h1>

                    <div className="space-y-5 mb-10">
                      <div className="border-l-2 border-white/20 pl-4">
                        <p className="font-source text-[15px] text-white/80 leading-relaxed">
                          Esta inscripción es válida{" "}
                          <strong className="text-white">
                            únicamente para el próximo encuentro
                          </strong>
                          . Para participar en cada charla del programa es
                          necesario completar una nueva encuesta.
                        </p>
                      </div>

                      <div className="border-l-2 border-cejop-blue pl-4">
                        <p className="font-source text-[15px] text-white/80 leading-relaxed">
                          Dado que la capacidad del espacio es acotada,
                          realizamos un proceso de selección para cada
                          encuentro. Nuestro compromiso es ir ampliando la
                          convocatoria a medida que el programa crezca. Si
                          quedás seleccionado,{" "}
                          <strong className="text-white">
                            te lo comunicamos por email o WhatsApp
                          </strong>
                          , así que estáte atento.
                        </p>
                      </div>
                    </div>

                    <p className="font-source text-xs text-white/40 leading-relaxed mb-10">
                      Tus respuestas son confidenciales y se utilizan
                      exclusivamente para diseñar un programa que represente las
                      inquietudes reales de los jóvenes de la provincia.
                    </p>

                    <button
                      onClick={next}
                      className="w-full flex items-center justify-center gap-3 font-montserrat font-bold text-sm tracking-wide py-4 bg-white text-cejop-dark hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 transition-all duration-300 group"
                    >
                      Comenzar encuesta
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

                    {/* Step title */}
                    <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-white leading-tight mb-1">
                      {steps[currentStep].title}
                    </h1>
                    <p className="font-source text-sm text-white/50 mb-8">
                      {steps[currentStep].subtitle}
                    </p>

                    {/* Step content */}
                    <div className="space-y-4">
                      {/* Step 1: Personal data */}
                      {currentStep === 1 && (
                        <>
                          <Field
                            label="Nombre y apellido"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Tu nombre completo"
                            required
                          />
                          <Field
                            label="Teléfono"
                            name="telefono"
                            type="tel"
                            inputMode="tel"
                            value={form.telefono}
                            onChange={handleChange}
                            placeholder="381 ..."
                            required
                          />
                          <Field
                            label="Mail"
                            name="mail"
                            type="email"
                            value={form.mail}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            required
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Field
                              label="Edad"
                              name="edad"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={form.edad}
                              onChange={handleChange}
                              placeholder="18–30"
                              required
                            />
                            <Field
                              label="Localidad"
                              name="localidad"
                              value={form.localidad}
                              onChange={handleChange}
                              placeholder="Tu ciudad"
                              required
                            />
                          </div>
                        </>
                      )}

                      {/* Step 2: Dirigentes que valorás */}
                      {currentStep === 2 && (
                        <>
                          <Field
                            label="¿Qué dirigente de Tucumán te gusta más?"
                            name="dirigenteTucGustar"
                            value={form.dirigenteTucGustar}
                            onChange={handleChange}
                            placeholder="Nombre del dirigente"
                            required
                          />
                          <TextArea
                            label="¿Por qué?"
                            name="dirigenteTucGustarPorque"
                            value={form.dirigenteTucGustarPorque}
                            onChange={handleChange}
                            placeholder="Opcional — contanos en pocas palabras"
                          />
                          <div className="pt-2" />
                          <Field
                            label="¿Qué dirigente de Argentina te gusta más?"
                            name="dirigenteArgGustar"
                            value={form.dirigenteArgGustar}
                            onChange={handleChange}
                            placeholder="Nombre del dirigente"
                            required
                          />
                          <TextArea
                            label="¿Por qué?"
                            name="dirigenteArgGustarPorque"
                            value={form.dirigenteArgGustarPorque}
                            onChange={handleChange}
                            placeholder="Opcional — contanos en pocas palabras"
                          />
                        </>
                      )}

                      {/* Step 3: Dirigentes que cuestionás */}
                      {currentStep === 3 && (
                        <>
                          <Field
                            label="¿Qué dirigente de Tucumán te gusta menos?"
                            name="dirigenteTucDisgustar"
                            value={form.dirigenteTucDisgustar}
                            onChange={handleChange}
                            placeholder="Nombre del dirigente"
                            required
                          />
                          <TextArea
                            label="¿Por qué?"
                            name="dirigenteTucDisgustarPorque"
                            value={form.dirigenteTucDisgustarPorque}
                            onChange={handleChange}
                            placeholder="Opcional — contanos en pocas palabras"
                          />
                          <div className="pt-2" />
                          <Field
                            label="¿Qué dirigente de Argentina te gusta menos?"
                            name="dirigenteArgDisgustar"
                            value={form.dirigenteArgDisgustar}
                            onChange={handleChange}
                            placeholder="Nombre del dirigente"
                            required
                          />
                          <TextArea
                            label="¿Por qué?"
                            name="dirigenteArgDisgustarPorque"
                            value={form.dirigenteArgDisgustarPorque}
                            onChange={handleChange}
                            placeholder="Opcional — contanos en pocas palabras"
                          />
                        </>
                      )}

                      {/* Step 4: Priority selection — pick exactly 3 */}
                      {currentStep === 4 && (
                        <>
                          <p className="font-source text-[13px] text-white/60 leading-relaxed -mt-2 mb-4">
                            Si pudieras definir la agenda política de Tucumán,
                            ¿cuáles serían tus <strong className="text-white/80">3 prioridades</strong>?
                            Tocá una temática para ver la pregunta y decidir si la seleccionás.
                          </p>

                          {/* Priority counter */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {[1, 2, 3].map((n) => {
                                const topic = priorities[n - 1]
                                  ? PRIORITY_TOPICS.find((t) => t.id === priorities[n - 1])
                                  : null;
                                return (
                                  <div
                                    key={n}
                                    className={`flex items-center gap-1.5 transition-all duration-300`}
                                  >
                                    <div
                                      className={`w-6 h-6 flex items-center justify-center text-[10px] font-montserrat font-bold ${
                                        topic
                                          ? "bg-cejop-blue text-white"
                                          : "border border-white/20 text-white/30"
                                      }`}
                                    >
                                      {n}
                                    </div>
                                    {topic && (
                                      <span className="font-source text-[11px] text-white/50 hidden sm:inline">
                                        {topic.label}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {priorities.length > 0 && (
                              <button
                                onClick={() => { setPriorities([]); setExpandedTopic(null); }}
                                className="font-source text-xs text-white/30 hover:text-white/60 transition-colors"
                              >
                                Reiniciar
                              </button>
                            )}
                          </div>

                          {/* Topic list — scrollable with fade hint */}
                          <div className="relative">
                            <div
                              className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1 scroll-smooth"
                              onScroll={(e) => {
                                const el = e.currentTarget;
                                const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
                                setScrolledToBottom(atBottom);
                              }}
                            >
                            {PRIORITY_TOPICS.map((topic) => {
                              const index = priorities.indexOf(topic.id);
                              const isSelected = index !== -1;
                              const isExpanded = expandedTopic === topic.id;
                              const isFull = priorities.length >= REQUIRED_PRIORITIES;
                              const isDisabled = !isSelected && isFull;

                              return (
                                <div key={topic.id}>
                                  {/* Topic chip */}
                                  <button
                                    onClick={() => {
                                      if (isSelected) {
                                        // Deselect
                                        setPriorities((prev) => prev.filter((id) => id !== topic.id));
                                        setExpandedTopic(null);
                                      } else if (!isDisabled) {
                                        // Expand to show question
                                        setExpandedTopic(isExpanded ? null : topic.id);
                                      }
                                    }}
                                    disabled={isDisabled}
                                    className={`w-full text-left px-3 py-2.5 border transition-all duration-200 flex items-center justify-between ${
                                      isSelected
                                        ? "border-cejop-blue bg-cejop-blue/15 text-white"
                                        : isExpanded
                                          ? "border-white/25 bg-white/[0.08] text-white"
                                          : isDisabled
                                            ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                                            : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/20"
                                    }`}
                                  >
                                    <span className="font-source text-[13px] leading-tight">
                                      {topic.label}
                                    </span>
                                    {isSelected ? (
                                      <span className="shrink-0 w-5 h-5 bg-cejop-blue text-white text-[10px] font-montserrat font-bold flex items-center justify-center">
                                        {index + 1}
                                      </span>
                                    ) : !isDisabled ? (
                                      <ChevronDown
                                        size={14}
                                        className={`shrink-0 text-white/30 transition-transform duration-200 ${
                                          isExpanded ? "rotate-180" : ""
                                        }`}
                                      />
                                    ) : null}
                                  </button>

                                  {/* Expanded question + select button */}
                                  <AnimatePresence>
                                    {isExpanded && !isSelected && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="border border-t-0 border-white/15 bg-white/[0.05] px-4 py-3">
                                          <p className="font-source text-[13px] text-white/70 leading-relaxed mb-3">
                                            {topic.question}
                                          </p>
                                          <button
                                            onClick={() => {
                                              setPriorities((prev) => [...prev, topic.id]);
                                              setExpandedTopic(null);
                                            }}
                                            className="w-full py-2 bg-cejop-blue/80 hover:bg-cejop-blue text-white font-montserrat font-bold text-xs tracking-wide transition-colors"
                                          >
                                            Elegir como prioridad {priorities.length + 1}
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                            </div>
                            {/* Fade gradient overlay */}
                            <div
                              className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cejop-dark via-cejop-dark/60 to-transparent transition-opacity duration-300 ${
                                scrolledToBottom ? "opacity-0" : "opacity-100"
                              }`}
                            />
                          </div>
                        </>
                      )}

                      {/* Step 5: Deep-dive on selected priorities (optional) */}
                      {currentStep === 5 && (
                        <div className="space-y-3">
                          <p className="font-source text-[13px] text-white/60 leading-relaxed -mt-2 mb-2">
                            Si querés, podés ampliar tu perspectiva sobre las temáticas que elegiste.
                            Es opcional — si preferís, podés avanzar directamente.
                          </p>

                          {selectedTopics.map((topic, i) => {
                            const hasResponse = !!(priorityResponses[topic.id]?.trim());
                            const isOpen = expandedTopic === `deep-${topic.id}`;

                            return (
                              <div key={topic.id}>
                                <button
                                  onClick={() =>
                                    setExpandedTopic(isOpen ? null : `deep-${topic.id}`)
                                  }
                                  className={`w-full text-left px-4 py-3 border transition-all duration-200 flex items-center justify-between ${
                                    hasResponse
                                      ? "border-cejop-blue/40 bg-cejop-blue/10"
                                      : isOpen
                                        ? "border-white/25 bg-white/[0.08]"
                                        : "border-white/10 bg-white/[0.04] hover:border-white/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="shrink-0 w-6 h-6 bg-cejop-blue text-white text-[10px] font-montserrat font-bold flex items-center justify-center">
                                      {i + 1}
                                    </span>
                                    <span className="font-montserrat font-bold text-[13px] text-white">
                                      {topic.label}
                                    </span>
                                  </div>
                                  {hasResponse ? (
                                    <CheckCircle size={14} className="text-cejop-blue-light shrink-0" />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className={`shrink-0 text-white/30 transition-transform duration-200 ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {isOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="border border-t-0 border-white/15 bg-white/[0.05] px-4 py-3 space-y-3">
                                        <p className="font-source text-[13px] text-white/50 leading-relaxed">
                                          {topic.question}
                                        </p>
                                        <textarea
                                          value={priorityResponses[topic.id] || ""}
                                          onChange={(e) =>
                                            handlePriorityResponse(topic.id, e.target.value)
                                          }
                                          rows={2}
                                          placeholder="¿Qué cambiarías concretamente?"
                                          className="w-full bg-white/[0.07] border border-white/15 text-white placeholder-white/25 px-4 py-3 font-source text-[14px] focus:outline-none focus:border-cejop-blue-light/60 focus:bg-white/10 transition-all resize-none rounded-none"
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Step 6: Optional open-ended */}
                      {currentStep === 6 && (
                        <>
                          <TextArea
                            label="¿Hay alguna temática que no esté en la lista y que considerés prioritaria?"
                            name="otraPreocupacion"
                            value={form.otraPreocupacion}
                            onChange={handleChange}
                            placeholder="Este campo es opcional. Si las temáticas anteriores cubrieron tus inquietudes, podés enviar directamente."
                            rows={4}
                          />
                          <p className="font-source text-xs text-white/40 leading-relaxed pt-2">
                            Esta información nos permite construir una agenda de
                            formación alineada con las prioridades reales de los
                            jóvenes tucumanos.
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
                        {submitting ? "Enviando..." : isLastStep ? "Enviar encuesta" : "Siguiente"}
                        {!submitting && (
                          <ArrowRight
                            size={16}
                            className={`transition-transform ${canAdvance() ? "group-hover:translate-x-1" : ""}`}
                          />
                        )}
                      </button>
                      {submitError && (
                        <p className="font-source text-xs text-red-400 text-center mt-2">
                          {submitError}
                        </p>
                      )}
                    </div>

                    {/* Step dots (exclude intro) */}
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
