/**
 * Estrae l'elenco delle categorie (collezioni) esistenti dalle opere,
 * deduplicate senza distinzione di maiuscole/accenti e ordinate.
 * Vive fuori dai componenti client cosi' anche i server component
 * (pagina admin) possono usarla.
 */
export function collectCategories(values: Array<string | null | undefined>) {
  const seen = new Map<string, string>();

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase("it");
    if (!seen.has(key)) {
      seen.set(key, trimmed);
    }
  }

  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, "it", { sensitivity: "base" }),
  );
}
