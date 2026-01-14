"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SHOP_CATEGORIES, type ShopItem } from "@/lib/shopCatalog";
import { useShopStore } from "@/store/useShopStore";
import { usePetStore } from "@/store/usePetStore";

export default function ShopModal() {
  const {
    isOpen,
    closeShop,
    selectedCategory,
    selectCategory,
    owned,
    purchaseItem,
  } = useShopStore();
  const { bucksters, spendBucksters } = usePetStore();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActive = true;
    setIsLoading(true);

    fetch(`/api/shop?category=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isActive) {
          return;
        }
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setItems([]);
      })
      .finally(() => {
        if (!isActive) {
          return;
        }
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, selectedCategory]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full bg-surface">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <h2 className="text-lg font-normal">Tienda</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-background px-2 py-1 text-xs text-text shadow-sm shadow-black/10">
              <Image
                src="/uiElements/CoinIcon.png"
                alt=""
                width={14}
                height={14}
              />
              <span>{bucksters}</span>
            </div>
          <button
            type="button"
            onClick={closeShop}
            className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
            aria-label="Cerrar tienda"
          >
            X
          </button>
          </div>
        </header>

        <div className="grid h-[calc(100svh-56px)] grid-cols-[160px_1fr]">
          <aside className="flex flex-col gap-2 overflow-y-auto border-r border-black/10 bg-background/40 p-3">
            {SHOP_CATEGORIES.map((category) => {
              const active = category.id === selectedCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs ${
                    active
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-background text-text"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </aside>

          <section className="overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {isLoading ? (
                <div className="col-span-2 rounded-2xl bg-background p-4 text-sm text-muted sm:col-span-3">
                  Cargando...
                </div>
              ) : items.length === 0 ? (
                <div className="col-span-2 rounded-2xl bg-background p-4 text-sm text-muted sm:col-span-3">
                  Sin items aun.
                </div>
              ) : (
                items.map((item) => {
                  const isOwned = owned.includes(item.id);
                  const price = item.price ?? null;
                  const canBuy =
                    price !== null && price <= bucksters && !isOwned;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-background p-3 shadow-sm shadow-black/10"
                    >
                  <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-white/60">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted">preview</span>
                    )}
                  </div>
                  <p className="mt-2 break-words text-xs leading-4">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {price === null ? "Precio TBD" : `${price} Bucksters`}
                  </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (price === null) {
                            return;
                          }
                          if (spendBucksters(price)) {
                            purchaseItem(item.id);
                          }
                        }}
                        disabled={!canBuy}
                        className="mt-2 w-full rounded-full bg-[var(--color-primary)] px-2 py-1 text-[10px] text-text disabled:opacity-50"
                      >
                        {isOwned ? "Comprado" : "Comprar"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
