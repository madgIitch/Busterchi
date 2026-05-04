"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CARD_CATALOG } from "@/lib/encounters/cards";
import { ENEMY_DECKS } from "@/lib/encounters/enemies";
import { ELEMENTS } from "@/lib/encounters/elements";
import type { CardDefinition, EnemyDeck, EnemyVariant } from "@/lib/encounters/types";
import WalkCard from "./WalkCard";
import { createCombatState, endTurn, playCard } from "@/combat";
import { useShopStore } from "@/store/useShopStore";
import { usePetStore } from "@/store/usePetStore";

const TOTAL_ROUNDS = 10;
const BUCKSTERS_PER_WIN = 3;
const BUCKSTERS_BOSS = 10;
const BUCKSTERS_FULL_RUN = 5;

const ELEMENT_EMOJI: Record<string, string> = {
  impulso: "⚡",
  calma: "🧘",
  caos: "🌀",
  vinculo: "❤️",
  territorio: "🏴",
};

type RoundEntry = { enemy: EnemyDeck; variant: EnemyVariant };

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRounds(): RoundEntry[] {
  const normalDecks = ENEMY_DECKS.filter((d) => d.id !== "idea_fundacional");
  const bossDeck = ENEMY_DECKS.find((d) => d.id === "idea_fundacional")!;
  const bossVariant = bossDeck.variants.find((v) => v.id === "sabino") ?? bossDeck.variants[0];

  const rounds: RoundEntry[] = [];
  for (let i = 0; i < TOTAL_ROUNDS - 1; i++) {
    const enemy = pickRandom(normalDecks);
    const variant = pickRandom(enemy.variants);
    rounds.push({ enemy, variant });
  }
  rounds.push({ enemy: bossDeck, variant: bossVariant });
  return rounds;
}

function DialogueBubble({ line }: { line: string }) {
  return (
    <div className="relative max-w-55 rounded-2xl rounded-bl-sm bg-white/90 px-3 py-2 text-center text-xs text-gray-800 shadow-sm shadow-black/10">
      {line}
      <span className="absolute -bottom-2 left-4 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white/90" />
    </div>
  );
}

function EnemyAvatar({
  variant,
  className = "",
}: {
  variant: EnemyVariant;
  className?: string;
}) {
  if (!variant.imageSrc) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-linear-to-br from-gray-800 to-gray-950 text-white ${className}`}
      >
        <div className="text-center px-2">
          <div className="text-3xl">👤</div>
          <div className="mt-1 text-[10px] text-gray-400 uppercase tracking-widest">
            sin imagen
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <Image
        src={variant.imageSrc}
        alt={variant.name}
        fill
        className="object-cover object-top"
        sizes="160px"
        unoptimized
      />
    </div>
  );
}

// ─── Pre-battle screen ───────────────────────────────────────────────────────

type PreBattleProps = {
  round: number;
  entry: RoundEntry;
  onStart: () => void;
  onClose: () => void;
};

function PreBattle({ round, entry, onStart, onClose }: PreBattleProps) {
  const isBoss = round === TOTAL_ROUNDS;
  const line = useMemo(
    () => pickRandom(entry.variant.dialogue.presentation),
    [entry.variant],
  );
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-svh w-full bg-background px-4 py-6 flex flex-col items-center justify-between">
        <header className="w-full flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-normal">Paseo</h2>
            <span className="text-xs text-muted">
              Ronda {round}/{TOTAL_ROUNDS}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
            aria-label="Cancelar paseo"
          >
            X
          </button>
        </header>

        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
          <div className="text-xs text-muted uppercase tracking-widest">
            {isBoss ? "⚠️ Encuentro final" : "Te cruzas con…"}
          </div>
          <EnemyAvatar
            variant={entry.variant}
            className={`w-40 h-40 shadow-lg shadow-black/25 border ${isBoss ? "border-red-400/50" : "border-white/30"}`}
          />
          <DialogueBubble line={line} />
          <div className="text-center">
            <div className={`text-base font-semibold ${isBoss ? "text-red-500" : ""}`}>
              {entry.variant.name}
            </div>
            <div className="text-xs text-muted mt-0.5">{entry.enemy.name}</div>
          </div>
          <div className="flex gap-2 mt-1">
            {entry.enemy.elements.map((el) => (
              <span
                key={el}
                className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-text shadow-sm shadow-black/10"
              >
                {ELEMENT_EMOJI[el]} {ELEMENTS[el].label}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-surface px-3 py-3 text-sm text-text shadow-sm shadow-black/10"
          >
            Otro día
          </button>
          <button
            type="button"
            onClick={onStart}
            className={`flex-1 rounded-full px-3 py-3 text-sm text-text ${isBoss ? "bg-red-500" : "bg-primary"}`}
          >
            {isBoss ? "¡Enfrentarlo!" : "¡Al encuentro!"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Between rounds screen ────────────────────────────────────────────────────

type BetweenRoundsProps = {
  completedRound: number;
  defeatedVariant: EnemyVariant;
  buckstersSoFar: number;
  nextEntry: RoundEntry | null;
  onContinue: () => void;
  onStop: () => void;
};

function BetweenRounds({
  completedRound,
  defeatedVariant,
  buckstersSoFar,
  nextEntry,
  onContinue,
  onStop,
}: BetweenRoundsProps) {
  const nextIsBoss = nextEntry && completedRound + 1 === TOTAL_ROUNDS;
  const defeatLine = useMemo(
    () => pickRandom(defeatedVariant.dialogue.defeat),
    [defeatedVariant],
  );
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-svh w-full bg-background px-4 py-6 flex flex-col items-center justify-between">
        <div className="w-full text-center">
          <div className="text-2xl">✅</div>
          <div className="mt-2 text-base font-semibold">
            Ronda {completedRound}/{TOTAL_ROUNDS} superada
          </div>
          <div className="mt-1 text-xs text-muted">
            Bucksters acumulados: {buckstersSoFar} 🪙
          </div>
          <div className="mt-3 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted">{defeatedVariant.name} dice:</span>
            <DialogueBubble line={defeatLine} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 flex-1 justify-center">
          {nextEntry ? (
            <>
              <div className="text-xs text-muted uppercase tracking-widest">
                {nextIsBoss ? "⚠️ Próximo: el encuentro final" : "Próximo encuentro"}
              </div>
              <EnemyAvatar
                variant={nextEntry.variant}
                className={`w-32 h-32 shadow-md shadow-black/20 border ${nextIsBoss ? "border-red-400/50" : "border-white/30"}`}
              />
              <div className="text-center">
                <div className={`text-sm font-semibold ${nextIsBoss ? "text-red-500" : ""}`}>
                  {nextEntry.variant.name}
                </div>
                <div className="text-xs text-muted mt-0.5">{nextEntry.enemy.name}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted">Has completado todas las rondas.</div>
          )}
        </div>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={onStop}
            className="flex-1 rounded-full bg-surface px-3 py-3 text-sm text-text shadow-sm shadow-black/10"
          >
            Volver a casa
          </button>
          {nextEntry && (
            <button
              type="button"
              onClick={onContinue}
              className={`flex-1 rounded-full px-3 py-3 text-sm text-text ${nextIsBoss ? "bg-red-500" : "bg-primary"}`}
            >
              Seguir el paseo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Battle session ───────────────────────────────────────────────────────────

type BattleSessionProps = {
  starterDeck: CardDefinition[];
  entry: RoundEntry;
  round: number;
  onWin: () => void;
  onLose: () => void;
  onClose: () => void;
};

function BattleSession({
  starterDeck,
  entry,
  round,
  onWin,
  onLose,
  onClose,
}: BattleSessionProps) {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [state, setState] = useState(() =>
    createCombatState(starterDeck, entry.enemy),
  );

  const hand = useMemo(() => state.hand, [state.hand]);
  const isBoss = round === TOTAL_ROUNDS;

  const handlePlayCard = (card: CardDefinition) => {
    setState((prev) => {
      const next = { ...prev };
      playCard(next, card.id);
      if (next.outcome === "win") setTimeout(onWin, 400);
      if (next.outcome === "lose") setTimeout(onLose, 400);
      return { ...next };
    });
  };

  const handleEndTurn = () => {
    setState((prev) => {
      const next = { ...prev };
      endTurn(next);
      if (next.outcome === "win") setTimeout(onWin, 400);
      if (next.outcome === "lose") setTimeout(onLose, 400);
      return { ...next };
    });
  };

  const getCardSize = (card: CardDefinition) =>
    card.cost >= 3 ? "h-[170px]" : "h-[150px]";

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-svh w-full bg-background px-3 py-3">
        <div className="fit-screen flex h-full flex-col gap-3">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-black/10 px-1 py-2">
            <div>
              <h2 className="text-sm font-normal leading-none">Paseo</h2>
              <span className="text-[10px] text-muted">
                Ronda {round}/{TOTAL_ROUNDS}{isBoss ? " · ⚠️ Jefe" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFaqOpen(true)}
                className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
                aria-label="Abrir ayuda"
              >
                ?
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
                aria-label="Cerrar paseo"
              >
                X
              </button>
            </div>
          </header>

          {/* Scene */}
          <section className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,168,183,0.35))] p-3 shadow-lg shadow-black/15">
            <div className="relative aspect-4/3 overflow-hidden rounded-[22px] border-2 border-white/50">
              <Image
                src="/scenes/Hospital.png"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/15" />
              {/* Buster */}
              <Image
                src="/pet/buster_idle.png"
                alt="Buster"
                width={48}
                height={36}
                className="absolute bottom-[2%] left-[20%] h-auto w-[clamp(36px,11vw,55px)] -translate-x-1/2 idle-float"
                priority
              />
              {/* Enemy in scene */}
              {entry.variant.imageSrc ? (
                <div className="absolute bottom-0 right-[8%] h-[36%] w-[clamp(25px,9vw,40px)]">
                  <Image
                    src={entry.variant.imageSrc}
                    alt={entry.variant.name}
                    fill
                    className="object-contain object-bottom"
                    sizes="40px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="absolute bottom-0 right-[8%] h-[30%] w-[clamp(22px,8vw,35px)] flex items-end justify-center">
                  <span className="text-[clamp(14px,5vw,24px)]">👤</span>
                </div>
              )}
              {/* Enemy HP overlay */}
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                  {entry.variant.name}
                </span>
                <div className="h-1.5 w-16 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isBoss ? "bg-red-500" : "bg-red-400"}`}
                    style={{ width: `${Math.max(0, state.enemy.hp)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Player stats */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted">
              {[
                ["⚡", `${state.player.energy}/${state.player.maxEnergy}`],
                ["😊", state.player.mood],
                ["😣", state.player.stress],
                ["🎵", state.player.rhythm],
                ["🧘", state.player.calm],
                ["🤔", state.player.confusion],
              ].map(([icon, val]) => (
                <div
                  key={String(icon)}
                  className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10"
                >
                  {icon} {val}
                </div>
              ))}
            </div>
          </section>

          {/* Turn info */}
          <section className="rounded-3xl bg-surface px-4 py-2 text-xs text-muted">
            Turno {state.turn} ·{" "}
            {state.phase === "A" ? "Tu turno" : "Enemigo actúa primero"}
            {state.player.stress >= 70 && (
              <span className="ml-2 text-orange-500">⚠️ Estrés alto</span>
            )}
          </section>

          {/* Hand */}
          <section className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-4">
            {hand.map((card, i) => (
              <WalkCard
                key={`${card.id}-${i}`}
                card={card}
                sizeClassName={getCardSize(card)}
                onPlay={() => handlePlayCard(card)}
              />
            ))}
          </section>

          <section className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEndTurn}
              disabled={state.outcome !== "ongoing"}
              className="flex-1 rounded-full bg-primary px-3 py-2 text-xs text-text disabled:opacity-40"
            >
              Terminar turno
            </button>
          </section>

          {/* Log */}
          <section className="rounded-2xl bg-surface p-2 text-[10px] text-muted">
            <div className="max-h-20 overflow-y-auto space-y-1">
              {state.log.slice(-6).map((entry, i) => (
                <div key={`${entry}-${i}`}>{entry}</div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {isFaqOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsFaqOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-background/95 p-4 text-xs text-text shadow-lg shadow-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">FAQ del modo Paseo</h3>
              <button
                type="button"
                onClick={() => setIsFaqOpen(false)}
                className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
              >
                X
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-[11px] font-semibold">Reglas básicas</div>
                <div className="mt-1 text-[11px] text-muted">
                  Juegas por turnos. Hasta 2 cartas por turno. El enemigo actúa
                  después.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold">Ganar o perder</div>
                <div className="mt-1 text-[11px] text-muted">
                  Ganas cuando el enemigo llega a 0 de vida. Pierdes si tu ánimo
                  llega a 0. Con estrés ≥ 100: -25 ánimo y se reinicia el estrés.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold">Paseo completo</div>
                <div className="mt-1 text-[11px] text-muted">
                  {TOTAL_ROUNDS} rondas. La última siempre es el jefe final.
                  Puedes volver a casa entre rondas.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold">Iconos</div>
                <div className="mt-1 text-[11px] text-muted">
                  ⚡ energía · 😊 ánimo · 😣 estrés · 🎵 ritmo · 🧘 calma ·
                  🤔 confusión
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Run-over screen (win by stopping early OR complete run) ──────────────────

type RunOverProps = {
  completedRounds: number;
  totalBucksters: number;
  defeatedBoss: boolean;
  onClose: () => void;
};

function RunOver({ completedRounds, totalBucksters, defeatedBoss, onClose }: RunOverProps) {
  const fullRun = completedRounds === TOTAL_ROUNDS;
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-svh w-full bg-background px-4 py-6 flex flex-col items-center justify-center gap-6">
        <div className="text-4xl">{fullRun ? "🏆" : "🐾"}</div>
        <div className="text-center">
          <div className="text-xl font-semibold">
            {fullRun ? "¡Paseo completado!" : "Buen paseo, Buster"}
          </div>
          <div className="mt-1 text-sm text-muted">
            {fullRun && defeatedBoss
              ? "Derrotaste a la Idea Fundacional"
              : `${completedRounds} de ${TOTAL_ROUNDS} rondas completadas`}
          </div>
        </div>
        <div className="rounded-2xl bg-surface px-6 py-3 text-center shadow-sm shadow-black/10">
          <div className="text-xs text-muted">Bucksters ganados</div>
          <div className="mt-1 text-base font-semibold">+{totalBucksters} 🪙</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-primary px-8 py-3 text-sm text-text"
        >
          Volver a casa
        </button>
      </div>
    </div>
  );
}

// ─── Lose screen ──────────────────────────────────────────────────────────────

type LoseScreenProps = {
  round: number;
  defeatedByVariant: EnemyVariant;
  buckstersSoFar: number;
  onClose: () => void;
};

function LoseScreen({ round, defeatedByVariant, buckstersSoFar, onClose }: LoseScreenProps) {
  const victoryLine = useMemo(
    () => pickRandom(defeatedByVariant.dialogue.victory),
    [defeatedByVariant],
  );
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-svh w-full bg-background px-4 py-6 flex flex-col items-center justify-center gap-5">
        <div className="text-4xl">😓</div>
        <div className="text-center">
          <div className="text-xl font-semibold">El paseo no salió bien</div>
          <div className="mt-1 text-sm text-muted">
            {defeatedByVariant.name} fue demasiado en la ronda {round}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted">{defeatedByVariant.name} dice:</span>
          <DialogueBubble line={victoryLine} />
        </div>
        {buckstersSoFar > 0 && (
          <div className="rounded-2xl bg-surface px-6 py-3 text-center shadow-sm shadow-black/10">
            <div className="text-xs text-muted">Bucksters antes de caer</div>
            <div className="mt-1 text-base font-semibold">+{buckstersSoFar} 🪙</div>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-primary px-8 py-3 text-sm text-text"
        >
          Volver a casa
        </button>
      </div>
    </div>
  );
}

// ─── Root modal ───────────────────────────────────────────────────────────────

type Phase = "pre" | "battle" | "between" | "run_over" | "lose";

export default function WalkGameModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const deck = useShopStore((s) => s.deck);
  const addBucksters = usePetStore((s) => s.addBucksters);

  const [phase, setPhase] = useState<Phase>("pre");
  const [round, setRound] = useState(1);
  const [totalBucksters, setTotalBucksters] = useState(0);
  const [defeatedBoss, setDefeatedBoss] = useState(false);

  const rounds = useMemo(() => generateRounds(), []);

  const currentEntry = rounds[round - 1];
  const nextEntry = rounds[round] ?? null;

  const starterDeck = useMemo(() => {
    const byId = new Map(CARD_CATALOG.map((c) => [c.id, c]));
    const selected = deck
      .map((id) => byId.get(id))
      .filter((c): c is CardDefinition => Boolean(c))
      .slice(0, 12);
    return selected.length > 0 ? selected : CARD_CATALOG.slice(0, 12);
  }, [deck]);

  const battleKey = `${round}-${starterDeck.map((c) => c.id).join("|")}`;

  const handleWin = () => {
    const isBoss = round === TOTAL_ROUNDS;
    const earned = isBoss ? BUCKSTERS_BOSS : BUCKSTERS_PER_WIN;
    const fullRunBonus = isBoss ? BUCKSTERS_FULL_RUN : 0;
    const newTotal = totalBucksters + earned + fullRunBonus;

    addBucksters(earned + fullRunBonus);
    setTotalBucksters(newTotal);

    if (isBoss) {
      setDefeatedBoss(true);
      setPhase("run_over");
    } else {
      setPhase("between");
    }
  };

  const handleLose = () => {
    if (totalBucksters > 0) addBucksters(0); // already added per-round
    setPhase("lose");
  };

  const handleContinue = () => {
    setRound((r) => r + 1);
    setPhase("battle");
  };

  const handleStop = () => {
    setPhase("run_over");
  };

  const handleClose = () => {
    setPhase("pre");
    setRound(1);
    setTotalBucksters(0);
    setDefeatedBoss(false);
    onClose();
  };

  if (!isOpen) return null;

  if (phase === "pre") {
    return (
      <PreBattle
        round={round}
        entry={currentEntry}
        onStart={() => setPhase("battle")}
        onClose={handleClose}
      />
    );
  }

  if (phase === "battle") {
    return (
      <BattleSession
        key={battleKey}
        starterDeck={starterDeck}
        entry={currentEntry}
        round={round}
        onWin={handleWin}
        onLose={handleLose}
        onClose={handleClose}
      />
    );
  }

  if (phase === "between") {
    return (
      <BetweenRounds
        completedRound={round}
        defeatedVariant={currentEntry.variant}
        buckstersSoFar={totalBucksters}
        nextEntry={nextEntry}
        onContinue={handleContinue}
        onStop={handleStop}
      />
    );
  }

  if (phase === "run_over") {
    return (
      <RunOver
        completedRounds={round}
        totalBucksters={totalBucksters}
        defeatedBoss={defeatedBoss}
        onClose={handleClose}
      />
    );
  }

  if (phase === "lose") {
    return (
      <LoseScreen
        round={round}
        defeatedByVariant={currentEntry.variant}
        buckstersSoFar={totalBucksters}
        onClose={handleClose}
      />
    );
  }

  return null;
}
