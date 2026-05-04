import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FloatingParticles from "@/components/FloatingParticles";
import PetSprite from "@/components/PetSprite";
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
import {
  DEFAULT_PET_DIRECTION,
  getDirectionTurnPath,
  getDirectionFromDelta,
  type PetAnimationMode,
  type PetDirection,
} from "@/lib/petAnimations";
import { useShopStore } from "@/store/useShopStore";
import { usePetStore } from "@/store/usePetStore";

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

type SceneName = "salon" | "habitacion";
type PetPosition = { x: number; y: number };

const SCENE_START_POSITIONS: Record<SceneName, PetPosition> = {
  salon: { x: 60, y: 80 },
  habitacion: { x: 68, y: 80 },
};

const WANDER_BOUNDS: Record<SceneName, { minX: number; maxX: number; minY: number; maxY: number }> = {
  salon: { minX: 42, maxX: 72, minY: 69, maxY: 84 },
  habitacion: { minX: 46, maxX: 78, minY: 69, maxY: 84 },
};

const ACTION_MODE_BY_KEY: Record<string, PetAnimationMode> = {
  snack: "bark",
  walk: "walk",
  pet: "jump",
  bath: "bark",
  levelUp: "jump",
};
const TURN_STEP_MS = 140;
const WALK_MOVE_DELAY_MS = 180;

function getRandomPosition(scene: SceneName): PetPosition {
  const bounds = WANDER_BOUNDS[scene];
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export default function PetScene({
  isSleeping,
  visualAction,
  isLevelingUp,
}: {
  isSleeping: boolean;
  visualAction?: string | null;
  isLevelingUp?: boolean;
}) {
  const [activeScene, setActiveScene] = useState<"salon" | "habitacion">(
    "salon",
  );
  const decorations = useShopStore((state) => state.decorations);
  const tapPet = usePetStore((state) => state.tapPet);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const turnTimeoutsRef = useRef<number[]>([]);
  const petModeRef = useRef<PetAnimationMode>("idle");
  const [sceneScale, setSceneScale] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState(getBackgroundByTime());
  const [particles, setParticles] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [petPosition, setPetPosition] = useState<PetPosition>(
    SCENE_START_POSITIONS.salon,
  );
  const [petDirection, setPetDirection] = useState<PetDirection>(
    DEFAULT_PET_DIRECTION,
  );
  const [isTapping, setIsTapping] = useState(false);
  const reducedMotion = useReducedMotionPreference();
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
    turnTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    turnTimeoutsRef.current = [];
    const nextPosition = SCENE_START_POSITIONS[activeScene];
    setPetPosition(nextPosition);
    setPetDirection(DEFAULT_PET_DIRECTION);
  }, [activeScene]);

  useEffect(() => {
    if (isSleeping || reducedMotion) {
      return;
    }
    const id = window.setInterval(() => {
      if (petModeRef.current !== "walk" && petModeRef.current !== "jump") {
        return;
      }
      setPetPosition((current) => {
        const next = getRandomPosition(activeScene);
        const nextDirection = getDirectionFromDelta(
          next.x - current.x,
          next.y - current.y,
        );
        setPetDirection((currentDirection) => {
          turnTimeoutsRef.current.forEach((timeoutId) =>
            window.clearTimeout(timeoutId),
          );
          turnTimeoutsRef.current = [];

          const turnPath = getDirectionTurnPath(currentDirection, nextDirection);
          turnPath.forEach((direction, index) => {
            const timeoutId = window.setTimeout(() => {
              setPetDirection(direction);
            }, TURN_STEP_MS * (index + 1));
            turnTimeoutsRef.current.push(timeoutId);
          });

          const moveTimeoutId = window.setTimeout(
            () => setPetPosition(next),
            TURN_STEP_MS * turnPath.length + WALK_MOVE_DELAY_MS,
          );
          turnTimeoutsRef.current.push(moveTimeoutId);

          return currentDirection;
        });
        return current;
      });
    }, 3600);
    return () => {
      window.clearInterval(id);
      turnTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      turnTimeoutsRef.current = [];
    };
  }, [activeScene, isSleeping, reducedMotion]);

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

  const actionMode = visualAction ? ACTION_MODE_BY_KEY[visualAction] : null;
  const petMode: PetAnimationMode = isSleeping
    ? "sleeping"
    : isLevelingUp
      ? "jump"
      : actionMode
        ? actionMode
        : isTapping
          ? "jump"
          : "idle";
  useEffect(() => {
    petModeRef.current = petMode;
  });

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
        <button
          type="button"
          disabled={isSleeping}
          onClick={(event) => {
            const rect = sceneRef.current?.getBoundingClientRect();
            if (!rect) {
              return;
            }
            setParticles({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
            setIsTapping(true);
            window.setTimeout(() => setIsTapping(false), 900);
            tapPet();
          }}
          className={`pet-sprite-anchor absolute z-25 w-[clamp(78px,24vw,128px)] -translate-x-1/2 -translate-y-1/2 ${
            isSleeping ? "pointer-events-none" : ""
          }`}
          style={{
            left: `${petPosition.x}%`,
            top: `${petPosition.y}%`,
          }}
          aria-label="Tocar a Buster"
        >
          <PetSprite
            mode={petMode}
            direction={isSleeping ? "south" : petDirection}
            isSleeping={isSleeping}
            reducedMotion={reducedMotion}
          />
        </button>
        {particles ? (
          <FloatingParticles
            emojis={["❤️", "✨", "🐾"]}
            originX={particles.x}
            originY={particles.y}
            onDone={() => setParticles(null)}
          />
        ) : null}
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
