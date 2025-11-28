import React, { useMemo, useState } from "react";

const WAPP_BASE_MOBILE = "https://wa.me";
const WAPP_BASE_DESKTOP = "https://web.whatsapp.com/send";

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

const enc = (s) => encodeURIComponent((s || "").trim());

// === SERVICIOS: ahora son 7 ===
const SERVICIOS = [
  {
    id: "urgencias24",
    label: "Urgencias 24 horas",
    baseText:
      "Hola, necesito una atención de cerrajería de urgencia (24 horas).",
    placeholder:
      "Ej: quedé afuera de casa/departamento, puerta principal, piso, referencia de calle…",
    defaultTipoLugar: "casa",
  },
  {
    id: "reparaciones",
    label: "Reparaciones de cerraduras",
    baseText:
      "Hola, necesito reparar una cerradura que se traba, gira en falso o no abre bien.",
    placeholder:
      "Ej: cerradura de puerta de entrada, gira en falso, marca si la sabés, tiempo de uso…",
    defaultTipoLugar: "casa",
  },
  {
    id: "cristal",
    label: "Puertas de cristal templado",
    baseText:
      "Hola, necesito servicio de cerrajería en una puerta de cristal templado.",
    placeholder:
      "Ej: puerta de cristal templado de local, tipo de cerradura, si tiene cierrapuerta de piso, dirección…",
    defaultTipoLugar: "local",
  },

  // === NUEVO SERVICIO (añadido sin tocar nada más) ===
  {
    id: "frentesVidriados",
    label: "Frentes vidriados y locales",
    baseText:
      "Hola, necesito asistencia en un frente vidriado o cerradura de local comercial.",
    placeholder:
      "Ej: cerradura de blindex, herraje inferior, desalineado, local en galería o calle…",
    defaultTipoLugar: "local",
  },

  {
    id: "herrajes",
    label: "Herrajes y cerraduras",
    baseText:
      "Hola, necesito asesoramiento o cambio de herrajes/cerraduras para mejorar la seguridad.",
    placeholder:
      "Ej: cantidad de puertas, tipo de cerraduras actuales, si es vivienda, local o consorcio…",
    defaultTipoLugar: "casa",
  },
  {
    id: "cierrapuertas",
    label: "Máquinas cierrapuerta de piso",
    baseText:
      "Hola, necesito instalar o regular máquinas cierrapuerta de piso.",
    placeholder:
      "Ej: edificio o local, cantidad de puertas, si ya hay cierrapuerta instalado, dirección…",
    defaultTipoLugar: "consorcio",
  },
  {
    id: "vehiculos",
    label: "Apertura de vehículos",
    baseText: "Hola, necesito abrir mi vehículo sin romper la cerradura.",
    placeholder:
      "Ej: auto 4 puertas, marca, modelo, año, si está en la calle o en garage…",
    defaultTipoLugar: "vehiculo",
  },
];

const TIPO_LUGAR_OPCIONES = [
  { value: "", label: "Seleccionar..." },
  { value: "casa", label: "Casa / departamento" },
  { value: "local", label: "Local comercial" },
  { value: "consorcio", label: "Consorcio / edificio" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "otro", label: "Otro" },
];

export default function AtencionInmediataCard({
  businessName = "Cerrajería Maresca",
  whatsappNumber,
}) {
  const [step, setStep] = useState(1);
  const [servicioId, setServicioId] = useState(SERVICIOS[0].id);

  const [tipoLugar, setTipoLugar] = useState("");
  const [zona, setZona] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [detalle, setDetalle] = useState("");

  const [errorTipoLugar, setErrorTipoLugar] = useState("");
  const [errorZona, setErrorZona] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");

  const pageTitle = typeof document !== "undefined" ? document.title : "";
  const pageUrl = typeof location !== "undefined" ? location.href : "";

  const finalPhone = useMemo(() => {
    const envNumber =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.PUBLIC_WHATSAPP_NUMBER;

    return (
      (whatsappNumber && whatsappNumber.trim()) ||
      (envNumber && String(envNumber).trim()) ||
      "5491133164381" // ← ESTE ES EL PRINCIPAL (3316)
    );
  }, [whatsappNumber]);

  const baseUrl = isMobile()
    ? `${WAPP_BASE_MOBILE}/${finalPhone}`
    : `${WAPP_BASE_DESKTOP}?phone=${finalPhone}`;

  const selectedServicio =
    SERVICIOS.find((s) => s.id === servicioId) ?? SERVICIOS[0];

  if (!finalPhone) return null;

  const handleServicioClick = (id) => {
    const servicio = SERVICIOS.find((s) => s.id === id);
    setServicioId(id);
    if (servicio && !tipoLugar) {
      setTipoLugar(servicio.defaultTipoLugar || "");
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hayError = false;

    if (!tipoLugar) {
      setErrorTipoLugar("Elegí el tipo de lugar.");
      hayError = true;
    } else setErrorTipoLugar("");

    if (!zona.trim()) {
      setErrorZona("Indicá al menos el barrio o zona.");
      hayError = true;
    } else setErrorZona("");

    if (!nombreContacto.trim()) {
      setErrorNombre("Indicá el nombre de contacto.");
      hayError = true;
    } else setErrorNombre("");

    if (!telefonoContacto.trim()) {
      setErrorTelefono("Indicá un teléfono de contacto.");
      hayError = true;
    } else setErrorTelefono("");

    if (hayError) return;

    const tipoLugarLabel =
      TIPO_LUGAR_OPCIONES.find((o) => o.value === tipoLugar)?.label ||
      tipoLugar;

    const partes = [
      "*Solicitud de servicio de cerrajería*",
      "",
      `*Servicio:* ${selectedServicio.label}`,
      `*Tipo de lugar:* ${tipoLugarLabel}`,
      `*Zona / barrio:* ${zona.trim()}`,
      `*Nombre de contacto:* ${nombreContacto.trim()}`,
      `*Teléfono de contacto:* ${telefonoContacto.trim()}`,
      detalle.trim()
        ? `\n*Detalle del trabajo:*\n_${detalle.trim()}_`
        : null,
      "",
      `_Enviado desde ${businessName}_`,
      pageTitle ? `_Página:_ ${pageTitle}` : null,
      pageUrl ? `_Link:_ ${pageUrl}` : null,
    ].filter(Boolean);

    const composed = partes.join("\n");

    const url = isMobile()
      ? `${baseUrl}?text=${enc(composed)}&app_absent=0`
      : `${baseUrl}&text=${enc(composed)}`;

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      aria-label="Atención inmediata por WhatsApp"
      className={[
        "relative w-full max-w-md rounded-3xl border border-amber-400/30",
        "bg-[radial-gradient(circle_at_top,#A43B1D_0,#292E65_52%,#212551_100%)]",
        "p-4 sm:p-6 text-slate-50 shadow-xl",
        "min-h-[440px] sm:min-h-[460px]",
        "flex flex-col gap-3",
      ].join(" ")}
    >
      {/* HEADER */}
      <header className="mb-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-amber-300">
              Atención inmediata
            </p>
            <p className="text-base sm:text-lg font-semibold">
              Contanos qué necesitás
            </p>
            <p className="mt-1 max-w-xs text-[0.75rem] text-slate-300">
              La Boca y alrededores. Priorizamos urgencias y personas afuera.
            </p>
          </div>
        </div>
      </header>

      {/* CUERPO */}
      <div className="flex-1 overflow-hidden">
        {step === 1 ? (
          <div className="flex h-full flex-col gap-3">
            <p className="text-[0.75rem] font-medium text-slate-200">
              Elegí el servicio de cerrajería
            </p>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleServicioClick(s.id)}
                    className={[
                      "flex items-center gap-2 rounded-2xl border px-3 py-2 text-left",
                      servicioId === s.id
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-slate-700 bg-slate-900/70 hover:border-amber-300/70",
                      "text-[0.8rem] sm:text-[0.85rem]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.7rem]",
                        servicioId === s.id
                          ? "border-amber-300 bg-amber-400 text-slate-950"
                          : "border-slate-500 text-slate-300",
                      ].join(" ")}
                    >
                      {servicioId === s.id ? "✓" : ""}
                    </span>
                    <span className="flex-1">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-1 w-full rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg hover:bg-amber-300"
            >
              Continuar con los datos
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex h-full flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[0.7rem]">
                <p className="font-semibold text-amber-200">MOTIVO ELEGIDO</p>
                <p className="text-slate-50">{selectedServicio.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-amber-400/60 px-3 py-1 text-[0.7rem] font-medium text-amber-200"
              >
                Cambiar servicio
              </button>
            </div>

            {/* Datos del formulario */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-[0.8rem] sm:text-[0.85rem]">
              <label className="block font-medium text-slate-200">
                Tipo de lugar <span className="text-amber-300">*</span>
                <select
                  value={tipoLugar}
                  onChange={(e) => setTipoLugar(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                >
                  {TIPO_LUGAR_OPCIONES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block font-medium text-slate-200">
                Zona / barrio <span className="text-amber-300">*</span>
                <input
                  type="text"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Ej: La Boca, Barracas, San Telmo…"
                />
              </label>

              <label className="block font-medium text-slate-200">
                Nombre de contacto <span className="text-amber-300">*</span>
                <input
                  type="text"
                  value={nombreContacto}
                  onChange={(e) => setNombreContacto(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Ej: Marta"
                />
              </label>

              <label className="block font-medium text-slate-200">
                Teléfono de contacto <span className="text-amber-300">*</span>
                <input
                  type="tel"
                  value={telefonoContacto}
                  onChange={(e) => setTelefonoContacto(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder="Ej: 11 1234 5678"
                />
              </label>

              <label className="block font-medium text-slate-200">
                Detalle (opcional)
                <textarea
                  value={detalle}
                  onChange={(e) => setDetalle(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  placeholder={selectedServicio.placeholder}
                ></textarea>
              </label>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="w-full rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg hover:bg-amber-300"
              >
                Chatear por WhatsApp
              </button>

              <a
                href="tel:+541133164381"
                className="w-full rounded-full border border-amber-400/70 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-amber-400/10"
              >
                Llamar ahora
              </a>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
