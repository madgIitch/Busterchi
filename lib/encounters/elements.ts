import type { ElementId } from "./types";

export const ELEMENTS: Record<
  ElementId,
  { label: string; strongAgainst: ElementId; weakAgainst: ElementId }
> = {
  impulso: {
    label: "Impulso",
    strongAgainst: "caos",
    weakAgainst: "vinculo",
  },
  calma: {
    label: "Calma",
    strongAgainst: "territorio",
    weakAgainst: "caos",
  },
  caos: {
    label: "Caos",
    strongAgainst: "calma",
    weakAgainst: "impulso",
  },
  vinculo: {
    label: "Vinculo",
    strongAgainst: "impulso",
    weakAgainst: "territorio",
  },
  territorio: {
    label: "Territorio",
    strongAgainst: "vinculo",
    weakAgainst: "calma",
  },
};
