// Data Logger local — Semana 1 (Fase 1)
// Grava eventos em JSONL: <LOG_DIR>/<AAAA-MM-DD>/<tipo>.jsonl
import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.env.LOG_DIR || "./logs");
const ENABLED = (process.env.LOG_ENABLED ?? "true").toLowerCase() !== "false";

let seq = 0;
const streams = new Map(); // chave "data/tipo" -> WriteStream

function dayOf(date) {
  // Data local do laboratório (não UTC), para a rotação ocorrer à meia-noite local
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStream(day, kind) {
  const key = `${day}/${kind}`;
  let s = streams.get(key);
  if (s) return s;
  // Rotação: fecha streams de dias anteriores (arquivos antigos ficam intactos)
  for (const [k, old] of streams) {
    if (!k.startsWith(day + "/")) { old.end(); streams.delete(k); }
  }
  const dir = path.join(LOG_DIR, day);
  fs.mkdirSync(dir, { recursive: true });
  s = fs.createWriteStream(path.join(dir, `${kind}.jsonl`), { flags: "a" });
  s.on("error", (e) => console.error("❌ Logger:", e.message));
  streams.set(key, s);
  return s;
}

function write(kind, source, type, fields = {}) {
  if (!ENABLED) return;
  try {
    const now = new Date();
    const record = {
      ts: now.toISOString(),
      ts_ms: now.getTime(),
      source,
      type,
      seq: ++seq,
      latency_ms: null, // reservado (Semanas 5–6)
      audit: null,      // reservado: "sincronizado" | "inconsistencia"
      ...fields,
    };
    getStream(dayOf(now), kind).write(JSON.stringify(record) + "\n");
  } catch (e) {
    console.error("❌ Logger:", e.message); // nunca derruba o servidor
  }
}

export function logSensor(sensor, value, extra = {}) {
  write("sensor", "plc", "sensorUpdate", { sensor, value, ...extra });
}

export function logSensorSnapshot(data) {
  write("sensor", "plc", "sensorSnapshot", { data });
}

export function logVision(payload) {
  write("vision", "vision", "visionUpdate", { payload });
}

// Auditoria CLP x Visão (portado do antigo data logger.js)
// Compara horizontal, vertical e garra; grava em audit.jsonl com audit preenchido.
export function auditSync(clpState, visionState = null) {
  if (!clpState || !visionState) return null;
  const campos = ["horizontal", "vertical", "garra"];
  const divergencias = campos.filter((c) => clpState[c] !== visionState[c]);
  const status = divergencias.length === 0 ? "sincronizado" : "inconsistencia";
  write("audit", "audit", "auditSync", {
    audit: status,
    divergencias,
    clp: clpState,
    visao: visionState,
  });
  return status;
}

export function closeLogger() {
  return Promise.all(
    [...streams.values()].map((s) => new Promise((r) => s.end(r)))
  ).then(() => streams.clear());
}

if (ENABLED) console.log(`📝 Data Logger ativo em ${LOG_DIR}`);
