import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  DECORATION_OVERRIDES,
  DECORATION_SLOTS,
  DEFAULT_DECORATION_SLOT,
  FURNITURE_TYPE_SLOTS,
  HABITACION_DECORATION_SLOTS,
  HABITACION_DECORATION_OVERRIDES,
  HABITACION_FURNITURE_TYPE_SLOTS,
  HABITACION_VINYL_GRID_LAYOUTS,
  HABITACION_VINYL_SHELF_SLOTS,
  VINYL_SHELF_SLOTS,
} from "@/lib/decorations/layout";
import { useShopStore } from "@/store/useShopStore";

function getBackgroundByTime(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    return "/scenes/fondoSalon/fondoAmanecer.png"; // 5am-8am
  } else if (hour >= 8 && hour < 12) {
    return "/scenes/fondoSalon/fondoMañana.png"; // 8am-12pm
  } else if (hour >= 12 && hour < 18) {
    return "/scenes/fondoSalon/fondoTarde.png"; // 12pm-6pm
  } else if (hour >= 18 && hour < 20) {
    return "/scenes/fondoSalon/fondoAtardecer.png"; // 6pm-8pm
  } else {
    return "/scenes/fondoSalon/fondoNoche.png"; // 8pm-5am
  }
}

export default function PetScene({ isSleeping }: { isSleeping: boolean }) {
  const [activeScene, setActiveScene] = useState<"salon" | "habitacion">(
    "salon",
  );
  const petImage = isSleeping ? "/pet/buster_sleep.png" : "/pet/buster_idle.png";
  const altText = isSleeping ? "Buster sleeping" : "Buster idle";
  const decorations = useShopStore((state) => state.decorations);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [sceneScale, setSceneScale] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState(getBackgroundByTime());
  const hasWindowEquipped = decorations.some((itemId) =>
    itemId.startsWith("ventanas/"),
  );
  const sceneSlots =
    activeScene === "habitacion"
      ? HABITACION_DECORATION_SLOTS
      : DECORATION_SLOTS;
  const sceneVinylShelfSlots =
    activeScene === "habitacion"
      ? HABITACION_VINYL_SHELF_SLOTS
      : VINYL_SHELF_SLOTS;
  const sceneFurnitureTypeSlots =
    activeScene === "habitacion"
      ? HABITACION_FURNITURE_TYPE_SLOTS
      : FURNITURE_TYPE_SLOTS;
  const vinylPositionByItemId = new Map<
    string,
    { leftPct: number; topPct: number }
  >();

  useEffect(() => {
    const updateBackground = () => {
      setBackgroundImage(getBackgroundByTime());
    };

    const checkInterval = setInterval(updateBackground, 60000);

    return () => clearInterval(checkInterval);
  }, []);

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

  if (activeScene === "habitacion" && activeShelfId) {
    const shelfGrid = HABITACION_VINYL_GRID_LAYOUTS[activeShelfId];
    if (shelfGrid) {
      const vinylItemIds = decorations.filter((itemId) =>
        itemId.startsWith("vinilos/"),
      );

      vinylItemIds.slice(0, shelfGrid.maxVinyls).forEach((vinylItemId, i) => {
        const row = Math.floor(i / 2);
        const isLeftColumn = i % 2 === 0;
        const leftPct = isLeftColumn
          ? shelfGrid.leftColumn.leftPct
          : shelfGrid.rightColumn.leftPct;
        const topBasePct = shelfGrid.leftColumn.topPct;
        vinylPositionByItemId.set(vinylItemId, {
          leftPct,
          topPct: topBasePct + row * shelfGrid.topOffset,
        });
      });
    }
  }

  const placedDecorations = decorations
    .map((itemId, index) => {
    const category = itemId.split("/")[0] ?? "";
    if (activeScene === "habitacion" && category === "ventanas") {
      return null;
    }
    const furnitureName = itemId.split("/").pop() ?? itemId;
    const lowerFurnitureName = furnitureName.toLowerCase();
    const isRoomOnlyRug =
      category === "alfombras" &&
      (lowerFurnitureName.includes("betis") ||
        lowerFurnitureName.includes("athletic"));
    if (activeScene === "salon" && isRoomOnlyRug) {
      return null;
    }
    if (activeScene === "salon" && category === "vinilos") {
      return null;
    }
    if (
      activeScene === "salon" &&
      category === "muebles" &&
      lowerFurnitureName.startsWith("estanter")
    ) {
      return null;
    }
    if (category === "vinilos" && !activeShelfId) {
      return null;
    }
    if (
      activeScene === "habitacion" &&
      category === "vinilos" &&
      !vinylPositionByItemId.has(itemId)
    ) {
      return null;
    }
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
        ? sceneVinylShelfSlots[activeShelfId]
        : undefined;
    const furnitureSlot = furnitureType
      ? sceneFurnitureTypeSlots[furnitureType]
      : undefined;
    const sceneOverride =
      activeScene === "habitacion"
        ? HABITACION_DECORATION_OVERRIDES[itemId]
        : undefined;
    const slot =
      sceneOverride ??
      DECORATION_OVERRIDES[itemId] ??
      vinylSlot ??
      furnitureSlot ??
      sceneSlots[category] ??
      DEFAULT_DECORATION_SLOT;
    const vinylPosition = vinylPositionByItemId.get(itemId);
    const offset = vinylPosition
      ? { x: 0, y: 0 }
      : (slot.stackOffset ?? { x: 0, y: 0 });
    const leftPct = vinylPosition ? vinylPosition.leftPct : slot.leftPct;
    const topPct = vinylPosition ? vinylPosition.topPct : slot.topPct;
    const top = `calc(${topPct}% + ${offset.y * index * sceneScale}px)`;
    return {
      itemId,
      category,
      left: `calc(${leftPct}% + ${offset.x * index * sceneScale}px)`,
      top,
      zIndex: slot.zIndex + index,
      widthPct: slot.widthPct,
      heightPct: slot.heightPct,
      widthPx: slot.widthPx ? slot.widthPx * sceneScale : undefined,
      heightPx: slot.heightPx ? slot.heightPx * sceneScale : undefined,
    };
  })
    .filter(
      (decoration): decoration is NonNullable<typeof decoration> =>
        Boolean(decoration),
    );

  return (
    <>
      <section className="w-full rounded-3xl bg-surface p-4 shadow-lg shadow-black/10 sm:p-6">
        <div
          ref={sceneRef}
          className="relative w-full aspect-3/2 sm:aspect-3/2 overflow-hidden rounded-2xl bg-background/60"
        >
        {activeScene === "salon" ? (
          hasWindowEquipped ? (
            <>
              <Image
                src={backgroundImage}
                alt=""
                fill
                priority
                className="z-0 object-contain object-top"
                sizes="(max-width: 640px) 95vw, 420px"
              />
              <Image
                src="/scenes/houseConVentana.png"
                alt=""
                fill
                priority
                className="z-1 object-cover"
                sizes="(max-width: 640px) 95vw, 420px"
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
          )
        ) : (
          <Image
            src="/scenes/habitaci%C3%B3n.png"
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
          <Image
            key={decoration.itemId}
            src={`/store/${decoration.itemId}`}
            alt=""
            width={100}
            height={100}
            unoptimized
            className="absolute"
            style={{
              left: decoration.left,
              top: decoration.top,
              transform: "translate(-50%, -50%)",
              width: useAutoFit
                ? "auto"
                : decoration.widthPx
                  ? `${decoration.widthPx}px`
                  : `${decoration.widthPct}%`,
              height: useAutoFit
                ? "auto"
                : decoration.heightPx
                  ? `${decoration.heightPx}px`
                  : `${decoration.heightPct}%`,
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
          className={`absolute z-25 h-auto -translate-x-1/2 -translate-y-1/2 idle-float ${
            activeScene === "habitacion"
              ? "left-[68%] top-[80%] w-[clamp(68px,22vw,92px)]"
              : "left-[60%] top-[80%] w-[clamp(68px,22vw,92px)]"
          }`}
        />
        </div>
      </section>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setActiveScene("salon")}
          aria-label="Ir a la escena izquierda"
          className="h-8 w-8 rounded-full bg-background text-sm text-text shadow-sm shadow-black/20 sm:h-9 sm:w-9"
        >
          <Image
            src="/uiElements/fleIzq.png"
            alt=""
            width={16}
            height={16}
            className="mx-auto"
          />
        </button>
        <button
          type="button"
          onClick={() => setActiveScene("habitacion")}
          aria-label="Ir a la escena derecha"
          className="h-8 w-8 rounded-full bg-background text-sm text-text shadow-sm shadow-black/20 sm:h-9 sm:w-9"
        >
          <Image
            src="/uiElements/fleDer.png"
            alt=""
            width={16}
            height={16}
            className="mx-auto"
          />
        </button>
      </div>
    </>
  );
}
