"use client";

import { useState } from "react";

export const NEW_CATEGORY_VALUE = "__new__";

/**
 * Risolve i due campi del selettore categoria (select + eventuale input
 * "nuova categoria") nel valore unico da mandare all'API.
 */
export function resolveCategoryFields(form: FormData): string | null {
  const selected = String(form.get("category_select") ?? "");

  if (selected === NEW_CATEGORY_VALUE) {
    return String(form.get("category_new") ?? "").trim() || null;
  }

  return selected.trim() || null;
}

/**
 * Select delle categorie/collezioni esistenti + voce "nuova categoria" che
 * apre un campo libero. Evita collezioni duplicate per differenze di
 * maiuscole ("Manga" vs "manga") quando si riusa una categoria esistente.
 */
export function AdminCategoryField({
  categories,
  defaultValue = "",
  dense = false,
}: {
  categories: string[];
  defaultValue?: string;
  /** true = stile compatto del form di modifica (py-3), false = upload (py-4). */
  dense?: boolean;
}) {
  const [isNew, setIsNew] = useState(false);
  const fieldClass = dense
    ? "mt-2 w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink placeholder:text-ink/20 outline-none transition focus:border-accent"
    : "mt-2 w-full border-b border-ink/10 bg-transparent py-4 text-lg text-ink placeholder:text-ink/20 outline-none transition focus:border-accent";
  // Se l'opera ha una categoria non piu' presente nell'elenco, mostrala comunque.
  const options =
    defaultValue && !categories.includes(defaultValue)
      ? [defaultValue, ...categories]
      : categories;

  return (
    <>
      <select
        name="category_select"
        defaultValue={defaultValue}
        onChange={(event) =>
          setIsNew(event.target.value === NEW_CATEGORY_VALUE)
        }
        className={`${fieldClass} cursor-pointer`}
      >
        <option value="">Senza categoria</option>
        {options.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
        <option value={NEW_CATEGORY_VALUE}>+ Nuova categoria...</option>
      </select>
      {isNew ? (
        <input
          name="category_new"
          maxLength={80}
          placeholder="Nome della nuova categoria"
          className={fieldClass}
        />
      ) : null}
    </>
  );
}
