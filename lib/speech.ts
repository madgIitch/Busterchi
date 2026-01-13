export const SPEECH_LINES = {
  default: [
    "¡Modo loco activado!",
    "Colita en modo fiesta.",
    "El mejor perrito reportandose.",
    "Eres mi humano favorito.",
    "Siesta ahora, juego despues.",
    "¡Boop al hocico!",
    "¿Has visto que elegante soy?",
    "Estoy feliz solo de verte.",
    "Dia perfecto para ser perrito.",
    "Nivel de ternura: maximo.",
    "Sonrisa perruna activada.",
    "Aqui, vigilando la casa.",
    "¿Jugamos un ratito?",
    "Te estaba esperando.",
  ],
  needs: {
    food: [
      "Tengo hambrecita...",
      "¿Me das un snack?",
      "Mi barriguita hace ruiditos.",
      "Hora oficial de comer, creo.",
      "Prometo portarme bien si hay comida.",
      "Ese olor... ¿es para mi?",
      "Un bocadito y soy feliz.",
      "Mi plato me llama.",
    ],
    walk: [
      "¿Paseito, porfa?",
      "Necesito estirar las patas.",
      "El mundo exterior me espera.",
      "¿Salimos a oler cosas?",
      "Tengo ganas de correr un poquito.",
      "La calle me esta llamando.",
      "Prometo no tirar de la correa (mucho).",
      "Aventura desbloqueable: paseo.",
    ],
    love: [
      "¿Me das mimitos?",
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
  },
  actions: {
    snack: [
      "¡Yummy!",
      "Snack recibido. Gracias.",
      "Esto mejora mi dia.",
      "Confirmo: estaba delicioso.",
      "Mi humano sabe lo que hace.",
      "Felicidad en forma de comida.",
      "¿Otro mas o ya?",
      "Te quiero un poquito mas ahora.",
    ],
    walk: [
      "¡A caminar!",
      "Paseito desbloqueado.",
      "Libertad perruna.",
      "¡Vamos, vamos!",
      "Este paseo promete.",
      "Olfateo en progreso.",
      "Patas felices en movimiento.",
      "Aventura completada con exito.",
    ],
    pet: [
      "¡Mimitos!",
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
      "¿Me despiertas en un ratito?",
    ],
  },
  sleepDreams: [
    "Sueño con huesitos gigantes.",
    "Estoy corriendo en una pradera.",
    "Zzz... mariposas por todas partes.",
    "Sueño contigo y mi camita.",
    "Un paseo infinito en mis sueños.",
    "Zzz... lluvia suave y mantita.",
  ],
};

export type ActionKey = "snack" | "walk" | "pet" | "sleep";

export type PetStats = {
  food: number;
  walk: number;
  love: number;
  energy: number;
};

const pickLine = (lines: string[]) =>
  lines[Math.floor(Math.random() * lines.length)];

export function getSpeechForAction(action: ActionKey) {
  const lines = SPEECH_LINES.actions[action] ?? SPEECH_LINES.default;
  return pickLine(lines.length ? lines : SPEECH_LINES.default);
}

export function getSpeechForNeeds(stats: PetStats) {
  if (stats.food < 25) {
    return pickLine(SPEECH_LINES.needs.food);
  }
  if (stats.walk < 25) {
    return pickLine(SPEECH_LINES.needs.walk);
  }
  if (stats.love < 25) {
    return pickLine(SPEECH_LINES.needs.love);
  }
  if (stats.energy < 25) {
    return pickLine(SPEECH_LINES.needs.energy);
  }
  return pickLine(SPEECH_LINES.default);
}

export function getSpeechForSleep() {
  return pickLine(SPEECH_LINES.sleepDreams);
}
