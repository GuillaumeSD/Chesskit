// italianGame.ts

export type Move = string;

export interface Variation {
  name: string;
  moves: Move[];
}

export const italianGameVariations: Variation[] = [
  {
    name: "Giuoco Piano",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3", "d6", "O-O", "O-O"],
  },
  {
    name: "Evans Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4", "exd4", "O-O"],
  },
  {
    name: "Two Knights Defense",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
  },
  {
    name: "Fried Liver Attack",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3"],
  },
  {
    name: "Traxler Counterattack",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5"],
  },
  {
    name: "Lolli Attack",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "d4"],
  },
  {
    name: "Scotch Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "d4"],
  },
  {
    name: "Hungarian Defense",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Be7"],
  },
  {
    name: "Paris Defense",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "d6"],
  },
  {
    name: "Rousseau Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "f5"],
  },
  {
    name: "Blackburne Shilling Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4"],
  },
  {
    name: "Jerome Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "Bxf7+", "Kxf7", "Nxe5+", "Nxe5", "Qh5+"],
  },
  {
    name: "Rosentreter Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "d4", "exd4", "c3"],
  },
  {
    name: "Neumann Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "c3", "Nf6", "Bc4"],
  },
  {
    name: "Alexandre Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "f5"],
  },
  {
    name: "Lucchini Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "d3", "f5"],
  },
  {
    name: "Ponziani-Steinitz Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Nxe4"],
  },
  {
    name: "Kloss Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nb4"],
  },
  {
    name: "Fegatello Attack",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3"],
  },
];
