"use client";

import ActionButtons from "@/components/ActionButtons";
import PetScene from "@/components/PetScene";
import SpeechBubble from "@/components/SpeechBubble";
import StatsBars from "@/components/StatsBars";
import { SPEECH_LINES } from "@/lib/speech";
import { usePetStore } from "@/store/usePetStore";

export default function Home() {
  const { food, walk, love, energy } = usePetStore();

  const stats = [
    { label: "Food", value: food },
    { label: "Walk", value: walk },
    { label: "Love", value: love },
    { label: "Energy", value: energy },
  ];

  const actions = [
    { label: "Snack", disabled: true },
    { label: "Walk", disabled: true },
    { label: "Pet", disabled: true },
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
        <ActionButtons actions={actions} />
        <SpeechBubble line={SPEECH_LINES[0]} />
      </main>
    </div>
  );
}
