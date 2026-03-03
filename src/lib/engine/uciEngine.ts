import { EngineName } from "@/types/enums";
import {
  EvaluateGameParams,
  EvaluatePositionWithUpdateParams,
  GameEval,
  PositionEval,
} from "@/types/eval";
import {
  getResultProperty,
  parseEvaluationResults,
} from "./helpers/parseResults";
import { computeAccuracy } from "./helpers/accuracy";
import { getIsStalemate, getWhoIsCheckmated } from "../chess";
import { getLichessEval } from "../lichess";
import { getMovesClassification } from "./helpers/moveClassification";
import { computeEstimatedElo } from "./helpers/estimateElo";
import { EngineWorker, WorkerJob } from "@/types/engine";
import { getEngineWorker, sendCommandsToWorker } from "./worker";

export class UciEngine {
  public readonly name: EngineName;
  private workers: EngineWorker[] = [];
  private workerQueue: WorkerJob[] = [];
  private isReady = false;
  private enginePath: string;
  private customEngineInit?:
    | ((worker: EngineWorker) => Promise<void>)
    | undefined = undefined;
  private multiPv = 3;
  private elo: number | undefined = undefined;

  private constructor(
    engineName: EngineName,
    enginePath: string,
    customEngineInit: UciEngine["customEngineInit"]
  ) {
    this.name = engineName;
    this.enginePath = enginePath;
    this.customEngineInit = customEngineInit;
  }

  public static async create(
    engineName: EngineName,
    enginePath: string,
    customEngineInit?: UciEngine["customEngineInit"]
  ): Promise<UciEngine> {
    const engine = new UciEngine(engineName, enginePath, customEngineInit);

    await engine.addNewWorker();
    engine.isReady = true;

    return engine;
  }

  private acquireWorker(): EngineWorker | undefined {
    for (const worker of this.workers) {
      if (!worker.isReady) continue;

      worker.isReady = false;
      return worker;
    }

    return undefined;
  }

  private async releaseWorker(worker: EngineWorker) {
    const nextJob = this.workerQueue.shift();
    if (!nextJob) {
      worker.isReady = true;
      return;
    }

    const res = await sendCommandsToWorker(
      worker,
      nextJob.commands,
      nextJob.finalMessage,
      nextJob.onNewMessage
    );

    this.releaseWorker(worker);
    nextJob.resolve(res);
  }

  private async setMultiPv(multiPv: number) {
    if (multiPv === this.multiPv) return;

    if (multiPv < 2 || multiPv > 6) {
      throw new Error(`Invalid MultiPV value : ${multiPv}`);
    }

    await this.sendCommandsToEachWorker(
      [`setoption name MultiPV value ${multiPv}`, "isready"],
      "readyok"
    );

    this.multiPv = multiPv;
  }

  private async setElo(elo: number) {
    if (elo === this.elo) return;

    if (elo < 1320 || elo > 3190) {
      throw new Error(`Invalid Elo value : ${elo}`);
    }

    await this.sendCommandsToEachWorker(
      ["setoption name UCI_LimitStrength value true", "isready"],
      "readyok"
    );

    await this.sendCommandsToEachWorker(
      [`setoption name UCI_Elo value ${elo}`, "isready"],
      "readyok"
    );

    this.elo = elo;
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  private throwErrorIfNotReady() {
    if (!this.isReady) {
      throw new Error(`${this.name} is not ready`);
    }
  }

  public shutdown(): void {
    this.isReady = false;
    this.workerQueue = [];

    for (const worker of this.workers) {
      this.terminateWorker(worker);
    }
    this.workers = [];
  }

  private terminateWorker(worker: EngineWorker) {
    console.log(`Terminating worker from ${this.enginePath}`);
    worker.isReady = false;
    worker.uci("quit");
    worker.terminate();
  }

  public async stopAllCurrentJobs(): Promise<void> {
    // Prevent unhandled promise rejections by cleanly resolving abandoned queue jobs
    const abandonedJobs = [...this.workerQueue];
    this.workerQueue = [];

    for (const job of abandonedJobs) {
      job.resolve([]); // Yield empty string array to fulfill the pending Promise safely
    }

    // Unbind any active React callback listeners immediately so in-flight engine updates
    // do not trigger "Maximum update depth exceeded" during the stop pipeline.
    for (const worker of this.workers) {
      worker.listen = () => null;
    }

    await this.sendCommandsToEachWorker(["stop", "isready"], "readyok");

    for (const worker of this.workers) {
      this.releaseWorker(worker);
    }
  }

  private async sendCommands(
    commands: string[],
    finalMessage: string,
    onNewMessage?: (messages: string[]) => void
  ): Promise<string[]> {
    const worker = this.acquireWorker();

    if (!worker) {
      return new Promise((resolve) => {
        this.workerQueue.push({
          commands,
          finalMessage,
          onNewMessage,
          resolve,
        });
      });
    }

    const res = await sendCommandsToWorker(
      worker,
      commands,
      finalMessage,
      onNewMessage
    );

    this.releaseWorker(worker);
    return res;
  }

  private async sendCommandsToEachWorker(
    commands: string[],
    finalMessage: string,
    onNewMessage?: (messages: string[]) => void
  ): Promise<void> {
    await Promise.all(
      this.workers.map(async (worker) => {
        await sendCommandsToWorker(
          worker,
          commands,
          finalMessage,
          onNewMessage
        );
        this.releaseWorker(worker);
      })
    );
  }

  private async addNewWorker() {
    const worker = getEngineWorker(this.enginePath);

    await sendCommandsToWorker(worker, ["uci"], "uciok");
    await sendCommandsToWorker(
      worker,
      [`setoption name MultiPV value ${this.multiPv}`, "isready"],
      "readyok"
    );
    await this.customEngineInit?.(worker);
    await sendCommandsToWorker(worker, ["ucinewgame", "isready"], "readyok");

    this.workers.push(worker);
    this.releaseWorker(worker);
  }

  private async setWorkersNb(workersNb: number) {
    if (workersNb === this.workers.length) return;

    if (workersNb < 1) {
      throw new Error(
        `Number of workers must be greater than 0, got ${workersNb} instead`
      );
    }

    if (workersNb < this.workers.length) {
      const workersToRemove = this.workers.slice(workersNb);
      this.workers = this.workers.slice(0, workersNb);

      for (const worker of workersToRemove) {
        this.terminateWorker(worker);
      }
      return;
    }

    const workersNbToCreate = workersNb - this.workers.length;

    await Promise.all(
      new Array(workersNbToCreate).fill(0).map(() => this.addNewWorker())
    );
  }

  public async evaluateGame({
    fens,
    uciMoves,
    depth = 16,
    multiPv = this.multiPv,
    setEvaluationProgress,
    playersRatings,
    workersNb = 1,
  }: EvaluateGameParams): Promise<GameEval> {
    this.throwErrorIfNotReady();
    this.isReady = false;
    setEvaluationProgress?.(1);

    await this.setMultiPv(multiPv);
    await this.sendCommandsToEachWorker(["ucinewgame", "isready"], "readyok");
    this.setWorkersNb(workersNb);

    const positions: PositionEval[] = new Array(fens.length);
    let completed = 0;

    const updateEval = (index: number, positionEval: PositionEval) => {
      completed++;
      positions[index] = positionEval;
      const progress = completed / fens.length;
      setEvaluationProgress?.(99 - Math.exp(-4 * progress) * 99);
    };

    await Promise.all(
      fens.map(async (fen, i) => {
        const whoIsCheckmated = getWhoIsCheckmated(fen);
        if (whoIsCheckmated) {
          updateEval(i, {
            lines: [
              {
                pv: [],
                depth: 0,
                multiPv: 1,
                mate: whoIsCheckmated === "w" ? -1 : 1,
              },
            ],
          });
          return;
        }

        const isStalemate = getIsStalemate(fen);
        if (isStalemate) {
          updateEval(i, {
            lines: [
              {
                pv: [],
                depth: 0,
                multiPv: 1,
                cp: 0,
              },
            ],
          });
          return;
        }

        const result = await this.evaluatePosition(fen, depth, workersNb);
        updateEval(i, result);
      })
    );

    await this.setWorkersNb(1);
    this.isReady = true;

    const positionsWithClassification = getMovesClassification(
      positions,
      uciMoves,
      fens
    );
    const accuracy = computeAccuracy(positions);
    const estimatedElo = computeEstimatedElo(
      positions,
      playersRatings?.white,
      playersRatings?.black
    );

    return {
      positions: positionsWithClassification,
      estimatedElo,
      accuracy,
      settings: {
        engine: this.name,
        date: new Date().toISOString(),
        depth,
        multiPv,
      },
    };
  }

  private async evaluatePosition(
    fen: string,
    depth = 16,
    workersNb: number
  ): Promise<PositionEval> {
    if (workersNb < 2) {
      const lichessEval = await getLichessEval(fen, this.multiPv);
      if (
        lichessEval.lines.length >= this.multiPv &&
        lichessEval.lines[0].depth >= depth
      ) {
        return lichessEval;
      }
    }

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove"
    );

    return parseEvaluationResults(results, fen);
  }

  public async evaluatePositionWithUpdate({
    fen,
    depth = 16,
    multiPv = this.multiPv,
    setPartialEval,
  }: EvaluatePositionWithUpdateParams): Promise<PositionEval> {
    this.throwErrorIfNotReady();

    const lichessEvalPromise = getLichessEval(fen, multiPv);

    await this.stopAllCurrentJobs();
    await this.setMultiPv(multiPv);

    let lastUpdate = 0;
    const THROTTLE_MS = 60; // Limit UI updates to ~16 updates per second for maximum fluidity and zero lag

    const onNewMessage = (messages: string[]) => {
      if (!setPartialEval) return;

      const now = performance.now();
      if (now - lastUpdate < THROTTLE_MS) return;
      lastUpdate = now;

      const parsedResults = parseEvaluationResults(messages, fen);
      setPartialEval(parsedResults);
    };

    const lichessEval = await lichessEvalPromise;
    if (
      lichessEval.lines.length >= multiPv &&
      lichessEval.lines[0].depth >= depth
    ) {
      setPartialEval?.(lichessEval);
      return lichessEval;
    }

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove",
      onNewMessage
    );

    return parseEvaluationResults(results, fen);
  }

  public async getEngineNextMove(
    fen: string,
    elo: number,
    depth = 16
  ): Promise<string | undefined> {
    this.throwErrorIfNotReady();

    await this.stopAllCurrentJobs();
    await this.setElo(elo);

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove"
    );

    const moveResult = results.find((result) => result.startsWith("bestmove"));
    const move = getResultProperty(moveResult ?? "", "bestmove");
    if (!move) {
      throw new Error("No move found");
    }

    return move === "(none)" ? undefined : move;
  }
}
