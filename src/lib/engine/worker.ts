import { EngineWorker } from "@/types/engine";
import { isIosDevice, isMobileDevice } from "./shared";

export const getEngineWorker = (enginePath: string): EngineWorker => {
  console.log(`Creating worker from ${enginePath}`);

  const worker = new window.Worker(enginePath);

  const engineWorker: EngineWorker = {
    isReady: false,
    uci: (command: string) => worker.postMessage(command),
    listen: () => null,
    terminate: () => worker.terminate(),
  };

  worker.onmessage = (event) => {
    engineWorker.listen(event.data);
  };

  return engineWorker;
};

export const sendCommandsToWorker = (
  worker: EngineWorker,
  commands: string[],
  finalMessage: string,
  onNewMessage?: (messages: string[]) => void
): Promise<string[]> => {
  return new Promise((resolve) => {
    const messages: string[] = [];

    worker.listen = (data) => {
      messages.push(data);
      onNewMessage?.(messages);

      if (data.startsWith(finalMessage)) {
        worker.listen = () => null;
        resolve(messages);
      }
    };

    for (const command of commands) {
      worker.uci(command);
    }
  });
};

export const getRecommendedWorkersNb = (): number => {
  const maxWorkersNbFromThreads = Math.max(
    1,
    Math.round(navigator.hardwareConcurrency - 4),
    Math.floor((navigator.hardwareConcurrency * 2) / 3)
  );

  const maxWorkersNbFromMemory =
    "deviceMemory" in navigator && typeof navigator.deviceMemory === "number"
      ? Math.max(1, Math.round(navigator.deviceMemory))
      : 4;

  const maxWorkersNbFromDevice = isIosDevice() ? 2 : isMobileDevice() ? 4 : 8;

  return Math.min(
    maxWorkersNbFromThreads,
    maxWorkersNbFromMemory,
    maxWorkersNbFromDevice
  );
};
