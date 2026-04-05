// GA4 custom events for CEJOP Tucumán
// All events are no-ops if gtag is not loaded

type GtagEvent = {
  action: string;
  params?: Record<string, string | number>;
};

function sendEvent({ action, params }: GtagEvent) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}

// ── Funnel events ──

export function trackCtaClick(label: string) {
  sendEvent({ action: "cta_click", params: { cta_label: label } });
}

export function trackEncuestaStart() {
  sendEvent({ action: "encuesta_start" });
}

export function trackEncuestaStep(step: number, stepName: string) {
  sendEvent({
    action: "encuesta_step",
    params: { step_number: step, step_name: stepName },
  });
}

export function trackEncuestaSubmit() {
  sendEvent({ action: "encuesta_submit" });
}

export function trackEncuestaDuplicate() {
  sendEvent({ action: "encuesta_duplicate" });
}

export function trackEncuestaBlocked() {
  sendEvent({ action: "encuesta_blocked" });
}

// ── Engagement events ──

export function trackFaqOpen(question: string) {
  sendEvent({ action: "faq_open", params: { question } });
}

export function trackScrollSection(section: string) {
  sendEvent({ action: "scroll_section", params: { section } });
}
