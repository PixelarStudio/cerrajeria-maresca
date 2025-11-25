import React, { useEffect, useMemo, useRef, useState } from "react";

const WAPP_BASE_MOBILE = "https://wa.me";
const WAPP_BASE_DESKTOP = "https://web.whatsapp.com/send";

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

const enc = (s) => encodeURIComponent((s || "").replace(/\s+/g, " ").trim());

// Motivos + placeholders específicos por tipo de consulta (step 1)
const CONSULTAS = [
  {
    id: "afuera",
    label: "Quedé afuera de casa/departamento",
    baseText: "Hola, quedé afuera de casa/departamento y necesito abrir la puerta.",
    detallePlaceholder: "Ej: puerta blindada/madera, llave puesta adentro, piso, etc.",
  },
  {
    id: "cerradura",
    label: "Problema con la cerradura",
    baseText: "Hola, tengo un problema con la cerradura (se traba, gira en falso o no abre).",
    detallePlaceholder: "Ej: se traba al girar, gira en falso, no cierra bien, tipo de puerta, etc.",
  },
  {
    id: "vehiculo",
    label: "Abrir vehículo",
    baseText: "Hola, necesito abrir mi vehículo.",
    detallePlaceholder: "Ej: modelo, año, color, si está en la calle o garaje, etc.",
  },
  {
    id: "presupuesto",
    label: "Presupuesto para local/consorcio",
    baseText: "Hola, necesito un presupuesto de cerrajería para un local/comercio o consorcio.",
    detallePlaceholder: "Ej: cantidad de puertas, tipo de cerraduras, dirección aproximada, etc.",
  },
];

const initialForm = {
  nombre: "",
  zona: "",
  detalle: "",
};

export default function WhatsAppFab({
  whatsappNumber,
  phone,
  businessName = "Cerrajería Maresca",
  callNumber = "+541162181863",
  bottomOffsetPx = 16,
  rightOffsetPx = 16,
  showHelperLabel = true,
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("menu"); // "menu" | "form"
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Número final de WhatsApp:
  // 1) whatsappNumber (prop)  2) phone (prop)  3) fallback fijo
  const finalPhone =
    (whatsappNumber && whatsappNumber.trim()) ||
    (phone && phone.trim()) ||
    "5491162181863";

  const pageTitle = typeof document !== "undefined" ? document.title : "";
  const pageUrl = typeof location !== "undefined" ? location.href : "";

  const baseUrl = isMobile()
    ? `${WAPP_BASE_MOBILE}/${finalPhone}`
    : `${WAPP_BASE_DESKTOP}?phone=${finalPhone}`;

  const selectedConsulta =
    CONSULTAS.find((c) => c.id === selectedId) ?? CONSULTAS[0];

  function buildLink() {
    const lines = [
      selectedConsulta.baseText,
      "",
      form.detalle ? `Detalle: ${form.detalle}` : null,
      form.zona ? `Zona/barrio: ${form.zona}` : null,
      form.nombre ? `Nombre: ${form.nombre}` : null,
      "",
      `Sitio: ${businessName}`,
      `Página: ${pageTitle}`,
      `Link: ${pageUrl}`,
    ].filter(Boolean);

    const composed = lines.join("\n");
    const utm = "utm_source=site&utm_medium=fab&utm_campaign=whatsapp";

    return isMobile()
      ? `${baseUrl}?text=${enc(composed)}&app_absent=0&${utm}`
      : `${baseUrl}&text=${enc(composed)}&${utm}`;
  }

  // Reset de estado al cerrar
  const resetState = () => {
    setStep("menu");
    setSelectedId(null);
    setForm(initialForm);
    setErrors({});
  };

  // Cerrar con click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!open) return;
      const p = panelRef.current;
      const b = btnRef.current;
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) {
        setOpen(false);
        resetState();
      }
    };
    document.addEventListener("pointerdown", onClickOutside);
    return () => document.removeEventListener("pointerdown", onClickOutside);
  }, [open]);

  // Teclado
  const onKey = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      resetState();
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
      if (!open) {
        resetState();
      }
    }
  };

  // Posición segura (incluye safe-area)
  const containerStyle = useMemo(
    () => ({
      bottom: `calc(${bottomOffsetPx}px + env(safe-area-inset-bottom, 0px))`,
      right: `calc(${rightOffsetPx}px + env(safe-area-inset-right, 0px))`,
    }),
    [bottomOffsetPx, rightOffsetPx]
  );

  if (!finalPhone) return null;

  const handleSelectConsulta = (id) => {
    setSelectedId(id);
    setStep("form");
    setForm(initialForm);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.zona.trim()) nextErrors.zona = "Indicá al menos el barrio o zona.";
    if (!form.detalle.trim()) nextErrors.detalle = "Contá brevemente qué pasó.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const url = buildLink();
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    resetState();
  };

  return (
    <div
      className="fixed z-[1000] select-none"
      style={containerStyle}
      aria-live="polite"
    >
      <div className="relative">
        {/* Etiqueta guía (en rojo, acorde al resto del sitio) */}
        {showHelperLabel && (
          <div
            className={[
              "absolute -top-10 right-0",
              "inline-flex items-center rounded-full bg-red-700 text-white",
              "text-xs sm:text-sm font-semibold shadow-lg px-3 py-1.5",
            ].join(" ")}
          >
            ¿Necesitás un cerrajero?
          </div>
        )}

        {/* Panel flotante: fondo oscuro + acento rojo */}
        <div
          ref={panelRef}
          role="menu"
          aria-hidden={!open}
          className={[
            "absolute bottom-[4.5rem] right-0 origin-bottom-right",
            "rounded-2xl border border-red-900/60 bg-slate-950 shadow-2xl",
            "p-3 sm:p-4",
            "w-[min(92vw,380px)]",
            "motion-safe:transition-all motion-safe:duration-150",
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 translate-y-2 scale-95",
          ].join(" ")}
          style={{ transformOrigin: "bottom right" }}
        >
          {step === "menu" && (
            <div className="grid gap-2 text-slate-50">
              {CONSULTAS.map((o) => (
                <button
                  key={o.id}
                  role="menuitem"
                  onClick={() => handleSelectConsulta(o.id)}
                  className="w-full text-left rounded-xl px-4 py-3.5 sm:py-4
                             bg-slate-900/80 border border-red-900/50
                             text-[0.9rem] sm:text-base leading-snug text-slate-50
                             flex items-center gap-3
                             hover:bg-slate-900 hover:border-red-500
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  style={{ minHeight: 56 }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-red-200 text-sm font-semibold"
                  >
                    •
                  </span>
                  <span className="flex-1 font-medium">{o.label}</span>
                </button>
              ))}

              {/* Llamar por teléfono */}
              <a
                href={`tel:${callNumber}`}
                className="w-full text-center rounded-xl px-4 py-4 sm:py-5
                           bg-red-600 text-white font-bold text-base sm:text-lg leading-snug
                           shadow-lg hover:bg-red-700
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 border border-red-800"
                style={{ minHeight: 56 }}
                role="menuitem"
              >
                Llamar a la cerrajería
              </a>

              <p className="mt-2 text-[0.7rem] text-slate-400 text-center px-1">
                Priorizamos urgencias (personas afuera o puertas trabadas).
              </p>
            </div>
          )}

          {step === "form" && (
            <form
              onSubmit={handleSubmitForm}
              noValidate
              className="space-y-3 text-sm text-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">
                    Consulta
                  </p>
                  <p className="text-sm font-semibold">{selectedConsulta.label}</p>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-[0.75rem] font-medium text-red-300 hover:text-red-200"
                >
                  ← Cambiar
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[0.75rem] font-medium text-slate-200">
                  Nombre (opcional)
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm
                               text-slate-50 placeholder:text-slate-500
                               focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    autoComplete="name"
                  />
                </label>

                <label className="block text-[0.75rem] font-medium text-slate-200">
                  Zona / barrio <span className="text-red-400">*</span>
                  <input
                    name="zona"
                    value={form.zona}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm
                               text-slate-50 placeholder:text-slate-500
                               focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                  {errors.zona && (
                    <span className="mt-1 block text-[0.7rem] text-red-400">
                      {errors.zona}
                    </span>
                  )}
                </label>

                <label className="block text-[0.75rem] font-medium text-slate-200">
                  Contanos qué pasó <span className="text-red-400">*</span>
                  <textarea
                    name="detalle"
                    value={form.detalle}
                    onChange={handleChange}
                    rows={3}
                    placeholder={selectedConsulta.detallePlaceholder}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm
                               text-slate-50 placeholder:text-slate-500
                               focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                    required
                  />
                  {errors.detalle && (
                    <span className="mt-1 block text-[0.7rem] text-red-400">
                      {errors.detalle}
                    </span>
                  )}
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white
                           shadow-lg hover:bg-red-700
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Enviar por WhatsApp
              </button>
            </form>
          )}
        </div>

        {/* FAB principal en rojo, simple, sin halo raro */}
        <button
          ref={btnRef}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) {
              resetState();
            }
          }}
          onKeyDown={onKey}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={
            open
              ? "Cerrar opciones de contacto por WhatsApp"
              : "Abrir opciones de contacto por WhatsApp"
          }
          className={[
            "relative inline-flex items-center justify-center rounded-full",
            "h-16 w-16 sm:h-[68px] sm:w-[68px]",
            "bg-red-600 hover:bg-red-700 text-white",
            "shadow-2xl",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
            "motion-safe:transition-transform motion-safe:duration-150 hover:scale-[1.04] active:scale-95",
          ].join(" ")}
        >
          {/* Ícono WhatsApp (verde clásico, que es el único acento fuera de la paleta) */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="w-g" x1="26" y1="6" x2="6" y2="26">
                <stop stopColor="#25D366" />
                <stop offset="1" stopColor="#128C7E" />
              </linearGradient>
            </defs>
            <path
              d="M16 3C9.383 3 4 8.383 4 15c0 2.09.527 4.057 1.453 5.79L4 29l8.454-1.38C14.172 28.482 15.055 28.6 16 28.6c6.617 0 12-5.383 12-12S22.617 3 16 3Z"
              fill="url(#w-g)"
            />
            <path
              d="M11.9 9.7c-.211-.493-.43-.503-.63-.511-.163-.006-.349-.012-.537-.012-.188 0-.494.07-.753.35-.26.28-.99.968-.99 2.362 0 1.394 1.015 2.741 1.156 2.93.142.189 2.002 3.208 4.951 4.369 2.451.969 2.95.775 3.483.726.533-.05 1.716-.7 1.96-1.374.244-.674.244-1.25.171-1.373-.073-.123-.27-.197-.563-.345-.294-.148-1.738-.858-2.007-.956-.268-.099-.464-.148-.66.148-.197.296-.756.956-.927 1.154-.171.197-.342.222-.635.074-.294-.148-1.24-.457-2.363-1.454-.874-.78-1.463-1.742-1.634-2.038-.171-.296-.018-.456.13-.603.134-.133.297-.346.445-.519.148-.173.197-.296.296-.494.099-.197.05-.37-.025-.518-.074-.148-.646-1.569-.883-2.144Z"
              fill="#fff"
            />
          </svg>

          {/* Etiqueta pequeña en XS */}
          <span className="absolute -top-9 right-1 bg-slate-950/90 text-white text-xs font-semibold rounded px-2 py-1 sm:hidden">
            WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
}
