"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ActionButtons from "@/components/ActionButtons";
import PetScene from "@/components/PetScene";
import SpeechBubble from "@/components/SpeechBubble";
import StatsBars from "@/components/StatsBars";
import { usePetStore } from "@/store/usePetStore";

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
  } = usePetStore();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    const decayId = setInterval(() => rehydrate(), 60 * 1000);
    const speechId = setInterval(() => updateSpeech(), 30 * 1000);
    return () => {
      clearInterval(id);
      clearInterval(decayId);
      clearInterval(speechId);
    };
  }, [rehydrate, updateSpeech]);

  useEffect(() => {
    rehydrate();
    updateSpeech();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        rehydrate();
      }
    };

    window.addEventListener("focus", rehydrate);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", rehydrate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [rehydrate, updateSpeech]);

  const cooldownMs = useMemo(
    () => ({
      snack: 2 * 60 * 1000,
      walk: 5 * 60 * 1000,
      pet: 1 * 60 * 1000,
      sleep: 10 * 60 * 1000,
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

  const actions = [
    {
      label: "Snack",
      imageSrc: "/uiElements/Snack.png",
      disabled: isSleepingNow || getRemaining("snack") > 0,
      cooldownLabel:
        getRemaining("snack") > 0
          ? `${Math.ceil(getRemaining("snack") / 1000)}s`
          : "",
      onClick: () => performAction("snack"),
    },
    {
      label: "Walk",
      imageSrc: "/uiElements/Walk.png",
      disabled: isSleepingNow || getRemaining("walk") > 0,
      cooldownLabel:
        getRemaining("walk") > 0
          ? `${Math.ceil(getRemaining("walk") / 1000)}s`
          : "",
      onClick: () => performAction("walk"),
    },
    {
      label: "Pet",
      imageSrc: "/uiElements/Pet.png",
      disabled: isSleepingNow || getRemaining("pet") > 0,
      cooldownLabel:
        getRemaining("pet") > 0
          ? `${Math.ceil(getRemaining("pet") / 1000)}s`
          : "",
      onClick: () => performAction("pet"),
    },
    {
      label: "Sleep",
      imageSrc: "/uiElements/Sleep.png",
      imageClassName: "h-[168px]",
      disabled: isSleepingNow || getRemaining("sleep") > 0,
      cooldownLabel:
        getRemaining("sleep") > 0
          ? `${Math.ceil(getRemaining("sleep") / 1000)}s`
          : "",
      onClick: () => performAction("sleep"),
    },
  ];

  return (
    <div className="h-[100svh] bg-background px-3 py-3 text-text sm:px-6 sm:py-6">
      <main className="fit-screen mx-auto flex h-full w-full max-w-md flex-col justify-between gap-2 sm:gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-normal sm:text-2xl">Bustergochi</h1>
          </div>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-surface text-text shadow-sm shadow-black/10 sm:h-10 sm:w-10"
            aria-label="Tienda"
          >
            <Image
              src="/uiElements/ShopIcon.png"
              alt=""
              width={20}
              height={20}
              className="mx-auto"
            />
          </button>
        </header>

        <PetScene isSleeping={isSleepingNow} />
        <StatsBars stats={stats} />
        <section className="w-full rounded-3xl bg-surface p-2 shadow-sm shadow-black/10 sm:p-4">
          <ActionButtons actions={actions} />
        </section>
        <SpeechBubble line={lastSpeechLine} />
      </main>
    </div>
  );
}
