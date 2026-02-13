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
];
