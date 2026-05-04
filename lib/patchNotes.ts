export type PatchNoteEntry = {
  version: string;
  date: string;
  changes: string[];
};

export const PATCH_NOTES: PatchNoteEntry[] = [
  {
    version: "v0.1.0",
    date: "2026-02-13",
    changes: [
      "Holaaa espero que te haya hecho ilusión este regalito, la verdad es que me ha hecho mucha ilusión a mi también.",
      "LLevo desde enero trabajando en esto y me he dejado muuuchas cosas en el tintero, pero bueno, poco a poco las iré sacando.",
      "De momento, lo que hay es lo que hay, pero espero que te guste y que por lo menos te ponga menos triste por no tener a tu perro por aqui",
      "A medida que vaya sacando cosas nuevas, iré actualizando esta sección con las novedades, así que no dudes en pasarte por aquí de vez en cuando a ver qué hay de nuevo.", 
    ],
  },
  {
    version: "v1.0",
    date: "2026-05-03",
    changes: [
      "kAIXOOO, ya está aqui la versión 1.0 por tu cumple, espero que te mole.",
      "Sigue siendo un proyecto en desarrollo, y además que sea en navegador hace que sea super complicado hacer cosas chulas y que no sean muy cutres",
      "Pero bueno, de momento he añadido un perro de VERDAD (el cual no se parece mucho a un galgo pero es un comienzo)",
      "También he añadido un juego a la hora de pasear al perro, tendrás que combatir contra una serie de enemigos cada uno más random que el anterior",
      ""
    ],
  },
];
