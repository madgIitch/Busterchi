"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ActionButtons from "@/components/ActionButtons";
import CatchGameModal from "@/components/CatchGameModal";
import InventoryModal from "@/components/InventoryModal";
import PatchNotesModal from "@/components/PatchNotesModal";
import PetScene from "@/components/PetScene";
import ShopModal from "@/components/ShopModal";
import SpeechBubble from "@/components/SpeechBubble";
import StatsBars from "@/components/StatsBars";
import WalkGameModal from "@/components/WalkGameModal";
import { ENABLE_WALK_GAME } from "@/lib/encounters/config";
import { usePetStore } from "@/store/usePetStore";
import { useShopStore } from "@/store/useShopStore";

export default function Home() {
  const {
    food,
    walk,
    love,
    energy,
    cooldowns,
    lastSpeechLine,
    performAction,
    rehydrate,
    updateSpeech,
    isSleeping,
    sleepUntil,
    bucksters,
    hygiene,
    level,
    isLevelingUp,
    gainXP,
    addBucksters,
    clearLevelUp,
  } = usePetStore();
  const { openShop, openInventory, rehydrate: rehydrateShop } = useShopStore();
  const [now, setNow] = useState(0);
  const [isWalkGameOpen, setIsWalkGameOpen] = useState(false);
  const [isCatchGameOpen, setIsCatchGameOpen] = useState(false);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  const [visualAction, setVisualAction] = useState<string | null>(null);
  const visualActionId = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    const decayId = setInterval(() => void rehydrate(), 60 * 1000);
    const speechId = setInterval(() => updateSpeech(), 30 * 1000);
    return () => {
      clearInterval(id);
      clearInterval(decayId);
      clearInterval(speechId);
    };
  }, [rehydrate, updateSpeech]);

  useEffect(() => {
    void rehydrate();
    updateSpeech();
    void rehydrateShop();
    rehydrateShop();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void rehydrate();
      }
    };

    const handleFocus = () => void rehydrate();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [rehydrate, rehydrateShop, updateSpeech]);

  const cooldownMs = useMemo(
    () => ({
      snack: 2 * 60 * 1000,
      walk: 30 * 1000,
      pet: 1 * 60 * 1000,
      sleep: 10 * 60 * 1000,
      bath: 5 * 60 * 1000,
    }),
    [],
  );

  const getRemaining = (key: keyof typeof cooldowns) => {
    const lastUsed = cooldowns[key];
    if (!lastUsed) {
      return 0;
    }
    return Math.max(0, cooldownMs[key] - (now - lastUsed));
  };

  const stats = [
    {
      label: "Food",
      value: food,
      iconSrc: "/uiElements/FoodStatusIcon.png",
      barEmptySrc: "/uiElements/ProgressEmptyFood.png",
      barFullSrc: "/uiElements/ProgressFullFood.png",
    },
    {
      label: "Walk",
      value: walk,
      iconSrc: "/uiElements/WalkStatusIcon.png",
      barEmptySrc: "/uiElements/ProgressEmptyWalk.png",
      barFullSrc: "/uiElements/ProgressFullWalk.png",
    },
    {
      label: "Love",
      value: love,
      iconSrc: "/uiElements/LoveStatusIcon.png",
      barEmptySrc: "/uiElements/ProgressEmptyLove.png",
      barFullSrc: "/uiElements/ProgressFullLove.png",
    },
    {
      label: "Energy",
      value: energy,
      iconSrc: "/uiElements/EnergyStatusIcon.png",
      barEmptySrc: "/uiElements/ProgressEmptyEnergy.png",
      barFullSrc: "/uiElements/ProgressFullEnergy.png",
    },
    {
      label: "Hygiene",
      value: hygiene,
      iconSrc: "/uiElements/WashStatusIcon.png",
      barEmptySrc: "/uiElements/ProgressEmptyWash.png",
      barFullSrc: "/uiElements/ProgressFullWash.png",
      endIcon: "",
    },
  ];

  const sleepRemaining = getRemaining("sleep");
  const isSleepingNow = isSleeping || sleepUntil > now || sleepRemaining > 0;

  useEffect(() => {
    const root = document.documentElement;
    if (isSleepingNow) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isSleepingNow]);

  const triggerVisualAction = (action: string, durationMs = 900) => {
    const nextId = visualActionId.current + 1;
    visualActionId.current = nextId;
    setVisualAction(action);
    window.setTimeout(() => {
      if (visualActionId.current === nextId) {
        setVisualAction(null);
      }
    }, durationMs);
  };

  const actions = [
    {
      label: "Snack",
      imageSrc: "/uiElements/Snack.png",
      disabled: isSleepingNow || getRemaining("snack") > 0,
      cooldownLabel:
        getRemaining("snack") > 0
          ? `${Math.ceil(getRemaining("snack") / 1000)}s`
          : "",
      onClick: () => {
        setIsCatchGameOpen(true);
      },
    },
    {
      label: "Walk",
      imageSrc: "/uiElements/Walk.png",
      disabled: isSleepingNow || getRemaining("walk") > 0,
      cooldownLabel:
        getRemaining("walk") > 0
          ? `${Math.ceil(getRemaining("walk") / 1000)}s`
          : "",
      onClick: () => {
        performAction("walk");
        triggerVisualAction("walk", 1200);
        setIsWalkGameOpen(ENABLE_WALK_GAME);
      },
    },
    {
      label: "Pet",
      imageSrc: "/uiElements/Pet.png",
      disabled: isSleepingNow || getRemaining("pet") > 0,
      cooldownLabel:
        getRemaining("pet") > 0
          ? `${Math.ceil(getRemaining("pet") / 1000)}s`
          : "",
      onClick: () => {
        performAction("pet");
        triggerVisualAction("pet");
      },
    },
    {
      label: "Sleep",
      imageSrc: "/uiElements/Sleep.png",
      imageClassName: "h-[168px]",
      disabled:
        process.env.NODE_ENV === "development" ||
        isSleepingNow ||
        getRemaining("sleep") > 0,
      cooldownLabel:
        getRemaining("sleep") > 0
          ? `${Math.ceil(getRemaining("sleep") / 1000)}s`
          : "",
      onClick: () => performAction("sleep"),
    },
    {
      label: "Bath",
      imageSrc: "/uiElements/Wash.png",
      disabled: isSleepingNow || getRemaining("bath") > 0,
      cooldownLabel:
        getRemaining("bath") > 0
          ? `${Math.ceil(getRemaining("bath") / 1000)}s`
          : "",
      onClick: () => {
        performAction("bath");
        triggerVisualAction("bath");
      },
    },
  ];

  return (
    <div className="h-svh bg-background px-3 py-3 text-text sm:px-6 sm:py-6">
      <main className="fit-screen mx-auto flex h-full w-full max-w-md flex-col justify-between gap-2 sm:gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-normal sm:text-2xl">Bustergotxi</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-surface text-text shadow-sm shadow-black/10 sm:h-10 sm:w-10"
              aria-label="Notas del parche"
              onClick={() => setIsPatchNotesOpen(true)}
            >
              <Image
                src="/uiElements/patchNotes.png"
                alt=""
                width={20}
                height={20}
                className="mx-auto"
              />
            </button>
            <div className="flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[10px] text-text shadow-sm shadow-black/10 sm:text-xs">
              <Image
                src="/uiElements/CoinIcon.png"
                alt=""
                width={14}
                height={14}
              />
              <span>{bucksters}</span>
            </div>
            <div className="rounded-full bg-surface px-2 py-1 text-[10px] text-text shadow-sm shadow-black/10 sm:text-xs">
              Niv. {level}
            </div>
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-surface text-text shadow-sm shadow-black/10 sm:h-10 sm:w-10"
              aria-label="Inventario"
              onClick={openInventory}
            >
              <Image
                src="/uiElements/InventoryIcon.png"
                alt=""
                width={24}
                height={24}
                className="mx-auto"
              />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-surface text-text shadow-sm shadow-black/10 sm:h-10 sm:w-10"
              aria-label="Tienda"
              onClick={openShop}
            >
              <Image
                src="/uiElements/ShopIcon.png"
                alt=""
                width={20}
                height={20}
                className="mx-auto"
              />
            </button>
          </div>
        </header>

        <PetScene
          isSleeping={isSleepingNow}
          visualAction={visualAction}
          isLevelingUp={isLevelingUp}
        />
        <SpeechBubble line={lastSpeechLine} />
        <StatsBars stats={stats} />
        <section className="w-full rounded-3xl bg-surface p-2 shadow-sm shadow-black/10 sm:p-4">
          <ActionButtons actions={actions} />
        </section>
        <InventoryModal />
        <ShopModal />
        <PatchNotesModal
          isOpen={isPatchNotesOpen}
          onClose={() => setIsPatchNotesOpen(false)}
        />
        <WalkGameModal
          isOpen={isWalkGameOpen}
          onClose={() => setIsWalkGameOpen(false)}
        />
        <CatchGameModal
          isOpen={isCatchGameOpen}
          onClose={() => setIsCatchGameOpen(false)}
          onReward={(bucksterReward, xpReward) => {
            performAction("snack");
            triggerVisualAction("snack");
            addBucksters(bucksterReward);
            gainXP(xpReward);
          }}
        />
        {isLevelingUp ? (
          <div
            className="level-up-overlay fixed inset-0 z-40 pointer-events-none"
            onAnimationEnd={clearLevelUp}
          >
            <span className="level-up-text">Subi de nivel!</span>
          </div>
        ) : null}
      </main>
    </div>
  );
}
