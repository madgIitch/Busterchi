"use client";

import { useEffect, useMemo, useState } from "react";
import ActionButtons from "@/components/ActionButtons";
import PetScene from "@/components/PetScene";
import SpeechBubble from "@/components/SpeechBubble";
import StatsBars from "@/components/StatsBars";
import { usePetStore } from "@/store/usePetStore";

export default function Home() {
  const { food, walk, love, energy, cooldowns, lastSpeechLine, performAction } =
    usePetStore();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const cooldownMs = useMemo(
    () => ({
      snack: 2 * 60 * 1000,
      walk: 5 * 60 * 1000,
      pet: 1 * 60 * 1000,
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

  const actions = [
    {
      label: "Snack",
      imageSrc: "/uiElements/Snack.png",
      disabled: getRemaining("snack") > 0,
      cooldownLabel:
        getRemaining("snack") > 0
          ? `${Math.ceil(getRemaining("snack") / 1000)}s`
          : "",
      onClick: () => performAction("snack"),
    },
    {
      label: "Walk",
      imageSrc: "/uiElements/Walk.png",
      disabled: getRemaining("walk") > 0,
      cooldownLabel:
        getRemaining("walk") > 0
          ? `${Math.ceil(getRemaining("walk") / 1000)}s`
          : "",
      onClick: () => performAction("walk"),
    },
    {
      label: "Pet",
      imageSrc: "/uiElements/Pet.png",
      disabled: getRemaining("pet") > 0,
      cooldownLabel:
        getRemaining("pet") > 0
          ? `${Math.ceil(getRemaining("pet") / 1000)}s`
          : "",
      onClick: () => performAction("pet"),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12 text-[var(--color-text)]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              PWA
            </p>
            <h1 className="text-2xl font-semibold">Busterchi</h1>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white/70 text-[var(--color-text)] shadow-sm shadow-black/10"
          >
            ⚙
          </button>
        </header>

        <PetScene />
        <StatsBars stats={stats} />
        <section className="w-full rounded-3xl bg-white/70 p-4 shadow-sm shadow-black/10">
          <ActionButtons actions={actions} />
        </section>
        <SpeechBubble line={lastSpeechLine} />
      </main>
    </div>
  );
}
