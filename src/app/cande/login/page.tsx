"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginInner() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const error = params.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/cande/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cejop-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-montserrat text-2xl font-bold text-white text-center mb-2">
          Panel interno CEJOP
        </h1>
        <p className="text-center text-white/60 text-sm mb-8">
          Ingresá tu email para recibir un link de acceso.
        </p>

        {sent ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
            <p className="text-white text-sm leading-relaxed">
              Si tu email está autorizado, te llega un link en los próximos
              minutos. Revisá tu casilla (y la carpeta de spam por las dudas).
            </p>
            <p className="text-white/50 text-xs mt-3">
              El link vence en 15 minutos y se usa una sola vez.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cejop-blue transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {error === "expired" && (
              <p className="text-amber-300 text-sm text-center">
                Ese link venció o ya fue usado. Pedí uno nuevo.
              </p>
            )}
            {error === "invalid" && (
              <p className="text-red-400 text-sm text-center">
                Link inválido. Pedí uno nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cejop-blue hover:bg-cejop-blue/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CandeLogin() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
