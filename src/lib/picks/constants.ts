import type { PickType } from "@/types/picks";

export const PICK_LIMITS: Record<PickType, number> = {
  GROUP_WINNER: 6,
  QUALIFIED_NOT_WINNER: 10,
  ELIMINATED: 6
};

export const TOTAL_PICKS = 22;

export const PICK_CATEGORIES: Array<{
  type: PickType;
  title: string;
  shortTitle: string;
  description: string;
}> = [
  {
    type: "GROUP_WINNER",
    title: "LIDERES DE GRUPO",
    shortTitle: "Lideres",
    description: "Selecoes que terminam em primeiro."
  },
  {
    type: "QUALIFIED_NOT_WINNER",
    title: "CLASSIFICADOS",
    shortTitle: "Classificados",
    description: "Passam de fase, mas nao lideram."
  },
  {
    type: "ELIMINATED",
    title: "ELIMINADOS",
    shortTitle: "Eliminados",
    description: "Caem ainda na fase de grupos."
  }
];

export const GROUP_ORDER = [
  "Grupo A",
  "Grupo B",
  "Grupo C",
  "Grupo D",
  "Grupo E",
  "Grupo F",
  "Grupo G",
  "Grupo H",
  "Grupo I",
  "Grupo J",
  "Grupo K",
  "Grupo L"
];
