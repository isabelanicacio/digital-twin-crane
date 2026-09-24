import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let eventBuffer = [];

export function logEvent(type, data) {
  eventBuffer.push({
    timestamp: new Date().toISOString(),
    type,
    data,
  });
}

export function flushBuffer() {
    if (eventBuffer.length === 0) return;

  const batch = [...eventBuffer];
  eventBuffer = [];

  const date = new Date().toISOString().slice(0, 10);
  const ts = Date.now();
  const dir = path.join(__dirname, "logs", date);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `batch_${ts}.json`),
    JSON.stringify(batch, null, 2)
  );

  console.log(`[logger] ${batch.length} eventos gravados em logs/${date}/batch_${ts}.json`);
}

export function auditSync(clpState, visionState = null) {
  if (!visionState) return;

  const match =
    clpState.horizontal === visionState.horizontal &&
    clpState.vertical === visionState.vertical &&
    clpState.garra === visionState.garra;

  logEvent("audit", {
    status: match ? "sincronizado" : "inconsistencia",
    clp: clpState,
    visao: visionState,
  });
}