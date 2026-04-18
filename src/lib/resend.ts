import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no está configurada");
  if (!cached) cached = new Resend(key);
  return cached;
}

export const FROM =
  process.env.RESEND_FROM_EMAIL || "CEJOP Tucumán <hola@cejoptucuman.com>";

export const LANDING_URL = "https://cejoptucuman.com";
export const LOGO_URL = `${LANDING_URL}/icon-512.png`;
export const INSTAGRAM_URL = "https://www.instagram.com/cejoptucuman";
