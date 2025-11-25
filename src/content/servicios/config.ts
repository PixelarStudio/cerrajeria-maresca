import { defineCollection, z } from "astro:content";

const serviciosCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    destacado: z.boolean().default(false),
    orden: z.number().default(0),
    descripcionCorta: z.string(),
    descripcionLarga: z.string().optional(),
    icon: z.string().optional(), // para futuro (svg, emoji, etc.)
  }),
});

export const collections = {
  servicios: serviciosCollection,
};
