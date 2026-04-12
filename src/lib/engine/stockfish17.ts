import { EngineName } from "@/types/enums";
import { UciEngine } from "./uciEngine";
import { isWasmSupported } from "./shared";

export class Stockfish17 {
  public static async create(lite?: boolean): Promise<UciEngine> {
    if (!Stockfish17.isSupported()) {
      throw new Error("Stockfish 17 is not supported");
    }

    const enginePath = `engines/stockfish-17/stockfish-17${
      lite ? "-lite" : ""
    }-single.js`;

    const engineName = lite
      ? EngineName.Stockfish17Lite
      : EngineName.Stockfish17;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
