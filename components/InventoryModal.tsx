"use client";

import Image from "next/image";
import { useShopStore } from "@/store/useShopStore";

function formatNameFromId(id: string) {
  const name = id.split("/").pop() ?? id;
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function InventoryModal() {
  const { isInventoryOpen, closeInventory, owned } = useShopStore();

  if (!isInventoryOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full bg-surface">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <h2 className="text-lg font-normal">Inventario</h2>
          <button
            type="button"
            onClick={closeInventory}
            className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
            aria-label="Cerrar inventario"
          >
            X
          </button>
        </header>

        <section className="h-[calc(100svh-56px)] overflow-y-auto p-4">
          {owned.length === 0 ? (
            <div className="rounded-2xl bg-background p-4 text-sm text-muted">
              Inventario vacio.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {owned.map((id) => (
                <div
                  key={id}
                  className="rounded-2xl bg-background p-3 shadow-sm shadow-black/10"
                >
                  <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-white/60">
                    <Image
                      src={`/store/${id}`}
                      alt={formatNameFromId(id)}
                      width={80}
                      height={80}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 break-words text-xs leading-4">
                    {formatNameFromId(id)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
