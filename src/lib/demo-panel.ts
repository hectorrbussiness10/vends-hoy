/**
 * Prototipos enviados por correo. El panel se abre para enseñarlo,
 * pero el servidor rechaza cualquier guardado.
 */
const DEMO_CLIENT_IDS = new Set([
  "sergio-rolando",
  "lorena-carpio",
  "tita-lolo",
  "secar",
  "pespuntes",
  "ohm-estilistas",
  "elena-cabrera",
  "barberia-cj",
  "isabel-salitre",
  "serendipia",
  "sandra-thuillier",
  "otro-flow",
  "raser",
  "lola-merceria",
  "natalia-romeo",
  "sirena-studio",
  "no-glory",
  "malaga-ink",
  "miyana",
  "wayamu",
  "maldita-tentacion",
  "la-garduna",
  "lily-bone",
  "pely-tattoo",
  "andros-fisio",
  "malaka-vet",
  "fisio-training",
  "bee-happy",
  "pablo-cruces",
]);

export function isDemoPanel(): boolean {
  const id = process.env.NEXT_PUBLIC_CLIENT_ID || "";
  return DEMO_CLIENT_IDS.has(id);
}
