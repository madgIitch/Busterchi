"use client";

import { PATCH_NOTES } from "@/lib/patchNotes";

type PatchNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PatchNotesModal({ isOpen, onClose }: PatchNotesModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full bg-surface">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <h2 className="text-lg font-normal">Notas del parche</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
            aria-label="Cerrar notas del parche"
          >
            X
          </button>
        </header>

        <section className="max-h-[calc(100svh-56px)] overflow-y-auto p-4">
          <div className="space-y-3">
            {PATCH_NOTES.map((note) => (
              <article
                key={`${note.version}-${note.date}`}
                className="rounded-2xl bg-background p-4 shadow-sm shadow-black/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-normal text-text">{note.version}</h3>
                  <span className="text-xs text-muted">{note.date}</span>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text">
                  {note.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
