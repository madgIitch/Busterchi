"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELEMENTS = void 0;
exports.ELEMENTS = {
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
