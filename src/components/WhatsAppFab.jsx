import React, { useEffect, useMemo, useRef, useState } from "react";

const WAPP_BASE_MOBILE = "https://wa.me";
const WAPP_BASE_DESKTOP = "https://web.whatsapp.com/send";

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

const enc = (s) => encodeURIComponent((s || "").trim());

// Definición base de servicios (la podés extraer a un utils/data después)
const SERVICIOS = [
  {
    id: "urgencias",
    label: "Urgencias 24 horas",
    intro: "Apertura de puertas y soluciones rápidas todos los días.",
    placeholderDetalle:
      "Ej: quedé afuera de casa/departamento, puerta principal, llave del lado de adentro…",
    tipo: "general",
  },
  {
    id: "reparaciones",
    label: "Reparaciones de cerraduras",
    intro: "Cerraduras que se traban, giran en falso o quedaron dañadas.",
    placeholderDetalle:
      "Ej: cerradura se traba al girar, puerta de madera/chapa/blindada, marca si la sabés…",
    tipo: "general",
  },
  {
    id: "cristal",
    label: "Puertas de cristal y frentes vidriados",
    intro: "Puertas de vidrio templado y frentes de locales comerciales.",
    placeholderDetalle:
      "Ej: puerta blindex de local, bisagra dañada, hoja no cierra bien, zona y referencia…",
    tipo: "general",
  },
  {
    id: "herrajes",
    label: "Herrajes y cerraduras",
    intro: "Cilindros, picaportes, cerraduras adicionales y refuerzos.",
    placeholderDetalle:
      "Ej: cambio de cilindro, agregado de cerradura de seguridad, cantidad de puertas…",
    tipo: "general",
  },
  {
    id: "cierrapuertas",
    label: "Cierra puertas de piso / aéreos",
    intro: "Instalación y regulación de cierra puertas para edificios y locales.",
    placeholderDetalle:
      "Ej: puerta de edificio, cierra muy fuerte o no llega a cerrar, cantidad de puertas…",
    tipo: "general",
  },
  {
    id: "vehiculos",
    label: "Apertura de vehículos",
    intro: "Apertura de autos y utilitarios con llave adentro, sin rotura.",
    placeholderDetalle:
      "Ej: auto 4 puertas, marca, modelo, año, si está en la calle o en garage, altura exacta…",
    tipo: "vehiculo",
  },
];

// Mensaje con negritas/cursivas y bloques bien separados
function buildWhatsAppMessage({
  servicio,
  isVehiculo,
  tipoLugar,
  tipoVehiculo,
  zona,
  detalle,
  nombre,
  telefono,
  businessName,
  pageTitle,
  pageUrl,
}) {
  const lineas = [];

  lineas.push("*Solicitud de servicio de cerrajería*");
  lineas.push("");
  lineas.push(`*Servicio:* ${servicio.label}`);

  if (!isVehiculo && tipoLugar) {
    lineas.push(`*Tipo de lugar:* ${tipoLugar}`);
  }
  if (isVehiculo && tipoVehiculo) {
    lineas.push(`*Tipo de vehículo:* ${tipoVehiculo}`);
  }

  lineas.push(`*Zona/barrio:* ${zona.trim()}`);
  lineas.push("");
  lineas.push(`*Nombre de contacto:* ${nombre.trim()}`);
  lineas.push(`*Teléfono de contacto:* ${telefono.trim()}`);

  if (detalle && detalle.trim()) {
    lineas.push("");
    lineas.push("*Detalle del trabajo:*");
    lineas.push(`_${detalle.trim()}_`);
  }

  lineas.push("");
  lineas.push(`_Enviado desde ${businessName}_`);
  if (pageTitle) lineas.push(`_Página:_ ${pageTitle}`);
  if (pageUrl) lineas.push(`_Link:_ ${pageUrl}`);

  return lineas.join("\n");
}

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
  const [step, setStep] = useState("servicio"); // "servicio" | "form"

  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Estado del formulario
  const [servicioId, setServicioId] = useState(SERVICIOS[0].id);
  const [zona, setZona] = useState("");
  const [detalle, setDetalle] = useState("");
  const [tipoLugar, setTipoLugar] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const [errorZona, setErrorZona] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");

  const finalPhone = useMemo(() => {
    const envNumber =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.PUBLIC_WHATSAPP_NUMBER;

    return (
      (whatsappNumber && whatsappNumber.trim()) ||
      (phone && phone.trim()) ||
      (envNumber && String(envNumber).trim()) ||
      "5491162181863"
    );
  }, [whatsappNumber, phone]);

  const pageTitle = typeof document !== "undefined" ? document.title : "";
  const pageUrl = typeof location !== "undefined" ? location.href : "";

  const baseUrl = isMobile()
    ? `${WAPP_BASE_MOBILE}/${finalPhone}`
    : `${WAPP_BASE_DESKTOP}?phone=${finalPhone}`;

  const servicio =
    SERVICIOS.find((s) => s.id === servicioId) ?? SERVICIOS[0];
  const isVehiculo = servicio.tipo === "vehiculo";

  // Cerrar con click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!open) return;
      const p = panelRef.current;
      const b = btnRef.current;
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) {
        setOpen(false);
        setStep("servicio");
      }
    };
    document.addEventListener("pointerdown", onClickOutside);
    return () => document.removeEventListener("pointerdown", onClickOutside);
  }, [open]);

  const onKey = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setStep("servicio");
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const containerStyle = useMemo(
    () => ({
      bottom: `calc(${bottomOffsetPx}px + env(safe-area-inset-bottom, 0px))`,
      right: `calc(${rightOffsetPx}px + env(safe-area-inset-right, 0px))`,
    }),
    [bottomOffsetPx, rightOffsetPx]
  );

  if (!finalPhone) return null;

  function handleSubmit(e) {
    e.preventDefault();

    let hasError = false;

    if (!nombre.trim()) {
      setErrorNombre("Indicá el nombre de contacto.");
      hasError = true;
    } else setErrorNombre("");

    if (!telefono.trim()) {
      setErrorTelefono("Indicá un teléfono de contacto.");
      hasError = true;
    } else setErrorTelefono("");

    if (!zona.trim()) {
      setErrorZona("Indicá al menos el barrio o zona.");
      hasError = true;
    } else setErrorZona("");

    if (hasError) return;

    const composed = buildWhatsAppMessage({
      servicio,
      isVehiculo,
      tipoLugar,
      tipoVehiculo,
      zona,
      detalle,
      nombre,
      telefono,
      businessName,
      pageTitle,
      pageUrl,
    });

    const utm =
      "utm_source=site&utm_medium=fab-panel&utm_campaign=whatsapp";

    const url = isMobile()
      ? `${baseUrl}?text=${enc(composed)}&app_absent=0&${utm}`
      : `${baseUrl}&text=${enc(composed)}&${utm}`;

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    setOpen(false);
    setStep("servicio");
  }

  return (
    <div
      className="fixed z-900 select-none"
      style={containerStyle}
      aria-live="polite"
    >
      <div className="relative">
        {showHelperLabel && (
          <div
            className={[
              "hidden sm:inline-flex max-w-xs items-center justify-center",
              "absolute -top-9 right-0",
              "rounded-full border border-amber-400/70 bg-slate-950/95 px-3 py-1.5",
              "text-xs font-medium text-amber-100 shadow-lg",
            ].join(" ")}
          >
            ¿Necesitás ayuda?
          </div>
        )}

        {/* PANEL flotante (2 pasos) */}
        <form
          ref={panelRef}
          role="dialog"
          aria-hidden={!open}
          onSubmit={step === "form" ? handleSubmit : undefined}
          className={[
            "absolute bottom-14 right-0 origin-bottom-right",
            "w-[min(92vw,320px)]",
            "rounded-2xl border border-slate-800 bg-slate-950/98",
            "p-3 shadow-2xl ring-1 ring-black/40 backdrop-blur",
            "motion-safe:transition-all motion-safe:duration-150",
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 translate-y-2 scale-95",
          ].join(" ")}
          style={{ transformOrigin: "bottom right" }}
        >
          {/* Paso 1: elegir servicio */}
          {step === "servicio" && (
            <>
              <p className="mb-2 text-[0.78rem] font-medium text-slate-200">
                Elegí el tipo de servicio y después completás tus datos.
              </p>

              <div className="grid gap-1.5 max-h-72 overflow-y-auto pr-1">
                {SERVICIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setServicioId(s.id);
                      setStep("form");
                    }}
                    className={[
                      "flex items-start gap-2 rounded-xl border px-2.5 py-2 text-left",
                      servicioId === s.id
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-slate-700 bg-slate-950 hover:border-amber-300/70",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border text-[0.6rem]",
                        servicioId === s.id
                          ? "border-amber-300 bg-amber-400 text-slate-950"
                          : "border-slate-500 text-slate-300",
                      ].join(" ")}
                    >
                      {servicioId === s.id ? "✓" : ""}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[0.78rem] font-semibold text-slate-50">
                        {s.label}
                      </span>
                      <span className="block text-[0.7rem] text-slate-300">
                        {s.intro}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Paso 2: formulario del servicio */}
          {step === "form" && (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep("servicio")}
                  className="rounded-full border border-slate-700 px-2 py-1 text-[0.7rem] text-slate-200 hover:border-amber-300/80"
                >
                  ← Cambiar servicio
                </button>
                <div className="text-right">
                  <p className="text-[0.7rem] uppercase tracking-wide text-amber-300">
                    Servicio elegido
                  </p>
                  <p className="text-[0.8rem] font-semibold text-slate-50">
                    {servicio.label}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {!isVehiculo ? (
                  <label className="block text-[0.72rem] font-medium text-slate-200">
                    Tipo de lugar
                    <select
                      value={tipoLugar}
                      onChange={(e) => setTipoLugar(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[0.78rem]
                                 text-slate-50 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="">Seleccionar…</option>
                      <option value="Casa / departamento">
                        Casa / departamento
                      </option>
                      <option value="Local / comercio">Local / comercio</option>
                      <option value="Consorcio / edificio">
                        Consorcio / edificio
                      </option>
                      <option value="Otro">Otro</option>
                    </select>
                  </label>
                ) : (
                  <label className="block text-[0.72rem] font-medium text-slate-200">
                    Tipo de vehículo
                    <select
                      value={tipoVehiculo}
                      onChange={(e) => setTipoVehiculo(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[0.78rem]
                                 text-slate-50 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="">Seleccionar…</option>
                      <option value="Auto">Auto</option>
                      <option value="Utilitario">Utilitario</option>
                      <option value="Moto">Moto</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </label>
                )}

                <label className="block text-[0.72rem] font-medium text-slate-200">
                  Zona / barrio <span className="text-amber-300">*</span>
                  <input
                    type="text"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[0.78rem]
                               text-slate-50 placeholder:text-slate-500
                               focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    placeholder="Ej: La Boca, Barracas, San Telmo…"
                  />
                  {errorZona && (
                    <span className="mt-1 block text-[0.7rem] text-amber-300">
                      {errorZona}
                    </span>
                  )}
                </label>

                <label className="block text-[0.72rem] font-medium text-slate-200">
                  Nombre de contacto <span className="text-amber-300">*</span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[0.78rem]
                               text-slate-50 placeholder:text-slate-500
                               focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    placeholder="Ej: Cristian"
                  />
                  {errorNombre && (
                    <span className="mt-1 block text-[0.7rem] text-amber-300">
                      {errorNombre}
                    </span>
                  )}
                </label>

                <label className="block text-[0.72rem] font-medium text-slate-200">
                  Teléfono de contacto{" "}
                  <span className="text-amber-300">*</span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[0.78rem]
                               text-slate-50 placeholder:text-slate-500
                               focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    placeholder="Ej: 11 6218 1863"
                  />
                  {errorTelefono && (
                    <span className="mt-1 block text-[0.7rem] text-amber-300">
                      {errorTelefono}
                    </span>
                  )}
                </label>

                <label className="block text-[0.72rem] font-medium text-slate-200">
                  Detalle (opcional)
                  <textarea
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    rows={2}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[0.78rem]
                               text-slate-50 placeholder:text-slate-500
                               focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    placeholder={servicio.placeholderDetalle}
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-amber-400 px-4 py-2.5
                             text-[0.8rem] font-semibold text-slate-950 shadow-lg
                             hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Enviar a WhatsApp
                </button>
                <a
                  href={`tel:${callNumber}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-amber-400/70 px-4 py-2.5
                             text-[0.8rem] font-semibold text-amber-200
                             hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Llamar ahora
                </a>
              </div>

              <p className="mt-2 text-[0.68rem] text-slate-400">
                El chat se abre con la información completa. Solo tenés que
                tocar enviar.
              </p>
            </>
          )}
        </form>

        {/* FAB principal (posición fija, siempre igual) */}
        <button
          ref={btnRef}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) setStep("servicio");
          }}
          onKeyDown={onKey}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={
            open
              ? "Cerrar opciones de contacto por WhatsApp"
              : "Abrir formulario de WhatsApp"
          }
          className={[
            "relative inline-flex items-center gap-2 rounded-full",
            "h-11 px-4 sm:h-12 sm:px-5",
            "border border-amber-400/80 bg-slate-950/95",
            "text-xs sm:text-sm font-semibold text-amber-100",
            "shadow-[0_12px_30px_rgba(251,191,36,0.25)]",
            "hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
            "motion-safe:transition-transform motion-safe:duration-150 hover:scale-[1.03] active:scale-95",
          ].join(" ")}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="h-4 w-4 text-white"
            >
              <path
                d="M16 3C9.383 3 4 8.383 4 15c0 2.09.527 4.057 1.453 5.79L4 29l8.454-1.38C14.172 28.482 15.055 28.6 16 28.6c6.617 0 12-5.383 12-12S22.617 3 16 3Z"
                fill="currentColor"
              />
              <path
                d="M11.9 9.7c-.211-.493-.43-.503-.63-.511-.163-.006-.349-.012-.537-.012-.188 0-.494.07-.753.35-.26.28-.99.968-.99 2.362 0 1.394 1.015 2.741 1.156 2.93.142.189 2.002 3.208 4.951 4.369 2.451.969 2.95.775 3.483.726.533-.05 1.716-.7 1.96-1.374.244-.674.244-1.25.171-1.373-.073-.123-.27-.197-.563-.345-.294-.148-1.738-.858-2.007-.956-.268-.099-.464-.148-.66.148-.197.296-.756.956-.927 1.154-.171.197-.342.222-.635.074-.294-.148-1.24-.457-2.363-1.454-.874-.78-1.463-1.742-1.634-2.038-.171-.296-.018-.456.13-.603.134-.133.297-.346.445-.519.148-.173.197-.296.296-.494.099-.197.05-.37-.025-.518-.074-.148-.646-1.569-.883-2.144Z"
                fill="#0F172A"
              />
            </svg>
          </span>

          <span className="hidden sm:inline">WhatsApp</span>
          <span className="inline sm:hidden">Chat</span>
        </button>
      </div>
    </div>
  );
}

