// src/config/site.ts
export const siteConfig = {
  name: "Cerrajería Maresca",
  slogan: "Cerrajería 24 hs en La Boca",
  domain: "cerrajeriamaresca.com.ar",
  siteUrl:
    import.meta.env.PUBLIC_SITE_URL || "https://www.cerrajeriamaresca.com.ar",
  locale: "es-AR",
  language: "es",
  currency: "ARS",

  // Logo principal (en /public/images/logotipo/logo1.png)
  logo: "/images/logo-oscuro.png",

  // Imagen por defecto para OG / JSON-LD
  defaultTitle: "Cerrajería Maresca | Cerrajería 24 hs en La Boca",
  defaultDescription:
    "Cerrajería Maresca. Cerrajería urgente las 24 horas en el barrio de La Boca, CABA. Apertura de puertas, cambio de combinación y trabajo en blindex. Atención inmediata por WhatsApp.",
  defaultImage: "/images/logotipo/logo1.png",

  twitterUser: "",

  social: {
    whatsappGuardia: + "+54 9 11 3316 4381",
    whatsappAlternativa: "54 9 11 6218 1863",
    instagram: "", // poné aquí el Instagram real si lo tienen
  },

  phones: {
    landline: "4301 5204",
    mobileGuardia: "+54 9 11 3316 4381 ",
    mobileAlternativa: "54 9 11 6218 1863",
  },

  business: {
    type: "Locksmith",
    legalName: "Cerrajería Maresca",
    phoneNumbers: [
      "4301-5204",
      "+54-11-6218-1863",
      "+54-11-3316-4381",
    ],
    streetAddress: "Puerto de Palos 721",
    addressLocality: "La Boca",
    addressRegion: "Ciudad Autónoma de Buenos Aires",
    postalCode: "C1162", // ajustalo si tenés el CP exacto
    addressCountry: "AR",
    latitude: -34.634, // coordenadas aproximadas de La Boca
    longitude: -58.36,
    openingHours: [
      {
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    serviceArea: "Barrio de La Boca y zonas cercanas de CABA",
  },
};
