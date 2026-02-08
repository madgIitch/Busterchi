import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  DECORATION_OVERRIDES,
  DECORATION_SLOTS,
  DEFAULT_DECORATION_SLOT,
  FURNITURE_TYPE_SLOTS,
  VINYL_SHELF_SLOTS,
} from "@/lib/decorations/layout";
import { useShopStore } from "@/store/useShopStore";

export default function PetScene({ isSleeping }: { isSleeping: boolean }) {
  const petImage = isSleeping ? "/pet/buster_sleep.png" : "/pet/buster_idle.png";
  const altText = isSleeping ? "Buster sleeping" : "Buster idle";
  const decorations = useShopStore((state) => state.decorations);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [sceneScale, setSceneScale] = useState(1);
  const hasWindowEquipped = decorations.some((itemId) =>
    itemId.startsWith("ventanas/"),
  );

  useEffect(() => {
    const node = sceneRef.current;
    if (!node) {
      return;
    }
    const baseWidth = 1536;
    const baseHeight = 1025;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      if (!width || !height) {
        return;
      }
      const scale = Math.min(width / baseWidth, height / baseHeight);
      setSceneScale(scale);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const activeShelfId = [...decorations]
    .reverse()
    .find((itemId) => {
      if (!itemId.startsWith("muebles/")) {
        return false;
      }
      const name = itemId.split("/").pop() ?? "";
      return name.toLowerCase().startsWith("estanter");
    });

  const placedDecorations = decorations
    .map((itemId, index) => {
    const category = itemId.split("/")[0] ?? "";
    if (category === "vinilos" && !activeShelfId) {
      return null;
    }
    const furnitureName = itemId.split("/").pop() ?? itemId;
    const lowerFurnitureName = furnitureName.toLowerCase();
    let furnitureType: "estanteria" | "mesa" | "sillon" | null = null;
    if (category === "muebles") {
      if (lowerFurnitureName.startsWith("estanter")) {
        furnitureType = "estanteria";
      } else if (lowerFurnitureName.startsWith("mesa")) {
        furnitureType = "mesa";
      } else if (lowerFurnitureName.startsWith("sillon")) {
        furnitureType = "sillon";
      }
    }
    const vinylSlot =
      category === "vinilos" && activeShelfId
        ? VINYL_SHELF_SLOTS[activeShelfId]
        : undefined;
    const furnitureSlot = furnitureType
      ? FURNITURE_TYPE_SLOTS[furnitureType]
      : undefined;
    const slot =
      DECORATION_OVERRIDES[itemId] ??
      vinylSlot ??
      furnitureSlot ??
      DECORATION_SLOTS[category] ??
      DEFAULT_DECORATION_SLOT;
    const offset = slot.stackOffset ?? { x: 0, y: 0 };
    const left = `calc(${slot.leftPct}% + ${
      offset.x * index * sceneScale
    }px)`;
    const top = `calc(${slot.topPct}% + ${offset.y * index * sceneScale}px)`;
    return {
      itemId,
      category,
      left,
      top,
      zIndex: slot.zIndex + index,
      widthPx: slot.widthPx ? slot.widthPx * sceneScale : undefined,
      heightPx: slot.heightPx ? slot.heightPx * sceneScale : undefined,
    };
  })
    .filter(
      (decoration): decoration is NonNullable<typeof decoration> =>
        Boolean(decoration),
    );

  return (
    <section className="w-full rounded-3xl bg-surface p-4 shadow-lg shadow-black/10 sm:p-6">
      <div
        ref={sceneRef}
        className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl bg-background/60"
      >
        {hasWindowEquipped ? (
          <>
            <Image
              src="/scenes/fondoSalon/fondoAmanecer.png"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
            <Image
              src="/scenes/houseConVentana.png"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </>
        ) : (
          <Image
            src="/scenes/hoseplaceholder.png"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 420px"
          />
        )}
        {placedDecorations.map((decoration) => (
          (() => {
            const useAutoFit = Boolean(
              decoration.widthPx || decoration.heightPx,
            );
            return (
          <img
            key={decoration.itemId}
            src={`/store/${decoration.itemId}`}
            alt=""
            className="absolute"
            style={{
              left: decoration.left,
              top: decoration.top,
              transform: "translate(-50%, -50%)",
              width: useAutoFit
                ? "auto"
                : decoration.widthPx
                  ? `${decoration.widthPx}px`
                  : undefined,
              height: useAutoFit
                ? "auto"
                : decoration.heightPx
                  ? `${decoration.heightPx}px`
                  : undefined,
              maxWidth:
                useAutoFit && decoration.widthPx
                  ? `${decoration.widthPx}px`
                  : undefined,
              maxHeight:
                useAutoFit && decoration.heightPx
                  ? `${decoration.heightPx}px`
                  : undefined,
              objectFit: useAutoFit ? "contain" : undefined,
              zIndex: decoration.zIndex,
            }}
          />
            );
          })()
        ))}
        <Image
          src={petImage}
          alt={altText}
          width={110}
          height={90}
          priority
          className="absolute left-[60%] top-[80%] h-auto w-[clamp(90px,28vw,130px)] -translate-x-1/2 -translate-y-1/2 idle-float"
        />
      </div>
    </section>
  );
}
