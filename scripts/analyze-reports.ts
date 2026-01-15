import fs from "node:fs";
import path from "node:path";

type EnemyData = {
  id: string;
  runs: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgSteps: number;
  avgMood: number;
  avgStress: number;
  avgEnemyHp: number;
  cardPlays: Record<string, number>;
};

type Report = {
  generatedAt: string;
  runs: number;
  maxSteps: number;
  deckSize: number;
  seed: string | null;
  enemies: EnemyData[];
};

type HistoricalPoint = {
  timestamp: string;
  label: string;
  enemies: Record<string, { winRate: number; avgStress: number }>;
  cardPlays: Record<string, number>;
};

const reportsDir = path.join(process.cwd(), "reports");

function loadReports(): Report[] {
  const files = fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json") && f.startsWith("combat-report"));
  const reports: Report[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(reportsDir, file), "utf8");
    try {
      reports.push(JSON.parse(content));
    } catch {
      console.warn(`Skipping invalid JSON: ${file}`);
    }
  }

  return reports.sort(
    (a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
  );
}

function buildHistoricalData(reports: Report[]): HistoricalPoint[] {
  return reports.map((report, index) => {
    const enemies: Record<string, { winRate: number; avgStress: number }> = {};
    const cardPlays: Record<string, number> = {};

    for (const enemy of report.enemies) {
      enemies[enemy.id] = {
        winRate: enemy.winRate * 100,
        avgStress: enemy.avgStress,
      };
      for (const [cardId, count] of Object.entries(enemy.cardPlays)) {
        cardPlays[cardId] = (cardPlays[cardId] ?? 0) + count;
      }
    }

    const date = new Date(report.generatedAt);
    const label = `v${index + 1}`;

    return {
      timestamp: report.generatedAt,
      label,
      enemies,
      cardPlays,
    };
  });
}

function generateMarkdown(data: HistoricalPoint[], reports: Report[]): string {
  const enemyIds = [...new Set(data.flatMap((d) => Object.keys(d.enemies)))];
  const lines: string[] = [];

  lines.push("# Balance Analysis Report");
  lines.push("");
  lines.push(`> Generado: ${new Date().toISOString()}`);
  lines.push(`> Versiones analizadas: ${data.length}`);
  lines.push(`> Win rate objetivo: **60-70%**`);
  lines.push("");

  // Win Rate Evolution Table
  lines.push("## Win Rate por Versión (%)");
  lines.push("");
  const winRateHeader = ["Enemigo", ...data.map((d) => d.label)];
  lines.push(`| ${winRateHeader.join(" | ")} |`);
  lines.push(`| ${winRateHeader.map(() => "---").join(" | ")} |`);

  for (const enemyId of enemyIds) {
    const row = [enemyId];
    for (const point of data) {
      const wr = point.enemies[enemyId]?.winRate;
      if (wr === undefined) {
        row.push("-");
      } else {
        const emoji = wr >= 60 && wr <= 70 ? "✅" : wr < 60 ? "⬇️" : "⬆️";
        row.push(`${wr.toFixed(1)}% ${emoji}`);
      }
    }
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");

  // Stress Evolution Table
  lines.push("## Estrés Promedio por Versión");
  lines.push("");
  const stressHeader = ["Enemigo", ...data.map((d) => d.label)];
  lines.push(`| ${stressHeader.join(" | ")} |`);
  lines.push(`| ${stressHeader.map(() => "---").join(" | ")} |`);

  for (const enemyId of enemyIds) {
    const row = [enemyId];
    for (const point of data) {
      const stress = point.enemies[enemyId]?.avgStress;
      row.push(stress !== undefined ? stress.toFixed(1) : "-");
    }
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");

  // Latest version analysis
  if (data.length > 0) {
    const latest = data[data.length - 1];
    const latestReport = reports[reports.length - 1];

    lines.push("## Análisis Última Versión");
    lines.push("");

    // Balance status
    lines.push("### Estado del Balance");
    lines.push("");
    const balanced: string[] = [];
    const tooEasy: string[] = [];
    const tooHard: string[] = [];

    for (const [enemyId, stats] of Object.entries(latest.enemies)) {
      if (stats.winRate >= 60 && stats.winRate <= 70) {
        balanced.push(`${enemyId} (${stats.winRate.toFixed(1)}%)`);
      } else if (stats.winRate > 70) {
        tooEasy.push(`${enemyId} (${stats.winRate.toFixed(1)}%)`);
      } else {
        tooHard.push(`${enemyId} (${stats.winRate.toFixed(1)}%)`);
      }
    }

    if (balanced.length > 0) {
      lines.push(`✅ **Balanceados:** ${balanced.join(", ")}`);
    }
    if (tooEasy.length > 0) {
      lines.push(`⬆️ **Demasiado fáciles:** ${tooEasy.join(", ")}`);
    }
    if (tooHard.length > 0) {
      lines.push(`⬇️ **Demasiado difíciles:** ${tooHard.join(", ")}`);
    }
    lines.push("");

    // Card usage
    lines.push("### Uso de Cartas (Top 12)");
    lines.push("");
    const sortedCards = Object.entries(latest.cardPlays)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    lines.push("| Carta | Usos | Barra |");
    lines.push("| --- | --- | --- |");

    const maxPlays = sortedCards[0]?.[1] ?? 1;
    for (const [cardId, count] of sortedCards) {
      const barLength = Math.round((count / maxPlays) * 20);
      const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
      const shortName = cardId.replace(/^(impulso_|calma_|caos_|vinculo_|territorio_)/, "");
      lines.push(`| ${shortName} | ${count} | \`${bar}\` |`);
    }
    lines.push("");

    // Card usage per enemy
    lines.push("### Uso de Cartas por Enemigo");
    lines.push("");
    for (const enemy of latestReport.enemies) {
      lines.push(`#### vs ${enemy.id}`);
      lines.push("");
      const topCards = Object.entries(enemy.cardPlays)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      for (const [cardId, count] of topCards) {
        const shortName = cardId.replace(/^(impulso_|calma_|caos_|vinculo_|territorio_)/, "");
        lines.push(`- ${shortName}: ${count}`);
      }
      lines.push("");
    }
  }

  // Version history
  if (data.length > 1) {
    lines.push("## Historial de Cambios");
    lines.push("");
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];
      lines.push(`### ${prev.label} → ${curr.label}`);
      lines.push("");

      for (const enemyId of enemyIds) {
        const prevWr = prev.enemies[enemyId]?.winRate;
        const currWr = curr.enemies[enemyId]?.winRate;
        if (prevWr !== undefined && currWr !== undefined) {
          const diff = currWr - prevWr;
          if (Math.abs(diff) >= 1) {
            const arrow = diff > 0 ? "📈" : "📉";
            lines.push(`- ${enemyId}: ${prevWr.toFixed(1)}% → ${currWr.toFixed(1)}% ${arrow} (${diff > 0 ? "+" : ""}${diff.toFixed(1)}%)`);
          }
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function main() {
  const reports = loadReports();

  if (reports.length === 0) {
    console.error("No hay reportes JSON en la carpeta reports/");
    process.exit(1);
  }

  console.log(`Analizando ${reports.length} reportes...`);

  const historicalData = buildHistoricalData(reports);
  const markdown = generateMarkdown(historicalData, reports);

  const outputPath = path.join(reportsDir, "balance-analysis.md");
  fs.writeFileSync(outputPath, markdown, "utf8");

  console.log(`Reporte generado: ${outputPath}`);
}

main();
