"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  LoaderCircle,
  Mail,
  MailOpen,
  Trash2,
} from "lucide-react";
import type { CommissionRequest } from "@/lib/supabase/types";

type Status = CommissionRequest["status"];

type Notice = {
  tone: "success" | "error" | "muted";
  text: string;
} | null;

type CommissionResponse = {
  request?: CommissionRequest;
  ok?: boolean;
  message?: string;
};

const FILTERS: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "Tutte" },
  { key: "new", label: "Nuove" },
  { key: "read", label: "Lette" },
  { key: "archived", label: "Archiviate" },
];

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  new: { label: "Nuova", className: "bg-accent/15 text-accent" },
  read: { label: "Letta", className: "bg-ink/8 text-ink/55" },
  archived: { label: "Archiviata", className: "bg-ink/5 text-ink/35" },
};

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getNoticeClass(tone: NonNullable<Notice>["tone"]) {
  if (tone === "success") return "text-accent";
  if (tone === "error") return "text-red-400";
  return "text-ink/50";
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

export function AdminCommissionManager({
  requests,
  loadOk,
}: {
  requests: CommissionRequest[];
  loadOk: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(requests);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.all += 1;
        acc[item.status] += 1;
        return acc;
      },
      { all: 0, new: 0, read: 0, archived: 0 } as Record<Status | "all", number>,
    );
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.status === filter)),
    [items, filter],
  );

  async function updateStatus(request: CommissionRequest, status: Status) {
    setBusyId(request.id);
    setNotice(null);

    const response = await fetch(`/api/admin/commission-requests/${request.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await parseJsonResponse<CommissionResponse>(response);

    if (!response.ok || !data.request) {
      setNotice({ tone: "error", text: data.message || "Aggiornamento non riuscito." });
      setBusyId(null);
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === request.id ? { ...item, status } : item)),
    );
    setNotice({ tone: "success", text: "Stato aggiornato." });
    router.refresh();
    setBusyId(null);
  }

  async function deleteRequest(request: CommissionRequest) {
    const confirmed = window.confirm(
      `Eliminare la richiesta di ${request.name}? L'azione e' definitiva.`,
    );
    if (!confirmed) return;

    setBusyId(request.id);
    setNotice(null);

    const response = await fetch(`/api/admin/commission-requests/${request.id}`, {
      method: "DELETE",
    });
    const data = await parseJsonResponse<CommissionResponse>(response);

    if (!response.ok) {
      setNotice({ tone: "error", text: data.message || "Eliminazione non riuscita." });
      setBusyId(null);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== request.id));
    setNotice({ tone: "success", text: "Richiesta eliminata." });
    router.refresh();
    setBusyId(null);
  }

  if (!loadOk) {
    return (
      <p className="border-t border-ink/8 pt-6 text-sm text-red-400">
        Non riesco a leggere le richieste. Verifica che la service role key Supabase sia
        configurata e raggiungibile.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-ink/10 text-ink/50 hover:border-accent hover:text-accent"
              }`}
            >
              {tab.label}
              <span className={active ? "text-accent" : "text-ink/30"}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {notice ? <p className={`text-sm ${getNoticeClass(notice.tone)}`}>{notice.text}</p> : null}

      {visible.length ? (
        <div className="grid gap-4">
          {visible.map((request) => {
            const badge = STATUS_BADGE[request.status];
            const isBusy = busyId === request.id;

            return (
              <article
                key={request.id}
                className="rounded-xl border border-ink/8 bg-pure-white p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl font-bold text-ink">
                        {request.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <a
                      href={`mailto:${request.email}`}
                      className="mt-1 inline-block text-sm text-ink/50 underline-offset-4 transition hover:text-accent hover:underline"
                    >
                      {request.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    {isBusy ? (
                      <LoaderCircle size={15} className="animate-spin text-accent" />
                    ) : null}
                    <time className="text-xs uppercase tracking-[0.12em] text-ink/30">
                      {dateFormatter.format(new Date(request.created_at))}
                    </time>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-base leading-[1.7] text-ink/70">
                  {request.message}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-ink/8 pt-4">
                  <a
                    href={`mailto:${request.email}?subject=${encodeURIComponent(
                      "Re: la tua richiesta di commissione",
                    )}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-pure-white transition hover:bg-accent"
                  >
                    <Mail size={14} strokeWidth={1.7} />
                    Rispondi
                  </a>
                  {request.status === "new" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(request, "read")}
                      disabled={isBusy}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink/55 transition hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      <MailOpen size={14} strokeWidth={1.7} />
                      Segna letta
                    </button>
                  ) : null}
                  {request.status !== "archived" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(request, "archived")}
                      disabled={isBusy}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink/55 transition hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      <Archive size={14} strokeWidth={1.7} />
                      Archivia
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatus(request, "read")}
                      disabled={isBusy}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink/55 transition hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      <ArchiveRestore size={14} strokeWidth={1.7} />
                      Ripristina
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteRequest(request)}
                    disabled={isBusy}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-400/25 px-4 py-2 text-xs uppercase tracking-[0.16em] text-red-300 transition hover:border-red-300 hover:text-red-200 disabled:opacity-50"
                  >
                    <Trash2 size={14} strokeWidth={1.7} />
                    Elimina
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-t border-ink/8 pt-6 text-ink/50">
          {items.length
            ? "Nessuna richiesta in questo stato."
            : "Nessuna richiesta di commissione ricevuta."}
        </div>
      )}
    </div>
  );
}
