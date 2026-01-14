"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const cards_1 = require("../lib/encounters/cards");
const enemies_1 = require("../lib/encounters/enemies");
const combat_1 = require("../combat");
const argv = process.argv.slice(2);
const args = parseArgs(argv);
let runs = toNumber(args.get("--runs"), 200);
const maxSteps = toNumber(args.get("--max-steps"), 40);
const deckSize = Math.min(toNumber(args.get("--deck-size"), 12), cards_1.CARD_CATALOG.length);
const enemyId = args.get("--enemy");
const seedArg = args.get("--seed");
if (!args.get("--runs") && argv.length > 0) {
    const positionalRuns = Number(argv[0]);
    if (Number.isFinite(positionalRuns) && positionalRuns > 0) {
        runs = positionalRuns;
    }
}
if (seedArg) {
    const seed = hashString(seedArg);
    const rng = mulberry32(seed);
    Math.random = rng;
}
const deck = cards_1.CARD_CATALOG.slice(0, deckSize);
const enemies = enemyId
    ? enemies_1.ENEMY_DECKS.filter((enemy) => enemy.id === enemyId)
    : enemies_1.ENEMY_DECKS;
if (enemies.length === 0) {
    console.error("No enemies matched.");
    process.exit(1);
}
const summaries = enemies.map((enemy) => simulateEnemy(enemy, deck, runs, maxSteps));
const report = buildReport(summaries, runs, maxSteps, deckSize, seedArg !== null && seedArg !== void 0 ? seedArg : null);
writeReport(report);
printSummary(report);
function simulateEnemy(enemy, deckInput, runsCount, maxStepsCount) {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalSteps = 0;
    let totalMood = 0;
    let totalStress = 0;
    let totalEnemyHp = 0;
    const cardPlays = {};
    for (let i = 0; i < runsCount; i += 1) {
        const result = simulateRun(enemy, deckInput, maxStepsCount, cardPlays);
        if (result.outcome === "win") {
            wins += 1;
        }
        else if (result.outcome === "loss") {
            losses += 1;
        }
        else {
            draws += 1;
        }
        totalSteps += result.steps;
        totalMood += result.finalMood;
        totalStress += result.finalStress;
        totalEnemyHp += result.finalEnemyHp;
    }
    const winRate = runsCount === 0 ? 0 : wins / runsCount;
    return {
        id: enemy.id,
        runs: runsCount,
        wins,
        losses,
        draws,
        winRate,
        avgSteps: avg(totalSteps, runsCount),
        avgMood: avg(totalMood, runsCount),
        avgStress: avg(totalStress, runsCount),
        avgEnemyHp: avg(totalEnemyHp, runsCount),
        cardPlays,
    };
}
function simulateRun(enemy, deckInput, maxStepsCount, cardPlays) {
    const state = (0, combat_1.createCombatState)(deckInput, enemy);
    let steps = 0;
    while (steps < maxStepsCount) {
        playerStep(state, cardPlays);
        steps += 1;
        if (isOver(state)) {
            break;
        }
        (0, combat_1.endTurn)(state);
        if (isOver(state)) {
            break;
        }
    }
    const outcome = resolveOutcome(state, steps, maxStepsCount);
    return {
        outcome,
        steps,
        finalMood: state.player.mood,
        finalStress: state.player.stress,
        finalEnemyHp: state.enemy.hp,
    };
}
function playerStep(state, cardPlays) {
    var _a;
    let attempts = 0;
    while (attempts < 2) {
        const choice = pickBestCard(state);
        if (!choice) {
            break;
        }
        const beforePlays = state.playerCardsPlayed;
        (0, combat_1.playCard)(state, choice.id);
        if (state.playerCardsPlayed === beforePlays) {
            break;
        }
        cardPlays[choice.id] = ((_a = cardPlays[choice.id]) !== null && _a !== void 0 ? _a : 0) + 1;
        attempts += 1;
    }
}
function pickBestCard(state) {
    const playable = state.hand.filter((card) => card.cost <= state.player.energy);
    if (playable.length === 0) {
        return null;
    }
    const scored = playable
        .map((card) => ({ card, score: scoreCard(state, card) }))
        .sort((a, b) => b.score - a.score);
    return scored[0].card;
}
function scoreCard(state, card) {
    let score = 0;
    const lowMood = state.player.mood <= 40;
    const highStress = state.player.stress >= 60;
    const highConfusion = state.player.confusion >= 4;
    for (const effect of card.effects) {
        switch (effect.type) {
            case "enemy_hp_pct":
                score += 120 + effect.value;
                break;
            case "enemy_hp_flat":
                score += 50 + effect.value * 4;
                break;
            case "skip_enemy_action":
                score += 80;
                break;
            case "damage_reduction_pct":
                score += 40 + effect.value / 4;
                break;
            case "heal_mood":
                score += (lowMood ? 60 : 25) + effect.value;
                break;
            case "stress_reduce":
                score += (highStress ? 50 : 15) + effect.value / 2;
                break;
            case "confusion_remove":
                score += (highConfusion ? 40 : 10) + effect.value;
                break;
            case "draw_cards":
                score += 5 + effect.value * 2;
                break;
            case "calm_add":
            case "rhythm_add":
                score += 6 + effect.value * 2;
                break;
            case "confusion_add":
                score -= 15 + effect.value;
                break;
            case "stress_add":
                score -= 10 + effect.value / 2;
                break;
            case "exit_combat":
                score -= 50;
                break;
            default:
                break;
        }
    }
    score -= card.cost * 6;
    if (card.exhaust || card.consumable) {
        score += 4;
    }
    return score;
}
function isOver(state) {
    return state.enemy.hp <= 0 || state.player.mood <= 0 || state.player.stress >= 100;
}
function resolveOutcome(state, steps, maxStepsCount) {
    if (state.enemy.hp <= 0) {
        return "win";
    }
    if (state.player.mood <= 0 || state.player.stress >= 100) {
        return "loss";
    }
    if (steps >= maxStepsCount) {
        return "draw";
    }
    return "draw";
}
function buildReport(summaries, runsCount, maxStepsCount, deckSizeCount, seed) {
    return {
        generatedAt: new Date().toISOString(),
        runs: runsCount,
        maxSteps: maxStepsCount,
        deckSize: deckSizeCount,
        seed,
        enemies: summaries,
    };
}
function writeReport(report) {
    const reportDir = node_path_1.default.join(process.cwd(), "reports");
    node_fs_1.default.mkdirSync(reportDir, { recursive: true });
    const timestamp = report.generatedAt.replace(/[:.]/g, "-");
    const jsonPath = node_path_1.default.join(reportDir, `combat-report-${timestamp}.json`);
    const mdPath = node_path_1.default.join(reportDir, `combat-report-${timestamp}.md`);
    node_fs_1.default.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
    node_fs_1.default.writeFileSync(mdPath, formatMarkdown(report), "utf8");
}
function formatMarkdown(report) {
    var _a;
    const lines = [];
    lines.push("# Combat simulation report");
    lines.push("");
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push(`Runs per enemy: ${report.runs}`);
    lines.push(`Max steps: ${report.maxSteps}`);
    lines.push(`Deck size: ${report.deckSize}`);
    if (report.seed) {
        lines.push(`Seed: ${report.seed}`);
    }
    lines.push("");
    lines.push("| Enemy | Runs | Wins | Losses | Draws | Win rate | Avg steps | Avg mood | Avg stress | Avg enemy hp |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const enemy of report.enemies) {
        lines.push(`| ${enemy.id} | ${enemy.runs} | ${enemy.wins} | ${enemy.losses} | ${enemy.draws} | ${pct(enemy.winRate)} | ${fmt(enemy.avgSteps)} | ${fmt(enemy.avgMood)} | ${fmt(enemy.avgStress)} | ${fmt(enemy.avgEnemyHp)} |`);
    }
    lines.push("");
    lines.push("## Most played cards (overall)");
    const aggregate = {};
    for (const enemy of report.enemies) {
        for (const [cardId, count] of Object.entries(enemy.cardPlays)) {
            aggregate[cardId] = ((_a = aggregate[cardId]) !== null && _a !== void 0 ? _a : 0) + count;
        }
    }
    const top = Object.entries(aggregate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    if (top.length === 0) {
        lines.push("No card plays recorded.");
    }
    else {
        lines.push("| Card | Plays |");
        lines.push("| --- | --- |");
        for (const [cardId, count] of top) {
            lines.push(`| ${cardId} | ${count} |`);
        }
    }
    return lines.join("\n");
}
function printSummary(report) {
    console.log("Combat simulation report");
    console.log(`Runs per enemy: ${report.runs}`);
    console.log(`Max steps: ${report.maxSteps}`);
    if (report.seed) {
        console.log(`Seed: ${report.seed}`);
    }
    for (const enemy of report.enemies) {
        console.log(`${enemy.id}: wins ${enemy.wins}/${enemy.runs} (${pct(enemy.winRate)}), avg steps ${fmt(enemy.avgSteps)}`);
    }
}
function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}
function fmt(value) {
    return value.toFixed(1);
}
function avg(total, count) {
    return count === 0 ? 0 : total / count;
}
function parseArgs(argv) {
    const map = new Map();
    for (let i = 0; i < argv.length; i += 1) {
        const key = argv[i];
        if (!key.startsWith("--")) {
            continue;
        }
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
            map.set(key, next);
            i += 1;
        }
        else {
            map.set(key, "true");
        }
    }
    return map;
}
function toNumber(value, fallback) {
    if (!value) {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) || 1;
}
function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
