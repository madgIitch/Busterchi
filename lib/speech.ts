import type { PetStats } from "@/lib/decay";

export const SPEECH_LINES = {
  default: [
    "Modo loco activado!",
    "Colita en modo fiesta.",
    "El mejor perrito reportandose.",
    "Eres mi humano favorito.",
    "Siesta ahora, juego despues.",
    "Boop al hocico!",
    "Has visto que elegante soy?",
    "Estoy feliz solo de verte.",
    "Dia perfecto para ser perrito.",
    "Nivel de ternura: maximo.",
    "Sonrisa perruna activada.",
    "Aqui, vigilando la casa.",
    "Jugamos un ratito?",
    "Te estaba esperando.",
  ],
  needs: {
    food: [
      "Tengo hambrecita...",
      "Me das un snack?",
      "Mi barriguita hace ruiditos.",
      "Hora oficial de comer, creo.",
      "Prometo portarme bien si hay comida.",
      "Ese olor... es para mi?",
      "Un bocadito y soy feliz.",
      "Mi plato me llama.",
    ],
    walk: [
      "Paseito, porfa?",
      "Necesito estirar las patas.",
      "El mundo exterior me espera.",
      "Salimos a oler cosas?",
      "Tengo ganas de correr un poquito.",
      "La calle me esta llamando.",
      "Prometo no tirar de la correa (mucho).",
      "Aventura desbloqueable: paseo.",
    ],
    love: [
      "Me das mimitos?",
      "Necesito carinito.",
      "Un abrazo y ya estoy bien.",
      "Rascame detras de la oreja.",
      "Quiero sentirme querido.",
      "Modo pegajoso activado.",
      "Cinco minutos de amor, minimo.",
      "Tu atencion es mi cosa favorita.",
    ],
    energy: [
      "Tengo suenito...",
      "Modo siesta activado.",
      "Mis ojitos se cierran solos.",
      "Creo que necesito una cabezadita.",
      "Demasiado esfuerzo por hoy.",
      "Energia baja, ternura alta.",
      "Cargando pilas perrunas...",
      "Una camita mullida seria ideal ahora.",
    ],
    hygiene: [
      "Necesito un banito kawaii.",
      "Mi pelito pide burbujas.",
      "Creo que huelo a aventura.",
      "Un poco de jabon y vuelvo a brillar.",
      "Banera, espuma y mimos, porfa.",
      "Mis patitas quieren agua tibia.",
      "Estoy listo para quedar reluciente.",
      "Modo ducha pendiente.",
    ],
  },
  actions: {
    snack: [
      "Yummy!",
      "Snack recibido. Gracias.",
      "Esto mejora mi dia.",
      "Confirmo: estaba delicioso.",
      "Mi humano sabe lo que hace.",
      "Felicidad en forma de comida.",
      "Otro mas o ya?",
      "Te quiero un poquito mas ahora.",
    ],
    walk: [
      "A caminar!",
      "Paseito desbloqueado.",
      "Libertad perruna.",
      "Vamos, vamos!",
      "Este paseo promete.",
      "Olfateo en progreso.",
      "Patas felices en movimiento.",
      "Aventura completada con exito.",
    ],
    pet: [
      "Mimitos!",
      "Me encanta que me acaricies.",
      "Esto es exactamente lo que necesitaba.",
      "No pares nunca, por favor.",
      "Nivel de felicidad aumentado.",
      "Soy un perrito muy querido.",
      "Mi corazon hace wuff.",
      "Gracias por tanto amor.",
    ],
    sleep: [
      "Hora de dormir...",
      "Zzz... recargando energia.",
      "Un suenito y vuelvo.",
      "Modo siesta activado.",
      "Cargando pilas perrunas.",
      "Me despiertas en un ratito?",
    ],
    bath: [
      "Burbujitas activadas.",
      "Ahora si huelo genial.",
      "Pelito limpio, corazon feliz.",
      "Gracias por el banito.",
      "Brillo perruno restaurado.",
      "Estoy suavecito otra vez.",
    ],
  },
  tap: [
    "Boop recibido.",
    "Eso me dio cosquillitas.",
    "Otra caricia para mi coleccion.",
    "Mi corazon hace wuff.",
    "Te senti cerquita.",
  ],
  levelUp: [
    "Subi de nivel, humano.",
    "Mas ternura desbloqueada.",
    "Buster evolucion emocional completa.",
  ],
  sleepDreams: [
    "Sueno con huesitos gigantes.",
    "Estoy corriendo en una pradera.",
    "Zzz... mariposas por todas partes.",
    "Sueno contigo y mi camita.",
    "Un paseo infinito en mis suenos.",
    "Zzz... lluvia suave y mantita.",
  ],
};

export type ActionKey = "snack" | "walk" | "pet" | "sleep" | "bath";

const pickLine = (lines: string[]) =>
  lines[Math.floor(Math.random() * lines.length)];

export function getSpeechForAction(action: ActionKey) {
  const lines = SPEECH_LINES.actions[action] ?? SPEECH_LINES.default;
  return pickLine(lines.length ? lines : SPEECH_LINES.default);
}

export function getSpeechForNeeds(stats: PetStats) {
  const needs: Array<[keyof typeof SPEECH_LINES.needs, number]> = [
    ["food", stats.food],
    ["walk", stats.walk],
    ["love", stats.love],
    ["energy", stats.energy],
    ["hygiene", stats.hygiene],
  ];
  const lowestNeed = needs.sort((a, b) => a[1] - b[1])[0];

  if (lowestNeed && lowestNeed[1] < 25) {
    return pickLine(SPEECH_LINES.needs[lowestNeed[0]]);
  }

  return pickLine(SPEECH_LINES.default);
}

export function getSpeechForSleep() {
  return pickLine(SPEECH_LINES.sleepDreams);
}

export function getSpeechForTap() {
  return pickLine(SPEECH_LINES.tap);
}

export function getSpeechForLevelUp() {
  return pickLine(SPEECH_LINES.levelUp);
}
