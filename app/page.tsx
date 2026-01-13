"use client";

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
      icon: "🦴",
      barGradient: "linear-gradient(90deg, #ffd27c 0%, #ffb14d 100%)",
    },
    {
      label: "Walk",
      value: walk,
      icon: "🐾",
      barGradient: "linear-gradient(90deg, #8fd0ff 0%, #5aa9f0 100%)",
    },
    {
      label: "Love",
      value: love,
      icon: "❤",
      barGradient: "linear-gradient(90deg, #ff9db7 0%, #f46f8d 100%)",
    },
    {
      label: "Energy",
      value: energy,
      icon: "🌙",
      barGradient: "linear-gradient(90deg, #b4e58f 0%, #8bc56b 100%)",
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
      disabled: isSleepingNow || getRemaining("sleep") > 0,
      cooldownLabel:
        getRemaining("sleep") > 0
          ? `${Math.ceil(getRemaining("sleep") / 1000)}s`
          : "",
      onClick: () => performAction("sleep"),
    },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-12 text-text">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              PWA
            </p>
            <h1 className="text-2xl font-normal">Busterchi</h1>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-surface text-text shadow-sm shadow-black/10"
          >
            ⚙
          </button>
        </header>

        <PetScene isSleeping={isSleepingNow} />
        <StatsBars stats={stats} />
        <section className="w-full rounded-3xl bg-surface p-4 shadow-sm shadow-black/10">
          <ActionButtons actions={actions} />
        </section>
        <SpeechBubble line={lastSpeechLine} />
      </main>
    </div>
  );
}
